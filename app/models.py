from sqlalchemy import Column, Integer, String, ForeignKey
from app.database import Base


class Farm(Base):
    __tablename__ = "farms"

    id = Column(Integer, primary_key=True, index=True)
    farmer_name = Column(String)
    village = Column(String)
    district = Column(String)


class Field(Base):
    __tablename__ = "fields"

    id = Column(Integer, primary_key=True, index=True)
    farm_id = Column(Integer, ForeignKey("farms.id"))
    field_name = Column(String)
    area = Column(String)


class SoilRecord(Base):
    __tablename__ = "soil_records"

    id = Column(Integer, primary_key=True, index=True)
    field_id = Column(Integer)
    nitrogen = Column(String)
    phosphorus = Column(String)
    potassium = Column(String)
    ph = Column(String)