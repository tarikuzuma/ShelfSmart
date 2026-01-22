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

# Get today's discounted price for a product batch
@router.get("/product-batch-discounted-price/")
def get_product_batch_discounted_price(product_batch_id: int, db: Session = Depends(get_db)):
    today = date.today()
    price_obj = db.query(models.ProductPrice).filter(models.ProductPrice.product_batch_id == product_batch_id, models.ProductPrice.date == today).first()
    if price_obj:
        return {"discounted_price": price_obj.discounted_price}
    batch = db.query(models.ProductBatch).filter(models.ProductBatch.id == product_batch_id).first()
    if batch:
        return {"discounted_price": batch.base_price}
    raise HTTPException(status_code=404, detail="Batch not found")

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
