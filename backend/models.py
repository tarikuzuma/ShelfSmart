
from sqlalchemy import Column, Integer, String, Float, Date, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    # Relationships
    prices = relationship("ProductPrice", back_populates="product")
    deliveries = relationship("Delivery", back_populates="product")
    sales = relationship("Sale", back_populates="product")

class ProductPrice(Base):
    __tablename__ = "product_prices"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    date = Column(Date, nullable=False)
    price = Column(Float, nullable=False)
    product = relationship("Product", back_populates="prices")

class Delivery(Base):
    __tablename__ = "deliveries"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    delivery_date = Column(Date, nullable=False)
    harvest_date = Column(Date, nullable=True)
    quantity = Column(Integer, nullable=False)
    product = relationship("Product", back_populates="deliveries")

class Sale(Base):
    __tablename__ = "sales"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    date = Column(Date, nullable=False)
    quantity = Column(Integer, nullable=False)
    total_price = Column(Float, nullable=False)
    product = relationship("Product", back_populates="sales")
