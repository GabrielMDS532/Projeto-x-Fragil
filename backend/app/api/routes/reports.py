from datetime import datetime
from typing import Annotated

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.enums import EvaluationResult, UserRole
from app.models.evaluation import Evaluation
from app.models.patient import Patient
from app.models.user import User
from app.schemas.report import EvaluationReportItem

router = APIRouter()


@router.get("/evaluations", response_model=list[EvaluationReportItem])
def report_evaluations(
    db: Annotated[Session, Depends(get_db)],
    usuario_atual: Annotated[User, Depends(get_current_user)],
    patient_id: int | None = None,
    user_id: int | None = None,
    result: EvaluationResult | None = None,
    date_from: datetime | None = Query(default=None),
    date_to: datetime | None = Query(default=None),
) -> list[EvaluationReportItem]:
    consulta = (
        db.query(Evaluation, Patient.name, User.name)
        .join(Patient, Patient.id == Evaluation.patient_id)
        .join(User, User.id == Evaluation.evaluator_user_id)
    )

    if usuario_atual.role != UserRole.ADMIN:
        consulta = consulta.filter(Evaluation.evaluator_user_id == usuario_atual.id)
    elif user_id is not None:
        consulta = consulta.filter(Evaluation.evaluator_user_id == user_id)

    if patient_id is not None:
        consulta = consulta.filter(Evaluation.patient_id == patient_id)
    if result is not None:
        consulta = consulta.filter(Evaluation.result == result)
    if date_from is not None:
        consulta = consulta.filter(Evaluation.created_at >= date_from)
    if date_to is not None:
        consulta = consulta.filter(Evaluation.created_at <= date_to)

    linhas = consulta.order_by(Evaluation.created_at.desc()).all()
    return [
        EvaluationReportItem(
            evaluation_id=evaluation.id,
            patient_id=evaluation.patient_id,
            patient_name=patient_name,
            evaluator_user_id=evaluation.evaluator_user_id,
            evaluator_name=evaluator_name,
            score=evaluation.score,
            threshold_used=evaluation.threshold_used,
            result=evaluation.result,
            created_at=evaluation.created_at,
        )
        for evaluation, patient_name, evaluator_name in linhas
    ]
