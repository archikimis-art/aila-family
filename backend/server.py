from fastapi import FastAPI, APIRouter, HTTPException, Depends, Header
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional, Any
import uuid
from datetime import datetime, timezone, timedelta
import bcrypt
import jwt
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env', override=False)

# MongoDB connection
mongo_url = os.environ.get('MONGO_URL', '')
client = AsyncIOMotorClient(mongo_url)
db_name = os.environ.get('DB_NAME', 'aila')
db = client[db_name]

# JWT Configuration
JWT_SECRET = os.environ.get('JWT_SECRET', 'aila-secret-key-change-in-production-2024')
JWT_ALGORITHM = 'HS256'
JWT_EXPIRATION_HOURS = 24 * 7  # 7 days

# Google OAuth Configuration
GOOGLE_CLIENT_ID = '548263066328-916g23gmboqvmqtd7fi3ejatoseh4h09.apps.googleusercontent.com'

# Create the main app
app = FastAPI(title="AÏLA API", version="1.0.0")

# CORS Configuration - Required for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=[
        "https://www.aila.family",
        "https://aila.family", 
        "http://localhost:3000",
        "http://localhost:8081",
        "http://localhost:19006",
    ],
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=600,
)

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Security
security = HTTPBearer(auto_error=False)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# ============================================================================
# MODELS
# ============================================================================

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    first_name: str
    last_name: str
    gdpr_consent: bool = False

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class GoogleAuthRequest(BaseModel):
    token: Optional[str] = None
    id_token: Optional[str] = None

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: str
    first_name: str
    last_name: str
    gdpr_consent: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    last_login: Optional[datetime] = None
    is_active: bool = True

class UserResponse(BaseModel):
    id: str
    email: str
    first_name: str
    last_name: str
    gdpr_consent: bool
    created_at: Any  # Can be string or datetime
    is_active: bool

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

