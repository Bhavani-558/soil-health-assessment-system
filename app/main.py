from fastapi import FastAPI

from app.database import Base, engine

from app.routers import (
    health,
    farms,
    fields,
    soil_records,
    images
)

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Soil Health Assessment API",
    version="1.0.0"
)


@app.get("/")
def root():
    return {"message": "Soil Health Assessment API"}


app.include_router(health.router)
app.include_router(farms.router)
app.include_router(fields.router)
app.include_router(soil_records.router)
app.include_router(images.router)