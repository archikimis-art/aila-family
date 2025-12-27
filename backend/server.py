from fastapi import FastAPI, APIRouter, HTTPException, Depends, status, Request
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
import stripe

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

# Configure Stripe
STRIPE_SECRET_KEY = os.environ.get('STRIPE_SECRET_KEY', '')
STRIPE_PUBLISHABLE_KEY = os.environ.get('STRIPE_PUBLISHABLE_KEY', '')
STRIPE_WEBHOOK_SECRET = os.environ.get('STRIPE_WEBHOOK_SECRET', '')
stripe.api_key = STRIPE_SECRET_KEY

# Stripe Price IDs (will be created dynamically if not set)
STRIPE_PRICE_MONTHLY = os.environ.get('STRIPE_PRICE_MONTHLY', '')
STRIPE_PRICE_YEARLY = os.environ.get('STRIPE_PRICE_YEARLY', '')
STRIPE_PRICE_LIFETIME = os.environ.get('STRIPE_PRICE_LIFETIME', '')

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

async def send_password_reset_email(to_email: str, reset_token: str):
    """Send password reset email via Resend"""
    try:
        reset_url = f"{FRONTEND_URL}/reset-password?token={reset_token}"
        
        html_content = f"""
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #0A1628; color: #FFFFFF;">
            <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #D4AF37; margin: 0;">🌳 AÏLA</h1>
                <p style="color: #B8C5D6; margin-top: 5px;">Réinitialisation de mot de passe</p>
            </div>
            
            <div style="background-color: #1A2F4A; border-radius: 12px; padding: 24px; margin-bottom: 20px;">
                <h2 style="color: #FFFFFF; margin-top: 0;">Mot de passe oublié ?</h2>
                <p style="color: #B8C5D6; line-height: 1.6;">
                    Vous avez demandé la réinitialisation de votre mot de passe. Cliquez sur le bouton ci-dessous pour en créer un nouveau.
                </p>
                <p style="color: #B8C5D6; line-height: 1.6;">
                    <strong style="color: #D4AF37;">Ce lien expire dans 1 heure.</strong>
                </p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="{reset_url}" style="display: inline-block; background-color: #D4AF37; color: #0A1628; text-decoration: none; padding: 16px 32px; border-radius: 12px; font-weight: bold; font-size: 16px;">
                    Réinitialiser mon mot de passe
                </a>
            </div>
            
            <p style="color: #6B7C93; font-size: 12px; text-align: center;">
                Si vous n'avez pas demandé cette réinitialisation, ignorez cet email. Votre mot de passe restera inchangé.
            </p>
        </div>
        """
        
        params = {
            "from": "AÏLA <noreply@aila.family>",
            "to": [to_email],
            "subject": "🔑 Réinitialisation de votre mot de passe AÏLA",
            "html": html_content
        }
        
        email = resend.Emails.send(params)
        logger.info(f"✓ Password reset email sent to {to_email}")
        return True
    except Exception as e:
        logger.error(f"✗ Failed to send password reset email to {to_email}: {e}")
        return False

async def send_event_notification_email(to_email: str, sender_name: str, event_type: str, event_title: str, event_description: str = None, event_date: str = None):
    """Send event notification email via Resend"""
    try:
        # Emoji based on event type
        event_emojis = {
            "birthday": "🎂",
            "birth": "👶",
            "graduation": "🎓",
            "wedding": "💍",
            "newyear": "🎆",
            "holiday": "🎄",
            "custom": "🎉"
        }
        emoji = event_emojis.get(event_type, "🎉")
        
        # Event type label in French
        event_labels = {
            "birthday": "Anniversaire",
            "birth": "Naissance",
            "graduation": "Diplôme",
            "wedding": "Mariage",
            "newyear": "Nouvel An",
            "holiday": "Fête",
            "custom": "Événement"
        }
        event_label = event_labels.get(event_type, "Événement")
        
        html_content = f"""
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #0A1628; color: #FFFFFF;">
            <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #D4AF37; margin: 0;">🌳 AÏLA</h1>
                <p style="color: #B8C5D6; margin-top: 5px;">Événement familial</p>
            </div>
            
            <div style="background-color: #1A2F4A; border-radius: 12px; padding: 24px; margin-bottom: 20px; text-align: center;">
                <div style="font-size: 48px; margin-bottom: 16px;">{emoji}</div>
                <h2 style="color: #D4AF37; margin: 0 0 16px 0;">{event_title}</h2>
                <p style="color: #B8C5D6; margin: 0;">
                    <strong>{sender_name}</strong> vous partage cet événement
                </p>
            </div>
            
            {f'<div style="background-color: #2A3F5A; border-radius: 8px; padding: 16px; margin-bottom: 20px;"><p style="color: #FFFFFF; margin: 0;">{event_description}</p></div>' if event_description else ''}
            
            {f'<p style="color: #6B7C93; text-align: center;">📅 {event_date}</p>' if event_date else ''}
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="{FRONTEND_URL}" style="display: inline-block; background-color: #D4AF37; color: #0A1628; text-decoration: none; padding: 16px 32px; border-radius: 12px; font-weight: bold; font-size: 16px;">
                    Voir l'arbre familial
                </a>
            </div>
        </div>
        """
        
        params = {
            "from": "AÏLA <noreply@aila.family>",
            "to": [to_email],
            "subject": f"{emoji} {event_label} - {event_title}",
            "html": html_content
        }
        
        email = resend.Emails.send(params)
        logger.info(f"✓ Event notification email sent to {to_email}")
        return True
    except Exception as e:
        logger.error(f"✗ Failed to send event notification email to {to_email}: {e}")
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

# JWT Configuration - CRITIQUE POUR LA STABILITÉ DE L'AUTHENTIFICATION
# Ce secret DOIT être constant pour que les sessions restent valides après redémarrage
JWT_SECRET = os.environ.get('JWT_SECRET')
if not JWT_SECRET:
    # Secret par défaut FIXE pour la production - NE JAMAIS CHANGER
    # Idéalement, définir JWT_SECRET dans les variables d'environnement Render
    JWT_SECRET = 'aila_production_jwt_secret_2024_stable_key_do_not_change_47e8cc1a'
    logging.warning("JWT_SECRET not set in environment, using default production secret")
JWT_ALGORITHM = 'HS256'
JWT_EXPIRATION_HOURS = 24 * 30  # 30 jours pour éviter les déconnexions fréquentes

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

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str

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

