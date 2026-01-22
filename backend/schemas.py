from pydantic import BaseModel
from datetime import date
from typing import Optional


from typing import Optional, List

class ProductBase(BaseModel):
    name: str
    category: Optional[str] = None

class ProductCreate(ProductBase):
    pass

class Product(ProductBase):
    id: int
    class Config:
        orm_mode = True

# ProductBatch
class ProductBatchBase(BaseModel):
    product_id: int
    manufacture_date: date
    expiry_date: date
    base_price: float
    quantity: int

class ProductBatchCreate(ProductBatchBase):
    pass

class ProductBatch(ProductBatchBase):
    id: int
    class Config:
        orm_mode = True

# ProductPrice (linked to batch)
class ProductPriceBase(BaseModel):
    product_batch_id: int
    date: date
    discounted_price: float

class ProductPriceCreate(ProductPriceBase):
    pass

class ProductPrice(ProductPriceBase):
    id: int
    class Config:
        orm_mode = True

# Inventory
class InventoryBase(BaseModel):
    product_id: int
    date: date
    quantity: int

class InventoryCreate(InventoryBase):
    pass

class Inventory(InventoryBase):
    id: int
    class Config:
        orm_mode = True

# Order and OrderItem
class OrderItemBase(BaseModel):
    product_id: int
    quantity: int
    price: float

class OrderItemCreate(OrderItemBase):
    pass

class OrderItem(OrderItemBase):
    id: int
    class Config:
        orm_mode = True

class OrderBase(BaseModel):
    date: date
    total_price: float

class OrderCreate(OrderBase):
    items: List[OrderItemCreate]

class Order(OrderBase):
    id: int
    items: List[OrderItem]
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
