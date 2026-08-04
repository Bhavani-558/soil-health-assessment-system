from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app import crud, schemas

router = APIRouter(
    prefix="/farms",
    tags=["farms"]
)


@router.post("/", response_model=schemas.FarmResponse)
def create_farm(
    farm: schemas.FarmCreate,
    db: Session = Depends(get_db)
):
    return crud.create_farm(db, farm)


@router.get("/", response_model=list[schemas.FarmResponse])
def get_farms(
    db: Session = Depends(get_db)
):
    return crud.get_farms(db)