

from database import SessionLocal
import models
import random
from datetime import date, timedelta

PRODUCT_NAMES = [
    "Apple", "Banana", "Carrot", "Tomato", "Potato", "Onion", "Orange", "Pear", "Peach", "Grape",
    "Lettuce", "Cucumber", "Broccoli", "Spinach", "Pepper", "Eggplant", "Zucchini", "Pumpkin", "Corn", "Celery",
    "Strawberry", "Blueberry", "Raspberry", "Watermelon", "Melon", "Kiwi", "Mango", "Pineapple", "Avocado", "Cabbage",
    "Radish", "Beet", "Turnip", "Garlic", "Ginger", "Chili", "Papaya", "Plum", "Apricot", "Fig",
    "Date", "Lime", "Lemon", "Cherry", "Cranberry", "Gooseberry", "Blackberry", "Passionfruit", "Guava", "Lychee"
]

RETAILER_NAMES = [
    "FreshMart", "GreenGrocer", "Fruitopia", "VeggieVille", "MarketPlace"
]

USER_NAMES = [
    f"User{i+1}" for i in range(50)
]

ADDRESSES = [
    f"{num} Main St, City" for num in range(1, 101)
]

def compute_next_day_price(prices):
    if not prices:
        return round(random.uniform(1.0, 10.0), 2)
    last_price = prices[-1]
    fluctuation = random.uniform(-0.03, 0.03)
    next_price = last_price * (1 + fluctuation)
    return round(max(next_price, 0.5), 2)

def seed_database():
    db = SessionLocal()

    # Seed Retailers
    retailers = []
    for i, name in enumerate(RETAILER_NAMES):
        retailer = models.Retailer(name=name, location=f"District {i+1}")
        db.add(retailer)
        retailers.append(retailer)
    db.commit()
    for r in retailers:
        db.refresh(r)

    # Seed Users
    users = []
    for i in range(50):
        user = models.User(name=USER_NAMES[i], shipping_address=random.choice(ADDRESSES))
        db.add(user)
        users.append(user)
    db.commit()
    for u in users:
        db.refresh(u)

    # Seed Products
    products = []
    today = date.today() - timedelta(days=49)
    for i in range(50):
        name = PRODUCT_NAMES[i % len(PRODUCT_NAMES)]
        retailer = random.choice(retailers)
        base_price = round(random.uniform(2.0, 10.0), 2)
        date_added = today
        expiration_date = today + timedelta(days=random.randint(30, 90))
        quantity = random.randint(50, 200)
        product = models.Product(
            retailer_id=retailer.id,
            name=name,
            base_price=base_price,
            date_added=date_added,
            expiration_date=expiration_date,
            quantity=quantity
        )
        db.add(product)
        products.append(product)
    db.commit()
    for p in products:
        db.refresh(p)

    # Seed Product Prices (50 days per product)
    for product in products:
        prices = []
        for i in range(50):
            if i == 0:
                price = product.base_price
            else:
                price = compute_next_day_price(prices)
            prices.append(price)
            db_price = models.ProductPrice(product_id=product.id, discounted_price=price)
            db.add(db_price)
    db.commit()

    # Seed Orders and OrderItems
    for i in range(50):
        user = random.choice(users)
        order_date = today + timedelta(days=random.randint(0, 49))
        order = models.Order(date=order_date, user_id=user.id)
        db.add(order)
        db.commit()
        db.refresh(order)
        # Each order has 1-5 items
        order_products = random.sample(products, k=random.randint(1, 5))
        for prod in order_products:
            quantity = random.randint(1, 10)
            order_item = models.OrderItem(order_id=order.id, product_id=prod.id, quantity=quantity)
            db.add(order_item)
        db.commit()

    db.close()

if __name__ == "__main__":
    seed_database()
