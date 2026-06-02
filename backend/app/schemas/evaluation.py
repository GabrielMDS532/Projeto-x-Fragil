from datetime import datetime

from pydantic import BaseModel, Field, model_validator

from app.models.enums import EvaluationResult


class SymptomAnswer(BaseModel):
    key: str
    present: bool


class EvaluationCreate(BaseModel):
    patient_id: int
    symptoms: list[SymptomAnswer] = Field(min_length=12, max_length=12)

    @model_validator(mode="after")
    def ensure_unique_keys(self):
        keys = [s.key for s in self.symptoms]
        if len(set(keys)) != len(keys):
            raise ValueError("Symptom keys must be unique.")
        return self


class EvaluationSymptomRead(BaseModel):
    key: str
    label: str
    present: bool
    applied_weight: float


class EvaluationRead(BaseModel):
    id: int
    patient_id: int
    evaluator_user_id: int
    score: float
    threshold_used: float
    result: EvaluationResult
    created_at: datetime
    symptoms: list[EvaluationSymptomRead]
