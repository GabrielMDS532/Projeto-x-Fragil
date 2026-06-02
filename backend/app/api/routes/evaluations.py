from datetime import datetime
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session, joinedload

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.enums import EvaluationResult, UserRole
from app.models.evaluation import Evaluation
from app.models.evaluation_symptom import EvaluationSymptom
from app.models.patient import Patient
from app.models.symptom import Symptom
from app.models.user import User
from app.schemas.evaluation import EvaluationCreate, EvaluationRead, EvaluationSymptomRead
from app.services.triage import calcular_triagem

router = APIRouter()


def _serialize_evaluation(evaluation: Evaluation) -> EvaluationRead:
    return EvaluationRead(
        id=evaluation.id,
        patient_id=evaluation.patient_id,
        evaluator_user_id=evaluation.evaluator_user_id,
        score=evaluation.score,
        threshold_used=evaluation.threshold_used,
        result=evaluation.result,
        created_at=evaluation.created_at,
        symptoms=[
            EvaluationSymptomRead(
                key=item.symptom.key,
                label=item.symptom.label,
                present=item.present,
                applied_weight=item.applied_weight,
            )
            for item in sorted(evaluation.symptoms, key=lambda x: x.symptom.order_index)
        ],
    )


@router.post("", response_model=EvaluationRead, status_code=status.HTTP_201_CREATED)
def create_evaluation(
    dados: EvaluationCreate,
    db: Annotated[Session, Depends(get_db)],
    usuario_atual: Annotated[User, Depends(get_current_user)],
) -> EvaluationRead:
    paciente = db.get(Patient, dados.patient_id)
    if not paciente:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient not found.")

    sintomas = db.query(Symptom).filter(Symptom.is_active.is_(True)).order_by(Symptom.order_index.asc()).all()
    respostas_sintomas = {item.key: item.present for item in dados.symptoms}

    try:
        triagem = calcular_triagem(paciente.sex, respostas_sintomas, sintomas)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(exc))

    avaliacao = Evaluation(
        patient_id=paciente.id,
        evaluator_user_id=usuario_atual.id,
        sex_snapshot=paciente.sex,
        score=triagem.pontuacao,
        threshold_used=triagem.limiar_usado,
        result=triagem.resultado,
    )
    db.add(avaliacao)
    db.flush()

    for detalhe in triagem.avaliacao_sintomas:
        db.add(
            EvaluationSymptom(
                evaluation_id=avaliacao.id,
                symptom_id=detalhe.sintoma.id,
                present=detalhe.presente,
                applied_weight=detalhe.peso_aplicado,
            )
        )

    db.commit()
    db.refresh(avaliacao)
    avaliacao = (
        db.query(Evaluation)
        .options(joinedload(Evaluation.symptoms).joinedload(EvaluationSymptom.symptom))
        .filter(Evaluation.id == avaliacao.id)
        .first()
    )
    return _serialize_evaluation(avaliacao)


@router.get("/{evaluation_id}", response_model=EvaluationRead)
def get_evaluation(
    evaluation_id: int,
    db: Annotated[Session, Depends(get_db)],
    usuario_atual: Annotated[User, Depends(get_current_user)],
) -> EvaluationRead:
    consulta = db.query(Evaluation).options(joinedload(Evaluation.symptoms).joinedload(EvaluationSymptom.symptom))
    avaliacao = consulta.filter(Evaluation.id == evaluation_id).first()
    if not avaliacao:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Evaluation not found.")

    if usuario_atual.role != UserRole.ADMIN and avaliacao.evaluator_user_id != usuario_atual.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to view this evaluation.")

    return _serialize_evaluation(avaliacao)


@router.get("", response_model=list[EvaluationRead])
def list_evaluations(
    db: Annotated[Session, Depends(get_db)],
    usuario_atual: Annotated[User, Depends(get_current_user)],
    patient_id: int | None = None,
    user_id: int | None = None,
    result: EvaluationResult | None = None,
    date_from: datetime | None = Query(default=None),
    date_to: datetime | None = Query(default=None),
) -> list[EvaluationRead]:
    consulta = db.query(Evaluation).options(joinedload(Evaluation.symptoms).joinedload(EvaluationSymptom.symptom))

    if usuario_atual.role != UserRole.ADMIN:
        consulta = consulta.filter(Evaluation.evaluator_user_id == usuario_atual.id)
    else:
        if user_id is not None:
            consulta = consulta.filter(Evaluation.evaluator_user_id == user_id)

    if patient_id is not None:
        consulta = consulta.filter(Evaluation.patient_id == patient_id)
    if result is not None:
        consulta = consulta.filter(Evaluation.result == result)
    if date_from is not None:
        consulta = consulta.filter(Evaluation.created_at >= date_from)
    if date_to is not None:
        consulta = consulta.filter(Evaluation.created_at <= date_to)

    avaliacoes = consulta.order_by(Evaluation.created_at.desc()).all()
    return [_serialize_evaluation(item) for item in avaliacoes]
