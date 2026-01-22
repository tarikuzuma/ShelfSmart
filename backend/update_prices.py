from datetime import date, timedelta
from sqlalchemy.orm import Session
from database import SessionLocal
from models import ProductBatch, ProductPrice
from seeder import next_day_price, PRODUCT_PRICE_RANGES

# Get today's date and next day
today = date.today()
next_day = today + timedelta(days=1)

def update_prices_for_next_day(db: Session):
    batches = db.query(ProductBatch).all()
    for batch in batches:
        # Get latest price
        latest_price_obj = (
            db.query(ProductPrice)
            .filter_by(product_batch_id=batch.id)
            .order_by(ProductPrice.date.desc())
            .first()
        )
        if not latest_price_obj:
            continue
        prev_price = latest_price_obj.discounted_price
        min_price, max_price = PRODUCT_PRICE_RANGES.get(batch.product.name, (batch.base_price * 0.7, batch.base_price))
        new_price = next_day_price(prev_price, min_price, max_price)
        db.add(ProductPrice(product_batch_id=batch.id, date=next_day, discounted_price=new_price))
    db.commit()
    print(f"Updated prices for {len(batches)} batches for {next_day}")

if __name__ == "__main__":
    db = SessionLocal()
    update_prices_for_next_day(db)
