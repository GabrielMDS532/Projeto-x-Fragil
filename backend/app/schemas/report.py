from datetime import datetime

from pydantic import BaseModel

from app.models.enums import EvaluationResult


class EvaluationReportItem(BaseModel):
    evaluation_id: int
    patient_id: int
    patient_name: str
    evaluator_user_id: int
    evaluator_name: str
    score: float
    threshold_used: float
    result: EvaluationResult
    created_at: datetime


class DashboardStats(BaseModel):
    total_patients: int
    total_evaluations: int
    total_referrals: int
