from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import requests
import os
from fastapi import WebSocket, WebSocketDisconnect
import asyncio
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
import crud, schemas
from database import SessionLocal
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Puedes cambiar esto si deseas permitir otros orígenes
    allow_credentials=True,
    allow_methods=["*"],  # Permite cualquier método HTTP
    allow_headers=["*"],  # Permite cualquier encabezado
)
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
# API Key de Polygon
POLYGON_API_KEY = "4qWqUYEliLIu23DCTGC925sKmWDu2Uiy"

# Función para obtener los datos de una acción desde Polygon.io
def get_stock_data(symbol: str):
    url = f"https://api.polygon.io/v2/aggs/ticker/{symbol}/prev"
    params = {
        'apiKey': POLYGON_API_KEY
    }
    response = requests.get(url, params=params)
    if response.status_code == 200:
        return response.json()
    return None

# Endpoint para obtener los datos de una acción
@app.get("/stock/{symbol}")
async def get_stock(symbol: str):
    data = get_stock_data(symbol)
    if data:
        return JSONResponse(content=data)
    return JSONResponse(status_code=404, content={"message": "Stock not found"})

# WebSocket para transmitir datos en tiempo real
@app.websocket("/ws/stock/{symbol}")
async def stock_websocket(websocket: WebSocket, symbol: str):
    await websocket.accept()
    try:
        while True:
            # Obtener datos de la acción
            data = get_stock_data(symbol)
            if data:
                await websocket.send_json(data)
            await asyncio.sleep(15)  # Retraso entre actualizaciones
    except WebSocketDisconnect:
        print("Client disconnected")


class StockRequest(BaseModel):
    ticker: str
    start_date: str  # Formato: 'YYYY-MM-DD'
    end_date: str    # Formato: 'YYYY-MM-DD'
class StockHistoryResponse(BaseModel):
    date: str
    open: float
    close: float
    high: float
    low: float
    volume: int
BASE_URL = "https://api.polygon.io/v2/aggs/ticker/"

@app.post("/stock/history")
async def get_stock_history(request: StockRequest):
    try:
        url = f"{BASE_URL}{request.ticker}/range/1/day/{request.start_date}/{request.end_date}"

        params = {"apiKey": POLYGON_API_KEY, "adjusted": True}

        response = requests.get(url, params=params)
        # Verificar el estado de la respuesta
        if response.status_code == 200:
            data = response.json()
            historical_data = [
                StockHistoryResponse(
                    date=str(item["t"]),
                    open=item["o"],
                    close=item["c"],
                    high=item["h"],
                    low=item["l"],
                    volume=item["v"]
                )
                for item in data["results"]
            ]
            return historical_data
        else:
            return None
    except Exception as e:
        return JSONResponse(status_code=500, content={"message": "Error interno del servidor", "details": str(e)})

@app.post("/", response_model=schemas.StockPurchaseResponse)
def create_purchase(purchase: schemas.StockPurchaseCreate, db: Session = Depends(get_db)):
    return crud.create_stock_purchase(db=db, purchase=purchase)

@app.get("/", response_model=list[schemas.StockPurchaseResponse])
def read_purchases(skip: int = 0, limit: int = 10, db: Session = Depends(get_db)):
    return crud.get_stock_purchases(db=db, skip=skip, limit=limit)

@app.get("/{stock}", response_model=list[schemas.StockPurchaseResponse])
def read_purchases_by_stock(stock: str, db: Session = Depends(get_db)):
    purchases = crud.get_purchases_by_stock(db=db, stock=stock)
    if not purchases:
        raise JSONResponse(status_code=404, content={"message": "Stock not found"})
    return purchases
