from datetime import date
from database import SessionLocal
from models import ProductBatch, ProductPrice
import random

def decrement_today_prices():
    today = date.today()
    db = SessionLocal()
    batches = db.query(ProductBatch).all()
    updated = 0
    for batch in batches:
        prices_today = db.query(ProductPrice).filter_by(product_batch_id=batch.id, date=today).all()
        if len(prices_today) > 1:
            print(f"Warning: Multiple prices for batch {batch.id} on {today}. Using first.")
        if prices_today:
            price_obj = prices_today[0]
            min_price = round(batch.base_price * 0.3, 2)
            old_price = price_obj.discounted_price
            decrement = round(random.uniform(0.01, 0.09), 2)
            new_price = max(min_price, round(old_price - decrement, 2))
            if old_price <= min_price:
                print(f"Batch {batch.id}: price already at minimum ({old_price})")
            else:
                price_obj.discounted_price = new_price
                db.add(price_obj)
                print(f"Batch {batch.id}: price {old_price} -> {new_price}")
                updated += 1
    db.commit()
    # ...existing code...
    print(f"Decremented today's prices for {updated} batches.")

if __name__ == "__main__":
    decrement_today_prices()
