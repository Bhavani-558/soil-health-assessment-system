from pydantic import BaseModel


class FarmCreate(BaseModel):
    farmer_name: str
    village: str
    district: str


class FarmResponse(FarmCreate):
    id: int

    class Config:
        from_attributes = True


class FieldCreate(BaseModel):
    farm_id: int
    field_name: str
    area: str


class FieldResponse(FieldCreate):
    id: int

    class Config:
        from_attributes = True


class SoilRecordCreate(BaseModel):
    field_id: int
    nitrogen: str
    phosphorus: str
    potassium: str
    ph: str


class SoilRecordResponse(SoilRecordCreate):
    id: int

    class Config:
        from_attributes = True