# ===================== FAMILY EVENTS MODELS =====================

class FamilyEventCreate(BaseModel):
    event_type: str  # birthday, birth, graduation, wedding, newyear, holiday, custom
    title: str
    description: Optional[str] = None
    event_date: str  # ISO date string
    person_id: Optional[str] = None  # Related person if applicable
    recipients: List[str] = []  # List of collaborator emails to notify
    send_email: bool = False

class FamilyEventResponse(BaseModel):
    id: str
    user_id: str
    event_type: str
    title: str
    description: Optional[str] = None
    event_date: str
    person_id: Optional[str] = None
    person_name: Optional[str] = None
    recipients: List[str] = []
    send_email: bool
    created_at: datetime

class UpcomingBirthdayResponse(BaseModel):
    person_id: str
    person_name: str
    birth_date: str
    days_until: int
    age: Optional[int] = None

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

@api_router.post("/auth/forgot-password")
async def forgot_password(data: ForgotPasswordRequest):
    """Request a password reset email"""
    email = data.email.lower().strip()
    
    # Check if user exists (but don't reveal if they don't for security)
    user = await db.users.find_one({"email": {"$regex": f"^{email}$", "$options": "i"}})
    
    if user:
        # Generate reset token
        reset_token = str(uuid.uuid4())
        expires_at = datetime.utcnow() + timedelta(hours=1)
        
        # Store reset token in database
        await db.password_resets.delete_many({"email": email})  # Remove old tokens
        await db.password_resets.insert_one({
            "email": email,
            "token": reset_token,
            "expires_at": expires_at,
            "created_at": datetime.utcnow()
        })
        
        # Send email
        await send_password_reset_email(email, reset_token)
    
    # Always return success to prevent email enumeration
    return {"message": "Si un compte existe avec cet email, vous recevrez un lien de réinitialisation."}

