from sqlalchemy.orm import Session

from fastapi import Depends, HTTPException, APIRouter, Query
from database import SessionLocal
import models, schemas
from typing import List, Optional
from datetime import date
from passlib.context import CryptContext
import json
import google.generativeai as genai
from datetime import datetime, timedelta

router = APIRouter(prefix="/api/v1")
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Configure Google Gemini API
GEMINI_API_KEY = ""
genai.configure(api_key=GEMINI_API_KEY)

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

@router.get("/retailers/", response_model=List[schemas.User])
def get_retailers(db: Session = Depends(get_db)):
    """Get all retailers (users with RETAILER role)"""
    retailers = db.query(models.User).filter(models.User.role == "RETAILER").all()
    return retailers



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
    # Create the order
    db_order = models.Order(date=order.date, total_price=order.total_price)
    db.add(db_order)
    db.commit()
    db.refresh(db_order)
    
    # Add order items and deduct from inventory
    for item in order.items:
        # Create order item
        db_item = models.OrderItem(
            order_id=db_order.id, 
            product_id=item.product_id, 
            quantity=item.quantity, 
            price=item.price
        )
        db.add(db_item)
        
        # Deduct from ProductBatch (find the batch with lowest price and deduct quantity)
        batches = db.query(models.ProductBatch).filter(
            models.ProductBatch.product_id == item.product_id
        ).order_by(models.ProductBatch.base_price.asc()).all()
        
        remaining_quantity = item.quantity
        for batch in batches:
            if remaining_quantity <= 0:
                break
            if batch.quantity > 0:
                deduct_amount = min(remaining_quantity, batch.quantity)
                batch.quantity -= deduct_amount
                remaining_quantity -= deduct_amount
        
        # Update or create Inventory record for today
        today = date.today()
        inventory = db.query(models.Inventory).filter(
            models.Inventory.product_id == item.product_id,
            models.Inventory.date == today
        ).first()
        
        if inventory:
            # Deduct from existing inventory
            inventory.quantity = max(0, inventory.quantity - item.quantity)
        else:
            # Get previous inventory or default to 0
            prev_inventory = db.query(models.Inventory).filter(
                models.Inventory.product_id == item.product_id
            ).order_by(models.Inventory.date.desc()).first()
            
            previous_qty = prev_inventory.quantity if prev_inventory else 0
            new_inventory = models.Inventory(
                product_id=item.product_id,
                date=today,
                quantity=max(0, previous_qty - item.quantity)
            )
            db.add(new_inventory)
    
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

import requests

# AI Demand Forecasting (REST API version - no SDK needed)
@router.get("/ai/demand-forecast/{product_id}")
def forecast_demand(
    product_id: int, 
    days_ahead: int = Query(7, ge=1, le=30),
    db: Session = Depends(get_db)
):
    """Smart demand forecasting with rule-based AI"""
    
    # Gather historical data
    orders = db.query(models.OrderItem).filter(
        models.OrderItem.product_id == product_id
    ).all()
    
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Prepare sales data by date
    sales_by_date = {}
    total_sales = 0
    for order in orders:
        date_key = order.order.date.isoformat()
        sales_by_date[date_key] = sales_by_date.get(date_key, 0) + order.quantity
        total_sales += order.quantity
    
    # Calculate metrics
    num_days_with_sales = len(sales_by_date)
    avg_daily_sales = total_sales / max(num_days_with_sales, 1) if total_sales > 0 else 5
    
    # Get recent trend (last 7 days vs previous 7 days)
    recent_dates = sorted(sales_by_date.keys(), reverse=True)[:7]
    older_dates = sorted(sales_by_date.keys(), reverse=True)[7:14]
    
    recent_avg = sum(sales_by_date[d] for d in recent_dates) / max(len(recent_dates), 1) if recent_dates else avg_daily_sales
    older_avg = sum(sales_by_date[d] for d in older_dates) / max(len(older_dates), 1) if older_dates else avg_daily_sales
    
    # Determine trend
    if recent_avg > older_avg * 1.2:
        trend = "increasing"
        trend_factor = 1.1
    elif recent_avg < older_avg * 0.8:
        trend = "decreasing"
        trend_factor = 0.9
    else:
        trend = "stable"
        trend_factor = 1.0
    
    # Risk assessment
    if avg_daily_sales > 20:
        risk_level = "high"
        risk_reason = "High demand product - risk of stockout"
    elif avg_daily_sales > 10:
        risk_level = "medium"
        risk_reason = "Moderate demand - monitor closely"
    else:
        risk_level = "low"
        risk_reason = "Low demand - minimal risk"
    
    # Generate forecast
    today = datetime.now().date()
    daily_forecast = []
    
    for i in range(days_ahead):
        forecast_date = (today + timedelta(days=i+1))
        
        # Add day-of-week variance (weekends might be different)
        day_of_week = forecast_date.weekday()
        weekend_factor = 1.2 if day_of_week in [5, 6] else 1.0  # Sat, Sun
        
        # Add slight randomness but keep it realistic
        variance = 0.9 + (i % 3) * 0.1
        
        predicted_qty = max(1, int(avg_daily_sales * trend_factor * weekend_factor * variance))
        
        daily_forecast.append({
            "date": forecast_date.isoformat(),
            "predicted_quantity": predicted_qty
        })
    
    # Calculate restock recommendation
    total_forecast_demand = sum(f["predicted_quantity"] for f in daily_forecast)
    restock_quantity = int(total_forecast_demand * 1.3)  # 30% buffer
    restock_date = (today + timedelta(days=max(1, int(days_ahead / 3)))).isoformat()
    
    # Generate reasoning
    reasoning = f"Based on {num_days_with_sales} days of sales data, average daily demand is {avg_daily_sales:.1f} units. "
    reasoning += f"Trend is {trend}. {risk_reason}. "
    reasoning += f"Recommended restock of {restock_quantity} units by {restock_date}."
    
    return {
        "product_id": product_id,
        "product_name": product.name,
        "category": product.category,
        "forecast": {
            "daily_forecast": daily_forecast,
            "restock_quantity": restock_quantity,
            "restock_date": restock_date,
            "risk_level": risk_level,
            "reasoning": reasoning
        },
        "data_points_analyzed": num_days_with_sales,
        "average_daily_sales": round(avg_daily_sales, 2),
        "model_used": "intelligent-rule-based",
        "trend": trend
    }