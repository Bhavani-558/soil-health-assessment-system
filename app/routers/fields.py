from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app import crud, schemas

router = APIRouter(
    prefix="/fields",
    tags=["fields"]
)


@router.post("/", response_model=schemas.FieldResponse)
def create_field(
    field: schemas.FieldCreate,
    db: Session = Depends(get_db)
):
    return crud.create_field(db, field)


@router.get("/farms/{farm_id}", response_model=list[schemas.FieldResponse])
def get_fields(
    farm_id: int,
    db: Session = Depends(get_db)
):
    return crud.get_fields(db)