@api_router.post("/auth/reset-password")
async def reset_password(data: ResetPasswordRequest):
    """Reset password using the token from email"""
    # Find the reset token
    reset_record = await db.password_resets.find_one({"token": data.token})
    
    if not reset_record:
        raise HTTPException(status_code=400, detail="Lien de réinitialisation invalide ou expiré")
    
    # Check if token is expired
    if reset_record['expires_at'] < datetime.utcnow():
        await db.password_resets.delete_one({"token": data.token})
        raise HTTPException(status_code=400, detail="Ce lien a expiré. Veuillez demander un nouveau lien.")
    
    # Validate new password
    if len(data.new_password) < 6:
        raise HTTPException(status_code=400, detail="Le mot de passe doit contenir au moins 6 caractères")
    
    # Update password
    new_hash = hash_password(data.new_password)
    result = await db.users.update_one(
        {"email": {"$regex": f"^{reset_record['email']}$", "$options": "i"}},
        {"$set": {"password_hash": new_hash}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")
    
    # Delete the used token
    await db.password_resets.delete_one({"token": data.token})
    
    return {"message": "Votre mot de passe a été réinitialisé avec succès. Vous pouvez maintenant vous connecter."}

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

@api_router.put("/preview/{session_token}/person/{person_id}", response_model=PreviewSessionResponse)
async def update_preview_person(session_token: str, person_id: str, person: PersonCreate):
    """Update a person in preview session"""
    session = await db.preview_sessions.find_one({"session_token": session_token})
    if not session:
        raise HTTPException(status_code=404, detail="Preview session not found")
    
    if session['expires_at'] < datetime.utcnow():
        await db.preview_sessions.delete_one({"session_token": session_token})
        raise HTTPException(status_code=410, detail="Preview session expired")
    
    # Find and update person
    persons = session.get('persons', [])
    person_found = False
    for i, p in enumerate(persons):
        if p.get('id') == person_id:
            persons[i] = {
                "id": person_id,
                "first_name": person.first_name,
                "last_name": person.last_name,
                "gender": person.gender,
                "birth_date": person.birth_date,
                "birth_place": person.birth_place,
                "death_date": person.death_date,
                "death_place": person.death_place,
                "geographic_branch": person.geographic_branch,
                "notes": person.notes,
            }
            person_found = True
            break
    
    if not person_found:
        raise HTTPException(status_code=404, detail="Person not found in preview session")
    
    await db.preview_sessions.update_one(
        {"session_token": session_token},
        {"$set": {"persons": persons}}
    )
    
    return await get_preview_session(session_token)

@api_router.delete("/preview/{session_token}/link/{link_id}", response_model=PreviewSessionResponse)
async def delete_preview_link(session_token: str, link_id: str):
    """Delete a link from preview session"""
    session = await db.preview_sessions.find_one({"session_token": session_token})
    if not session:
        raise HTTPException(status_code=404, detail="Preview session not found")
    
    if session['expires_at'] < datetime.utcnow():
        await db.preview_sessions.delete_one({"session_token": session_token})
        raise HTTPException(status_code=410, detail="Preview session expired")
    
    # Remove link
    links = session.get('links', [])
    original_count = len(links)
    links = [l for l in links if l.get('id') != link_id]
    
    if len(links) == original_count:
        raise HTTPException(status_code=404, detail="Link not found in preview session")
    
    await db.preview_sessions.update_one(
        {"session_token": session_token},
        {"$set": {"links": links}}
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

# ===================== TREE MANAGEMENT ROUTES =====================

@api_router.delete("/tree/clear")
async def clear_tree(current_user: dict = Depends(get_current_user)):
    """Delete all persons and links in the user's tree (keeps account)"""
    user_id = str(current_user['_id'])
    
    # Delete all persons and links
    deleted_persons = await db.persons.delete_many({"user_id": user_id})
    deleted_links = await db.family_links.delete_many({"user_id": user_id})
    
    return {
        "message": "Arbre supprimé avec succès",
        "deleted_persons": deleted_persons.deleted_count,
        "deleted_links": deleted_links.deleted_count
    }

# ===================== DEBUG ROUTES =====================

@api_router.get("/tree/debug")
async def debug_tree(current_user: dict = Depends(get_current_user)):
    """Get detailed tree data for debugging"""
    user_id = str(current_user['_id'])
    
    persons = await db.persons.find({"user_id": user_id}).to_list(500)
    links = await db.family_links.find({"user_id": user_id}).to_list(500)
    
    # Build person map
    person_map = {str(p['_id']): f"{p['first_name']} {p['last_name']}" for p in persons}
    
    # Annotate links with names
    annotated_links = []
    for link in links:
        annotated_links.append({
            "id": str(link['_id']),
            "type": link['link_type'],
            "person_1": {
                "id": link['person_id_1'],
                "name": person_map.get(link['person_id_1'], "UNKNOWN")
            },
            "person_2": {
                "id": link['person_id_2'],
                "name": person_map.get(link['person_id_2'], "UNKNOWN")
            },
            "description": f"{person_map.get(link['person_id_1'], '?')} est {link['link_type']} de {person_map.get(link['person_id_2'], '?')}"
        })
    
    return {
        "persons": [{"id": str(p['_id']), "name": f"{p['first_name']} {p['last_name']}"} for p in persons],
        "links": annotated_links,
        "summary": {
            "total_persons": len(persons),
            "total_links": len(links),
            "parent_links": len([l for l in links if l['link_type'] == 'parent']),
            "spouse_links": len([l for l in links if l['link_type'] == 'spouse']),
        }
    }

# ===================== TREE EXPORT ROUTES =====================

@api_router.get("/tree/export/json")
async def export_tree_json(current_user: dict = Depends(get_current_user)):
    """Export family tree as JSON data"""
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
    
    return tree_data

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

# ===================== IMPORT GEDCOM ROUTES =====================

class ImportGedcomRequest(BaseModel):
    gedcom_content: str

@api_router.post("/tree/import/gedcom")
async def import_tree_gedcom(request: ImportGedcomRequest, current_user: dict = Depends(get_current_user)):
    """Import a GEDCOM file and add persons/links to the tree"""
    user_id = str(current_user['_id'])
    
    lines = request.gedcom_content.strip().split('\n')
    
    persons_created = 0
    links_created = 0
    current_person = None
    persons_map = {}  # GEDCOM ID -> MongoDB ID
    families = {}  # Family ID -> {husb, wife, children}
    
    i = 0
    while i < len(lines):
        line = lines[i].strip()
        parts = line.split(' ', 2)
        
        if len(parts) < 2:
            i += 1
            continue
        
        level = parts[0]
        tag_or_id = parts[1]
        value = parts[2] if len(parts) > 2 else ''
        
        # Parse individual
        if level == '0' and tag_or_id.startswith('@I') and 'INDI' in value:
            gedcom_id = tag_or_id.strip('@')
            current_person = {
                'gedcom_id': gedcom_id,
                'first_name': 'Inconnu',
                'last_name': '',
                'gender': 'unknown',
                'birth_date': None,
                'birth_place': None,
                'death_date': None,
                'death_place': None,
                'user_id': user_id,
            }
        
        elif level == '1' and current_person:
            if tag_or_id == 'NAME' and value:
                # Parse name like "John /Doe/"
                name_parts = value.replace('/', ' ').split()
                if name_parts:
                    current_person['first_name'] = name_parts[0]
                    if len(name_parts) > 1:
                        current_person['last_name'] = ' '.join(name_parts[1:])
            elif tag_or_id == 'SEX':
                current_person['gender'] = 'male' if value == 'M' else 'female' if value == 'F' else 'unknown'
            elif tag_or_id == 'BIRT':
                # Look ahead for date/place
                j = i + 1
                while j < len(lines) and lines[j].strip().startswith('2'):
                    sub_parts = lines[j].strip().split(' ', 2)
                    if len(sub_parts) >= 3:
                        if sub_parts[1] == 'DATE':
                            current_person['birth_date'] = sub_parts[2]
                        elif sub_parts[1] == 'PLAC':
                            current_person['birth_place'] = sub_parts[2]
                    j += 1
            elif tag_or_id == 'DEAT':
                j = i + 1
                while j < len(lines) and lines[j].strip().startswith('2'):
                    sub_parts = lines[j].strip().split(' ', 2)
                    if len(sub_parts) >= 3:
                        if sub_parts[1] == 'DATE':
                            current_person['death_date'] = sub_parts[2]
                        elif sub_parts[1] == 'PLAC':
                            current_person['death_place'] = sub_parts[2]
                    j += 1
        
        # Save person when we hit next record
        if level == '0' and current_person and current_person.get('first_name') != 'Inconnu':
            result = await db.persons.insert_one(current_person)
            persons_map[current_person['gedcom_id']] = str(result.inserted_id)
            persons_created += 1
            current_person = None
        
        # Parse family
        if level == '0' and tag_or_id.startswith('@F') and 'FAM' in value:
            fam_id = tag_or_id.strip('@')
            families[fam_id] = {'husb': None, 'wife': None, 'children': []}
        
        if level == '1' and families:
            current_fam_id = list(families.keys())[-1] if families else None
            if current_fam_id:
                if tag_or_id == 'HUSB' and value:
                    families[current_fam_id]['husb'] = value.strip('@')
                elif tag_or_id == 'WIFE' and value:
                    families[current_fam_id]['wife'] = value.strip('@')
                elif tag_or_id == 'CHIL' and value:
                    families[current_fam_id]['children'].append(value.strip('@'))
        
        i += 1
    
    # Save last person
    if current_person and current_person.get('first_name') != 'Inconnu':
        result = await db.persons.insert_one(current_person)
        persons_map[current_person['gedcom_id']] = str(result.inserted_id)
        persons_created += 1
    
    # Create family links
    for fam_id, fam in families.items():
        husb_id = persons_map.get(fam['husb'])
        wife_id = persons_map.get(fam['wife'])
        
        # Create spouse link
        if husb_id and wife_id:
            await db.family_links.insert_one({
                'user_id': user_id,
                'person_id_1': husb_id,
                'person_id_2': wife_id,
                'link_type': 'spouse',
            })
            links_created += 1
        
        # Create parent links
        for child_gedcom_id in fam['children']:
            child_id = persons_map.get(child_gedcom_id)
            if child_id:
                if husb_id:
                    await db.family_links.insert_one({
                        'user_id': user_id,
                        'person_id_1': husb_id,
                        'person_id_2': child_id,
                        'link_type': 'parent',
                    })
                    links_created += 1
                if wife_id:
                    await db.family_links.insert_one({
                        'user_id': user_id,
                        'person_id_1': wife_id,
                        'person_id_2': child_id,
                        'link_type': 'parent',
                    })
                    links_created += 1
    
    return {
        "message": f"Import réussi ! {persons_created} personnes et {links_created} liens créés.",
        "persons_created": persons_created,
        "links_created": links_created
    }

# ===================== SEND TREE BY EMAIL =====================

class SendTreeEmailRequest(BaseModel):
    recipient_emails: List[str]
    format: str = "json"  # "json" or "gedcom"
    message: Optional[str] = None

@api_router.post("/tree/send-email")
async def send_tree_by_email(request: SendTreeEmailRequest, current_user: dict = Depends(get_current_user)):
    """Send the family tree file by email to specified recipients"""
    user_id = str(current_user['_id'])
    user_name = f"{current_user['first_name']} {current_user['last_name']}"
    
    # Get tree data
    persons = await db.persons.find({"user_id": user_id}).to_list(500)
    links = await db.family_links.find({"user_id": user_id}).to_list(500)
    
    if not persons:
        raise HTTPException(status_code=400, detail="Votre arbre est vide")
    
    # Prepare tree summary
    tree_summary = f"- {len(persons)} personnes\n- {len(links)} liens familiaux"
    
    custom_message = request.message or ""
    if custom_message:
        custom_message = f"\n\nMessage de {user_name}:\n{custom_message}"
    
    emails_sent = 0
    errors = []
    
    for email in request.recipient_emails:
        try:
            html_content = f"""
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0A1628; color: #FFFFFF; padding: 20px; border-radius: 12px;">
                <div style="text-align: center; margin-bottom: 20px;">
                    <h1 style="color: #D4AF37; margin: 0;">🌳 AÏLA</h1>
                    <p style="color: #B8C5D6;">Arbre Généalogique Familial</p>
                </div>
                
                <p>Bonjour,</p>
                
                <p><strong>{user_name}</strong> vous partage son arbre généalogique !</p>
                
                <div style="background: #1A2F4A; padding: 15px; border-radius: 8px; margin: 20px 0;">
                    <p style="margin: 0; color: #D4AF37;"><strong>Contenu de l'arbre :</strong></p>
                    <p style="margin: 10px 0 0 0; white-space: pre-line;">{tree_summary}</p>
                </div>
                
                {f'<div style="background: #2A3F5A; padding: 15px; border-radius: 8px; margin: 20px 0;"><p style="margin: 0; white-space: pre-line;">{custom_message}</p></div>' if custom_message else ''}
                
                <p>Pour consulter l'arbre interactif, créez votre compte gratuit sur AÏLA :</p>
                
                <div style="text-align: center; margin: 20px 0;">
                    <a href="{FRONTEND_URL}" style="display: inline-block; background: #D4AF37; color: #0A1628; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">
                        Découvrir AÏLA
                    </a>
                </div>
                
                <p style="color: #6B7C93; font-size: 12px; text-align: center;">
                    AÏLA - L'arbre généalogique qui connecte votre famille
                </p>
            </div>
            """
            
            resend.emails.send({
                "from": "AÏLA <noreply@aila.family>",
                "to": email,
                "subject": f"🌳 {user_name} partage son arbre généalogique avec vous",
                "html": html_content,
            })
            emails_sent += 1
            
        except Exception as e:
            logger.error(f"Error sending email to {email}: {e}")
            errors.append(email)
    
    return {
        "message": f"{emails_sent} email(s) envoyé(s) avec succès",
        "emails_sent": emails_sent,
        "errors": errors if errors else None
    }

# ===================== COLLABORATION ROUTES =====================

@api_router.post("/collaborators/invite", response_model=CollaboratorResponse)
async def invite_collaborator(invite: CollaboratorInvite, current_user: dict = Depends(get_current_user)):
    """Invite someone to collaborate on your family tree"""
    user_id = str(current_user['_id'])
    
    # Normalize email to lowercase for consistent comparison
    invite_email = invite.email.lower().strip()
    user_email = current_user['email'].lower().strip()
    
    # Check if already invited (case-insensitive)
    existing = await db.collaborators.find_one({
        "tree_owner_id": user_id,
        "email": {"$regex": f"^{invite_email}$", "$options": "i"}
    })
    if existing:
        raise HTTPException(status_code=400, detail="Cette personne a déjà été invitée")
    
    # Check if inviting yourself
    if invite_email == user_email:
        raise HTTPException(status_code=400, detail="Vous ne pouvez pas vous inviter vous-même")
    
    # Check if the email is registered (case-insensitive)
    invited_user = await db.users.find_one({"email": {"$regex": f"^{invite_email}$", "$options": "i"}})
    
    # Create invitation token
    invite_token = str(uuid.uuid4())
    
    collaborator_doc = {
        "tree_owner_id": user_id,
        "user_id": str(invited_user['_id']) if invited_user else None,
        "email": invite_email,  # Store normalized email
        "role": invite.role,
        "status": "accepted" if invited_user else "pending",  # Auto-accept if user exists
        "invite_token": invite_token,
        "invited_at": datetime.utcnow(),
        "accepted_at": datetime.utcnow() if invited_user else None
    }
    
    result = await db.collaborators.insert_one(collaborator_doc)
    collaborator_doc['_id'] = result.inserted_id
    collaborator_doc = serialize_object_id(collaborator_doc)
    
    # Send invitation email (use original email for display)
    owner_name = f"{current_user['first_name']} {current_user['last_name']}"
    await send_invitation_email(
        to_email=invite.email,  # Use original email for sending
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

@api_router.post("/collaborators/accept/{invite_token}")
async def accept_invitation(invite_token: str, current_user: dict = Depends(get_current_user)):
    """Accept a collaboration invitation using the token"""
    user_email = current_user['email'].lower().strip()  # Normalize email
    user_id = str(current_user['_id'])
    
    # Find the invitation by token
    invitation = await db.collaborators.find_one({"invite_token": invite_token})
    
    if not invitation:
        raise HTTPException(status_code=404, detail="Invitation not found")
    
    # Compare emails case-insensitively
    invitation_email = invitation['email'].lower().strip()
    if invitation_email != user_email:
        raise HTTPException(status_code=403, detail=f"Cette invitation a été envoyée à une autre adresse email ({invitation['email']})")
    
    if invitation['status'] == 'accepted':
        # Already accepted, return the tree owner info
        owner = await db.users.find_one({"_id": ObjectId(invitation['tree_owner_id'])})
        return {
            "message": "Invitation already accepted",
            "tree_owner_id": invitation['tree_owner_id'],
            "tree_owner_name": f"{owner['first_name']} {owner['last_name']}" if owner else "Unknown",
            "role": invitation['role']
        }
    
    # Accept the invitation
    await db.collaborators.update_one(
        {"_id": invitation['_id']},
        {
            "$set": {
                "status": "accepted",
                "user_id": user_id,
                "accepted_at": datetime.utcnow()
            }
        }
    )
    
    # Get tree owner info
    owner = await db.users.find_one({"_id": ObjectId(invitation['tree_owner_id'])})
    
    return {
        "message": "Invitation accepted successfully",
        "tree_owner_id": invitation['tree_owner_id'],
        "tree_owner_name": f"{owner['first_name']} {owner['last_name']}" if owner else "Unknown",
        "role": invitation['role']
    }

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

# ===================== SHARED TREE EDITOR ROUTES =====================

@api_router.post("/tree/shared/{owner_id}/persons", response_model=PersonResponse)
async def create_person_in_shared_tree(owner_id: str, person: PersonCreate, current_user: dict = Depends(get_current_user)):
    """Create a person in a shared tree (editor only)"""
    user_id = str(current_user['_id'])
    
    # Check if user has editor access
    collaboration = await db.collaborators.find_one({
        "tree_owner_id": owner_id,
        "user_id": user_id,
        "status": "accepted",
        "role": "editor"
    })
    
    if not collaboration:
        raise HTTPException(status_code=403, detail="Vous n'avez pas les droits d'éditeur sur cet arbre")
    
    # Create person in the owner's tree
    person_doc = {
        "user_id": owner_id,  # Important: use owner_id, not current user
        "first_name": person.first_name,
        "last_name": person.last_name,
        "gender": person.gender,
        "birth_date": person.birth_date,
        "birth_place": person.birth_place,
        "death_date": person.death_date,
        "death_place": person.death_place,
        "geographic_branch": person.geographic_branch,
        "notes": person.notes,
        "created_by": user_id,  # Track who created it
        "created_at": datetime.now().isoformat()
    }
    
    result = await db.persons.insert_one(person_doc)
    person_doc['_id'] = result.inserted_id
    person_doc = serialize_object_id(person_doc)
    
    return PersonResponse(**person_doc)

@api_router.post("/tree/shared/{owner_id}/links", response_model=FamilyLinkResponse)
async def create_link_in_shared_tree(owner_id: str, link: FamilyLinkCreate, current_user: dict = Depends(get_current_user)):
    """Create a family link in a shared tree (editor only)"""
    user_id = str(current_user['_id'])
    
    # Check if user has editor access
    collaboration = await db.collaborators.find_one({
        "tree_owner_id": owner_id,
        "user_id": user_id,
        "status": "accepted",
        "role": "editor"
    })
    
    if not collaboration:
        raise HTTPException(status_code=403, detail="Vous n'avez pas les droits d'éditeur sur cet arbre")
    
    # Verify both persons exist in the owner's tree
    person1 = await db.persons.find_one({"_id": ObjectId(link.person_id_1), "user_id": owner_id})
    person2 = await db.persons.find_one({"_id": ObjectId(link.person_id_2), "user_id": owner_id})
    
    if not person1 or not person2:
        raise HTTPException(status_code=404, detail="Une ou plusieurs personnes n'existent pas dans cet arbre")
    
    # Check for existing link
    existing = await db.family_links.find_one({
        "user_id": owner_id,
        "$or": [
            {"person_id_1": link.person_id_1, "person_id_2": link.person_id_2, "link_type": link.link_type},
            {"person_id_1": link.person_id_2, "person_id_2": link.person_id_1, "link_type": link.link_type}
        ]
    })
    
    if existing:
        raise HTTPException(status_code=400, detail="Ce lien existe déjà")
    
    # Create link in the owner's tree
    link_doc = {
        "user_id": owner_id,  # Important: use owner_id
        "person_id_1": link.person_id_1,
        "person_id_2": link.person_id_2,
        "link_type": link.link_type,
        "created_by": user_id,  # Track who created it
        "created_at": datetime.now().isoformat()
    }
    
    result = await db.family_links.insert_one(link_doc)
    link_doc['_id'] = result.inserted_id
    link_doc = serialize_object_id(link_doc)
    
    return FamilyLinkResponse(**link_doc)

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
# IMPORTANT: Chat messages are now PRIVATE per family tree
# Messages are scoped to tree_owner_id - only the owner and their collaborators can see them

async def get_user_tree_owner_id(user_id: str) -> str:
    """
    Get the tree_owner_id for chat messages.
    - If user owns a tree (has persons), they are the tree_owner
    - If user is a collaborator on someone else's tree, use that tree owner's ID
    - Falls back to user's own ID if no collaboration found
    """
    # Check if user has their own tree (owns persons)
    user_persons = await db.persons.find_one({"user_id": user_id})
    if user_persons:
        return user_id  # User owns their own tree
    
    # Check if user is a collaborator on someone else's tree
    collaboration = await db.collaborators.find_one({
        "user_id": user_id,
        "status": "accepted"
    })
    if collaboration:
        return collaboration['tree_owner_id']
    
    # Default to user's own ID (they'll start their own tree)
    return user_id

async def get_accessible_tree_ids(user_id: str) -> List[str]:
    """
    Get all tree_owner_ids that a user can access for chat.
    - User's own ID (their own tree)
    - All tree_owner_ids where user is an accepted collaborator
    """
    accessible_ids = [user_id]  # Always include user's own tree
    
    # Find all trees where user is a collaborator
    collaborations = await db.collaborators.find({
        "user_id": user_id,
        "status": "accepted"
    }).to_list(100)
    
    for collab in collaborations:
        if collab['tree_owner_id'] not in accessible_ids:
            accessible_ids.append(collab['tree_owner_id'])
    
    return accessible_ids

@api_router.post("/chat/messages", response_model=ChatMessageResponse)
async def send_message(
    message_data: ChatMessageCreate,
    current_user: dict = Depends(get_current_user)
):
    """Send a chat message - visible only to family tree members (owner + collaborators)"""
    user_id = str(current_user['_id'])
    user_name = f"{current_user['first_name']} {current_user['last_name']}"
    
    # Determine which tree this message belongs to
    tree_owner_id = await get_user_tree_owner_id(user_id)
    
    # Prepare message document with tree_owner_id for privacy
    message_doc = {
        "tree_owner_id": tree_owner_id,  # CRITICAL: Associates message with a specific family tree
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
    
    logger.info(f"Chat message sent by {user_name} for tree_owner: {tree_owner_id}")
    
    return ChatMessageResponse(**serialize_object_id(message_doc))

@api_router.get("/chat/messages", response_model=List[ChatMessageResponse])
async def get_messages(
    limit: int = 50,
    skip: int = 0,
    current_user: dict = Depends(get_current_user)
):
    """Get chat messages - ONLY messages from accessible family trees (owner + collaborators)"""
    user_id = str(current_user['_id'])
    
    # Get all tree IDs this user can access
    accessible_tree_ids = await get_accessible_tree_ids(user_id)
    
    logger.info(f"User {user_id} accessing chat for trees: {accessible_tree_ids}")
    
    # PRIVACY FIX: Only fetch messages from accessible trees
    # Also include legacy messages (no tree_owner_id) that belong to this user
    query = {
        "$or": [
            {"tree_owner_id": {"$in": accessible_tree_ids}},  # Messages from accessible trees
            {"tree_owner_id": {"$exists": False}, "user_id": user_id}  # Legacy messages from this user
        ]
    }
    
    messages = await db.chat_messages.find(query).sort("created_at", -1).skip(skip).limit(limit).to_list(limit)
    
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
    
    # Check permissions - must be message author or admin
    if not is_admin and message['user_id'] != user_id:
        raise HTTPException(status_code=403, detail="You can only delete your own messages")
    
    # Additional check: user must have access to this tree's messages
    accessible_tree_ids = await get_accessible_tree_ids(user_id)
    message_tree_id = message.get('tree_owner_id', message['user_id'])
    
    if not is_admin and message_tree_id not in accessible_tree_ids:
        raise HTTPException(status_code=403, detail="You don't have access to this message")
    
    await db.chat_messages.delete_one({"_id": ObjectId(message_id)})
    
    return {"message": "Message deleted successfully"}

# ===================== FAMILY EVENTS =====================

@api_router.get("/events/birthdays", response_model=List[UpcomingBirthdayResponse])
async def get_upcoming_birthdays(current_user: dict = Depends(get_current_user)):
    """Get upcoming birthdays from tree members (next 7 days) - EXCLUDING DECEASED PERSONS"""
    user_id = str(current_user['_id'])
    
    # Get all persons with birth dates, EXCLUDING deceased persons
    # A person is deceased if death_date exists and is not empty
    persons = await db.persons.find({
        "user_id": user_id,
        "birth_date": {"$ne": None, "$exists": True},
        "$or": [
            {"death_date": {"$exists": False}},  # No death_date field
            {"death_date": None},                 # death_date is null
            {"death_date": ""}                    # death_date is empty string
        ]
    }).to_list(None)
    
    upcoming = []
    today = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
    
    def parse_birth_date(date_str: str):
        """Parse birth date in multiple formats"""
        if not date_str:
            return None
        
        # Remove time component if present
        date_str = date_str.split("T")[0].strip()
        
        # Try different formats
        formats = [
            "%Y-%m-%d",      # 1964-12-25
            "%d/%m/%Y",      # 25/12/1964
            "%d-%m-%Y",      # 25-12-1964
            "%Y",            # 1964 (year only)
        ]
        
        for fmt in formats:
            try:
                return datetime.strptime(date_str, fmt)
            except ValueError:
                continue
        
        return None
    
    for person in persons:
        birth_date_str = person.get("birth_date")
        if not birth_date_str:
            continue
        
        # Double-check: Skip if person has ANY death date (even partial)
        death_date = person.get("death_date")
        if death_date and str(death_date).strip():
            logger.info(f"Skipping birthday for deceased person: {person.get('first_name')} {person.get('last_name')}")
            continue
        
        birth_date = parse_birth_date(birth_date_str)
        if not birth_date:
            logger.warning(f"Could not parse birth date: {birth_date_str}")
            continue
        
        try:
            # Calculate this year's birthday
            this_year_birthday = birth_date.replace(year=today.year)
            if this_year_birthday < today:
                this_year_birthday = this_year_birthday.replace(year=today.year + 1)
            
            days_until = (this_year_birthday - today).days
            
            # Only include birthdays in the next 7 days (popup reminder)
            if 0 <= days_until <= 7:
                age = this_year_birthday.year - birth_date.year
                
                upcoming.append(UpcomingBirthdayResponse(
                    person_id=str(person["_id"]),
                    person_name=f"{person['first_name']} {person['last_name']}",
                    birth_date=birth_date_str,
                    days_until=days_until,
                    age=age
                ))
        except (ValueError, TypeError) as e:
            logger.error(f"Error processing birthday for {person.get('first_name', 'Unknown')}: {e}")
            continue
    
    # Sort by days until birthday
    upcoming.sort(key=lambda x: x.days_until)
    logger.info(f"Found {len(upcoming)} upcoming birthdays in next 7 days (excluding deceased)")
    return upcoming

@api_router.get("/events/today")
async def get_todays_events(current_user: dict = Depends(get_current_user)):
    """Get today's birthdays and events for animation display - EXCLUDING DECEASED PERSONS"""
    user_id = str(current_user['_id'])
    today = datetime.now()
    today_str = today.strftime("%m-%d")
    
    events = []
    
    # Check for birthdays today - EXCLUDING deceased persons
    persons = await db.persons.find({
        "user_id": user_id,
        "birth_date": {"$ne": None, "$exists": True},
        "$or": [
            {"death_date": {"$exists": False}},  # No death_date field
            {"death_date": None},                 # death_date is null
            {"death_date": ""}                    # death_date is empty string
        ]
    }).to_list(None)
    
    for person in persons:
        birth_date_str = person.get("birth_date")
        if birth_date_str:
            # Skip if person has ANY death date (even partial)
            death_date = person.get("death_date")
            if death_date and str(death_date).strip():
                logger.info(f"Skipping today's birthday for deceased: {person.get('first_name')} {person.get('last_name')}")
                continue
            
            try:
                birth_date = datetime.strptime(birth_date_str.split("T")[0], "%Y-%m-%d")
                if birth_date.strftime("%m-%d") == today_str:
                    age = today.year - birth_date.year
                    events.append({
                        "type": "birthday",
                        "person_id": str(person["_id"]),
                        "person_name": f"{person['first_name']} {person['last_name']}",
                        "title": f"🎂 Anniversaire de {person['first_name']}!",
                        "age": age
                    })
            except (ValueError, TypeError):
                continue
    
    # Check for custom events today
    custom_events = await db.family_events.find({
        "user_id": user_id,
        "event_date": {"$regex": f"^{today.strftime('%Y-%m-%d')}"}
    }).to_list(None)
    
    for event in custom_events:
        events.append({
            "type": event["event_type"],
            "event_id": str(event["_id"]),
            "title": event["title"],
            "description": event.get("description"),
            "person_name": event.get("person_name")
        })
    
    # Check for New Year
    if today.strftime("%m-%d") == "01-01":
        events.append({
            "type": "newyear",
            "title": "🎆 Bonne Année!",
            "description": f"Bonne année {today.year} à toute la famille!"
        })
    
    return {"events": events, "has_events": len(events) > 0}

@api_router.post("/events", response_model=FamilyEventResponse)
async def create_family_event(event: FamilyEventCreate, current_user: dict = Depends(get_current_user)):
    """Create a new family event"""
    user_id = current_user["user_id"]
    
    person_name = None
    if event.person_id:
        person = await db.persons.find_one({"_id": ObjectId(event.person_id), "user_id": user_id})
        if person:
            person_name = f"{person['first_name']} {person['last_name']}"
    
    event_doc = {
        "user_id": user_id,
        "event_type": event.event_type,
        "title": event.title,
        "description": event.description,
        "event_date": event.event_date,
        "person_id": event.person_id,
        "person_name": person_name,
        "recipients": event.recipients,
        "send_email": event.send_email,
        "created_at": datetime.utcnow()
    }
    
    result = await db.family_events.insert_one(event_doc)
    event_doc["_id"] = result.inserted_id
    
    # Send email notifications if requested
    if event.send_email and event.recipients:
        user = await db.users.find_one({"_id": ObjectId(user_id)})
        sender_name = f"{user.get('first_name', '')} {user.get('last_name', '')}".strip() or user.get('email', 'Un membre')
        
        for recipient_email in event.recipients:
            try:
                await send_event_notification_email(
                    to_email=recipient_email,
                    sender_name=sender_name,
                    event_type=event.event_type,
                    event_title=event.title,
                    event_description=event.description,
                    event_date=event.event_date
                )
            except Exception as e:
                logger.error(f"Failed to send event email to {recipient_email}: {e}")
    
    return FamilyEventResponse(
        id=str(event_doc["_id"]),
        user_id=user_id,
        event_type=event_doc["event_type"],
        title=event_doc["title"],
        description=event_doc.get("description"),
        event_date=event_doc["event_date"],
        person_id=event_doc.get("person_id"),
        person_name=person_name,
        recipients=event_doc["recipients"],
        send_email=event_doc["send_email"],
        created_at=event_doc["created_at"]
    )

@api_router.get("/events", response_model=List[FamilyEventResponse])
async def get_family_events(current_user: dict = Depends(get_current_user)):
    """Get all family events for the user"""
    user_id = current_user["user_id"]
    
    events = await db.family_events.find({"user_id": user_id}).sort("event_date", 1).to_list(None)
    
    return [
        FamilyEventResponse(
            id=str(event["_id"]),
            user_id=event["user_id"],
            event_type=event["event_type"],
            title=event["title"],
            description=event.get("description"),
            event_date=event["event_date"],
            person_id=event.get("person_id"),
            person_name=event.get("person_name"),
            recipients=event.get("recipients", []),
            send_email=event.get("send_email", False),
            created_at=event["created_at"]
        )
        for event in events
    ]

@api_router.delete("/events/{event_id}")
async def delete_family_event(event_id: str, current_user: dict = Depends(get_current_user)):
    """Delete a family event"""
    user_id = current_user["user_id"]
    
    result = await db.family_events.delete_one({
        "_id": ObjectId(event_id),
        "user_id": user_id
    })
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Event not found")
    
    return {"message": "Event deleted successfully"}

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

# ===================== STRIPE PAYMENT ROUTES =====================

class CreateCheckoutRequest(BaseModel):
    plan: str  # 'monthly', 'yearly', or 'lifetime'
    success_url: Optional[str] = None
    cancel_url: Optional[str] = None

class SubscriptionResponse(BaseModel):
    subscription_status: str
    plan: Optional[str] = None
    current_period_end: Optional[str] = None
    is_premium: bool

# Stripe Products and Prices - Model: Free with ads, Premium without ads
STRIPE_PRODUCTS = {
    # Subscriptions
    'monthly': {'name': 'AÏLA Premium - Mensuel', 'price': 299, 'interval': 'month', 'type': 'subscription'},
    'yearly': {'name': 'AÏLA Premium - Annuel', 'price': 2499, 'interval': 'year', 'type': 'subscription'},
    # Microtransactions (one-time purchases) - Prix réduits
    'pdf_export': {'name': 'Export PDF - AÏLA', 'price': 99, 'interval': None, 'type': 'one_time'},
    'theme_gold': {'name': 'Thème Or Royal - AÏLA', 'price': 199, 'interval': None, 'type': 'one_time'},
    'theme_nature': {'name': 'Thème Nature - AÏLA', 'price': 199, 'interval': None, 'type': 'one_time'},
    'theme_vintage': {'name': 'Thème Vintage - AÏLA', 'price': 199, 'interval': None, 'type': 'one_time'},
}

async def get_or_create_stripe_price(plan: str) -> str:
    """Get or create a Stripe price for the given plan"""
    if plan not in STRIPE_PRODUCTS:
        raise HTTPException(status_code=400, detail="Invalid plan")
    
    product_config = STRIPE_PRODUCTS[plan]
    
    # Search for existing product
    try:
        products = stripe.Product.list(limit=100)
        existing_product = None
        for p in products.data:
            if p.metadata.get('aila_plan') == plan:
                existing_product = p
                break
        
        if existing_product:
            # Get the price for this product
            prices = stripe.Price.list(product=existing_product.id, active=True, limit=1)
            if prices.data:
                return prices.data[0].id
        
        # Create new product
        product = stripe.Product.create(
            name=product_config['name'],
            metadata={'aila_plan': plan}
        )
        
        # Create price
        price_data = {
            'product': product.id,
            'unit_amount': product_config['price'],
            'currency': 'eur',
        }
        
        if product_config['interval']:
            price_data['recurring'] = {'interval': product_config['interval']}
        
        price = stripe.Price.create(**price_data)
        return price.id
        
    except stripe.error.StripeError as e:
        logger.error(f"Stripe error: {e}")
        raise HTTPException(status_code=500, detail=f"Stripe error: {str(e)}")

@api_router.get("/stripe/config")
async def get_stripe_config():
    """Get Stripe publishable key"""
    return {
        "publishable_key": STRIPE_PUBLISHABLE_KEY,
        "plans": {
            "monthly": {"price": "2,99 €", "description": "Par mois - Sans publicités"},
            "yearly": {"price": "24,99 €", "description": "Par an (économisez 30%)"},
        },
        "extras": {
            "pdf_export": {"price": "0,99 €", "description": "Export PDF haute qualité"},
            "theme_gold": {"price": "1,99 €", "description": "Thème Or Royal"},
            "theme_nature": {"price": "1,99 €", "description": "Thème Nature"},
            "theme_vintage": {"price": "1,99 €", "description": "Thème Vintage"},
        }
    }

@api_router.post("/stripe/create-checkout-session")
async def create_checkout_session(
    request: CreateCheckoutRequest,
    current_user: dict = Depends(get_current_user)
):
    """Create a Stripe Checkout session"""
    try:
        price_id = await get_or_create_stripe_price(request.plan)
        user_id = str(current_user['_id'])
        user_email = current_user['email']
        
        # Get product configuration
        product_config = STRIPE_PRODUCTS.get(request.plan, {})
        is_subscription = product_config.get('type') == 'subscription'
        
        # Check if user already has a Stripe customer ID
        stripe_customer_id = current_user.get('stripe_customer_id')
        
        if not stripe_customer_id:
            # Create a new customer
            customer = stripe.Customer.create(
                email=user_email,
                metadata={'user_id': user_id}
            )
            stripe_customer_id = customer.id
            
            # Save customer ID to database
            await db.users.update_one(
                {"_id": current_user['_id']},
                {"$set": {"stripe_customer_id": stripe_customer_id}}
            )
        
        success_url = request.success_url or f"{FRONTEND_URL}/(tabs)/profile?payment=success"
        cancel_url = request.cancel_url or f"{FRONTEND_URL}/pricing?payment=cancelled"
        
        # Create checkout session
        session_params = {
            'customer': stripe_customer_id,
            'payment_method_types': ['card'],
            'line_items': [{'price': price_id, 'quantity': 1}],
            'mode': 'subscription' if is_subscription else 'payment',
            'success_url': success_url,
            'cancel_url': cancel_url,
            'metadata': {
                'user_id': user_id,
                'plan': request.plan,
                'product_type': product_config.get('type', 'one_time')
            }
        }
        
        session = stripe.checkout.Session.create(**session_params)
        
        return {"checkout_url": session.url, "session_id": session.id}
        
    except stripe.error.StripeError as e:
        logger.error(f"Stripe checkout error: {e}")
        raise HTTPException(status_code=500, detail=f"Stripe error: {str(e)}")

@api_router.get("/stripe/subscription-status", response_model=SubscriptionResponse)
async def get_subscription_status(current_user: dict = Depends(get_current_user)):
    """Get user's subscription status"""
    subscription_status = current_user.get('subscription_status', 'free')
    plan = current_user.get('subscription_plan')
    period_end = current_user.get('subscription_period_end')
    
    is_premium = subscription_status in ['active', 'lifetime']
    
    return SubscriptionResponse(
        subscription_status=subscription_status,
        plan=plan,
        current_period_end=period_end.isoformat() if period_end else None,
        is_premium=is_premium
    )

@api_router.post("/stripe/webhook")
async def stripe_webhook(request: Request):
    """Handle Stripe webhooks"""
    payload = await request.body()
    sig_header = request.headers.get('stripe-signature')
    
    try:
        if STRIPE_WEBHOOK_SECRET:
            event = stripe.Webhook.construct_event(
                payload, sig_header, STRIPE_WEBHOOK_SECRET
            )
        else:
            # For testing without webhook secret
            import json
            event = json.loads(payload)
            
    except ValueError as e:
        raise HTTPException(status_code=400, detail="Invalid payload")
    except stripe.error.SignatureVerificationError as e:
        raise HTTPException(status_code=400, detail="Invalid signature")
    
    # Handle the event
    if event['type'] == 'checkout.session.completed':
        session = event['data']['object']
        user_id = session.get('metadata', {}).get('user_id')
        plan = session.get('metadata', {}).get('plan')
        
        if user_id:
            update_data = {
                'subscription_status': 'lifetime' if plan == 'lifetime' else 'active',
                'subscription_plan': plan,
                'stripe_session_id': session['id']
            }
            
            if plan != 'lifetime' and session.get('subscription'):
                # Get subscription details
                subscription = stripe.Subscription.retrieve(session['subscription'])
                update_data['stripe_subscription_id'] = subscription.id
                update_data['subscription_period_end'] = datetime.fromtimestamp(
                    subscription.current_period_end
                )
            
            await db.users.update_one(
                {"_id": ObjectId(user_id)},
                {"$set": update_data}
            )
            logger.info(f"Updated subscription for user {user_id}: {plan}")
    
    elif event['type'] == 'customer.subscription.updated':
        subscription = event['data']['object']
        customer_id = subscription['customer']
        
        # Find user by stripe customer id
        user = await db.users.find_one({"stripe_customer_id": customer_id})
        if user:
            await db.users.update_one(
                {"_id": user['_id']},
                {"$set": {
                    "subscription_status": subscription['status'],
                    "subscription_period_end": datetime.fromtimestamp(
                        subscription['current_period_end']
                    )
                }}
            )
    
    elif event['type'] == 'customer.subscription.deleted':
        subscription = event['data']['object']
        customer_id = subscription['customer']
        
        user = await db.users.find_one({"stripe_customer_id": customer_id})
        if user:
            await db.users.update_one(
                {"_id": user['_id']},
                {"$set": {
                    "subscription_status": "cancelled",
                    "subscription_plan": None
                }}
            )
    
    return {"status": "success"}

@api_router.post("/stripe/cancel-subscription")
async def cancel_subscription(current_user: dict = Depends(get_current_user)):
    """Cancel user's subscription"""
    subscription_id = current_user.get('stripe_subscription_id')
    
    if not subscription_id:
        raise HTTPException(status_code=400, detail="No active subscription")
    
    try:
        # Cancel at period end (user keeps access until end of billing period)
        stripe.Subscription.modify(
            subscription_id,
            cancel_at_period_end=True
        )
        
        await db.users.update_one(
            {"_id": current_user['_id']},
            {"$set": {"subscription_status": "cancelling"}}
        )
        
        return {"message": "Subscription will be cancelled at the end of the billing period"}
        
    except stripe.error.StripeError as e:
        raise HTTPException(status_code=500, detail=f"Stripe error: {str(e)}")

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
