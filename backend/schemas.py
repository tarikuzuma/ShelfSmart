
from pydantic import BaseModel
from datetime import date
from typing import Optional, List

class UserBase(BaseModel):
    name: str
    shipping_address: str

class UserCreate(UserBase):
    pass

class User(UserBase):
    id: int
    class Config:
        orm_mode = True

class RetailerBase(BaseModel):
    name: str
    location: str

class RetailerCreate(RetailerBase):
    pass

class Retailer(RetailerBase):
    id: int
    class Config:
        orm_mode = True

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

class ProductPriceBase(BaseModel):
    product_id: int
    discounted_price: float

class ProductPriceCreate(ProductPriceBase):
    pass

class ProductPrice(ProductPriceBase):
    id: int
    class Config:
        orm_mode = True

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
