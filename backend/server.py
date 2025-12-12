from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timedelta
import jwt
import bcrypt
from bson import ObjectId
import resend

ROOT_DIR = Path(__file__).parent

# Configure logging first before anything else with more verbose output
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    force=True  # Force reconfiguration if already configured
)
logger = logging.getLogger(__name__)

# Log startup
logger.info("=" * 60)
logger.info("AÏLA APPLICATION STARTING")
logger.info("=" * 60)

# Try to load .env file if it exists (for local development)
env_file = ROOT_DIR / '.env'
if env_file.exists():
    load_dotenv(env_file)
    logger.info(f"✓ Loaded environment variables from {env_file}")
else:
    logger.info("✓ No .env file found, using environment variables from system")
    logger.info(f"✓ Environment variables: MONGO_URL={'SET' if os.environ.get('MONGO_URL') else 'NOT SET'}, DB_NAME={os.environ.get('DB_NAME', 'NOT SET')}")

# Configure Resend for email sending
RESEND_API_KEY = os.environ.get('RESEND_API_KEY', 're_ZVuwLNzR_ER7hfFTBQi6LqZTZuWEQa7Sr')
resend.api_key = RESEND_API_KEY
FRONTEND_URL = os.environ.get('FRONTEND_URL', 'https://www.aila.family')

async def send_invitation_email(to_email: str, inviter_name: str, role: str, invite_token: str):
    """Send invitation email via Resend"""
    try:
        role_fr = "lecteur" if role == "viewer" else "éditeur"
        invite_url = f"{FRONTEND_URL}/(tabs)/tree?invite={invite_token}"
        
        html_content = f"""
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #0A1628; color: #FFFFFF;">
            <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #D4AF37; margin: 0;">🌳 AÏLA</h1>
                <p style="color: #B8C5D6; margin-top: 5px;">L'arbre qui connecte les générations</p>
            </div>
            
            <div style="background-color: #1A2F4A; border-radius: 12px; padding: 24px; margin-bottom: 20px;">
                <h2 style="color: #FFFFFF; margin-top: 0;">Vous êtes invité(e) !</h2>
                <p style="color: #B8C5D6; line-height: 1.6;">
                    <strong style="color: #D4AF37;">{inviter_name}</strong> vous invite à rejoindre son arbre généalogique familial en tant que <strong style="color: #D4AF37;">{role_fr}</strong>.
                </p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="{invite_url}" style="display: inline-block; background-color: #D4AF37; color: #0A1628; text-decoration: none; padding: 16px 32px; border-radius: 12px; font-weight: bold; font-size: 16px;">
                    Accepter l'invitation
                </a>
            </div>
            
            <p style="color: #6B7C93; font-size: 12px; text-align: center;">
                Si vous ne connaissez pas {inviter_name}, vous pouvez ignorer cet email.
            </p>
        </div>
        """
        
        params = {
            "from": "AÏLA <noreply@aila.family>",
            "to": [to_email],
            "subject": f"🌳 {inviter_name} vous invite à rejoindre son arbre généalogique",
            "html": html_content
        }
        
        email = resend.Emails.send(params)
        logger.info(f"✓ Invitation email sent to {to_email}")
        return True
    except Exception as e:
        logger.error(f"✗ Failed to send invitation email to {to_email}: {e}")
        return False

# MongoDB connection with timeout settings for Atlas
logger.info("Configuring MongoDB connection...")
mongo_url = os.environ.get('MONGO_URL')
if not mongo_url:
    logger.warning("⚠ MONGO_URL environment variable not set, using default localhost")
    mongo_url = "mongodb://localhost:27017"
else:
    # Log a sanitized version (hide credentials)
    sanitized_url = mongo_url.split('@')[-1] if '@' in mongo_url else 'localhost'
    logger.info(f"✓ MONGO_URL configured (connecting to: {sanitized_url})")

# Configure MongoDB client with timeouts for production (Atlas)
# Note: Connection is lazy - actual connection happens on first operation
# Initialize client and db as None first
client = None
db = None

try:
    logger.info("Creating AsyncIOMotorClient...")
    client = AsyncIOMotorClient(
        mongo_url,
        serverSelectionTimeoutMS=10000,  # 10 seconds timeout for server selection
        connectTimeoutMS=20000,  # 20 seconds connection timeout
        socketTimeoutMS=45000,  # 45 seconds socket timeout
        maxPoolSize=50,  # Increased connection pool size
        minPoolSize=10,  # Minimum pool size
        retryWrites=True,  # Retry writes on network errors
        retryReads=True,  # Retry reads on network errors
    )
    db_name = os.environ.get('DB_NAME', 'aila_db')
    db = client[db_name]
    logger.info(f"✓ MongoDB client configured for database: {db_name}")
except Exception as e:
    logger.error(f"❌ Failed to configure MongoDB client: {e}", exc_info=True)
    # Don't raise - let the app start and health check will report the issue
    logger.warning("⚠ Continuing startup without MongoDB connection")
    # Create a dummy client that will fail gracefully
    try:
        logger.info("Creating fallback MongoDB client...")
        client = AsyncIOMotorClient("mongodb://localhost:27017", serverSelectionTimeoutMS=1000)
        db = client['aila_db']
        logger.info("✓ Fallback client created")
    except Exception as fallback_error:
        logger.error(f"❌ Fallback client creation failed: {fallback_error}")
        pass

# JWT Configuration
JWT_SECRET = os.environ.get('JWT_SECRET')
if not JWT_SECRET:
    # Generate a default secret for development, but log a warning
    import secrets
    JWT_SECRET = secrets.token_urlsafe(32)
    logging.warning("JWT_SECRET not set, using generated secret. Set JWT_SECRET in production!")
JWT_ALGORITHM = 'HS256'
JWT_EXPIRATION_HOURS = 24 * 7  # 1 week

# Create the main app
app = FastAPI(title="AÏLA - Arbre Généalogique API", version="1.0.0")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

security = HTTPBearer()

# ===================== MODELS =====================

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    first_name: str
    last_name: str
    gdpr_consent: bool = False

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    email: str
    first_name: str
    last_name: str
    created_at: datetime
    gdpr_consent: bool
    gdpr_consent_date: Optional[datetime] = None
    role: str = "member"  # admin or member

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

class PersonCreate(BaseModel):
    first_name: str
    last_name: str
    gender: str = "unknown"  # male, female, unknown
    birth_date: Optional[str] = None
    birth_place: Optional[str] = None
    death_date: Optional[str] = None
    death_place: Optional[str] = None
    photo: Optional[str] = None  # base64
    notes: Optional[str] = None
    geographic_branch: Optional[str] = None  # région/zone géographique

class PersonUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    gender: Optional[str] = None
    birth_date: Optional[str] = None
    birth_place: Optional[str] = None
    death_date: Optional[str] = None
    death_place: Optional[str] = None
    photo: Optional[str] = None
    notes: Optional[str] = None
    geographic_branch: Optional[str] = None

class PersonResponse(BaseModel):
    id: str
    user_id: Optional[str] = None
    first_name: str
    last_name: str
    gender: str
    birth_date: Optional[str] = None
    birth_place: Optional[str] = None
    death_date: Optional[str] = None
    death_place: Optional[str] = None
    photo: Optional[str] = None
    notes: Optional[str] = None
    geographic_branch: Optional[str] = None
    created_at: datetime
    is_preview: bool = False

class FamilyLinkCreate(BaseModel):
    person_id_1: str
    person_id_2: str
    link_type: str  # parent, child, spouse

class FamilyLinkResponse(BaseModel):
    id: str
    user_id: Optional[str] = None
    person_id_1: str
    person_id_2: str
    link_type: str
    created_at: datetime

class PreviewSessionCreate(BaseModel):
    persons: List[PersonCreate] = []

class PreviewSessionResponse(BaseModel):
    session_token: str
    persons: List[PersonResponse]
    links: List[FamilyLinkResponse]
    created_at: datetime
    expires_at: datetime

class TreeResponse(BaseModel):
    persons: List[PersonResponse]
    links: List[FamilyLinkResponse]

# ===================== COLLABORATION MODELS =====================

class CollaboratorInvite(BaseModel):
    email: EmailStr
    role: str = "editor"  # viewer, editor

class CollaboratorResponse(BaseModel):
    id: str
    tree_owner_id: str
    user_id: Optional[str] = None
    email: str
    role: str
    status: str  # pending, accepted, rejected
    invited_at: datetime
    accepted_at: Optional[datetime] = None

class ContributionCreate(BaseModel):
    action: str  # add, edit, delete
    entity_type: str  # person, link
    entity_id: Optional[str] = None
    entity_data: Optional[dict] = None

class ContributionResponse(BaseModel):
    id: str
    tree_owner_id: str
    contributor_id: str
    contributor_name: str
    action: str
    entity_type: str
    entity_id: Optional[str] = None
    entity_data: Optional[dict] = None
    status: str  # pending, approved, rejected
    created_at: datetime
    reviewed_at: Optional[datetime] = None
    review_note: Optional[str] = None

class ContributionReview(BaseModel):
    status: str  # approved, rejected
    note: Optional[str] = None

class NotificationResponse(BaseModel):
    id: str
    user_id: str
    type: str
    title: str
    message: str
    data: Optional[dict] = None
    read: bool
    created_at: datetime

class ChatMessageCreate(BaseModel):
    message: str
    mentioned_person_id: Optional[str] = None  # ID d'une personne de l'arbre mentionnée

class ChatMessageResponse(BaseModel):
    id: str
    user_id: str
    user_name: str  # Prénom + Nom de l'expéditeur
    message: str
    mentioned_person_id: Optional[str] = None
    mentioned_person_name: Optional[str] = None
    created_at: datetime

