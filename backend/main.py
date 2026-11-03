from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI(title="Failure Analysis Demo API")


class Product(BaseModel):
    id: int
    name: str
    price: float


PRODUCTS = [
    Product(id=1, name="Keyboard", price=49.99),
    Product(id=2, name="Mouse", price=24.99),
    Product(id=3, name="Monitor", price=199.99),
]


@app.get("/api/products", response_model=list[Product])
def get_products():
    return PRODUCTS