class Person(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    owner_id: str
    first_name: str
    last_name: str
    birth_date: Optional[str] = None
    death_date: Optional[str] = None
    gender: Optional[str] = None
    photo_url: Optional[str] = None
    bio: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class PersonCreate(BaseModel):
    first_name: str
    last_name: str
    birth_date: Optional[str] = None
    death_date: Optional[str] = None
    gender: Optional[str] = None
    photo_url: Optional[str] = None
    bio: Optional[str] = None

class Link(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    owner_id: str
    person_id_1: str
    person_id_2: str
    link_type: str  # parent, spouse, sibling
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class LinkCreate(BaseModel):
    person_id_1: str
    person_id_2: str
    link_type: str

class StatusCheck(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class StatusCheckCreate(BaseModel):
    client_name: str

# ============================================================================
# HELPER FUNCTIONS
# ============================================================================

def hash_password(password: str) -> str:
    """Hash a password using bcrypt"""
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    """Verify a password against its hash"""
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_access_token(user_id: str, email: str) -> str:
    """Create a JWT access token"""
    payload = {
        'sub': user_id,
        'email': email,
        'exp': datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS),
        'iat': datetime.now(timezone.utc)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def decode_token(token: str) -> dict:
    """Decode and verify a JWT token"""
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    """Get the current authenticated user from JWT token"""
    if not credentials:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    token = credentials.credentials
    payload = decode_token(token)
    
    user = await db.users.find_one({"id": payload['sub']}, {"_id": 0, "password_hash": 0})
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    
    return user

async def get_optional_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> Optional[dict]:
    """Get the current user if authenticated, None otherwise"""
    if not credentials:
        return None
    
    try:
        token = credentials.credentials
        payload = decode_token(token)
        user = await db.users.find_one({"id": payload['sub']}, {"_id": 0, "password_hash": 0})
        return user
    except:
        return None

# ============================================================================
# AUTH ENDPOINTS
# ============================================================================

@api_router.post("/auth/register", response_model=TokenResponse)
async def register(user_data: UserCreate):
    """Register a new user"""
    try:
        # Check if user already exists
        existing = await db.users.find_one({"email": user_data.email.lower()})
        if existing:
            raise HTTPException(status_code=400, detail="Email already registered")
        
        # Create user
        user = User(
            email=user_data.email.lower(),
            first_name=user_data.first_name,
            last_name=user_data.last_name,
            gdpr_consent=user_data.gdpr_consent
        )
        
        # Hash password
        password_hash = hash_password(user_data.password)
        
        # Save to database
        user_doc = user.model_dump()
        user_doc['password_hash'] = password_hash
        for key in ['created_at', 'updated_at', 'last_login']:
            if user_doc.get(key):
                user_doc[key] = user_doc[key].isoformat() if isinstance(user_doc[key], datetime) else user_doc[key]
        
        await db.users.insert_one(user_doc)
        
        # Create token
        token = create_access_token(user.id, user.email)
        
        logger.info(f"New user registered: {user.email}")
        
        return TokenResponse(
            access_token=token,
            user=UserResponse(
                id=user.id,
                email=user.email,
                first_name=user.first_name,
                last_name=user.last_name,
                gdpr_consent=user.gdpr_consent,
                created_at=user.created_at.isoformat(),
                is_active=user.is_active
            )
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Registration error: {e}")
        raise HTTPException(status_code=500, detail="Registration failed")

@api_router.post("/auth/login", response_model=TokenResponse)
async def login(credentials: UserLogin):
    """Login a user"""
    try:
        # Find user
        user = await db.users.find_one({"email": credentials.email.lower()})
        if not user:
            raise HTTPException(status_code=401, detail="Invalid email or password")
        
        # Verify password - check both password_hash and password fields for legacy support
        password_hash = user.get('password_hash') or user.get('password', '')
        if not password_hash:
            logger.error(f"No password hash found for user: {credentials.email}")
            raise HTTPException(status_code=401, detail="Invalid email or password")
        
        if not verify_password(credentials.password, password_hash):
            logger.error(f"Password verification failed for user: {credentials.email}")
            raise HTTPException(status_code=401, detail="Invalid email or password")
        
        # Get or generate user ID (legacy accounts may not have 'id' field)
        user_id = user.get('id') or str(uuid.uuid4())
        
        # If user doesn't have an 'id' field, add one
        if not user.get('id'):
            await db.users.update_one(
                {"email": user['email']},
                {"$set": {"id": user_id}}
            )
        
        # Update last login
        await db.users.update_one(
            {"email": user['email']},
            {"$set": {"last_login": datetime.now(timezone.utc).isoformat()}}
        )
        
        # Create token
        token = create_access_token(user_id, user['email'])
        
        # Handle created_at - could be string or datetime
        created_at = user.get('created_at', '')
        if hasattr(created_at, 'isoformat'):
            created_at = created_at.isoformat()
        elif not isinstance(created_at, str):
            created_at = str(created_at) if created_at else ''
        
        logger.info(f"User logged in: {user['email']}")
        
        return TokenResponse(
            access_token=token,
            user=UserResponse(
                id=user_id,
                email=user['email'],
                first_name=user.get('first_name', ''),
                last_name=user.get('last_name', ''),
                gdpr_consent=user.get('gdpr_consent', False),
                created_at=created_at,
                is_active=user.get('is_active', True)
            )
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Login error for {credentials.email}: {e}")
        raise HTTPException(status_code=500, detail="Login failed")

@api_router.get("/auth/me", response_model=UserResponse)
async def get_me(current_user: dict = Depends(get_current_user)):
    """Get current user info"""
    return UserResponse(
        id=current_user['id'],
        email=current_user['email'],
        first_name=current_user.get('first_name', ''),
        last_name=current_user.get('last_name', ''),
        gdpr_consent=current_user.get('gdpr_consent', False),
        created_at=current_user.get('created_at', ''),
        is_active=current_user.get('is_active', True)
    )

@api_router.post("/auth/google", response_model=TokenResponse)
async def google_auth(auth_data: GoogleAuthRequest):
    """Authenticate with Google OAuth"""
    try:
        google_token = auth_data.token or auth_data.id_token
        if not google_token:
            raise HTTPException(status_code=400, detail="No Google token provided")
        
        try:
            idinfo = id_token.verify_oauth2_token(google_token, google_requests.Request(), GOOGLE_CLIENT_ID)
        except ValueError as e:
            logger.error(f"Google token verification failed: {e}")
            raise HTTPException(status_code=401, detail="Invalid Google token")
        
        google_email = idinfo.get('email', '').lower()
        google_given_name = idinfo.get('given_name', '')
        google_family_name = idinfo.get('family_name', '')
        google_picture = idinfo.get('picture', '')
        
        if not google_email:
            raise HTTPException(status_code=400, detail="Email not provided by Google")
        
        existing_user = await db.users.find_one({"email": google_email})
        
        if existing_user:
            await db.users.update_one({"id": existing_user['id']}, {"$set": {"last_login": datetime.now(timezone.utc).isoformat(), "photo_url": google_picture}})
            user_id = existing_user['id']
            first_name = existing_user.get('first_name', google_given_name)
            last_name = existing_user.get('last_name', google_family_name)
            gdpr_consent = existing_user.get('gdpr_consent', False)
            created_at = existing_user.get('created_at', datetime.now(timezone.utc).isoformat())
            is_active = existing_user.get('is_active', True)
        else:
            user_id = str(uuid.uuid4())
            first_name = google_given_name
            last_name = google_family_name
            gdpr_consent = False
            created_at = datetime.now(timezone.utc).isoformat()
            is_active = True
            await db.users.insert_one({"id": user_id, "email": google_email, "first_name": first_name, "last_name": last_name, "photo_url": google_picture, "gdpr_consent": gdpr_consent, "created_at": created_at, "updated_at": created_at, "last_login": created_at, "is_active": is_active, "auth_provider": "google"})
        
        token = create_access_token(user_id, google_email)
        return TokenResponse(access_token=token, user=UserResponse(id=user_id, email=google_email, first_name=first_name, last_name=last_name, gdpr_consent=gdpr_consent, created_at=created_at, is_active=is_active))
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Google auth error: {e}")
        raise HTTPException(status_code=500, detail="Google authentication failed")

# ============================================================================
# PERSONS ENDPOINTS
# ============================================================================

@api_router.get("/persons")
async def get_persons(current_user: dict = Depends(get_current_user)):
    """Get all persons for the current user"""
    persons = await db.persons.find({"owner_id": current_user['id']}, {"_id": 0}).to_list(1000)
    return persons

@api_router.get("/persons/{person_id}")
async def get_person(person_id: str, current_user: dict = Depends(get_current_user)):
    """Get a specific person"""
    person = await db.persons.find_one({"id": person_id, "owner_id": current_user['id']}, {"_id": 0})
    if not person:
        raise HTTPException(status_code=404, detail="Person not found")
    return person

@api_router.post("/persons")
async def create_person(person_data: PersonCreate, current_user: dict = Depends(get_current_user)):
    """Create a new person"""
    try:
        doc = {
            "id": str(uuid.uuid4()),
            "owner_id": current_user['id'],
            "first_name": person_data.first_name,
            "last_name": person_data.last_name,
            "birth_date": person_data.birth_date,
            "death_date": person_data.death_date,
            "gender": person_data.gender,
            "photo_url": person_data.photo_url,
            "bio": person_data.bio,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
        
        await db.persons.insert_one(doc)
        # Remove _id before returning
        doc.pop('_id', None)
        return doc
    except Exception as e:
        logger.error(f"Error creating person: {e}")
        raise HTTPException(status_code=500, detail=f"Error creating person: {str(e)}")

@api_router.put("/persons/{person_id}")
async def update_person(person_id: str, person_data: PersonCreate, current_user: dict = Depends(get_current_user)):
    """Update a person"""
    existing = await db.persons.find_one({"id": person_id, "owner_id": current_user['id']})
    if not existing:
        raise HTTPException(status_code=404, detail="Person not found")
    
    update_data = person_data.model_dump(exclude_unset=True)
    update_data['updated_at'] = datetime.now(timezone.utc).isoformat()
    
    await db.persons.update_one({"id": person_id}, {"$set": update_data})
    
    updated = await db.persons.find_one({"id": person_id}, {"_id": 0})
    return updated

@api_router.delete("/persons/{person_id}")
async def delete_person(person_id: str, current_user: dict = Depends(get_current_user)):
    """Delete a person"""
    result = await db.persons.delete_one({"id": person_id, "owner_id": current_user['id']})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Person not found")
    
    # Also delete related links
    await db.links.delete_many({
        "owner_id": current_user['id'],
        "$or": [{"person_id_1": person_id}, {"person_id_2": person_id}]
    })
    
    return {"success": True}

# ============================================================================
# LINKS ENDPOINTS
# ============================================================================

@api_router.get("/links")
async def get_links(current_user: dict = Depends(get_current_user)):
    """Get all links for the current user"""
    links = await db.links.find({"owner_id": current_user['id']}, {"_id": 0}).to_list(1000)
    return links

@api_router.post("/links")
async def create_link(link_data: LinkCreate, current_user: dict = Depends(get_current_user)):
    """Create a new link between two persons"""
    try:
        # Verify both persons exist and belong to user
        person1 = await db.persons.find_one({"id": link_data.person_id_1, "owner_id": current_user['id']})
        person2 = await db.persons.find_one({"id": link_data.person_id_2, "owner_id": current_user['id']})
        
        if not person1 or not person2:
            raise HTTPException(status_code=404, detail="One or both persons not found")
        
        doc = {
            "id": str(uuid.uuid4()),
            "owner_id": current_user['id'],
            "person_id_1": link_data.person_id_1,
            "person_id_2": link_data.person_id_2,
            "link_type": link_data.link_type,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        
        await db.links.insert_one(doc)
        doc.pop('_id', None)
        return doc
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating link: {e}")
        raise HTTPException(status_code=500, detail=f"Error creating link: {str(e)}")

@api_router.delete("/links/{link_id}")
async def delete_link(link_id: str, current_user: dict = Depends(get_current_user)):
    """Delete a link"""
    result = await db.links.delete_one({"id": link_id, "owner_id": current_user['id']})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Link not found")
    return {"success": True}

# ============================================================================
# TREE ENDPOINTS
# ============================================================================

@api_router.get("/tree")
async def get_tree(current_user: dict = Depends(get_current_user)):
    """Get the complete family tree for the current user"""
    persons = await db.persons.find({"owner_id": current_user['id']}, {"_id": 0}).to_list(1000)
    links = await db.links.find({"owner_id": current_user['id']}, {"_id": 0}).to_list(1000)
    
    return {
        "persons": persons,
        "links": links
    }

@api_router.delete("/tree/clear")
async def clear_tree(current_user: dict = Depends(get_current_user)):
    """Clear all persons and links for the current user"""
    await db.persons.delete_many({"owner_id": current_user['id']})
    await db.links.delete_many({"owner_id": current_user['id']})
    return {"success": True}

@api_router.get("/tree/debug")
async def debug_tree(current_user: dict = Depends(get_current_user)):
    """Debug endpoint for tree data"""
    persons_count = await db.persons.count_documents({"owner_id": current_user['id']})
    links_count = await db.links.count_documents({"owner_id": current_user['id']})
    
    return {
        "user_id": current_user['id'],
        "persons_count": persons_count,
        "links_count": links_count
    }

# ============================================================================
# PREVIEW ENDPOINTS (for non-authenticated users to try the app)
# ============================================================================

@api_router.post("/preview/session")
async def create_preview_session():
    """Create a new preview session for unauthenticated users"""
    session_token = str(uuid.uuid4())
    session = {
        "token": session_token,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "expires_at": (datetime.now(timezone.utc) + timedelta(hours=24)).isoformat(),
        "persons": [],
        "links": []
    }
    await db.preview_sessions.insert_one(session)
    return {"token": session_token, "expires_in": 86400}

@api_router.post("/preview/demo")
async def create_demo_session():
    """Create a demo session with GENERIC sample family data"""
    session_token = str(uuid.uuid4())
    
    # Generic demo family - NOT real user data
    demo_persons = [
        {"id": str(uuid.uuid4()), "session_token": session_token, "first_name": "Jean", "last_name": "DUPONT", "gender": "male", "birth_date": "1940-05-15"},
        {"id": str(uuid.uuid4()), "session_token": session_token, "first_name": "Marie", "last_name": "DUPONT", "gender": "female", "birth_date": "1942-08-22"},
        {"id": str(uuid.uuid4()), "session_token": session_token, "first_name": "Pierre", "last_name": "DUPONT", "gender": "male", "birth_date": "1965-03-10"},
        {"id": str(uuid.uuid4()), "session_token": session_token, "first_name": "Sophie", "last_name": "MARTIN", "gender": "female", "birth_date": "1968-11-28"},
        {"id": str(uuid.uuid4()), "session_token": session_token, "first_name": "Lucas", "last_name": "DUPONT", "gender": "male", "birth_date": "1995-07-04"},
        {"id": str(uuid.uuid4()), "session_token": session_token, "first_name": "Emma", "last_name": "DUPONT", "gender": "female", "birth_date": "1998-01-19"},
    ]
    
    # Create family links
    demo_links = [
        {"id": str(uuid.uuid4()), "session_token": session_token, "person_id_1": demo_persons[0]["id"], "person_id_2": demo_persons[1]["id"], "link_type": "spouse"},
        {"id": str(uuid.uuid4()), "session_token": session_token, "person_id_1": demo_persons[0]["id"], "person_id_2": demo_persons[2]["id"], "link_type": "parent"},
        {"id": str(uuid.uuid4()), "session_token": session_token, "person_id_1": demo_persons[1]["id"], "person_id_2": demo_persons[2]["id"], "link_type": "parent"},
        {"id": str(uuid.uuid4()), "session_token": session_token, "person_id_1": demo_persons[2]["id"], "person_id_2": demo_persons[3]["id"], "link_type": "spouse"},
        {"id": str(uuid.uuid4()), "session_token": session_token, "person_id_1": demo_persons[2]["id"], "person_id_2": demo_persons[4]["id"], "link_type": "parent"},
        {"id": str(uuid.uuid4()), "session_token": session_token, "person_id_1": demo_persons[3]["id"], "person_id_2": demo_persons[4]["id"], "link_type": "parent"},
        {"id": str(uuid.uuid4()), "session_token": session_token, "person_id_1": demo_persons[2]["id"], "person_id_2": demo_persons[5]["id"], "link_type": "parent"},
        {"id": str(uuid.uuid4()), "session_token": session_token, "person_id_1": demo_persons[3]["id"], "person_id_2": demo_persons[5]["id"], "link_type": "parent"},
    ]
    
    # Create session
    session = {
        "token": session_token,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "expires_at": (datetime.now(timezone.utc) + timedelta(hours=24)).isoformat(),
    }
    
    try:
        await db.preview_sessions.insert_one(session)
        
        # Insert demo persons
        for person in demo_persons:
            person["created_at"] = datetime.now(timezone.utc).isoformat()
            await db.preview_persons.insert_one(person)
        
        # Insert demo links
        for link in demo_links:
            link["created_at"] = datetime.now(timezone.utc).isoformat()
            await db.preview_links.insert_one(link)
            
    except Exception as e:
        logger.error(f"Error creating demo session: {e}")
        # Even if DB inserts fail, return the demo data directly
    
    # Return persons and links without session_token field (clean for frontend)
    clean_persons = [{k: v for k, v in p.items() if k != 'session_token'} for p in demo_persons]
    clean_links = [{k: v for k, v in l.items() if k != 'session_token'} for l in demo_links]
    
    return {
        "session_token": session_token,
        "token": session_token,
        "expires_in": 86400,
        "persons": clean_persons,
        "links": clean_links
    }

@api_router.get("/preview/{token}")
async def get_preview_session(token: str):
    """Get preview session data"""
    session = await db.preview_sessions.find_one({"token": token}, {"_id": 0})
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    persons = await db.preview_persons.find({"session_token": token}, {"_id": 0}).to_list(1000)
    links = await db.preview_links.find({"session_token": token}, {"_id": 0}).to_list(1000)
    
    return {
        "token": token,
        "persons": persons,
        "links": links,
        "created_at": session.get("created_at"),
        "expires_at": session.get("expires_at")
    }

@api_router.post("/preview/{token}/person")
async def add_preview_person(token: str, person_data: dict):
    """Add a person to preview session"""
    session = await db.preview_sessions.find_one({"token": token})
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    person = {
        "id": str(uuid.uuid4()),
        "session_token": token,
        "first_name": person_data.get("first_name", person_data.get("firstName", "")),
        "last_name": person_data.get("last_name", person_data.get("lastName", "")),
        "birth_date": person_data.get("birth_date", person_data.get("birthDate")),
        "death_date": person_data.get("death_date", person_data.get("deathDate")),
        "gender": person_data.get("gender"),
        "photo_url": person_data.get("photo_url", person_data.get("photoUrl")),
        "bio": person_data.get("bio"),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.preview_persons.insert_one(person)
    del person["session_token"]
    return person

@api_router.put("/preview/{token}/person/{person_id}")
async def update_preview_person(token: str, person_id: str, person_data: dict):
    """Update a person in preview session"""
    session = await db.preview_sessions.find_one({"token": token})
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    update_data = {
        "first_name": person_data.get("first_name", person_data.get("firstName")),
        "last_name": person_data.get("last_name", person_data.get("lastName")),
        "birth_date": person_data.get("birth_date", person_data.get("birthDate")),
        "death_date": person_data.get("death_date", person_data.get("deathDate")),
        "gender": person_data.get("gender"),
        "photo_url": person_data.get("photo_url", person_data.get("photoUrl")),
        "bio": person_data.get("bio"),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    # Remove None values
    update_data = {k: v for k, v in update_data.items() if v is not None}
    
    await db.preview_persons.update_one(
        {"id": person_id, "session_token": token},
        {"$set": update_data}
    )
    
    person = await db.preview_persons.find_one({"id": person_id}, {"_id": 0, "session_token": 0})
    return person

@api_router.delete("/preview/{token}/person/{person_id}")
async def delete_preview_person(token: str, person_id: str):
    """Delete a person from preview session"""
    await db.preview_persons.delete_one({"id": person_id, "session_token": token})
    await db.preview_links.delete_many({
        "session_token": token,
        "$or": [{"person_id_1": person_id}, {"person_id_2": person_id}]
    })
    return {"success": True}

@api_router.post("/preview/{token}/link")
async def add_preview_link(token: str, link_data: dict):
    """Add a link to preview session"""
    session = await db.preview_sessions.find_one({"token": token})
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    link = {
        "id": str(uuid.uuid4()),
        "session_token": token,
        "person_id_1": link_data.get("person_id_1", link_data.get("personId1")),
        "person_id_2": link_data.get("person_id_2", link_data.get("personId2")),
        "link_type": link_data.get("link_type", link_data.get("linkType")),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.preview_links.insert_one(link)
    del link["session_token"]
    return link

@api_router.delete("/preview/{token}/link/{link_id}")
async def delete_preview_link(token: str, link_id: str):
    """Delete a link from preview session"""
    await db.preview_links.delete_one({"id": link_id, "session_token": token})
    return {"success": True}

@api_router.post("/preview/{token}/convert")
async def convert_preview_to_account(token: str, current_user: dict = Depends(get_current_user)):
    """Convert preview session data to user account"""
    session = await db.preview_sessions.find_one({"token": token})
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    # Move persons to user
    preview_persons = await db.preview_persons.find({"session_token": token}).to_list(1000)
    for person in preview_persons:
        person["owner_id"] = current_user["id"]
        del person["session_token"]
        del person["_id"]
        await db.persons.insert_one(person)
    
    # Move links to user
    preview_links = await db.preview_links.find({"session_token": token}).to_list(1000)
    for link in preview_links:
        link["owner_id"] = current_user["id"]
        del link["session_token"]
        del link["_id"]
        await db.links.insert_one(link)
    
    # Delete preview data
    await db.preview_persons.delete_many({"session_token": token})
    await db.preview_links.delete_many({"session_token": token})
    await db.preview_sessions.delete_one({"token": token})
    
    return {"success": True, "persons_migrated": len(preview_persons), "links_migrated": len(preview_links)}

# ============================================================================
# EVENTS ENDPOINTS
# ============================================================================

@api_router.get("/events/birthdays")
async def get_upcoming_birthdays(current_user: dict = Depends(get_current_user)):
    """Get upcoming birthdays"""
    persons = await db.persons.find(
        {"owner_id": current_user['id'], "birth_date": {"$ne": None}},
        {"_id": 0}
    ).to_list(1000)
    
    today = datetime.now(timezone.utc)
    birthdays = []
    
    for person in persons:
        if person.get('birth_date'):
            try:
                birth_date = datetime.fromisoformat(person['birth_date'].replace('Z', '+00:00'))
                # Check if birthday is in the next 30 days
                this_year_birthday = birth_date.replace(year=today.year)
                if this_year_birthday < today:
                    this_year_birthday = birth_date.replace(year=today.year + 1)
                
                days_until = (this_year_birthday - today).days
                if 0 <= days_until <= 30:
                    birthdays.append({
                        "person": person,
                        "date": this_year_birthday.isoformat(),
                        "days_until": days_until
                    })
            except:
                pass
    
    birthdays.sort(key=lambda x: x['days_until'])
    return birthdays

@api_router.get("/events/today")
async def get_todays_events(current_user: dict = Depends(get_current_user)):
    """Get today's events"""
    today = datetime.now(timezone.utc).date().isoformat()
    events = await db.events.find(
        {"owner_id": current_user['id'], "event_date": {"$regex": f"^{today}"}},
        {"_id": 0}
    ).to_list(100)
    return events

@api_router.get("/events")
async def get_events(current_user: dict = Depends(get_current_user)):
    """Get all events"""
    events = await db.events.find({"owner_id": current_user['id']}, {"_id": 0}).to_list(1000)
    return events

@api_router.post("/events")
async def create_event(event_data: dict, current_user: dict = Depends(get_current_user)):
    """Create a new event"""
    event = {
        "id": str(uuid.uuid4()),
        "owner_id": current_user['id'],
        "event_type": event_data.get('event_type'),
        "title": event_data.get('title'),
        "description": event_data.get('description'),
        "event_date": event_data.get('event_date'),
        "person_id": event_data.get('person_id'),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.events.insert_one(event)
    return event

@api_router.delete("/events/{event_id}")
async def delete_event(event_id: str, current_user: dict = Depends(get_current_user)):
    """Delete an event"""
    result = await db.events.delete_one({"id": event_id, "owner_id": current_user['id']})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Event not found")
    return {"success": True}

# ============================================================================
# NOTIFICATIONS ENDPOINTS
# ============================================================================

@api_router.get("/notifications")
async def get_notifications(current_user: dict = Depends(get_current_user)):
    """Get all notifications for the current user"""
    notifications = await db.notifications.find(
        {"user_id": current_user['id']},
        {"_id": 0}
    ).sort("created_at", -1).to_list(100)
    return notifications

@api_router.get("/notifications/unread-count")
async def get_unread_count(current_user: dict = Depends(get_current_user)):
    """Get unread notifications count"""
    count = await db.notifications.count_documents({
        "user_id": current_user['id'],
        "read": False
    })
    return {"count": count}

@api_router.put("/notifications/{notification_id}/read")
async def mark_notification_read(notification_id: str, current_user: dict = Depends(get_current_user)):
    """Mark a notification as read"""
    await db.notifications.update_one(
        {"id": notification_id, "user_id": current_user['id']},
        {"$set": {"read": True, "read_at": datetime.now(timezone.utc).isoformat()}}
    )
    return {"success": True}

@api_router.put("/notifications/read-all")
async def mark_all_notifications_read(current_user: dict = Depends(get_current_user)):
    """Mark all notifications as read"""
    await db.notifications.update_many(
        {"user_id": current_user['id'], "read": False},
        {"$set": {"read": True, "read_at": datetime.now(timezone.utc).isoformat()}}
    )
    return {"success": True}

# ============================================================================
# GDPR ENDPOINTS
# ============================================================================

@api_router.get("/gdpr/export")
async def export_data(current_user: dict = Depends(get_current_user)):
    """Export all user data for GDPR compliance"""
    user_data = await db.users.find_one({"id": current_user['id']}, {"_id": 0, "password_hash": 0})
    persons = await db.persons.find({"owner_id": current_user['id']}, {"_id": 0}).to_list(1000)
    links = await db.links.find({"owner_id": current_user['id']}, {"_id": 0}).to_list(1000)
    events = await db.events.find({"owner_id": current_user['id']}, {"_id": 0}).to_list(1000)
    
    return {
        "user": user_data,
        "persons": persons,
        "links": links,
        "events": events,
        "exported_at": datetime.now(timezone.utc).isoformat()
    }

@api_router.delete("/gdpr/delete-account")
async def delete_account(current_user: dict = Depends(get_current_user)):
    """Delete user account and all associated data"""
    user_id = current_user['id']
    
    # Delete all user data
    await db.persons.delete_many({"owner_id": user_id})
    await db.links.delete_many({"owner_id": user_id})
    await db.events.delete_many({"owner_id": user_id})
    await db.notifications.delete_many({"user_id": user_id})
    await db.user_reminders.delete_many({"user_id": user_id})
    await db.users.delete_one({"id": user_id})
    
    logger.info(f"User account deleted: {current_user['email']}")
    
    return {"success": True, "message": "Account deleted"}

# ============================================================================
# TREE EXPORT ENDPOINTS
# ============================================================================

@api_router.get("/tree/export/json")
async def export_tree_json(current_user: dict = Depends(get_current_user)):
    """Export family tree as JSON"""
    persons = await db.persons.find({"owner_id": current_user['id']}, {"_id": 0}).to_list(1000)
    links = await db.links.find({"owner_id": current_user['id']}, {"_id": 0}).to_list(1000)
    
    return {
        "format": "AILA JSON",
        "version": "1.0",
        "exported_at": datetime.now(timezone.utc).isoformat(),
        "owner": {
            "email": current_user.get('email'),
            "name": f"{current_user.get('first_name', '')} {current_user.get('last_name', '')}".strip()
        },
        "persons": persons,
        "links": links,
        "stats": {
            "total_persons": len(persons),
            "total_links": len(links)
        }
    }

@api_router.get("/tree/export/gedcom")
async def export_tree_gedcom(current_user: dict = Depends(get_current_user)):
    """Export family tree as GEDCOM format"""
    persons = await db.persons.find({"owner_id": current_user['id']}, {"_id": 0}).to_list(1000)
    links = await db.links.find({"owner_id": current_user['id']}, {"_id": 0}).to_list(1000)
    
    # Generate GEDCOM content
    gedcom_lines = [
        "0 HEAD",
        "1 SOUR AILA",
        "2 VERS 1.0",
        "1 GEDC",
        "2 VERS 5.5.1",
        "2 FORM LINEAGE-LINKED",
        "1 CHAR UTF-8",
        f"1 DATE {datetime.now(timezone.utc).strftime('%d %b %Y').upper()}",
    ]
    
    # Add individuals
    for person in persons:
        pid = person.get('id', '')[:8]
        gedcom_lines.append(f"0 @I{pid}@ INDI")
        gedcom_lines.append(f"1 NAME {person.get('first_name', '')} /{person.get('last_name', '')}/")
        if person.get('gender'):
            sex = 'M' if person.get('gender') == 'male' else 'F' if person.get('gender') == 'female' else 'U'
            gedcom_lines.append(f"1 SEX {sex}")
        if person.get('birth_date'):
            gedcom_lines.append("1 BIRT")
            gedcom_lines.append(f"2 DATE {person.get('birth_date')}")
        if person.get('death_date'):
            gedcom_lines.append("1 DEAT")
            gedcom_lines.append(f"2 DATE {person.get('death_date')}")
    
    gedcom_lines.append("0 TRLR")
    
    return {
        "content": "\n".join(gedcom_lines),
        "filename": f"aila_tree_{datetime.now(timezone.utc).strftime('%Y%m%d')}.ged"
    }

# ============================================================================
# STATUS ENDPOINTS
# ============================================================================

@api_router.get("/")
async def root():
    return {"message": "AÏLA API v1.0", "status": "healthy"}

@api_router.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now(timezone.utc).isoformat()}

# ============================================================================
# STUB ENDPOINTS (to prevent 404 errors)
# ============================================================================

@api_router.get("/stripe/subscription-status")
async def get_subscription_status(current_user: dict = Depends(get_current_user)):
    """Get subscription status (stub - premium not implemented)"""
    return {"status": "free", "plan": "free", "features": []}

@api_router.get("/collaborators")
async def get_collaborators(current_user: dict = Depends(get_current_user)):
    """Get collaborators for current user's tree"""
    collaborators = await db.collaborators.find(
        {"owner_id": current_user['id']}, 
        {"_id": 0}
    ).to_list(100)
    return collaborators

@api_router.get("/collaborators/shared-with-me")
async def get_shared_trees(current_user: dict = Depends(get_current_user)):
    """Get trees shared with current user"""
    shared = await db.collaborators.find(
        {"email": current_user.get('email')}, 
        {"_id": 0}
    ).to_list(100)
    return shared

@api_router.post("/collaborators/invite")
async def invite_collaborator(data: dict, current_user: dict = Depends(get_current_user)):
    """Invite someone to collaborate on your tree"""
    email = data.get('email', '').strip().lower()
    role = data.get('role', 'viewer')
    
    if not email:
        raise HTTPException(status_code=400, detail="Email is required")
    
    # Check if already invited
    existing = await db.collaborators.find_one({
        "owner_id": current_user['id'],
        "email": email
    })
    if existing:
        raise HTTPException(status_code=400, detail="This person is already invited")
    
    # Create invitation
    invitation = {
        "id": str(uuid.uuid4()),
        "owner_id": current_user['id'],
        "owner_name": f"{current_user.get('first_name', '')} {current_user.get('last_name', '')}".strip(),
        "owner_email": current_user.get('email'),
        "email": email,
        "role": role,
        "status": "pending",
        "invited_at": datetime.now(timezone.utc).isoformat(),
    }
    
    await db.collaborators.insert_one(invitation)
    logger.info(f"Invitation sent from {current_user['email']} to {email}")
    
    return {"success": True, "message": f"Invitation envoyée à {email}"}

@api_router.post("/collaborators/accept/{invite_id}")
async def accept_invitation(invite_id: str, current_user: dict = Depends(get_current_user)):
    """Accept a collaboration invitation"""
    invitation = await db.collaborators.find_one({"id": invite_id})
    if not invitation:
        raise HTTPException(status_code=404, detail="Invitation not found")
    
    if invitation.get('email') != current_user.get('email'):
        raise HTTPException(status_code=403, detail="This invitation is not for you")
    
    await db.collaborators.update_one(
        {"id": invite_id},
        {"$set": {"status": "accepted", "accepted_at": datetime.now(timezone.utc).isoformat()}}
    )
    
    return {"success": True, "message": "Invitation acceptée"}

@api_router.delete("/collaborators/{collaborator_id}")
async def remove_collaborator(collaborator_id: str, current_user: dict = Depends(get_current_user)):
    """Remove a collaborator"""
    result = await db.collaborators.delete_one({
        "id": collaborator_id,
        "owner_id": current_user['id']
    })
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Collaborator not found")
    return {"success": True}

# ============================================================================
# SHARED TREE ENDPOINTS
# ============================================================================

@api_router.get("/tree/shared/{owner_id}")
async def get_shared_tree(owner_id: str, current_user: dict = Depends(get_current_user)):
    """Get a shared tree by owner ID"""
    # Check if user has access to this tree
    collaboration = await db.collaborators.find_one({
        "owner_id": owner_id,
        "email": current_user.get('email'),
        "status": "accepted"
    })
    if not collaboration:
        raise HTTPException(status_code=403, detail="You don't have access to this tree")
    
    persons = await db.persons.find({"owner_id": owner_id}, {"_id": 0}).to_list(1000)
    links = await db.links.find({"owner_id": owner_id}, {"_id": 0}).to_list(1000)
    
    return {"persons": persons, "links": links}

@api_router.post("/tree/shared/{owner_id}/persons")
async def add_person_to_shared_tree(owner_id: str, person_data: dict, current_user: dict = Depends(get_current_user)):
    """Add a person to a shared tree (creates a contribution for review)"""
    collaboration = await db.collaborators.find_one({
        "owner_id": owner_id,
        "email": current_user.get('email'),
        "status": "accepted"
    })
    if not collaboration or collaboration.get('role') != 'editor':
        raise HTTPException(status_code=403, detail="You don't have edit access to this tree")
    
    # Create contribution for review
    contribution = {
        "id": str(uuid.uuid4()),
        "tree_owner_id": owner_id,
        "contributor_id": current_user['id'],
        "contributor_email": current_user.get('email'),
        "type": "add_person",
        "data": person_data,
        "status": "pending",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.contributions.insert_one(contribution)
    return {"success": True, "message": "Contribution soumise pour révision", "contribution_id": contribution["id"]}

@api_router.post("/tree/shared/{owner_id}/links")
async def add_link_to_shared_tree(owner_id: str, link_data: dict, current_user: dict = Depends(get_current_user)):
    """Add a link to a shared tree (creates a contribution for review)"""
    collaboration = await db.collaborators.find_one({
        "owner_id": owner_id,
        "email": current_user.get('email'),
        "status": "accepted"
    })
    if not collaboration or collaboration.get('role') != 'editor':
        raise HTTPException(status_code=403, detail="You don't have edit access to this tree")
    
    contribution = {
        "id": str(uuid.uuid4()),
        "tree_owner_id": owner_id,
        "contributor_id": current_user['id'],
        "contributor_email": current_user.get('email'),
        "type": "add_link",
        "data": link_data,
        "status": "pending",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.contributions.insert_one(contribution)
    return {"success": True, "message": "Contribution soumise pour révision", "contribution_id": contribution["id"]}

# ============================================================================
# CONTRIBUTIONS ENDPOINTS
# ============================================================================

@api_router.post("/contributions")
async def create_contribution(data: dict, owner_id: str = None, current_user: dict = Depends(get_current_user)):
    """Create a contribution"""
    contribution = {
        "id": str(uuid.uuid4()),
        "tree_owner_id": owner_id or data.get('owner_id'),
        "contributor_id": current_user['id'],
        "contributor_email": current_user.get('email'),
        "type": data.get('type', 'suggestion'),
        "data": data,
        "status": "pending",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.contributions.insert_one(contribution)
    return {"success": True, "contribution_id": contribution["id"]}

@api_router.get("/contributions/pending")
async def get_pending_contributions(current_user: dict = Depends(get_current_user)):
    """Get pending contributions for trees you own"""
    contributions = await db.contributions.find({
        "tree_owner_id": current_user['id'],
        "status": "pending"
    }, {"_id": 0}).to_list(100)
    return contributions

@api_router.get("/contributions/my")
async def get_my_contributions(current_user: dict = Depends(get_current_user)):
    """Get contributions made by current user"""
    contributions = await db.contributions.find({
        "contributor_id": current_user['id']
    }, {"_id": 0}).to_list(100)
    return contributions

@api_router.post("/contributions/{contribution_id}/review")
async def review_contribution(contribution_id: str, data: dict, current_user: dict = Depends(get_current_user)):
    """Review a contribution (approve/reject)"""
    contribution = await db.contributions.find_one({"id": contribution_id})
    if not contribution:
        raise HTTPException(status_code=404, detail="Contribution not found")
    
    if contribution.get('tree_owner_id') != current_user['id']:
        raise HTTPException(status_code=403, detail="You can only review contributions to your own tree")
    
    status = data.get('status')  # 'approved' or 'rejected'
    note = data.get('note', '')
    
    await db.contributions.update_one(
        {"id": contribution_id},
        {"$set": {
            "status": status,
            "review_note": note,
            "reviewed_at": datetime.now(timezone.utc).isoformat(),
            "reviewed_by": current_user['id']
        }}
    )
    
    # If approved, apply the contribution
    if status == 'approved':
        if contribution.get('type') == 'add_person':
            person_data = contribution.get('data', {})
            person = {
                "id": str(uuid.uuid4()),
                "owner_id": current_user['id'],
                **person_data,
                "created_at": datetime.now(timezone.utc).isoformat()
            }
            await db.persons.insert_one(person)
        elif contribution.get('type') == 'add_link':
            link_data = contribution.get('data', {})
            link = {
                "id": str(uuid.uuid4()),
                "owner_id": current_user['id'],
                **link_data,
                "created_at": datetime.now(timezone.utc).isoformat()
            }
            await db.links.insert_one(link)
    
    return {"success": True, "status": status}

# ============================================================================
# CHAT ENDPOINTS
# ============================================================================

@api_router.get("/chat/messages")
async def get_chat_messages(limit: int = 50, skip: int = 0, current_user: dict = Depends(get_current_user)):
    """Get family chat messages"""
    messages = await db.chat_messages.find(
        {"tree_owner_id": current_user['id']},
        {"_id": 0}
    ).sort("created_at", -1).skip(skip).limit(limit).to_list(limit)
    return messages

@api_router.post("/chat/messages")
async def send_chat_message(data: dict, current_user: dict = Depends(get_current_user)):
    """Send a chat message"""
    message = {
        "id": str(uuid.uuid4()),
        "tree_owner_id": current_user['id'],
        "sender_id": current_user['id'],
        "sender_name": f"{current_user.get('first_name', '')} {current_user.get('last_name', '')}".strip(),
        "sender_email": current_user.get('email'),
        "message": data.get('message', ''),
        "mentioned_person_id": data.get('mentioned_person_id'),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.chat_messages.insert_one(message)
    return message

@api_router.delete("/chat/messages/{message_id}")
async def delete_chat_message(message_id: str, current_user: dict = Depends(get_current_user)):
    """Delete a chat message"""
    result = await db.chat_messages.delete_one({
        "id": message_id,
        "sender_id": current_user['id']
    })
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Message not found or not yours")
    return {"success": True}

# ============================================================================
# TREE MERGE ENDPOINTS
# ============================================================================

@api_router.get("/tree/merge/shared-trees")
async def get_mergeable_trees(current_user: dict = Depends(get_current_user)):
    """Get trees that can be merged with current user's tree"""
    # Find trees shared with current user
    collaborations = await db.collaborators.find({
        "email": current_user.get('email'),
        "status": "accepted"
    }, {"_id": 0}).to_list(100)
    
    mergeable = []
    for collab in collaborations:
        owner = await db.users.find_one({"id": collab.get('owner_id')}, {"_id": 0, "password_hash": 0})
        if owner:
            person_count = await db.persons.count_documents({"owner_id": collab.get('owner_id')})
            mergeable.append({
                "owner_id": collab.get('owner_id'),
                "owner_name": f"{owner.get('first_name', '')} {owner.get('last_name', '')}".strip(),
                "owner_email": owner.get('email'),
                "person_count": person_count,
                "role": collab.get('role')
            })
    
    return mergeable

@api_router.post("/tree/merge/analyze")
async def analyze_merge(source_tree_owner_id: str, current_user: dict = Depends(get_current_user)):
    """Analyze potential merge conflicts between two trees"""
    # Get both trees
    my_persons = await db.persons.find({"owner_id": current_user['id']}, {"_id": 0}).to_list(1000)
    source_persons = await db.persons.find({"owner_id": source_tree_owner_id}, {"_id": 0}).to_list(1000)
    
    # Find potential duplicates by name
    duplicates = []
    for sp in source_persons:
        for mp in my_persons:
            if (sp.get('first_name', '').lower() == mp.get('first_name', '').lower() and
                sp.get('last_name', '').lower() == mp.get('last_name', '').lower()):
                duplicates.append({
                    "source_person": sp,
                    "my_person": mp,
                    "match_type": "name"
                })
    
    return {
        "my_tree_count": len(my_persons),
        "source_tree_count": len(source_persons),
        "potential_duplicates": duplicates,
        "new_persons": len(source_persons) - len(duplicates)
    }

@api_router.post("/tree/merge/execute")
async def execute_merge(data: dict, current_user: dict = Depends(get_current_user)):
    """Execute a tree merge"""
    source_tree_owner_id = data.get('source_tree_owner_id')
    merge_strategy = data.get('merge_strategy', 'add_new')  # 'add_new', 'replace', 'skip_duplicates'
    
    source_persons = await db.persons.find({"owner_id": source_tree_owner_id}, {"_id": 0}).to_list(1000)
    source_links = await db.links.find({"owner_id": source_tree_owner_id}, {"_id": 0}).to_list(1000)
    
    merged_persons = 0
    merged_links = 0
    
    # Map old IDs to new IDs for link migration
    id_map = {}
    
    for person in source_persons:
        old_id = person.get('id')
        new_id = str(uuid.uuid4())
        id_map[old_id] = new_id
        
        new_person = {
            **person,
            "id": new_id,
            "owner_id": current_user['id'],
            "merged_from": source_tree_owner_id,
            "merged_at": datetime.now(timezone.utc).isoformat()
        }
        await db.persons.insert_one(new_person)
        merged_persons += 1
    
    for link in source_links:
        new_link = {
            **link,
            "id": str(uuid.uuid4()),
            "owner_id": current_user['id'],
            "person_id_1": id_map.get(link.get('person_id_1'), link.get('person_id_1')),
            "person_id_2": id_map.get(link.get('person_id_2'), link.get('person_id_2')),
            "merged_from": source_tree_owner_id,
            "merged_at": datetime.now(timezone.utc).isoformat()
        }
        await db.links.insert_one(new_link)
        merged_links += 1
    
    return {
        "success": True,
        "merged_persons": merged_persons,
        "merged_links": merged_links
    }

# ============================================================================
# AUTH - FORGOT/RESET PASSWORD ENDPOINTS
# ============================================================================

@api_router.post("/auth/forgot-password")
async def forgot_password(data: dict):
    """Request password reset"""
    email = data.get('email', '').strip().lower()
    if not email:
        raise HTTPException(status_code=400, detail="Email is required")
    
    user = await db.users.find_one({"email": email})
    if not user:
        # Don't reveal if email exists or not
        return {"success": True, "message": "Si cet email existe, vous recevrez un lien de réinitialisation."}
    
    # Generate reset token
    reset_token = str(uuid.uuid4())
    expires_at = datetime.now(timezone.utc) + timedelta(hours=1)
    
    await db.password_resets.insert_one({
        "token": reset_token,
        "user_id": user.get('id'),
        "email": email,
        "expires_at": expires_at.isoformat(),
        "used": False,
        "created_at": datetime.now(timezone.utc).isoformat()
    })
    
    # TODO: Send email with reset link
    logger.info(f"Password reset requested for {email}, token: {reset_token}")
    
    return {"success": True, "message": "Si cet email existe, vous recevrez un lien de réinitialisation."}

@api_router.post("/auth/reset-password")
async def reset_password(data: dict):
    """Reset password with token"""
    token = data.get('token', '')
    new_password = data.get('password', '')
    
    if not token or not new_password:
        raise HTTPException(status_code=400, detail="Token and password are required")
    
    if len(new_password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters")
    
    reset_request = await db.password_resets.find_one({
        "token": token,
        "used": False
    })
    
    if not reset_request:
        raise HTTPException(status_code=400, detail="Invalid or expired token")
    
    # Check expiration
    expires_at = datetime.fromisoformat(reset_request['expires_at'].replace('Z', '+00:00'))
    if datetime.now(timezone.utc) > expires_at:
        raise HTTPException(status_code=400, detail="Token has expired")
    
    # Update password
    new_hash = hash_password(new_password)
    await db.users.update_one(
        {"id": reset_request['user_id']},
        {"$set": {"password_hash": new_hash, "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    
    # Mark token as used
    await db.password_resets.update_one(
        {"token": token},
        {"$set": {"used": True}}
    )
    
    logger.info(f"Password reset completed for user {reset_request['user_id']}")
    
    return {"success": True, "message": "Mot de passe réinitialisé avec succès"}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.model_dump()
    status_obj = StatusCheck(**status_dict)
    
    doc = status_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    
    await db.status_checks.insert_one(doc)
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    status_checks = await db.status_checks.find({}, {"_id": 0}).to_list(1000)
    
    for check in status_checks:
        if isinstance(check['timestamp'], str):
            check['timestamp'] = datetime.fromisoformat(check['timestamp'])
    
    return status_checks

# ============================================================================
# REMINDER SYSTEM
# ============================================================================

class ReminderType(str):
    CONTINUE_TREE = "continue_tree"
    INVITE_FAMILY = "invite_family"
    COMPLETE_PROFILE = "complete_profile"
    ADD_PHOTOS = "add_photos"
    CUSTOM = "custom"

class ReminderCreate(BaseModel):
    user_id: Optional[str] = None
    reminder_type: str = "continue_tree"
    title: str
    message: str
    send_email: bool = False
    send_push: bool = True
    scheduled_at: Optional[datetime] = None

class Reminder(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: Optional[str] = None
    reminder_type: str
    title: str
    message: str
    send_email: bool = False
    send_push: bool = True
    scheduled_at: Optional[datetime] = None
    sent_at: Optional[datetime] = None
    read_at: Optional[datetime] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    created_by: Optional[str] = None
    status: str = "pending"

class FamilyReminderCreate(BaseModel):
    family_member_email: str
    family_member_name: str
    sender_name: str
    custom_message: Optional[str] = None

class ReminderStats(BaseModel):
    total_sent: int
    total_read: int
    total_pending: int
    read_rate: float

@api_router.post("/reminders", response_model=Reminder)
async def create_reminder(reminder: ReminderCreate):
    """Create a new reminder (admin only)"""
    try:
        reminder_obj = Reminder(
            user_id=reminder.user_id,
            reminder_type=reminder.reminder_type,
            title=reminder.title,
            message=reminder.message,
            send_email=reminder.send_email,
            send_push=reminder.send_push,
            scheduled_at=reminder.scheduled_at,
            status="pending" if reminder.scheduled_at else "sent",
            sent_at=None if reminder.scheduled_at else datetime.now(timezone.utc)
        )
        
        doc = reminder_obj.model_dump()
        for key in ['scheduled_at', 'sent_at', 'read_at', 'created_at']:
            if doc.get(key):
                doc[key] = doc[key].isoformat()
        
        await db.reminders.insert_one(doc)
        
        if reminder.user_id is None:
            users = await db.users.find({}, {"id": 1}).to_list(10000)
            for user in users:
                user_reminder = doc.copy()
                user_reminder['id'] = str(uuid.uuid4())
                user_reminder['user_id'] = user.get('id')
                await db.user_reminders.insert_one(user_reminder)
        else:
            await db.user_reminders.insert_one(doc)
        
        logger.info(f"Reminder created: {reminder_obj.id}")
        return reminder_obj
    except Exception as e:
        logger.error(f"Error creating reminder: {e}")
        raise

@api_router.get("/reminders", response_model=List[Reminder])
async def get_reminders(limit: int = 50, skip: int = 0):
    """Get all reminders (admin only)"""
    reminders = await db.reminders.find({}, {"_id": 0}).sort("created_at", -1).skip(skip).limit(limit).to_list(limit)
    
    for r in reminders:
        for key in ['scheduled_at', 'sent_at', 'read_at', 'created_at']:
            if r.get(key) and isinstance(r[key], str):
                r[key] = datetime.fromisoformat(r[key])
    
    return reminders

@api_router.get("/reminders/user/{user_id}", response_model=List[Reminder])
async def get_user_reminders(user_id: str):
    """Get reminders for a specific user"""
    reminders = await db.user_reminders.find(
        {"user_id": user_id, "status": {"$in": ["sent", "pending"]}}, 
        {"_id": 0}
    ).sort("created_at", -1).to_list(50)
    
    for r in reminders:
        for key in ['scheduled_at', 'sent_at', 'read_at', 'created_at']:
            if r.get(key) and isinstance(r[key], str):
                r[key] = datetime.fromisoformat(r[key])
    
    return reminders

@api_router.put("/reminders/{reminder_id}/read")
async def mark_reminder_read(reminder_id: str, user_id: str):
    """Mark a reminder as read"""
    await db.user_reminders.update_one(
        {"id": reminder_id, "user_id": user_id},
        {"$set": {"read_at": datetime.now(timezone.utc).isoformat(), "status": "read"}}
    )
    return {"success": True}

@api_router.get("/reminders/stats", response_model=ReminderStats)
async def get_reminder_stats():
    """Get reminder statistics (admin only)"""
    total_sent = await db.user_reminders.count_documents({"status": "sent"})
    total_read = await db.user_reminders.count_documents({"status": "read"})
    total_pending = await db.user_reminders.count_documents({"status": "pending"})
    
    read_rate = (total_read / total_sent * 100) if total_sent > 0 else 0
    
    return ReminderStats(
        total_sent=total_sent,
        total_read=total_read,
        total_pending=total_pending,
        read_rate=round(read_rate, 1)
    )

@api_router.post("/reminders/family")
async def send_family_reminder(reminder: FamilyReminderCreate):
    """Send a reminder to a family member to join the tree"""
    try:
        doc = {
            "id": str(uuid.uuid4()),
            "email": reminder.family_member_email,
            "name": reminder.family_member_name,
            "sender_name": reminder.sender_name,
            "message": reminder.custom_message or f"{reminder.sender_name} vous invite à rejoindre l'arbre familial sur AÏLA !",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "status": "sent"
        }
        await db.family_reminders.insert_one(doc)
        
        logger.info(f"Family reminder sent to {reminder.family_member_email} from {reminder.sender_name}")
        
        return {"success": True, "message": f"Rappel envoyé à {reminder.family_member_name}"}
    except Exception as e:
        logger.error(f"Error sending family reminder: {e}")
        return {"success": False, "message": str(e)}

@api_router.get("/reminders/templates")
async def get_reminder_templates():
    """Get predefined reminder templates"""
    templates = [
        {
            "id": "continue_tree",
            "title": "Continuez votre arbre ! 🌳",
            "message": "Votre arbre familial vous attend ! Ajoutez de nouveaux membres pour le faire grandir.",
            "icon": "leaf"
        },
        {
            "id": "invite_family",
            "title": "Invitez votre famille ! 👨‍👩‍👧‍👦",
            "message": "Partagez votre arbre avec vos proches pour qu'ils puissent contribuer aussi.",
            "icon": "people"
        },
        {
            "id": "add_photos",
            "title": "Ajoutez des photos ! 📸",
            "message": "Donnez vie à votre arbre en ajoutant des photos de vos proches.",
            "icon": "camera"
        },
        {
            "id": "complete_profile",
            "title": "Complétez les profils ! ✏️",
            "message": "Ajoutez des dates de naissance et des informations sur vos ancêtres.",
            "icon": "create"
        },
        {
            "id": "weekly_update",
            "title": "Nouveautés de la semaine ! ✨",
            "message": "Découvrez les nouvelles fonctionnalités et continuez à enrichir votre arbre.",
            "icon": "sparkles"
        }
    ]
    return templates

# ============================================================================
# ADMIN ENDPOINTS
# ============================================================================

# Admin credentials (in production, use environment variables)
ADMIN_EMAIL = os.environ.get('ADMIN_EMAIL', 'admin@aila.family')
ADMIN_PASSWORD = os.environ.get('ADMIN_PASSWORD', 'AilaAdmin2024!')

class AdminLogin(BaseModel):
    email: str
    password: str

class PasswordReset(BaseModel):
    new_password: str

@api_router.post("/admin/login")
async def admin_login(credentials: AdminLogin):
    """Admin login endpoint"""
    if credentials.email == ADMIN_EMAIL and credentials.password == ADMIN_PASSWORD:
        token = create_access_token("admin", ADMIN_EMAIL)
        return {"access_token": token, "token_type": "bearer", "role": "admin"}
    raise HTTPException(status_code=401, detail="Invalid admin credentials")

async def verify_admin_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Verify admin token"""
    if not credentials:
        raise HTTPException(status_code=401, detail="Admin authentication required")
    try:
        payload = decode_token(credentials.credentials)
        if payload.get('email') != ADMIN_EMAIL:
            raise HTTPException(status_code=403, detail="Admin access required")
        return payload
    except:
        raise HTTPException(status_code=401, detail="Invalid admin token")

@api_router.get("/admin/stats")
async def get_admin_stats(admin: dict = Depends(verify_admin_token)):
    """Get admin statistics"""
    total_users = await db.users.count_documents({})
    total_persons = await db.persons.count_documents({})
    total_links = await db.links.count_documents({})
    
    # Users created in different time periods
    now = datetime.now(timezone.utc)
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0).isoformat()
    week_ago = (now - timedelta(days=7)).isoformat()
    month_ago = (now - timedelta(days=30)).isoformat()
    
    users_today = await db.users.count_documents({"created_at": {"$gte": today_start}})
    users_this_week = await db.users.count_documents({"created_at": {"$gte": week_ago}})
    users_this_month = await db.users.count_documents({"created_at": {"$gte": month_ago}})
    
    return {
        "total_users": total_users,
        "total_persons": total_persons,
        "total_links": total_links,
        "users_today": users_today,
        "users_this_week": users_this_week,
        "users_this_month": users_this_month,
        "premium_users": 0
    }

@api_router.get("/admin/users")
async def get_admin_users(limit: int = 100, search: str = None, admin: dict = Depends(verify_admin_token)):
    """Get all users for admin"""
    query = {}
    if search:
        query = {"$or": [
            {"email": {"$regex": search, "$options": "i"}},
            {"first_name": {"$regex": search, "$options": "i"}},
            {"last_name": {"$regex": search, "$options": "i"}}
        ]}
    
    total = await db.users.count_documents(query)
    users = await db.users.find(query, {"_id": 0, "password_hash": 0}).limit(limit).to_list(limit)
    return {"users": users, "total": total}

@api_router.get("/admin/users/{user_id}")
async def get_admin_user(user_id: str, admin: dict = Depends(verify_admin_token)):
    """Get specific user details"""
    user = await db.users.find_one({"id": user_id}, {"_id": 0, "password_hash": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Get user's tree stats
    persons_count = await db.persons.count_documents({"owner_id": user_id})
    links_count = await db.links.count_documents({"owner_id": user_id})
    
    user["persons_count"] = persons_count
    user["links_count"] = links_count
    return user

@api_router.post("/admin/users/{user_id}/reset-password")
async def reset_user_password(user_id: str, data: PasswordReset, admin: dict = Depends(verify_admin_token)):
    """Reset a user's password (admin only)"""
    user = await db.users.find_one({"id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Hash new password
    new_hash = hash_password(data.new_password)
    
    await db.users.update_one(
        {"id": user_id},
        {"$set": {"password_hash": new_hash, "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    
    logger.info(f"Admin reset password for user: {user['email']}")
    return {"success": True, "message": f"Password reset for {user['email']}"}

@api_router.post("/admin/migrate-to-aila-db")
async def migrate_to_aila_db(admin: dict = Depends(verify_admin_token)):
    """Migrate data from 'aila' database to 'aila_db' database"""
    try:
        # Connect to both databases
        source_db = client['aila']
        target_db = client['aila_db']
        
        migrated = {"users": 0, "persons": 0, "links": 0}
        
        # Migrate users
        source_users = await source_db.users.find({}, {"_id": 0}).to_list(1000)
        for user in source_users:
            existing = await target_db.users.find_one({"email": user.get("email")})
            if not existing:
                await target_db.users.insert_one(user)
                migrated["users"] += 1
        
        # Migrate persons
        source_persons = await source_db.persons.find({}, {"_id": 0}).to_list(10000)
        for person in source_persons:
            existing = await target_db.persons.find_one({"id": person.get("id")})
            if not existing:
                await target_db.persons.insert_one(person)
                migrated["persons"] += 1
        
        # Migrate links
        source_links = await source_db.links.find({}, {"_id": 0}).to_list(10000)
        for link in source_links:
            existing = await target_db.links.find_one({"id": link.get("id")})
            if not existing:
                await target_db.links.insert_one(link)
                migrated["links"] += 1
        
        logger.info(f"Migration complete: {migrated}")
        return {"success": True, "migrated": migrated}
    except Exception as e:
        logger.error(f"Migration error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/admin/fix-owner-ids")
async def fix_owner_ids(admin: dict = Depends(verify_admin_token)):
    """Fix owner_id in persons and links to match user IDs"""
    try:
        fixed = {"persons": 0, "links": 0}
        
        # Get all users with their emails and IDs
        users = await db.users.find({}, {"_id": 0}).to_list(1000)
        email_to_id = {}
        for user in users:
            if user.get('id') and user.get('email'):
                email_to_id[user['email'].lower()] = user['id']
                # Also map old-style owner_id (email) to new ID
                email_to_id[user['email']] = user['id']
        
        # Fix persons - update owner_id if it's an email to use the user's ID
        persons = await db.persons.find({}, {"_id": 0}).to_list(10000)
        for person in persons:
            owner_id = person.get('owner_id', '')
            # Check if owner_id is an email (contains @)
            if '@' in str(owner_id) and owner_id.lower() in email_to_id:
                new_owner_id = email_to_id[owner_id.lower()]
                await db.persons.update_one(
                    {"id": person['id']},
                    {"$set": {"owner_id": new_owner_id}}
                )
                fixed["persons"] += 1
            # Also check if owner_id doesn't exist in users
            elif owner_id and owner_id not in [u.get('id') for u in users]:
                # Try to find user by matching patterns
                for email, uid in email_to_id.items():
                    if email in str(owner_id).lower() or str(owner_id) in email:
                        await db.persons.update_one(
                            {"id": person['id']},
                            {"$set": {"owner_id": uid}}
                        )
                        fixed["persons"] += 1
                        break
        
        # Fix links - same logic
        links = await db.links.find({}, {"_id": 0}).to_list(10000)
        for link in links:
            owner_id = link.get('owner_id', '')
            if '@' in str(owner_id) and owner_id.lower() in email_to_id:
                new_owner_id = email_to_id[owner_id.lower()]
                await db.links.update_one(
                    {"id": link['id']},
                    {"$set": {"owner_id": new_owner_id}}
                )
                fixed["links"] += 1
        
        logger.info(f"Fixed owner_ids: {fixed}")
        return {"success": True, "fixed": fixed}
    except Exception as e:
        logger.error(f"Fix owner_ids error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/admin/debug-owners")
async def debug_owners(admin: dict = Depends(verify_admin_token)):
    """Debug: show unique owner_ids in persons and links"""
    try:
        # Get unique owner_ids from persons
        persons = await db.persons.find({}, {"owner_id": 1, "_id": 0}).to_list(10000)
        person_owners = list(set([p.get('owner_id', 'NONE') for p in persons]))
        
        # Get unique owner_ids from links
        links = await db.links.find({}, {"owner_id": 1, "_id": 0}).to_list(10000)
        link_owners = list(set([l.get('owner_id', 'NONE') for l in links]))
        
        # Get all user IDs
        users = await db.users.find({}, {"id": 1, "email": 1, "_id": 0}).to_list(1000)
        user_info = [{"id": u.get('id', 'NO ID'), "email": u.get('email', '')} for u in users]
        
        return {
            "person_owner_ids": person_owners[:20],  # Limit to 20
            "link_owner_ids": link_owners[:20],
            "users": user_info[:20],
            "total_persons": len(persons),
            "total_links": len(links)
        }
    except Exception as e:
        logger.error(f"Debug owners error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/admin/transfer-ownership")
async def transfer_ownership(old_owner_id: str, new_owner_id: str, admin: dict = Depends(verify_admin_token)):
    """Transfer all persons and links from one owner to another"""
    try:
        # Update persons
        persons_result = await db.persons.update_many(
            {"owner_id": old_owner_id},
            {"$set": {"owner_id": new_owner_id}}
        )
        
        # Update links
        links_result = await db.links.update_many(
            {"owner_id": old_owner_id},
            {"$set": {"owner_id": new_owner_id}}
        )
        
        # Also handle NONE owner_id
        persons_none = await db.persons.update_many(
            {"owner_id": {"$in": [None, "NONE", ""]}},
            {"$set": {"owner_id": new_owner_id}}
        )
        
        links_none = await db.links.update_many(
            {"owner_id": {"$in": [None, "NONE", ""]}},
            {"$set": {"owner_id": new_owner_id}}
        )
        
        logger.info(f"Transferred ownership from {old_owner_id} to {new_owner_id}")
        return {
            "success": True,
            "persons_updated": persons_result.modified_count + persons_none.modified_count,
            "links_updated": links_result.modified_count + links_none.modified_count
        }
    except Exception as e:
        logger.error(f"Transfer ownership error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/admin/fix-empty-ids")
async def fix_empty_ids(admin: dict = Depends(verify_admin_token)):
    """Add IDs to persons and links that don't have one"""
    try:
        fixed = {"persons": 0, "links": 0}
        
        # Fix persons without ID
        persons = await db.persons.find({}).to_list(10000)
        for person in persons:
            if not person.get('id') or person.get('id') == '' or person.get('id') is None:
                new_id = str(uuid.uuid4())
                await db.persons.update_one(
                    {"_id": person['_id']},
                    {"$set": {"id": new_id}}
                )
                fixed["persons"] += 1
        
        # Fix links without ID
        links = await db.links.find({}).to_list(10000)
        for link in links:
            if not link.get('id') or link.get('id') == '' or link.get('id') is None:
                new_id = str(uuid.uuid4())
                await db.links.update_one(
                    {"_id": link['_id']},
                    {"$set": {"id": new_id}}
                )
                fixed["links"] += 1
        
        logger.info(f"Fixed empty IDs: {fixed}")
        return {"success": True, "fixed": fixed}
    except Exception as e:
        logger.error(f"Fix empty IDs error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.delete("/admin/users/{user_id}")
async def delete_user_admin(user_id: str, admin: dict = Depends(verify_admin_token)):
    """Delete a user (admin only)"""
    user = await db.users.find_one({"id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Delete user's data
    await db.persons.delete_many({"owner_id": user_id})
    await db.links.delete_many({"owner_id": user_id})
    await db.events.delete_many({"owner_id": user_id})
    await db.users.delete_one({"id": user_id})
    
    logger.info(f"Admin deleted user: {user['email']}")
    return {"success": True, "message": f"User {user['email']} deleted"}

# ============================================================================
# MIDDLEWARE & APP SETUP
# ============================================================================

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include the router in the main app (MUST be after all route definitions)
app.include_router(api_router)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
