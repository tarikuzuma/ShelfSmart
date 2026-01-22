
from sqlalchemy import Column, Integer, String, Float, Date, ForeignKey
from sqlalchemy.orm import relationship
from database import Base


class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    category = Column(String, index=True, nullable=True)
    # Relationships
    batches = relationship("ProductBatch", back_populates="product")

class ProductBatch(Base):
    __tablename__ = "product_batches"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    manufacture_date = Column(Date, nullable=False)
    expiry_date = Column(Date, nullable=False)
    base_price = Column(Float, nullable=False)
    quantity = Column(Integer, nullable=False)
    # Relationships
    product = relationship("Product", back_populates="batches")
    prices = relationship("ProductPrice", back_populates="product_batch")


class ProductPrice(Base):
    __tablename__ = "product_prices"

    id = Column(Integer, primary_key=True, index=True)
    product_batch_id = Column(Integer, ForeignKey("product_batches.id"), nullable=False)
    date = Column(Date, nullable=False)
    discounted_price = Column(Float, nullable=False)
    # Relationships
    product_batch = relationship("ProductBatch", back_populates="prices")

# Inventory snapshot per product per day
class Inventory(Base):
    __tablename__ = "inventories"
    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    date = Column(Date, nullable=False, index=True)
    quantity = Column(Integer, nullable=False)
    product = relationship("Product")

# Order (sales transaction)
class Order(Base):
    __tablename__ = "orders"
    id = Column(Integer, primary_key=True, index=True)
    date = Column(Date, nullable=False)
    total_price = Column(Float, nullable=False)
    items = relationship("OrderItem", back_populates="order")

class OrderItem(Base):
    __tablename__ = "order_items"
    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    quantity = Column(Integer, nullable=False)
    price = Column(Float, nullable=False)  # price per unit at time of order
    order = relationship("Order", back_populates="items")
    product = relationship("Product")
