

from sqlalchemy import Column, Integer, String, Float, Date, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    shipping_address = Column(String, nullable=False)
    orders = relationship("Order", back_populates="user")

class Retailer(Base):
    __tablename__ = "retailers"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    location = Column(String, nullable=False)
    products = relationship("Product", back_populates="retailer")

class Product(Base):
    __tablename__ = "products"
    id = Column(Integer, primary_key=True, index=True)
    retailer_id = Column(Integer, ForeignKey("retailers.id"), nullable=False)
    name = Column(String, index=True, nullable=False)
    base_price = Column(Float, nullable=False)
    date_added = Column(Date, nullable=False)
    expiration_date = Column(Date, nullable=True)
    quantity = Column(Integer, nullable=False)
    retailer = relationship("Retailer", back_populates="products")
    prices = relationship("ProductPrice", back_populates="product")
    order_items = relationship("OrderItem", back_populates="product")

class ProductPrice(Base):
    __tablename__ = "product_prices"
    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    discounted_price = Column(Float, nullable=False)
    product = relationship("Product", back_populates="prices")

class Order(Base):
    __tablename__ = "orders"
    id = Column(Integer, primary_key=True, index=True)
    date = Column(Date, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    user = relationship("User", back_populates="orders")
    items = relationship("OrderItem", back_populates="order")

class OrderItem(Base):
    __tablename__ = "order_items"
    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    quantity = Column(Integer, nullable=False)
    order = relationship("Order", back_populates="items")
    product = relationship("Product", back_populates="order_items")
