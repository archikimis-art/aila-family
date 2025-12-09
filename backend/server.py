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

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection with timeout settings for Atlas
mongo_url = os.environ.get('MONGO_URL')
if not mongo_url:
    raise RuntimeError("MONGO_URL environment variable is required")

# Configure MongoDB client with timeouts for production (Atlas)
client = AsyncIOMotorClient(
    mongo_url,
    serverSelectionTimeoutMS=5000,  # 5 seconds timeout for server selection
    connectTimeoutMS=10000,  # 10 seconds connection timeout
    socketTimeoutMS=30000,  # 30 seconds socket timeout
    maxPoolSize=10,  # Connection pool size
    retryWrites=True,  # Retry writes on network errors
)
db_name = os.environ.get('DB_NAME', 'aila_db')
db = client[db_name]

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

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

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
    algerian_branch: Optional[str] = None  # wilaya/region

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
    algerian_branch: Optional[str] = None

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
    algerian_branch: Optional[str] = None
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
    
    # Create user
    user_doc = {
        "email": user_data.email,
        "password_hash": hash_password(user_data.password),
        "first_name": user_data.first_name,
        "last_name": user_data.last_name,
        "gdpr_consent": user_data.gdpr_consent,
        "gdpr_consent_date": datetime.utcnow() if user_data.gdpr_consent else None,
        "created_at": datetime.utcnow()
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
            gdpr_consent_date=user_doc.get('gdpr_consent_date')
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
            gdpr_consent_date=user.get('gdpr_consent_date')
        )
    )

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
        gdpr_consent_date=user.get('gdpr_consent_date')
    )

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
        "algerian_branch": person.algerian_branch,
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
    
    result = await db.persons.find_one_and_update(
        {"_id": ObjectId(person_id), "user_id": str(current_user['_id'])},
        {"$set": update_data},
        return_document=True
    )
    if not result:
        raise HTTPException(status_code=404, detail="Person not found")
    return PersonResponse(**serialize_object_id(result))

@api_router.delete("/persons/{person_id}")
async def delete_person(person_id: str, current_user: dict = Depends(get_current_user)):
    result = await db.persons.delete_one({
        "_id": ObjectId(person_id),
        "user_id": str(current_user['_id'])
    })
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Person not found")
    
    # Also delete related links
    await db.family_links.delete_many({
        "$or": [
            {"person_id_1": person_id},
            {"person_id_2": person_id}
        ],
        "user_id": str(current_user['_id'])
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
    
    if link.link_type not in ['parent', 'child', 'spouse']:
        raise HTTPException(status_code=400, detail="Invalid link type. Use: parent, child, spouse")
    
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
    result = await db.family_links.delete_one({
        "_id": ObjectId(link_id),
        "user_id": str(current_user['_id'])
    })
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Link not found")
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
        algerian_branch=p.get('algerian_branch'),
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
        "algerian_branch": person.algerian_branch,
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
            "algerian_branch": p.get('algerian_branch'),
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
    await db.users.delete_one({"_id": current_user['_id']})
    
    return {"message": "Account and all data deleted successfully"}

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
        logger.info("Database indexes created")
    except Exception as e:
        logger.error(f"Failed to connect to MongoDB: {e}")
        # Don't raise - let the app start and health check will report unhealthy
        logger.warning("Application starting without database connection")

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
