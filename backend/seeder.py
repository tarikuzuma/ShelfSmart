import random
from datetime import date, timedelta
from sqlalchemy.orm import Session
from models import Product, ProductBatch, ProductPrice, Inventory, Order, OrderItem

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

# Tiered discount logic matching frontend
def get_discounted_price(base_price, days_to_expiry):
    if days_to_expiry >= 30:
        return base_price
    if days_to_expiry >= 15:
        return round(base_price * 0.90, 2)
    if days_to_expiry >= 8:
        return round(base_price * 0.80, 2)
    if days_to_expiry >= 4:
        return round(base_price * 0.70, 2)
    if days_to_expiry >= 1:
        return round(base_price * 0.50, 2)
    return round(base_price * 0.30, 2)

def seed_data(db: Session, days: int = 7):

    # 1. Products (with categories)
    categories = [
        "Vegetable", "Fruit", "Meat", "Dairy", "Grain", "Nut", "Seed", "Seafood", "Bakery"
    ]
    def guess_category(name):
        name = name.lower()
        if name in ["tomato", "potato", "carrot", "lettuce", "cucumber", "onion", "pepper", "broccoli", "spinach", "zucchini"]:
            return "Vegetable"
        if name in ["apple", "banana", "orange", "grape", "strawberry", "blueberry", "peach", "pear", "plum", "cherry"]:
            return "Fruit"
        if name in ["chicken breast", "beef steak", "pork chop"]:
            return "Meat"
        if name in ["milk", "cheese", "yogurt", "butter", "eggs"]:
            return "Dairy"
        if name in ["bread", "rice", "pasta", "oats", "beans", "lentils", "chickpeas", "quinoa", "corn", "barley"]:
            return "Grain"
        if name in ["almonds", "walnuts", "peanuts", "cashews", "hazelnuts"]:
            return "Nut"
        if name in ["pumpkin seeds", "sunflower seeds", "flaxseed", "chia seed", "sesame seed"]:
            return "Seed"
        if name in ["salmon", "tuna", "shrimp"]:
            return "Seafood"
        return "Bakery"

    products = []
    for name in PRODUCT_NAMES:
        category = guess_category(name)
        product = Product(name=name, category=category)
        db.add(product)
        products.append(product)
    db.commit()
    for product in products:
        db.refresh(product)

    # 2. Product Batches (simulate 1-3 batches per product, with realistic expiry)
    batches = []
    today = date.today()
    for product in products:
        for _ in range(random.randint(1, 3)):
            manufacture_date = today - timedelta(days=random.randint(10, 30))
            expiry_date = manufacture_date + timedelta(days=random.randint(7, 30))
            min_price, max_price = PRODUCT_PRICE_RANGES[product.name]
            base_price = round(random.uniform(min_price, max_price), 2)
            quantity = random.randint(30, 200)
            batch = ProductBatch(product_id=product.id, manufacture_date=manufacture_date, expiry_date=expiry_date, base_price=base_price, quantity=quantity)
            db.add(batch)
            batches.append(batch)
    db.commit()
    for batch in batches:
        db.refresh(batch)

    # Find earliest manufacture date
    earliest_date = min(batch.manufacture_date for batch in batches)
    num_days = (today - earliest_date).days + 1

    # 3. Product Prices (simulate for each day from earliest manufacture date to today)
    for batch in batches:
        for d in range(num_days):
            price_date = earliest_date + timedelta(days=d)
            if price_date > today:
                break
            days_to_expiry = (batch.expiry_date - price_date).days
            discounted_price = get_discounted_price(batch.base_price, days_to_expiry)
            db.add(ProductPrice(product_batch_id=batch.id, date=price_date, discounted_price=discounted_price))
    db.commit()

    # 4. Orders and OrderItems (simulate 1-3 orders per day, each with 1-3 items, only from non-expired batches)
    for d in range(num_days):
        order_date = earliest_date + timedelta(days=d)
        if order_date > today:
            break
        num_orders = random.randint(1, 3)
        for _ in range(num_orders):
            order_items = []
            total_price = 0.0
            # Only use batches that are not expired on order_date and have quantity left
            valid_batches = [b for b in batches if b.expiry_date >= order_date and b.quantity > 0]
            if not valid_batches:
                continue
            for _ in range(random.randint(1, 3)):
                batch = random.choice(valid_batches)
                product = next(p for p in products if p.id == batch.product_id)
                max_qty = min(10, batch.quantity)
                if max_qty <= 0:
                    continue
                quantity = random.randint(1, max_qty)
                price_obj = db.query(ProductPrice).filter_by(product_batch_id=batch.id, date=order_date).first()
                price = price_obj.discounted_price if price_obj else batch.base_price
                total_price += quantity * price
                order_items.append((product.id, quantity, price, batch))
            if not order_items:
                continue
            db_order = Order(date=order_date, total_price=round(total_price, 2))
            db.add(db_order)
            db.commit()
            db.refresh(db_order)
            for pid, qty, price, batch in order_items:
                db.add(OrderItem(order_id=db_order.id, product_id=pid, quantity=qty, price=price))
                # Subtract from batch quantity
                batch.quantity -= qty
            db.commit()

    # 5. Inventory snapshot per product per day
    for d in range(num_days):
        snap_date = earliest_date + timedelta(days=d)
        if snap_date > today:
            break
        for product in products:
            # Sum all batch quantities up to this day
            batch_qty = db.query(ProductBatch).filter(ProductBatch.product_id == product.id, ProductBatch.manufacture_date <= snap_date).with_entities(ProductBatch.quantity).all()
            total_batch_qty = sum(q[0] for q in batch_qty)
            # Sum all order items (sales) up to and including this day
            sold = db.query(OrderItem, Order).join(Order, OrderItem.order_id == Order.id).filter(OrderItem.product_id == product.id, Order.date <= snap_date).with_entities(OrderItem.quantity).all()
            sold_qty = sum(q[0] for q in sold)
            inventory_qty = total_batch_qty - sold_qty
            db.add(Inventory(product_id=product.id, date=snap_date, quantity=inventory_qty))
    db.commit()

if __name__ == "__main__":
    from database import SessionLocal
    db = SessionLocal()
    seed_data(db, days=7)
    print("Seeded 50 products with prices, deliveries, and sales.")
