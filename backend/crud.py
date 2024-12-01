import datetime
from sqlalchemy.orm import Session
import models, schemas

def create_stock_purchase(db: Session, purchase: schemas.StockPurchaseCreate):
    db_purchase = models.StockPurchase(
        stock=purchase.stock,
        name=purchase.name,
        price=purchase.price,
        quantity=purchase.quantity,
        currency=purchase.currency,
        stock_date=purchase.stock_date,
        purchase_date=purchase.purchase_date or datetime.datetime.now(datetime.timezone.utc)
    )
    db.add(db_purchase)
    db.commit()
    db.refresh(db_purchase)
    return db_purchase

def get_stock_purchases(db: Session, skip: int = 0, limit: int = 10):
    return db.query(models.StockPurchase).offset(skip).limit(limit).all()

def get_purchases_by_stock(db: Session, stock: str):
    return db.query(models.StockPurchase).filter(models.StockPurchase.stock == stock).all()