import random
from datetime import date, timedelta
from sqlalchemy.orm import Session
from models import Product, ProductPrice, Delivery, Sale

PRODUCT_NAMES = [
    "Tomato", "Potato", "Carrot", "Lettuce", "Cucumber", "Onion", "Pepper", "Broccoli", "Spinach", "Zucchini",
    "Apple", "Banana", "Orange", "Grape", "Strawberry", "Blueberry", "Peach", "Pear", "Plum", "Cherry",
    "Chicken Breast", "Eggs", "Milk", "Cheese", "Yogurt", "Butter", "Beef Steak", "Pork Chop", "Salmon", "Tuna", "Shrimp",
    "Bread", "Rice", "Pasta", "Oats", "Beans", "Lentils", "Chickpeas", "Quinoa", "Corn", "Barley",
    "Almonds", "Walnuts", "Peanuts", "Cashews", "Hazelnuts", "Pumpkin Seeds", "Sunflower Seeds", "Flaxseed", "Chia Seed", "Sesame Seed"
]

# Realistic price ranges for each product (min, max)
PRODUCT_PRICE_RANGES = {
    "Tomato": (1.5, 3.0), "Potato": (0.8, 2.0), "Carrot": (1.0, 2.5), "Lettuce": (1.2, 2.8), "Cucumber": (1.0, 2.2),
    "Onion": (0.7, 1.8), "Pepper": (2.0, 4.0), "Broccoli": (2.0, 3.5), "Spinach": (1.5, 3.0), "Zucchini": (1.2, 2.5),
    "Apple": (2.0, 4.0), "Banana": (1.0, 2.0), "Orange": (1.5, 3.0), "Grape": (2.5, 5.0), "Strawberry": (3.0, 6.0),
    "Blueberry": (4.0, 8.0), "Peach": (2.0, 4.0), "Pear": (2.0, 4.0), "Plum": (2.0, 4.0), "Cherry": (4.0, 8.0),
    "Chicken Breast": (5.0, 8.0), "Eggs": (2.0, 4.0), "Milk": (1.0, 2.5), "Cheese": (3.0, 7.0), "Yogurt": (1.0, 2.5),
    "Butter": (2.0, 4.0), "Beef Steak": (8.0, 15.0), "Pork Chop": (5.0, 10.0), "Salmon": (10.0, 18.0), "Tuna": (8.0, 14.0), "Shrimp": (10.0, 16.0),
    "Bread": (1.0, 3.0), "Rice": (0.8, 2.0), "Pasta": (1.0, 2.5), "Oats": (1.0, 2.5), "Beans": (1.0, 2.5), "Lentils": (1.0, 2.5),
    "Chickpeas": (1.0, 2.5), "Quinoa": (2.0, 4.0), "Corn": (1.0, 2.5), "Barley": (1.0, 2.5),
    "Almonds": (8.0, 15.0), "Walnuts": (8.0, 15.0), "Peanuts": (3.0, 6.0), "Cashews": (8.0, 15.0), "Hazelnuts": (8.0, 15.0),
    "Pumpkin Seeds": (4.0, 8.0), "Sunflower Seeds": (3.0, 6.0), "Flaxseed": (3.0, 6.0), "Chia Seed": (6.0, 12.0), "Sesame Seed": (3.0, 6.0)
}

# Helper to simulate next day price based on previous price and random walk

def next_day_price(prev_price, min_price, max_price):
    # Simulate a small random walk, with a bias to stay within min/max
    change = random.uniform(-0.05, 0.05) * prev_price
    new_price = prev_price + change
    new_price = max(min_price, min(max_price, new_price))
    return round(new_price, 2)

def seed_data(db: Session, days: int = 7):
    # 1. Products
    products = []
    for name in PRODUCT_NAMES:
        product = Product(name=name)
        db.add(product)
        products.append(product)
    db.commit()
    db.refresh(products[0])

    # 2. Product Prices (simulate for N days)
    today = date.today()
    for product in products:
        min_price, max_price = PRODUCT_PRICE_RANGES[product.name]
        price = round(random.uniform(min_price, max_price), 2)
        for d in range(days):
            price_date = today - timedelta(days=days-d-1)
            db.add(ProductPrice(product_id=product.id, date=price_date, price=price))
            price = next_day_price(price, min_price, max_price)
    db.commit()

    # 3. Deliveries (simulate 1-2 deliveries per product)
    for product in products:
        for _ in range(random.randint(1, 2)):
            delivery_date = today - timedelta(days=random.randint(1, days))
            harvest_date = delivery_date - timedelta(days=random.randint(1, 3))
            quantity = random.randint(50, 200)
            db.add(Delivery(product_id=product.id, delivery_date=delivery_date, harvest_date=harvest_date, quantity=quantity))
    db.commit()

    # 4. Sales (simulate 1-3 sales per day per product)
    for product in products:
        for d in range(days):
            sale_date = today - timedelta(days=days-d-1)
            for _ in range(random.randint(1, 3)):
                quantity = random.randint(1, 10)
                # Use the price for that day
                price_obj = db.query(ProductPrice).filter_by(product_id=product.id, date=sale_date).first()
                price = price_obj.price if price_obj else round(random.uniform(*PRODUCT_PRICE_RANGES[product.name]), 2)
                total_price = round(quantity * price, 2)
                db.add(Sale(product_id=product.id, date=sale_date, quantity=quantity, total_price=total_price))
    db.commit()

if __name__ == "__main__":
    from database import SessionLocal
    db = SessionLocal()
    seed_data(db, days=7)
    print("Seeded 50 products with prices, deliveries, and sales.")
