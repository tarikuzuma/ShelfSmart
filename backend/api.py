from sqlalchemy.orm import Session

from fastapi import Depends, HTTPException, APIRouter, Query
from database import SessionLocal
import models, schemas
from typing import List, Optional
from datetime import date
from passlib.context import CryptContext

router = APIRouter(prefix="/api/v1")

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Auth
@router.post("/auth/signup", response_model=schemas.User)
def signup(user: schemas.UserCreate, db: Session = Depends(get_db)):
    existing = db.query(models.User).filter(models.User.email == user.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed_password = pwd_context.hash(user.password)
    new_user = models.User(
        role=user.role,
        name=user.name,
        email=user.email,
        phone=user.phone,
        password_hash=hashed_password,
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

# Products
@router.post("/products/", response_model=schemas.Product)
def create_product(product: schemas.ProductCreate, db: Session = Depends(get_db)):
    db_product = models.Product(name=product.name)
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product

@router.get("/products/", response_model=List[schemas.Product])
def read_products(name: Optional[str] = Query(None), db: Session = Depends(get_db)):
    query = db.query(models.Product)
    if name:
        query = query.filter(models.Product.name.ilike(f"%{name}%"))
    return query.all()

# Product Prices
@router.post("/product-prices/", response_model=schemas.ProductPrice)
def create_product_price(price: schemas.ProductPriceCreate, db: Session = Depends(get_db)):
    db_price = models.ProductPrice(**price.dict())
    db.add(db_price)
    db.commit()
    db.refresh(db_price)
    return db_price

@router.get("/product-prices/", response_model=List[schemas.ProductPrice])
def read_product_prices(product_id: Optional[int] = Query(None), date_from: Optional[date] = Query(None), date_to: Optional[date] = Query(None), db: Session = Depends(get_db)):
    query = db.query(models.ProductPrice)
    if product_id:
        query = query.filter(models.ProductPrice.product_id == product_id)
    if date_from:
        query = query.filter(models.ProductPrice.date >= date_from)
    if date_to:
        query = query.filter(models.ProductPrice.date <= date_to)
    return query.all()

# Deliveries
@router.post("/deliveries/", response_model=schemas.Delivery)
def create_delivery(delivery: schemas.DeliveryCreate, db: Session = Depends(get_db)):
    db_delivery = models.Delivery(**delivery.dict())
    db.add(db_delivery)
    db.commit()
    db.refresh(db_delivery)
    return db_delivery

@router.get("/deliveries/", response_model=List[schemas.Delivery])
def read_deliveries(product_id: Optional[int] = Query(None), delivery_date: Optional[date] = Query(None), db: Session = Depends(get_db)):
    query = db.query(models.Delivery)
    if product_id:
        query = query.filter(models.Delivery.product_id == product_id)
    if delivery_date:
        query = query.filter(models.Delivery.delivery_date == delivery_date)
    return query.all()

# Sales
@router.post("/sales/", response_model=schemas.Sale)
def create_sale(sale: schemas.SaleCreate, db: Session = Depends(get_db)):
    db_sale = models.Sale(**sale.dict())
    db.add(db_sale)
    db.commit()
    db.refresh(db_sale)
    return db_sale

@router.get("/sales/", response_model=List[schemas.Sale])
def read_sales(product_id: Optional[int] = Query(None), date_from: Optional[date] = Query(None), date_to: Optional[date] = Query(None), db: Session = Depends(get_db)):
    query = db.query(models.Sale)
    if product_id:
        query = query.filter(models.Sale.product_id == product_id)
    if date_from:
        query = query.filter(models.Sale.date >= date_from)
    if date_to:
        query = query.filter(models.Sale.date <= date_to)
    return query.all()
