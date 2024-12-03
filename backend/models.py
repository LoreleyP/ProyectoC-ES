from sqlalchemy import Column, Integer, String, Float, DateTime
from database import Base 

class StockPurchase(Base):
    __tablename__ = "stock_purchases"

    id = Column(Integer, primary_key=True, index=True)
    stock = Column(String, index=True)
    name = Column(String)
    price = Column(Float)
    quantity = Column(Integer)
    currency = Column(String)
    stock_date = Column(DateTime)
    purchase_date = Column(DateTime)
