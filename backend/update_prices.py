
import sys
from datetime import date, timedelta, datetime
from sqlalchemy.orm import Session
from database import SessionLocal
from models import ProductBatch, ProductPrice
from seeder import get_discounted_price, PRODUCT_PRICE_RANGES

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
        # Use tiered discount logic
        days_to_expiry = (batch.expiry_date - target_date).days
        new_price = get_discounted_price(batch.base_price, days_to_expiry)
        db.add(ProductPrice(product_batch_id=batch.id, date=target_date, discounted_price=new_price))
    db.commit()
    print(f"Updated prices for {len(batches)} batches for {target_date}")

if __name__ == "__main__":
    db = SessionLocal()
    update_prices_for_date(db, target_date)
