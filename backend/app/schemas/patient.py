from datetime import datetime

from pydantic import BaseModel, Field

from app.models.enums import BiologicalSex


class PatientCreate(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    sex: BiologicalSex
    age: int = Field(ge=0, le=130)
    guardian: str | None = Field(default=None, max_length=120)
    phone: str | None = Field(default=None, max_length=40)
    notes: str | None = None


class PatientUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=2, max_length=120)
    sex: BiologicalSex | None = None
    age: int | None = Field(default=None, ge=0, le=130)
    guardian: str | None = Field(default=None, max_length=120)
    phone: str | None = Field(default=None, max_length=40)
    notes: str | None = None


class PatientRead(BaseModel):
    id: int
    name: str
    sex: BiologicalSex
    age: int
    guardian: str | None
    phone: str | None
    notes: str | None
    created_by_user_id: int
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
