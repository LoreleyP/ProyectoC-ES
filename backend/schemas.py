from pydantic import BaseModel
import datetime

class StockPurchaseBase(BaseModel):
    stock: str
    name: str
    price: float
    quantity: int
    currency: str
    stock_date: datetime.datetime
    purchase_date: datetime.datetime

class StockPurchaseCreate(StockPurchaseBase):
    pass

class StockPurchaseResponse(StockPurchaseBase):
    id: int
    purchase_date: datetime.datetime

    class Config:
        from_attributes = True  
