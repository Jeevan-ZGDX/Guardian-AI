# Lightweight version with SQLite DB and Auth
import time, json, hashlib, os, uuid, datetime
from typing import List, Optional
from fastapi import FastAPI, File, Form, UploadFile, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel, EmailStr
from sqlalchemy import create_engine, Column, String, Integer, Float, Boolean, ForeignKey, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session, relationship
from jose import JWTError, jwt
from passlib.context import CryptContext
import uvicorn

# --- Configuration ---
SECRET_KEY = "your-secret-key-keep-it-secret"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
DATABASE_URL = "sqlite:///./campus_track.db"

# --- Database Setup ---
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# --- Models ---
class User(Base):
    __tablename__ = "users"
    id = Column(String, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    role = Column(String) # 'student' or 'vendor'
    full_name = Column(String)

class InventoryItem(Base):
    __tablename__ = "inventory"
    id = Column(String, primary_key=True, index=True)
    name = Column(String)
    qty = Column(Integer)

class Issue(Base):
    __tablename__ = "issues"
    id = Column(String, primary_key=True, index=True)
    title = Column(String)
    description = Column(String)
    severity = Column(Integer)
    sentiment = Column(Float)
    reporter_id = Column(String, ForeignKey("users.id"))
    status = Column(String, default="open")
    block_hash = Column(String)
    created_at = Column(Integer)

class BlockchainBlock(Base):
    __tablename__ = "blockchain"
    hash = Column(String, primary_key=True)
    index = Column(Integer)
    timestamp = Column(Integer)
    prev_hash = Column(String)
    data = Column(Text)

Base.metadata.create_all(bind=engine)

# --- Dependencies ---
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- Auth Utilities ---
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

def verify_password(plain_password, hashed_password):
    try:
        return pwd_context.verify(plain_password, hashed_password)
    except Exception as e:
        print(f"Password verification error: {e}")
        return False

def get_password_hash(password):
    # Truncate password to 72 bytes for bcrypt compatibility
    try:
        return pwd_context.hash(password[:72])
    except Exception as e:
        print(f"Password hashing error: {e}")
        # Fallback to simple hash for testing
        import hashlib
        return hashlib.sha256(password.encode()).hexdigest()

def create_access_token(data: dict, expires_delta: Optional[datetime.timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.datetime.utcnow() + expires_delta
    else:
        expire = datetime.datetime.utcnow() + datetime.timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    user = db.query(User).filter(User.email == email).first()
    if user is None:
        raise credentials_exception
    return user

# --- Pydantic Schemas ---
class UserCreate(BaseModel):
    email: EmailStr
    password: str
    role: str
    full_name: str

class Token(BaseModel):
    access_token: str
    token_type: str
    role: str
    user_name: str

class IssueCreate(BaseModel):
    title: str
    description: str

class InventoryCheck(BaseModel):
    available: bool
    qty: int

# --- App ---
app = FastAPI(title="Campus Issue Resolver API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Blockchain Logic ---
def get_chain(db: Session):
    return db.query(BlockchainBlock).order_by(BlockchainBlock.index).all()

def add_block_to_db(data: str, db: Session):
    last_block = db.query(BlockchainBlock).order_by(BlockchainBlock.index.desc()).first()
    if not last_block:
        # Genesis
        idx = 0
        prev = "0"
    else:
        idx = last_block.index + 1
        prev = last_block.hash
    
    ts = int(time.time())
    h = hashlib.sha256(f"{idx}{ts}{prev}{data}".encode()).hexdigest()
    new_block = BlockchainBlock(index=idx, timestamp=ts, prev_hash=prev, data=data, hash=h)
    db.add(new_block)
    db.commit()
    return h

# Initialize Genesis if empty
def init_chain():
    db = SessionLocal()
    if db.query(BlockchainBlock).count() == 0:
        add_block_to_db("genesis", db)
        
        # Also seed inventory
        if db.query(InventoryItem).count() == 0:
            items = [
                InventoryItem(id="1", name="Chair", qty=12),
                InventoryItem(id="2", name="Desk", qty=8),
                InventoryItem(id="3", name="Bulb", qty=30),
                InventoryItem(id="4", name="Fan", qty=5),
                InventoryItem(id="5", name="Projector", qty=2)
            ]
            db.add_all(items)
            db.commit()
    db.close()

init_chain()

# --- AI Stub ---
def classify_severity(text:str)->int:
    if any(word in text.lower() for word in ['broken', 'damaged', 'urgent', 'emergency', 'fire', 'spark']):
        return 3
    elif any(word in text.lower() for word in ['issue', 'problem', 'not working', 'flickering']):
        return 2
    else:
        return 1

def sentiment_score(text:str)->float:
    return 0.0 # Placeholder

# --- Endpoints ---

@app.post("/token", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = datetime.timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email, "role": user.role}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer", "role": user.role, "user_name": user.full_name}

@app.post("/register", response_model=Token)
def register(user: UserCreate, db: Session = Depends(get_db)):
    if not user.email.endswith("@citchennai.net"):
        raise HTTPException(400, "Email must belong to @citchennai.net domain")
    
    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user:
        raise HTTPException(400, "Email already registered")
    
    hashed_pw = get_password_hash(user.password)
    new_user = User(id=str(uuid.uuid4()), email=user.email, hashed_password=hashed_pw, role=user.role, full_name=user.full_name)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    access_token = create_access_token(data={"sub": new_user.email, "role": new_user.role})
    return {"access_token": access_token, "token_type": "bearer", "role": new_user.role, "user_name": new_user.full_name}

@app.get("/api/chain")
def get_blockchain(db: Session = Depends(get_db)):
    chain = get_chain(db)
    return {"chain": chain, "length": len(chain)}

@app.get("/api/inventory")
def get_inventory_list(db: Session = Depends(get_db)):
    return db.query(InventoryItem).all()

@app.post("/api/inventory/{item_id}/check")
def check_inventory(item_id: str, db: Session = Depends(get_db)):
    item = db.query(InventoryItem).filter(InventoryItem.id == item_id).first()
    if not item:
        raise HTTPException(404, "Item not found")
    return {"available": item.qty > 0, "qty": item.qty}

@app.post("/api/issues")
def raise_issue(issue_data: IssueCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role != "student":
        raise HTTPException(403, "Only students can raise issues")
        
    severity = classify_severity(issue_data.description)
    sentiment = sentiment_score(issue_data.description)
    
    new_issue = Issue(
        id=str(uuid.uuid4()),
        title=issue_data.title,
        description=issue_data.description,
        severity=severity,
        sentiment=sentiment,
        reporter_id=current_user.id,
        created_at=int(time.time())
    )
    
    # Add to DB
    db.add(new_issue)
    
    # Add to Blockchain
    block_data = json.dumps({
        "type": "ISSUE_RAISED",
        "id": new_issue.id,
        "title": new_issue.title,
        "reporter": current_user.email,
        "severity": severity
    })
    block_hash = add_block_to_db(block_data, db)
    
    new_issue.block_hash = block_hash
    db.commit()
    
    return {
        "id": new_issue.id,
        "block_hash": block_hash,
        "severity": severity,
        "status": "open"
    }

@app.post("/api/report")
async def voice_report(
    audio: UploadFile = File(...), 
    issue_id: str = Form(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != "vendor":
        raise HTTPException(403, "Only vendors can submit reports")
        
    content = await audio.read()
    # Simulate processing
    transcript = "Simulated transcript: The issue has been resolved using available inventory."
    summary = "Issue resolved."
    
    # Add to Blockchain
    block_data = json.dumps({
        "type": "REPORT_SUBMITTED",
        "issue_id": issue_id,
        "vendor": current_user.email,
        "transcript": transcript,
        "summary": summary
    })
    block_hash = add_block_to_db(block_data, db)
    
    # Update issue status
    issue = db.query(Issue).filter(Issue.id == issue_id).first()
    if issue:
        issue.status = "resolved"
        db.commit()
        
    return {
        "report": {
            "transcript": transcript,
            "summary": summary,
            "issue_id": issue_id
        },
        "block_hash": block_hash
    }

@app.get("/")
def root():
    return {"msg": "Campus Issue Resolver API with Auth & DB"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
