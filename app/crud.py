from sqlalchemy.orm import Session
from app import models, schemas


# ---------- Farms ----------
def create_farm(db: Session, farm: schemas.FarmCreate):
    db_farm = models.Farm(**farm.model_dump())
    db.add(db_farm)
    db.commit()
    db.refresh(db_farm)
    return db_farm


def get_farms(db: Session):
    return db.query(models.Farm).all()


# ---------- Fields ----------
def create_field(db: Session, field: schemas.FieldCreate):
    db_field = models.Field(**field.model_dump())
    db.add(db_field)
    db.commit()
    db.refresh(db_field)
    return db_field


def get_fields(db: Session):
    return db.query(models.Field).all()


# ---------- Soil Records ----------
def create_record(db: Session, record: schemas.SoilRecordCreate):
    db_record = models.SoilRecord(**record.model_dump())
    db.add(db_record)
    db.commit()
    db.refresh(db_record)
    return db_record


def get_records(db: Session):
    return db.query(models.SoilRecord).all()