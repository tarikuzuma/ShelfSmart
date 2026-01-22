from sqlalchemy.orm import Session

from fastapi import Depends, HTTPException, APIRouter, Query
from database import SessionLocal
import models, schemas
from typing import List, Optional
from datetime import date
from passlib.context import CryptContext

router = APIRouter(prefix="/api/v1")
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# In-memory subscription storage: { userId: [retailerId1, retailerId2, ...] }
subscribed_retailers: dict = {}

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Auth endpoints
@router.post("/auth/signup", response_model=schemas.User)
def signup(user: schemas.UserCreate, db: Session = Depends(get_db)):
    if db.query(models.User).filter(models.User.email == user.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")

    new_user = models.User(
        role=user.role,
        name=user.name,
        email=user.email,
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



# Products
@router.post("/products/", response_model=schemas.Product)
def create_product(product: schemas.ProductCreate, db: Session = Depends(get_db)):
    db_product = models.Product(name=product.name, category=product.category)
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product


# List products
@router.get("/products/", response_model=List[schemas.Product])
def read_products(name: Optional[str] = Query(None), category: Optional[str] = Query(None), db: Session = Depends(get_db)):
    query = db.query(models.Product)
    if name:
        query = query.filter(models.Product.name.ilike(f"%{name}%"))
    if category:
        query = query.filter(models.Product.category == category)
    return query.all()

# Get product by id
@router.get("/products/{id}", response_model=schemas.Product)
def get_product(id: int, db: Session = Depends(get_db)):
    product = db.query(models.Product).filter(models.Product.id == id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

# Get cheapest batch for product
@router.get("/products/{id}/cheapest-batch", response_model=schemas.ProductBatch)
def get_cheapest_batch(id: int, db: Session = Depends(get_db)):
    batch = db.query(models.ProductBatch).filter(models.ProductBatch.product_id == id).order_by(models.ProductBatch.base_price.asc()).first()
    if not batch:
        raise HTTPException(status_code=404, detail="No batch found for product")
    return batch


# Product Batches
@router.post("/product-batches/", response_model=schemas.ProductBatch)
def create_product_batch(batch: schemas.ProductBatchCreate, db: Session = Depends(get_db)):
    db_batch = models.ProductBatch(**batch.dict())
    db.add(db_batch)
    db.commit()
    db.refresh(db_batch)
    return db_batch


# List product batches
@router.get("/product-batches/", response_model=List[schemas.ProductBatch])
def read_product_batches(product_id: Optional[int] = Query(None), db: Session = Depends(get_db)):
    query = db.query(models.ProductBatch)
    if product_id:
        query = query.filter(models.ProductBatch.product_id == product_id)
    return query.all()

# Get product batch by id
@router.get("/product-batches/{id}", response_model=schemas.ProductBatch)
def get_product_batch(id: int, db: Session = Depends(get_db)):
    batch = db.query(models.ProductBatch).filter(models.ProductBatch.id == id).first()
    if not batch:
        raise HTTPException(status_code=404, detail="Product batch not found")
    return batch

# Product Prices (by batch)
@router.post("/product-prices/", response_model=schemas.ProductPrice)
def create_product_price(price: schemas.ProductPriceCreate, db: Session = Depends(get_db)):
    db_price = models.ProductPrice(**price.dict())
    db.add(db_price)
    db.commit()
    db.refresh(db_price)
    return db_price

@router.get("/product-prices/", response_model=List[schemas.ProductPrice])
def read_product_prices(product_batch_id: Optional[int] = Query(None), date_from: Optional[date] = Query(None), date_to: Optional[date] = Query(None), db: Session = Depends(get_db)):
    query = db.query(models.ProductPrice)
    if product_batch_id:
        query = query.filter(models.ProductPrice.product_batch_id == product_batch_id)
    if date_from:
        query = query.filter(models.ProductPrice.date >= date_from)
    if date_to:
        query = query.filter(models.ProductPrice.date <= date_to)
    return query.all()


# Inventory endpoints
@router.post("/inventories/", response_model=schemas.Inventory)
def create_inventory(inv: schemas.InventoryCreate, db: Session = Depends(get_db)):
    db_inv = models.Inventory(**inv.dict())
    db.add(db_inv)
    db.commit()
    db.refresh(db_inv)
    return db_inv

@router.get("/inventories/", response_model=List[schemas.Inventory])
def read_inventories(product_id: Optional[int] = Query(None), date_from: Optional[date] = Query(None), date_to: Optional[date] = Query(None), db: Session = Depends(get_db)):
    query = db.query(models.Inventory)
    if product_id:
        query = query.filter(models.Inventory.product_id == product_id)
    if date_from:
        query = query.filter(models.Inventory.date >= date_from)
    if date_to:
        query = query.filter(models.Inventory.date <= date_to)
    return query.all()


# Order endpoints
@router.post("/orders/", response_model=schemas.Order)
def create_order(order: schemas.OrderCreate, db: Session = Depends(get_db)):
    db_order = models.Order(date=order.date, total_price=order.total_price)
    db.add(db_order)
    db.commit()
    db.refresh(db_order)
    # Add order items
    for item in order.items:
        db_item = models.OrderItem(order_id=db_order.id, product_id=item.product_id, quantity=item.quantity, price=item.price)
        db.add(db_item)
    db.commit()
    db.refresh(db_order)
    db_order.items = db.query(models.OrderItem).filter_by(order_id=db_order.id).all()
    return db_order

@router.get("/orders/", response_model=List[schemas.Order])
def read_orders(date_from: Optional[date] = Query(None), date_to: Optional[date] = Query(None), db: Session = Depends(get_db)):
    query = db.query(models.Order)
    if date_from:
        query = query.filter(models.Order.date >= date_from)
    if date_to:
        query = query.filter(models.Order.date <= date_to)
    orders = query.all()
    for order in orders:
        order.items = db.query(models.OrderItem).filter_by(order_id=order.id).all()
    return orders

# Subscription endpoints (in-memory storage)
@router.post("/subscriptions/{user_id}/{retailer_id}")
def subscribe_to_retailer(user_id: int, retailer_id: int):
    """Subscribe a user to a retailer for price alerts"""
    if user_id not in subscribed_retailers:
        subscribed_retailers[user_id] = []
    if retailer_id not in subscribed_retailers[user_id]:
        subscribed_retailers[user_id].append(retailer_id)
    return {"message": "Subscribed successfully", "subscriptions": subscribed_retailers[user_id]}

@router.delete("/subscriptions/{user_id}/{retailer_id}")
def unsubscribe_from_retailer(user_id: int, retailer_id: int):
    """Unsubscribe a user from a retailer"""
    if user_id in subscribed_retailers:
        subscribed_retailers[user_id] = [r for r in subscribed_retailers[user_id] if r != retailer_id]
    return {"message": "Unsubscribed successfully", "subscriptions": subscribed_retailers.get(user_id, [])}

@router.get("/subscriptions/{user_id}")
def get_user_subscriptions(user_id: int):
    """Get all retailers a user is subscribed to"""
    return {"user_id": user_id, "retailer_ids": subscribed_retailers.get(user_id, [])}

@router.get("/subscriptions/retailer/{retailer_id}/users")
def get_subscribed_users(retailer_id: int):
    """Get all users subscribed to a retailer (for price drop notifications)"""
    subscribed_users = [uid for uid, retailer_ids in subscribed_retailers.items() if retailer_id in retailer_ids]
    return {"retailer_id": retailer_id, "user_ids": subscribed_users}
