from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.enums import EvaluationResult, UserRole
from app.models.evaluation import Evaluation
from app.models.patient import Patient
from app.models.user import User
from app.schemas.report import DashboardStats

router = APIRouter()


@router.get("/stats", response_model=DashboardStats)
def get_dashboard_stats(
    db: Annotated[Session, Depends(get_db)],
    usuario_atual: Annotated[User, Depends(get_current_user)],
) -> DashboardStats:
    if usuario_atual.role == UserRole.ADMIN:
        total_pacientes = db.query(func.count(Patient.id)).scalar() or 0
        total_avaliacoes = db.query(func.count(Evaluation.id)).scalar() or 0
        total_encaminhamentos = (
            db.query(func.count(Evaluation.id))
            .filter(Evaluation.result == EvaluationResult.ENCAMINHAR_TESTE_GENETICO)
            .scalar()
            or 0
        )
    else:
        total_pacientes = db.query(func.count(Patient.id)).scalar() or 0
        total_avaliacoes = (
            db.query(func.count(Evaluation.id)).filter(Evaluation.evaluator_user_id == usuario_atual.id).scalar() or 0
        )
        total_encaminhamentos = (
            db.query(func.count(Evaluation.id))
            .filter(
                Evaluation.evaluator_user_id == usuario_atual.id,
                Evaluation.result == EvaluationResult.ENCAMINHAR_TESTE_GENETICO,
            )
            .scalar()
            or 0
        )

    return DashboardStats(
        total_patients=total_pacientes,
        total_evaluations=total_avaliacoes,
        total_referrals=total_encaminhamentos,
    )
