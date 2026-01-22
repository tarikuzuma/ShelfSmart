from sqlalchemy.orm import Session
from fastapi import Depends, HTTPException, APIRouter, Query
from database import SessionLocal
import models, schemas
from typing import List, Optional
from datetime import date

router = APIRouter(prefix="/api/v1")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Users
@router.post("/users/", response_model=schemas.User)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = models.User(**user.dict())
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@router.get("/users/", response_model=List[schemas.User])
def read_users(name: Optional[str] = Query(None), db: Session = Depends(get_db)):
    query = db.query(models.User)
    if name:
        query = query.filter(models.User.name.ilike(f"%{name}%"))
    return query.all()

# Retailers
@router.post("/retailers/", response_model=schemas.Retailer)
def create_retailer(retailer: schemas.RetailerCreate, db: Session = Depends(get_db)):
    db_retailer = models.Retailer(**retailer.dict())
    db.add(db_retailer)
    db.commit()
    db.refresh(db_retailer)
    return db_retailer

@router.get("/retailers/", response_model=List[schemas.Retailer])
def read_retailers(name: Optional[str] = Query(None), db: Session = Depends(get_db)):
    query = db.query(models.Retailer)
    if name:
        query = query.filter(models.Retailer.name.ilike(f"%{name}%"))
    return query.all()

# Products
@router.post("/products/", response_model=schemas.Product)
def create_product(product: schemas.ProductCreate, db: Session = Depends(get_db)):
    db_product = models.Product(**product.dict())
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product

@router.get("/products/", response_model=List[schemas.Product])
def read_products(name: Optional[str] = Query(None), retailer_id: Optional[int] = Query(None), db: Session = Depends(get_db)):
    query = db.query(models.Product)
    if name:
        query = query.filter(models.Product.name.ilike(f"%{name}%"))
    if retailer_id:
        query = query.filter(models.Product.retailer_id == retailer_id)
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
def read_product_prices(product_id: Optional[int] = Query(None), db: Session = Depends(get_db)):
    query = db.query(models.ProductPrice)
    if product_id:
        query = query.filter(models.ProductPrice.product_id == product_id)
    return query.all()

# Orders
@router.post("/orders/", response_model=schemas.Order)
def create_order(order: schemas.OrderCreate, db: Session = Depends(get_db)):
    db_order = models.Order(date=order.date, user_id=order.user_id)
    db.add(db_order)
    db.commit()
    db.refresh(db_order)
    # Add order items
    for item in order.items:
        db_item = models.OrderItem(order_id=db_order.id, product_id=item.product_id, quantity=item.quantity)
        db.add(db_item)
    db.commit()
    db.refresh(db_order)
    return db_order

@router.get("/orders/", response_model=List[schemas.Order])
def read_orders(user_id: Optional[int] = Query(None), db: Session = Depends(get_db)):
    query = db.query(models.Order)
    if user_id:
        query = query.filter(models.Order.user_id == user_id)
    return query.all()

# Order Items
@router.get("/order-items/", response_model=List[schemas.OrderItem])
def read_order_items(order_id: Optional[int] = Query(None), product_id: Optional[int] = Query(None), db: Session = Depends(get_db)):
    query = db.query(models.OrderItem)
    if order_id:
        query = query.filter(models.OrderItem.order_id == order_id)
    if product_id:
        query = query.filter(models.OrderItem.product_id == product_id)
    return query.all()
    return db_delivery

