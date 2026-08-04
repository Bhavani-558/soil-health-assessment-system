from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app import crud, schemas

router = APIRouter(
    prefix="/soil-records",
    tags=["soil-records"]
)


@router.post("/", response_model=schemas.SoilRecordResponse)
def create_record(
    record: schemas.SoilRecordCreate,
    db: Session = Depends(get_db)
):
    return crud.create_record(db, record)


@router.get("/", response_model=list[schemas.SoilRecordResponse])
def get_records(
    db: Session = Depends(get_db)
):
    return crud.get_records(db)


@router.get("/by-field/{field_id}", response_model=list[schemas.SoilRecordResponse])
def get_by_field(
    field_id: int,
    db: Session = Depends(get_db)
):
    records = crud.get_records(db)
    return [r for r in records if r.field_id == field_id]