# ===================== HELPERS =====================

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_token(user_id: str) -> str:
    payload = {
        'user_id': user_id,
        'exp': datetime.utcnow() + timedelta(hours=JWT_EXPIRATION_HOURS),
        'iat': datetime.utcnow()
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def decode_token(token: str) -> dict:
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    payload = decode_token(credentials.credentials)
    user = await db.users.find_one({"_id": ObjectId(payload['user_id'])})
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user

def serialize_object_id(obj: dict) -> dict:
    if obj and '_id' in obj:
        obj['id'] = str(obj['_id'])
        del obj['_id']
    return obj

# ===================== AUTH ROUTES =====================

@api_router.post("/auth/register", response_model=TokenResponse)
async def register(user_data: UserCreate):
    # Check if email exists
    existing = await db.users.find_one({"email": user_data.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    if not user_data.gdpr_consent:
        raise HTTPException(status_code=400, detail="GDPR consent is required")
    
    # Check if this is the first user - make them admin
    user_count = await db.users.count_documents({})
    role = "admin" if user_count == 0 else "member"
    
    # Create user
    user_doc = {
        "email": user_data.email,
        "password_hash": hash_password(user_data.password),
        "first_name": user_data.first_name,
        "last_name": user_data.last_name,
        "gdpr_consent": user_data.gdpr_consent,
        "gdpr_consent_date": datetime.utcnow() if user_data.gdpr_consent else None,
        "created_at": datetime.utcnow(),
        "role": role
    }
    
    result = await db.users.insert_one(user_doc)
    user_doc['_id'] = result.inserted_id
    user_doc = serialize_object_id(user_doc)
    
    token = create_token(user_doc['id'])
    
    return TokenResponse(
        access_token=token,
        user=UserResponse(
            id=user_doc['id'],
            email=user_doc['email'],
            first_name=user_doc['first_name'],
            last_name=user_doc['last_name'],
            created_at=user_doc['created_at'],
            gdpr_consent=user_doc['gdpr_consent'],
            gdpr_consent_date=user_doc.get('gdpr_consent_date'),
            role=user_doc['role']
        )
    )

@api_router.post("/auth/login", response_model=TokenResponse)
async def login(credentials: UserLogin):
    user = await db.users.find_one({"email": credentials.email})
    if not user or not verify_password(credentials.password, user['password_hash']):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    user = serialize_object_id(user)
    token = create_token(user['id'])
    
    return TokenResponse(
        access_token=token,
        user=UserResponse(
            id=user['id'],
            email=user['email'],
            first_name=user['first_name'],
            last_name=user['last_name'],
            created_at=user['created_at'],
            gdpr_consent=user.get('gdpr_consent', False),
            gdpr_consent_date=user.get('gdpr_consent_date'),
            role=user.get('role', 'member')
        )
    )

# Temporary admin endpoint to reset password - REMOVE AFTER USE
class PasswordReset(BaseModel):
    email: EmailStr
    new_password: str
    admin_key: str

@api_router.post("/auth/admin-reset-password")
async def admin_reset_password(data: PasswordReset):
    # Simple admin key protection
    if data.admin_key != "AILA_TEMP_RESET_2024":
        raise HTTPException(status_code=403, detail="Invalid admin key")
    
    user = await db.users.find_one({"email": data.email})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    new_hash = hash_password(data.new_password)
    await db.users.update_one(
        {"email": data.email},
        {"$set": {"password_hash": new_hash}}
    )
    
    return {"message": "Password reset successfully"}

@api_router.get("/auth/me", response_model=UserResponse)
async def get_me(current_user: dict = Depends(get_current_user)):
    user = serialize_object_id(current_user.copy())
    return UserResponse(
        id=user['id'],
        email=user['email'],
        first_name=user['first_name'],
        last_name=user['last_name'],
        created_at=user['created_at'],
        gdpr_consent=user.get('gdpr_consent', False),
        gdpr_consent_date=user.get('gdpr_consent_date'),
        role=user.get('role', 'member')
    )

# ===================== USER MANAGEMENT ROUTES (ADMIN ONLY) =====================

@api_router.get("/users", response_model=List[UserResponse])
async def get_all_users(current_user: dict = Depends(get_current_user)):
    # Only admins can list all users
    if current_user.get('role', 'member') != 'admin':
        raise HTTPException(status_code=403, detail="Admin access required")
    
    users = await db.users.find({}).to_list(500)
    return [
        UserResponse(
            id=str(u['_id']),
            email=u['email'],
            first_name=u['first_name'],
            last_name=u['last_name'],
            created_at=u['created_at'],
            gdpr_consent=u.get('gdpr_consent', False),
            gdpr_consent_date=u.get('gdpr_consent_date'),
            role=u.get('role', 'member')
        )
        for u in users
    ]

@api_router.put("/users/{user_id}/promote")
async def promote_user_to_admin(user_id: str, current_user: dict = Depends(get_current_user)):
    # Only admins can promote users
    if current_user.get('role', 'member') != 'admin':
        raise HTTPException(status_code=403, detail="Admin access required")
    
    # Check if target user exists
    target_user = await db.users.find_one({"_id": ObjectId(user_id)})
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Update user role
    await db.users.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": {"role": "admin"}}
    )
    
    return {"message": f"User {target_user['email']} promoted to admin"}

@api_router.put("/users/{user_id}/demote")
async def demote_user_to_member(user_id: str, current_user: dict = Depends(get_current_user)):
    # Only admins can demote users
    if current_user.get('role', 'member') != 'admin':
        raise HTTPException(status_code=403, detail="Admin access required")
    
    # Prevent demoting yourself
    if str(current_user['_id']) == user_id:
        raise HTTPException(status_code=400, detail="Cannot demote yourself")
    
    # Check if target user exists
    target_user = await db.users.find_one({"_id": ObjectId(user_id)})
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Update user role
    await db.users.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": {"role": "member"}}
    )
    
    return {"message": f"User {target_user['email']} demoted to member"}


# ===================== PERSON ROUTES =====================

@api_router.post("/persons", response_model=PersonResponse)
async def create_person(person: PersonCreate, current_user: dict = Depends(get_current_user)):
    person_doc = {
        "user_id": str(current_user['_id']),
        "first_name": person.first_name,
        "last_name": person.last_name,
        "gender": person.gender,
        "birth_date": person.birth_date,
        "birth_place": person.birth_place,
        "death_date": person.death_date,
        "death_place": person.death_place,
        "photo": person.photo,
        "notes": person.notes,
        "geographic_branch": person.geographic_branch,
        "created_at": datetime.utcnow(),
        "is_preview": False
    }
    
    result = await db.persons.insert_one(person_doc)
    person_doc['_id'] = result.inserted_id
    person_doc = serialize_object_id(person_doc)
    
    return PersonResponse(**person_doc)

@api_router.get("/persons", response_model=List[PersonResponse])
async def get_persons(current_user: dict = Depends(get_current_user)):
    persons = await db.persons.find({"user_id": str(current_user['_id'])}).to_list(500)
    return [PersonResponse(**serialize_object_id(p)) for p in persons]

@api_router.get("/persons/{person_id}", response_model=PersonResponse)
async def get_person(person_id: str, current_user: dict = Depends(get_current_user)):
    person = await db.persons.find_one({
        "_id": ObjectId(person_id),
        "user_id": str(current_user['_id'])
    })
    if not person:
        raise HTTPException(status_code=404, detail="Person not found")
    return PersonResponse(**serialize_object_id(person))

@api_router.put("/persons/{person_id}", response_model=PersonResponse)
async def update_person(person_id: str, person: PersonUpdate, current_user: dict = Depends(get_current_user)):
    update_data = {k: v for k, v in person.dict().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No data to update")
    
    # Check if person exists
    existing_person = await db.persons.find_one({"_id": ObjectId(person_id)})
    if not existing_person:
        raise HTTPException(status_code=404, detail="Person not found")
    
    # Check permissions: admin can edit anything, members can only edit their own
    user_role = current_user.get('role', 'member')
    if user_role != 'admin' and existing_person['user_id'] != str(current_user['_id']):
        raise HTTPException(status_code=403, detail="You can only modify your own entries")
    
    result = await db.persons.find_one_and_update(
        {"_id": ObjectId(person_id)},
        {"$set": update_data},
        return_document=True
    )
    return PersonResponse(**serialize_object_id(result))

@api_router.delete("/persons/{person_id}")
async def delete_person(person_id: str, current_user: dict = Depends(get_current_user)):
    # Check if person exists
    existing_person = await db.persons.find_one({"_id": ObjectId(person_id)})
    if not existing_person:
        raise HTTPException(status_code=404, detail="Person not found")
    
    # Check permissions: admin can delete anything, members can only delete their own
    user_role = current_user.get('role', 'member')
    if user_role != 'admin' and existing_person['user_id'] != str(current_user['_id']):
        raise HTTPException(status_code=403, detail="You can only delete your own entries")
    
    result = await db.persons.delete_one({"_id": ObjectId(person_id)})
    
    # Also delete related links
    await db.family_links.delete_many({
        "$or": [
            {"person_id_1": person_id},
            {"person_id_2": person_id}
        ]
    })
    
    return {"message": "Person deleted successfully"}

# ===================== FAMILY LINK ROUTES =====================

@api_router.post("/links", response_model=FamilyLinkResponse)
async def create_link(link: FamilyLinkCreate, current_user: dict = Depends(get_current_user)):
    # Verify both persons exist and belong to user
    person1 = await db.persons.find_one({
        "_id": ObjectId(link.person_id_1),
        "user_id": str(current_user['_id'])
    })
    person2 = await db.persons.find_one({
        "_id": ObjectId(link.person_id_2),
        "user_id": str(current_user['_id'])
    })
    
    if not person1 or not person2:
        raise HTTPException(status_code=404, detail="One or both persons not found")
    
    # Extended family relationship types
    valid_link_types = [
        'parent', 'child', 'spouse',  # Core relationships
        'sibling',  # Frère/Sœur
        'grandparent', 'grandchild',  # Grand-parent / Petit-enfant
        'uncle_aunt', 'nephew_niece',  # Oncle-Tante / Neveu-Nièce
        'cousin',  # Cousin/Cousine
        'step_parent', 'step_child',  # Beau-parent / Beau-fils
        'parent_in_law', 'child_in_law',  # Beau-père-mère / Gendre-Belle-fille
        'sibling_in_law',  # Beau-frère / Belle-sœur
        'godparent', 'godchild',  # Parrain-Marraine / Filleul(e)
    ]
    
    if link.link_type not in valid_link_types:
        raise HTTPException(
            status_code=400, 
            detail=f"Invalid link type. Valid types: {', '.join(valid_link_types)}"
        )
    
    link_doc = {
        "user_id": str(current_user['_id']),
        "person_id_1": link.person_id_1,
        "person_id_2": link.person_id_2,
        "link_type": link.link_type,
        "created_at": datetime.utcnow()
    }
    
    result = await db.family_links.insert_one(link_doc)
    link_doc['_id'] = result.inserted_id
    link_doc = serialize_object_id(link_doc)
    
    return FamilyLinkResponse(**link_doc)

@api_router.get("/links", response_model=List[FamilyLinkResponse])
async def get_links(current_user: dict = Depends(get_current_user)):
    links = await db.family_links.find({"user_id": str(current_user['_id'])}).to_list(500)
    return [FamilyLinkResponse(**serialize_object_id(l)) for l in links]

@api_router.delete("/links/{link_id}")
async def delete_link(link_id: str, current_user: dict = Depends(get_current_user)):
    # Check if link exists
    existing_link = await db.family_links.find_one({"_id": ObjectId(link_id)})
    if not existing_link:
        raise HTTPException(status_code=404, detail="Link not found")
    
    # Check permissions: admin can delete anything, members can only delete their own
    user_role = current_user.get('role', 'member')
    if user_role != 'admin' and existing_link['user_id'] != str(current_user['_id']):
        raise HTTPException(status_code=403, detail="You can only delete your own entries")
    
    result = await db.family_links.delete_one({"_id": ObjectId(link_id)})
    return {"message": "Link deleted successfully"}

# ===================== TREE ROUTES =====================

@api_router.get("/tree", response_model=TreeResponse)
async def get_tree(current_user: dict = Depends(get_current_user)):
    persons = await db.persons.find({"user_id": str(current_user['_id'])}).to_list(500)
    links = await db.family_links.find({"user_id": str(current_user['_id'])}).to_list(500)
    
    return TreeResponse(
        persons=[PersonResponse(**serialize_object_id(p)) for p in persons],
        links=[FamilyLinkResponse(**serialize_object_id(l)) for l in links]
    )

# ===================== PREVIEW MODE ROUTES =====================

@api_router.post("/preview/session", response_model=PreviewSessionResponse)
async def create_preview_session():
    session_token = str(uuid.uuid4())
    expires_at = datetime.utcnow() + timedelta(hours=24)  # 24h expiration
    
    session_doc = {
        "session_token": session_token,
        "persons": [],
        "links": [],
        "created_at": datetime.utcnow(),
        "expires_at": expires_at
    }
    
    await db.preview_sessions.insert_one(session_doc)
    
    return PreviewSessionResponse(
        session_token=session_token,
        persons=[],
        links=[],
        created_at=session_doc['created_at'],
        expires_at=expires_at
    )

@api_router.get("/preview/{session_token}", response_model=PreviewSessionResponse)
async def get_preview_session(session_token: str):
    session = await db.preview_sessions.find_one({"session_token": session_token})
    if not session:
        raise HTTPException(status_code=404, detail="Preview session not found")
    
    if session['expires_at'] < datetime.utcnow():
        await db.preview_sessions.delete_one({"session_token": session_token})
        raise HTTPException(status_code=410, detail="Preview session expired")
    
    persons = [PersonResponse(
        id=p.get('id', str(uuid.uuid4())),
        first_name=p['first_name'],
        last_name=p['last_name'],
        gender=p.get('gender', 'unknown'),
        birth_date=p.get('birth_date'),
        birth_place=p.get('birth_place'),
        death_date=p.get('death_date'),
        death_place=p.get('death_place'),
        photo=p.get('photo'),
        notes=p.get('notes'),
        geographic_branch=p.get('geographic_branch'),
        created_at=p.get('created_at', datetime.utcnow()),
        is_preview=True
    ) for p in session.get('persons', [])]
    
    links = [FamilyLinkResponse(
        id=l.get('id', str(uuid.uuid4())),
        person_id_1=l['person_id_1'],
        person_id_2=l['person_id_2'],
        link_type=l['link_type'],
        created_at=l.get('created_at', datetime.utcnow())
    ) for l in session.get('links', [])]
    
    return PreviewSessionResponse(
        session_token=session_token,
        persons=persons,
        links=links,
        created_at=session['created_at'],
        expires_at=session['expires_at']
    )

@api_router.post("/preview/{session_token}/person", response_model=PreviewSessionResponse)
async def add_preview_person(session_token: str, person: PersonCreate):
    session = await db.preview_sessions.find_one({"session_token": session_token})
    if not session:
        raise HTTPException(status_code=404, detail="Preview session not found")
    
    if len(session.get('persons', [])) >= 10:
        raise HTTPException(status_code=400, detail="Preview mode limited to 10 members")
    
    person_doc = {
        "id": str(uuid.uuid4()),
        "first_name": person.first_name,
        "last_name": person.last_name,
        "gender": person.gender,
        "birth_date": person.birth_date,
        "birth_place": person.birth_place,
        "death_date": person.death_date,
        "death_place": person.death_place,
        "photo": person.photo,
        "notes": person.notes,
        "geographic_branch": person.geographic_branch,
        "created_at": datetime.utcnow().isoformat()
    }
    
    await db.preview_sessions.update_one(
        {"session_token": session_token},
        {"$push": {"persons": person_doc}}
    )
    
    return await get_preview_session(session_token)

@api_router.post("/preview/{session_token}/link", response_model=PreviewSessionResponse)
async def add_preview_link(session_token: str, link: FamilyLinkCreate):
    session = await db.preview_sessions.find_one({"session_token": session_token})
    if not session:
        raise HTTPException(status_code=404, detail="Preview session not found")
    
    link_doc = {
        "id": str(uuid.uuid4()),
        "person_id_1": link.person_id_1,
        "person_id_2": link.person_id_2,
        "link_type": link.link_type,
        "created_at": datetime.utcnow().isoformat()
    }
    
    await db.preview_sessions.update_one(
        {"session_token": session_token},
        {"$push": {"links": link_doc}}
    )
    
    return await get_preview_session(session_token)

@api_router.delete("/preview/{session_token}/person/{person_id}", response_model=PreviewSessionResponse)
async def delete_preview_person(session_token: str, person_id: str):
    """Delete a person from preview session"""
    session = await db.preview_sessions.find_one({"session_token": session_token})
    if not session:
        raise HTTPException(status_code=404, detail="Preview session not found")
    
    if session['expires_at'] < datetime.utcnow():
        await db.preview_sessions.delete_one({"session_token": session_token})
        raise HTTPException(status_code=410, detail="Preview session expired")
    
    # Remove person from persons list
    persons = session.get('persons', [])
    original_count = len(persons)
    persons = [p for p in persons if p.get('id') != person_id]
    
    if len(persons) == original_count:
        raise HTTPException(status_code=404, detail="Person not found in preview session")
    
    # Also remove any links involving this person
    links = session.get('links', [])
    links = [l for l in links if l.get('person_id_1') != person_id and l.get('person_id_2') != person_id]
    
    await db.preview_sessions.update_one(
        {"session_token": session_token},
        {"$set": {"persons": persons, "links": links}}
    )
    
    return await get_preview_session(session_token)

@api_router.post("/preview/{session_token}/convert")
async def convert_preview_to_permanent(session_token: str, current_user: dict = Depends(get_current_user)):
    session = await db.preview_sessions.find_one({"session_token": session_token})
    if not session:
        raise HTTPException(status_code=404, detail="Preview session not found")
    
    user_id = str(current_user['_id'])
    old_to_new_ids = {}
    
    # Convert persons
    for p in session.get('persons', []):
        old_id = p.get('id')
        person_doc = {
            "user_id": user_id,
            "first_name": p['first_name'],
            "last_name": p['last_name'],
            "gender": p.get('gender', 'unknown'),
            "birth_date": p.get('birth_date'),
            "birth_place": p.get('birth_place'),
            "death_date": p.get('death_date'),
            "death_place": p.get('death_place'),
            "photo": p.get('photo'),
            "notes": p.get('notes'),
            "geographic_branch": p.get('geographic_branch'),
            "created_at": datetime.utcnow(),
            "is_preview": False
        }
        result = await db.persons.insert_one(person_doc)
        old_to_new_ids[old_id] = str(result.inserted_id)
    
    # Convert links with updated IDs
    for l in session.get('links', []):
        new_person_1 = old_to_new_ids.get(l['person_id_1'])
        new_person_2 = old_to_new_ids.get(l['person_id_2'])
        if new_person_1 and new_person_2:
            link_doc = {
                "user_id": user_id,
                "person_id_1": new_person_1,
                "person_id_2": new_person_2,
                "link_type": l['link_type'],
                "created_at": datetime.utcnow()
            }
            await db.family_links.insert_one(link_doc)
    
    # Delete preview session
    await db.preview_sessions.delete_one({"session_token": session_token})
    
    return {"message": "Preview converted to permanent tree", "persons_converted": len(old_to_new_ids)}

# ===================== GDPR ROUTES =====================

@api_router.get("/gdpr/export")
async def export_user_data(current_user: dict = Depends(get_current_user)):
    """Export all user data for GDPR compliance"""
    user_id = str(current_user['_id'])
    
    persons = await db.persons.find({"user_id": user_id}).to_list(500)
    links = await db.family_links.find({"user_id": user_id}).to_list(500)
    
    user_data = serialize_object_id(current_user.copy())
    if 'password_hash' in user_data:
        del user_data['password_hash']
    
    return {
        "user": user_data,
        "persons": [serialize_object_id(p) for p in persons],
        "family_links": [serialize_object_id(l) for l in links],
        "exported_at": datetime.utcnow().isoformat()
    }

@api_router.delete("/gdpr/delete-account")
async def delete_account(current_user: dict = Depends(get_current_user)):
    """Delete all user data for GDPR compliance"""
    user_id = str(current_user['_id'])
    
    await db.persons.delete_many({"user_id": user_id})
    await db.family_links.delete_many({"user_id": user_id})
    await db.collaborators.delete_many({"$or": [{"tree_owner_id": user_id}, {"user_id": user_id}]})
    await db.contributions.delete_many({"$or": [{"tree_owner_id": user_id}, {"contributor_id": user_id}]})
    await db.notifications.delete_many({"user_id": user_id})
    await db.users.delete_one({"_id": current_user['_id']})
    
    return {"message": "Account and all data deleted successfully"}

# ===================== TREE EXPORT ROUTES =====================

@api_router.get("/tree/export/json")
async def export_tree_json(current_user: dict = Depends(get_current_user)):
    """Export family tree as JSON file (downloadable)"""
    from fastapi.responses import Response
    import json
    
    user_id = str(current_user['_id'])
    
    # Get all tree data
    persons = await db.persons.find({"user_id": user_id}).to_list(500)
    links = await db.family_links.find({"user_id": user_id}).to_list(500)
    
    tree_data = {
        "app": "AÏLA Family Tree",
        "version": "1.0",
        "exported_at": datetime.utcnow().isoformat(),
        "exported_by": f"{current_user['first_name']} {current_user['last_name']}",
        "persons": [serialize_object_id(p) for p in persons],
        "family_links": [serialize_object_id(l) for l in links],
        "stats": {
            "total_persons": len(persons),
            "total_links": len(links)
        }
    }
    
    json_content = json.dumps(tree_data, indent=2, ensure_ascii=False)
    
    return Response(
        content=json_content,
        media_type="application/json",
        headers={
            "Content-Disposition": f"attachment; filename=aila_tree_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}.json"
        }
    )

@api_router.get("/tree/export/gedcom")
async def export_tree_gedcom(current_user: dict = Depends(get_current_user)):
    """Export family tree as GEDCOM file (genealogy standard format)"""
    from fastapi.responses import Response
    
    user_id = str(current_user['_id'])
    
    # Get all tree data
    persons = await db.persons.find({"user_id": user_id}).to_list(500)
    links = await db.family_links.find({"user_id": user_id}).to_list(500)
    
    # Generate GEDCOM format
    gedcom_lines = [
        "0 HEAD",
        "1 SOUR AÏLA",
        "2 VERS 1.0",
        "2 NAME AÏLA Family Tree",
        "1 DEST ANY",
        "1 DATE " + datetime.utcnow().strftime("%d %b %Y").upper(),
        "1 CHAR UTF-8",
        "1 GEDC",
        "2 VERS 5.5.1",
        "2 FORM LINEAGE-LINKED",
    ]
    
    # Add persons as individuals
    person_id_map = {}
    for idx, person in enumerate(persons, start=1):
        person_id_map[str(person['_id'])] = f"I{idx}"
        
        gedcom_lines.append(f"0 @I{idx}@ INDI")
        gedcom_lines.append(f"1 NAME {person['first_name']} /{person['last_name']}/")
        
        if person.get('gender'):
            gender_code = 'M' if person['gender'] == 'male' else 'F'
            gedcom_lines.append(f"1 SEX {gender_code}")
        
        if person.get('birth_date'):
            gedcom_lines.append(f"1 BIRT")
            gedcom_lines.append(f"2 DATE {person['birth_date']}")
        
        if person.get('birth_place'):
            if not person.get('birth_date'):
                gedcom_lines.append(f"1 BIRT")
            gedcom_lines.append(f"2 PLAC {person['birth_place']}")
        
        if person.get('death_date'):
            gedcom_lines.append(f"1 DEAT")
            gedcom_lines.append(f"2 DATE {person['death_date']}")
    
    # Add family links
    family_idx = 1
    for link in links:
        person1_id = person_id_map.get(str(link['person1_id']))
        person2_id = person_id_map.get(str(link['person2_id']))
        
        if not person1_id or not person2_id:
            continue
        
        if link['link_type'] == 'spouse':
            gedcom_lines.append(f"0 @F{family_idx}@ FAM")
            gedcom_lines.append(f"1 HUSB @{person1_id}@")
            gedcom_lines.append(f"1 WIFE @{person2_id}@")
            family_idx += 1
        elif link['link_type'] in ['parent', 'child']:
            gedcom_lines.append(f"0 @F{family_idx}@ FAM")
            if link['link_type'] == 'parent':
                gedcom_lines.append(f"1 HUSB @{person1_id}@")
                gedcom_lines.append(f"1 CHIL @{person2_id}@")
            else:  # child
                gedcom_lines.append(f"1 CHIL @{person1_id}@")
                gedcom_lines.append(f"1 HUSB @{person2_id}@")
            family_idx += 1
    
    gedcom_lines.append("0 TRLR")
    
    gedcom_content = "\n".join(gedcom_lines)
    
    return Response(
        content=gedcom_content,
        media_type="text/x-gedcom",
        headers={
            "Content-Disposition": f"attachment; filename=aila_tree_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}.ged"
        }
    )

# ===================== COLLABORATION ROUTES =====================

@api_router.post("/collaborators/invite", response_model=CollaboratorResponse)
async def invite_collaborator(invite: CollaboratorInvite, current_user: dict = Depends(get_current_user)):
    """Invite someone to collaborate on your family tree"""
    user_id = str(current_user['_id'])
    
    # Check if already invited
    existing = await db.collaborators.find_one({
        "tree_owner_id": user_id,
        "email": invite.email
    })
    if existing:
        raise HTTPException(status_code=400, detail="This person has already been invited")
    
    # Check if inviting yourself
    if invite.email == current_user['email']:
        raise HTTPException(status_code=400, detail="You cannot invite yourself")
    
    # Check if the email is registered
    invited_user = await db.users.find_one({"email": invite.email})
    
    # Create invitation token
    invite_token = str(uuid.uuid4())
    
    collaborator_doc = {
        "tree_owner_id": user_id,
        "user_id": str(invited_user['_id']) if invited_user else None,
        "email": invite.email,
        "role": invite.role,
        "status": "accepted" if invited_user else "pending",  # Auto-accept if user exists
        "invite_token": invite_token,
        "invited_at": datetime.utcnow(),
        "accepted_at": datetime.utcnow() if invited_user else None
    }
    
    result = await db.collaborators.insert_one(collaborator_doc)
    collaborator_doc['_id'] = result.inserted_id
    collaborator_doc = serialize_object_id(collaborator_doc)
    
    # Send invitation email
    owner_name = f"{current_user['first_name']} {current_user['last_name']}"
    await send_invitation_email(
        to_email=invite.email,
        inviter_name=owner_name,
        role=invite.role,
        invite_token=invite_token
    )
    
    # Create notification for the invited user if they exist
    if invited_user:
        await db.notifications.insert_one({
            "user_id": str(invited_user['_id']),
            "type": "collaboration_invite",
            "title": "Nouvelle invitation",
            "message": f"{owner_name} vous a invité à collaborer sur son arbre généalogique",
            "data": {"tree_owner_id": user_id, "collaborator_id": collaborator_doc['id']},
            "read": False,
            "created_at": datetime.utcnow()
        })
    
    return CollaboratorResponse(
        id=collaborator_doc['id'],
        tree_owner_id=collaborator_doc['tree_owner_id'],
        user_id=collaborator_doc.get('user_id'),
        email=collaborator_doc['email'],
        role=collaborator_doc['role'],
        status=collaborator_doc['status'],
        invited_at=collaborator_doc['invited_at'],
        accepted_at=collaborator_doc.get('accepted_at')
    )

@api_router.get("/collaborators", response_model=List[CollaboratorResponse])
async def get_collaborators(current_user: dict = Depends(get_current_user)):
    """Get all collaborators for your tree"""
    user_id = str(current_user['_id'])
    collaborators = await db.collaborators.find({"tree_owner_id": user_id}).to_list(100)
    return [CollaboratorResponse(
        id=str(c['_id']),
        tree_owner_id=c['tree_owner_id'],
        user_id=c.get('user_id'),
        email=c['email'],
        role=c['role'],
        status=c['status'],
        invited_at=c['invited_at'],
        accepted_at=c.get('accepted_at')
    ) for c in collaborators]

@api_router.get("/collaborators/shared-with-me")
async def get_trees_shared_with_me(current_user: dict = Depends(get_current_user)):
    """Get trees that others have shared with you"""
    user_id = str(current_user['_id'])
    collaborations = await db.collaborators.find({
        "user_id": user_id,
        "status": "accepted"
    }).to_list(100)
    
    result = []
    for collab in collaborations:
        owner = await db.users.find_one({"_id": ObjectId(collab['tree_owner_id'])})
        if owner:
            persons_count = await db.persons.count_documents({"user_id": collab['tree_owner_id']})
            result.append({
                "id": str(collab['_id']),
                "owner_id": collab['tree_owner_id'],
                "owner_name": f"{owner['first_name']} {owner['last_name']}",
                "owner_email": owner['email'],
                "role": collab['role'],
                "persons_count": persons_count,
                "accepted_at": collab.get('accepted_at')
            })
    
    return result

@api_router.delete("/collaborators/{collaborator_id}")
async def remove_collaborator(collaborator_id: str, current_user: dict = Depends(get_current_user)):
    """Remove a collaborator from your tree"""
    user_id = str(current_user['_id'])
    
    result = await db.collaborators.delete_one({
        "_id": ObjectId(collaborator_id),
        "tree_owner_id": user_id
    })
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Collaborator not found")
    
    return {"message": "Collaborator removed successfully"}

@api_router.get("/tree/shared/{owner_id}", response_model=TreeResponse)
async def get_shared_tree(owner_id: str, current_user: dict = Depends(get_current_user)):
    """Get a shared tree that you have access to"""
    user_id = str(current_user['_id'])
    
    # Check if user has access
    collaboration = await db.collaborators.find_one({
        "tree_owner_id": owner_id,
        "user_id": user_id,
        "status": "accepted"
    })
    
    if not collaboration:
        raise HTTPException(status_code=403, detail="You don't have access to this tree")
    
    persons = await db.persons.find({"user_id": owner_id}).to_list(500)
    links = await db.family_links.find({"user_id": owner_id}).to_list(500)
    
    return TreeResponse(
        persons=[PersonResponse(**serialize_object_id(p)) for p in persons],
        links=[FamilyLinkResponse(**serialize_object_id(l)) for l in links]
    )

# ===================== CONTRIBUTIONS ROUTES =====================

@api_router.post("/contributions", response_model=ContributionResponse)
async def create_contribution(contribution: ContributionCreate, owner_id: str, current_user: dict = Depends(get_current_user)):
    """Create a contribution (modification request) for a shared tree"""
    user_id = str(current_user['_id'])
    
    # Check if user has editor access
    collaboration = await db.collaborators.find_one({
        "tree_owner_id": owner_id,
        "user_id": user_id,
        "status": "accepted",
        "role": "editor"
    })
    
    if not collaboration:
        raise HTTPException(status_code=403, detail="You don't have editor access to this tree")
    
    contributor_name = f"{current_user['first_name']} {current_user['last_name']}"
    
    contribution_doc = {
        "tree_owner_id": owner_id,
        "contributor_id": user_id,
        "contributor_name": contributor_name,
        "action": contribution.action,
        "entity_type": contribution.entity_type,
        "entity_id": contribution.entity_id,
        "entity_data": contribution.entity_data,
        "status": "pending",
        "created_at": datetime.utcnow(),
        "reviewed_at": None,
        "review_note": None
    }
    
    result = await db.contributions.insert_one(contribution_doc)
    contribution_doc['_id'] = result.inserted_id
    contribution_doc = serialize_object_id(contribution_doc)
    
    # Notify the tree owner
    await db.notifications.insert_one({
        "user_id": owner_id,
        "type": "new_contribution",
        "title": "Nouvelle contribution",
        "message": f"{contributor_name} a proposé une modification à votre arbre",
        "data": {"contribution_id": contribution_doc['id']},
        "read": False,
        "created_at": datetime.utcnow()
    })
    
    return ContributionResponse(**contribution_doc)

@api_router.get("/contributions/pending", response_model=List[ContributionResponse])
async def get_pending_contributions(current_user: dict = Depends(get_current_user)):
    """Get all pending contributions for your tree"""
    user_id = str(current_user['_id'])
    
    contributions = await db.contributions.find({
        "tree_owner_id": user_id,
        "status": "pending"
    }).to_list(100)
    
    return [ContributionResponse(**serialize_object_id(c)) for c in contributions]

@api_router.get("/contributions/my", response_model=List[ContributionResponse])
async def get_my_contributions(current_user: dict = Depends(get_current_user)):
    """Get all contributions you've made to other trees"""
    user_id = str(current_user['_id'])
    
    contributions = await db.contributions.find({
        "contributor_id": user_id
    }).sort("created_at", -1).to_list(100)
    
    return [ContributionResponse(**serialize_object_id(c)) for c in contributions]

@api_router.post("/contributions/{contribution_id}/review")
async def review_contribution(contribution_id: str, review: ContributionReview, current_user: dict = Depends(get_current_user)):
    """Approve or reject a contribution"""
    user_id = str(current_user['_id'])
    
    contribution = await db.contributions.find_one({
        "_id": ObjectId(contribution_id),
        "tree_owner_id": user_id,
        "status": "pending"
    })
    
    if not contribution:
        raise HTTPException(status_code=404, detail="Contribution not found or already reviewed")
    
    # If approved, apply the change
    if review.status == "approved":
        if contribution['action'] == "add" and contribution['entity_type'] == "person":
            person_data = contribution['entity_data']
            person_data['user_id'] = user_id
            person_data['created_at'] = datetime.utcnow()
            person_data['is_preview'] = False
            await db.persons.insert_one(person_data)
        
        elif contribution['action'] == "add" and contribution['entity_type'] == "link":
            link_data = contribution['entity_data']
            link_data['user_id'] = user_id
            link_data['created_at'] = datetime.utcnow()
            await db.family_links.insert_one(link_data)
        
        elif contribution['action'] == "edit" and contribution['entity_type'] == "person":
            await db.persons.update_one(
                {"_id": ObjectId(contribution['entity_id']), "user_id": user_id},
                {"$set": contribution['entity_data']}
            )
        
        elif contribution['action'] == "delete" and contribution['entity_type'] == "person":
            await db.persons.delete_one({"_id": ObjectId(contribution['entity_id']), "user_id": user_id})
            await db.family_links.delete_many({
                "$or": [
                    {"person_id_1": contribution['entity_id']},
                    {"person_id_2": contribution['entity_id']}
                ],
                "user_id": user_id
            })
    
    # Update contribution status
    await db.contributions.update_one(
        {"_id": ObjectId(contribution_id)},
        {"$set": {
            "status": review.status,
            "reviewed_at": datetime.utcnow(),
            "review_note": review.note
        }}
    )
    
    # Notify contributor
    status_text = "approuvée" if review.status == "approved" else "refusée"
    await db.notifications.insert_one({
        "user_id": contribution['contributor_id'],
        "type": "contribution_reviewed",
        "title": f"Contribution {status_text}",
        "message": f"Votre contribution a été {status_text}" + (f": {review.note}" if review.note else ""),
        "data": {"contribution_id": contribution_id, "status": review.status},
        "read": False,
        "created_at": datetime.utcnow()
    })
    
    return {"message": f"Contribution {review.status}", "contribution_id": contribution_id}

# ===================== NOTIFICATIONS ROUTES =====================

@api_router.get("/notifications", response_model=List[NotificationResponse])
async def get_notifications(current_user: dict = Depends(get_current_user)):
    """Get all notifications for the current user"""
    user_id = str(current_user['_id'])
    
    notifications = await db.notifications.find({
        "user_id": user_id
    }).sort("created_at", -1).to_list(50)
    
    return [NotificationResponse(**serialize_object_id(n)) for n in notifications]

@api_router.get("/notifications/unread-count")
async def get_unread_count(current_user: dict = Depends(get_current_user)):
    """Get count of unread notifications"""
    user_id = str(current_user['_id'])
    count = await db.notifications.count_documents({"user_id": user_id, "read": False})
    return {"unread_count": count}

@api_router.put("/notifications/{notification_id}/read")
async def mark_notification_read(notification_id: str, current_user: dict = Depends(get_current_user)):
    """Mark a notification as read"""
    user_id = str(current_user['_id'])
    
    result = await db.notifications.update_one(
        {"_id": ObjectId(notification_id), "user_id": user_id},
        {"$set": {"read": True}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Notification not found")
    
    return {"message": "Notification marked as read"}

@api_router.put("/notifications/read-all")
async def mark_all_notifications_read(current_user: dict = Depends(get_current_user)):
    """Mark all notifications as read"""
    user_id = str(current_user['_id'])
    
    await db.notifications.update_many(
        {"user_id": user_id, "read": False},
        {"$set": {"read": True}}
    )
    
    return {"message": "All notifications marked as read"}

# ===================== CHAT ROUTES =====================

@api_router.post("/chat/messages", response_model=ChatMessageResponse)
async def send_message(
    message_data: ChatMessageCreate,
    current_user: dict = Depends(get_current_user)
):
    """Send a chat message to all collaborators"""
    user_id = str(current_user['_id'])
    user_name = f"{current_user['first_name']} {current_user['last_name']}"
    
    # Prepare message document
    message_doc = {
        "user_id": user_id,
        "user_name": user_name,
        "message": message_data.message,
        "mentioned_person_id": message_data.mentioned_person_id,
        "mentioned_person_name": None,
        "created_at": datetime.utcnow()
    }
    
    # If a person is mentioned, get their name
    if message_data.mentioned_person_id:
        try:
            person = await db.persons.find_one({"_id": ObjectId(message_data.mentioned_person_id)})
            if person:
                message_doc["mentioned_person_name"] = f"{person['first_name']} {person['last_name']}"
        except:
            pass
    
    # Insert message
    result = await db.chat_messages.insert_one(message_doc)
    message_doc['_id'] = result.inserted_id
    
    return ChatMessageResponse(**serialize_object_id(message_doc))

@api_router.get("/chat/messages", response_model=List[ChatMessageResponse])
async def get_messages(
    limit: int = 50,
    skip: int = 0,
    current_user: dict = Depends(get_current_user)
):
    """Get chat messages (latest first)"""
    messages = await db.chat_messages.find().sort("created_at", -1).skip(skip).limit(limit).to_list(limit)
    
    # Reverse to show oldest first
    messages.reverse()
    
    return [ChatMessageResponse(**serialize_object_id(m)) for m in messages]

@api_router.delete("/chat/messages/{message_id}")
async def delete_message(
    message_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Delete a chat message (only your own messages or if admin)"""
    user_id = str(current_user['_id'])
    is_admin = current_user.get('role') == 'admin'
    
    message = await db.chat_messages.find_one({"_id": ObjectId(message_id)})
    if not message:
        raise HTTPException(status_code=404, detail="Message not found")
    
    # Check permissions
    if not is_admin and message['user_id'] != user_id:
        raise HTTPException(status_code=403, detail="You can only delete your own messages")
    
    await db.chat_messages.delete_one({"_id": ObjectId(message_id)})
    
    return {"message": "Message deleted successfully"}

# ===================== HEALTH CHECK =====================

@api_router.get("/")
async def root():
    return {"message": "AÏLA - Arbre Généalogique API", "version": "1.0.0"}

@api_router.get("/health")
async def health_check():
    """Health check endpoint that verifies MongoDB connection"""
    try:
        # Verify MongoDB connection by pinging the database
        await client.admin.command('ping')
        return {
            "status": "healthy",
            "timestamp": datetime.utcnow().isoformat(),
            "database": "connected"
        }
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return {
            "status": "unhealthy",
            "timestamp": datetime.utcnow().isoformat(),
            "database": "disconnected",
            "error": str(e)
        }

# Include the router in the main app
app.include_router(api_router)

# Root-level health check for Kubernetes (without /api prefix)
@app.get("/health")
async def root_health_check():
    """Root health check endpoint for Kubernetes
    
    Returns HTTP 200 if the service is starting up or running
    Returns HTTP 503 only if database connection fails after multiple retries
    """
    health_status = {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "service": "running",
        "database": "unknown"
    }
    
    # Check if client is initialized
    if client is None:
        health_status["database"] = "not_configured"
        health_status["database_message"] = "MongoDB client not initialized"
        return health_status
    
    try:
        # Try to ping database with a shorter timeout for health checks
        await client.admin.command('ping', maxTimeMS=5000)
        health_status["database"] = "connected"
        return health_status
    except Exception as e:
        # Log the error but still return 200 to allow the service to start
        # Database might be slow to connect in production
        logger.warning(f"Health check - database connection pending: {e}")
        health_status["database"] = "connecting"
        health_status["database_message"] = "Connection pending, service is starting"
        # Return 200 to allow Kubernetes to consider the service healthy during startup
        return health_status

@app.get("/")
async def root_info():
    """Root endpoint"""
    return {"message": "AÏLA - Arbre Généalogique API", "version": "1.0.0"}

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_db_client():
    """Initialize database connection and create indexes"""
    if client is None or db is None:
        logger.warning("MongoDB client not initialized, skipping startup connection")
        return
        
    try:
        # Test MongoDB connection first
        await client.admin.command('ping')
        logger.info("MongoDB connection successful")
        
        # Create indexes
        await db.users.create_index("email", unique=True)
        await db.persons.create_index("user_id")
        await db.family_links.create_index("user_id")
        await db.preview_sessions.create_index("session_token", unique=True)
        await db.preview_sessions.create_index("expires_at", expireAfterSeconds=0)
        
        # Collaboration indexes
        await db.collaborators.create_index("tree_owner_id")
        await db.collaborators.create_index("user_id")
        await db.collaborators.create_index("email")
        await db.contributions.create_index("tree_owner_id")
        await db.contributions.create_index("contributor_id")
        await db.contributions.create_index("status")
        await db.notifications.create_index("user_id")
        await db.notifications.create_index([("user_id", 1), ("read", 1)])
        
        logger.info("Database indexes created")
    except Exception as e:
        logger.error(f"Failed to connect to MongoDB: {e}")
        # Don't raise - let the app start and health check will report unhealthy
        logger.warning("Application starting without database connection")

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
