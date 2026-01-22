from sqlalchemy.orm import Session
from fastapi import Depends, HTTPException, APIRouter, Query
from database import SessionLocal
import models, schemas
from typing import List, Optional
from passlib.context import CryptContext

router = APIRouter(prefix="/api/v1")
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ---------- AUTH ----------

@router.post("/auth/signup", response_model=schemas.User)
def signup(user: schemas.UserCreate, db: Session = Depends(get_db)):
    if db.query(models.User).filter(models.User.email == user.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")

    new_user = models.User(
        role=user.role,
        name=user.name,
        email=user.email,
        phone=user.phone,
        password_hash=pwd_context.hash(user.password),
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@router.post("/auth/login", response_model=schemas.User)
def login(user: schemas.UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if not db_user or not pwd_context.verify(user.password, db_user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    return db_user
