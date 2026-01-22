from pydantic import BaseModel, EmailStr
from datetime import date, datetime
from typing import Optional, List, Literal

# ---------- USER ----------

class UserBase(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    role: Literal["CONSUMER", "RETAILER"]

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class User(UserBase):
    id: int
    created_at: datetime

    class Config:
        orm_mode = True

# ---------- RETAILER ----------

class RetailerBase(BaseModel):
    name: str
    location: str

class RetailerCreate(RetailerBase):
    pass

class Retailer(RetailerBase):
    id: int

    class Config:
        orm_mode = True

# ---------- PRODUCT ----------

class ProductBase(BaseModel):
    retailer_id: int
    name: str
    base_price: float
    date_added: date
    expiration_date: Optional[date]
    quantity: int

class ProductCreate(ProductBase):
    pass

class Product(ProductBase):
    id: int

    class Config:
        orm_mode = True

# ---------- PRODUCT PRICE ----------

class ProductPriceBase(BaseModel):
    product_id: int
    discounted_price: float

class ProductPriceCreate(ProductPriceBase):
    pass

class ProductPrice(ProductPriceBase):
    id: int

    class Config:
        orm_mode = True

# ---------- ORDER ----------

class OrderItemBase(BaseModel):
    product_id: int
    quantity: int

class OrderItemCreate(OrderItemBase):
    pass

class OrderItem(OrderItemBase):
    id: int

    class Config:
        orm_mode = True

class OrderBase(BaseModel):
    date: date
    user_id: int

class OrderCreate(OrderBase):
    items: List[OrderItemCreate]

class Order(OrderBase):
    id: int
    items: List[OrderItem] = []

    class Config:
        orm_mode = True
