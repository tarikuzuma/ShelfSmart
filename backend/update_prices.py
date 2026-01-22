
import sys
from datetime import date, timedelta, datetime
from sqlalchemy.orm import Session
from database import SessionLocal
from models import ProductBatch, ProductPrice
from seeder import next_day_price, PRODUCT_PRICE_RANGES

def parse_date_arg():
    if len(sys.argv) > 1:
        arg = sys.argv[1]
        # Accept YYYY-MM-DD or MM-DD
        try:
            if len(arg) == 5 and '-' in arg:
                # MM-DD, use current year
                d = datetime.strptime(f"{date.today().year}-{arg}", "%Y-%m-%d").date()
            else:
                d = datetime.strptime(arg, "%Y-%m-%d").date()
            return d
        except Exception:
            print("Invalid date format. Use YYYY-MM-DD or MM-DD.")
            sys.exit(1)
    return date.today() + timedelta(days=1)

target_date = parse_date_arg()


def update_prices_for_date(db: Session, target_date: date):
    batches = db.query(ProductBatch).all()
    for batch in batches:
        # Get latest price before target_date
        latest_price_obj = (
            db.query(ProductPrice)
            .filter_by(product_batch_id=batch.id)
            .filter(ProductPrice.date < target_date)
            .order_by(ProductPrice.date.desc())
            .first()
        )
        if not latest_price_obj:
            continue
        prev_price = latest_price_obj.discounted_price
        min_price, max_price = PRODUCT_PRICE_RANGES.get(batch.product.name, (batch.base_price * 0.7, batch.base_price))
        new_price = next_day_price(prev_price, min_price, max_price)
        db.add(ProductPrice(product_batch_id=batch.id, date=target_date, discounted_price=new_price))
    db.commit()
    print(f"Updated prices for {len(batches)} batches for {target_date}")

if __name__ == "__main__":
    db = SessionLocal()
    update_prices_for_date(db, target_date)
