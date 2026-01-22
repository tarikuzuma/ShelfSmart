from pydantic import BaseModel
from datetime import date
from typing import Optional

class ProductBase(BaseModel):
    name: str

class ProductCreate(ProductBase):
    pass

class Product(ProductBase):
    id: int
    class Config:
        orm_mode = True

class ProductPriceBase(BaseModel):
    product_id: int
    date: date
    price: float

class ProductPriceCreate(ProductPriceBase):
    pass

class ProductPrice(ProductPriceBase):
    id: int
    class Config:
        orm_mode = True

class DeliveryBase(BaseModel):
    product_id: int
    delivery_date: date
    harvest_date: Optional[date]
    quantity: int

class DeliveryCreate(DeliveryBase):
    pass

class Delivery(DeliveryBase):
    id: int
    class Config:
        orm_mode = True

class SaleBase(BaseModel):
    product_id: int
    date: date
    quantity: int
    total_price: float

class SaleCreate(SaleBase):
    pass

class Sale(SaleBase):
    id: int
    class Config:
        orm_mode = True
