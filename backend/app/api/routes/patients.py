from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.evaluation import Evaluation
from app.models.evaluation_symptom import EvaluationSymptom
from app.models.enums import UserRole
from app.models.patient import Patient
from app.models.user import User
from app.schemas.evaluation import EvaluationRead, EvaluationSymptomRead
from app.schemas.patient import PatientCreate, PatientRead, PatientUpdate

router = APIRouter()


@router.post("", response_model=PatientRead, status_code=status.HTTP_201_CREATED)
def create_patient(
    dados: PatientCreate,
    db: Annotated[Session, Depends(get_db)],
    usuario_atual: Annotated[User, Depends(get_current_user)],
) -> Patient:
    paciente = Patient(**dados.model_dump(), created_by_user_id=usuario_atual.id)
    db.add(paciente)
    db.commit()
    db.refresh(paciente)
    return paciente


@router.get("", response_model=list[PatientRead])
def list_patients(
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[User, Depends(get_current_user)],
) -> list[Patient]:
    return db.query(Patient).order_by(Patient.created_at.desc()).all()


@router.get("/{patient_id}", response_model=PatientRead)
def get_patient(
    patient_id: int,
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[User, Depends(get_current_user)],
) -> Patient:
    paciente = db.get(Patient, patient_id)
    if not paciente:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient not found.")
    return paciente


@router.patch("/{patient_id}", response_model=PatientRead)
def update_patient(
    patient_id: int,
    dados: PatientUpdate,
    db: Annotated[Session, Depends(get_db)],
    usuario_atual: Annotated[User, Depends(get_current_user)],
) -> Patient:
    paciente = db.get(Patient, patient_id)
    if not paciente:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient not found.")

    if usuario_atual.role != UserRole.ADMIN and paciente.created_by_user_id != usuario_atual.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can update only your own registered patients.",
        )

    for chave, valor in dados.model_dump(exclude_unset=True).items():
        setattr(paciente, chave, valor)

    db.add(paciente)
    db.commit()
    db.refresh(paciente)
    return paciente


@router.get("/{patient_id}/evaluations", response_model=list[EvaluationRead])
def list_patient_evaluations(
    patient_id: int,
    db: Annotated[Session, Depends(get_db)],
    usuario_atual: Annotated[User, Depends(get_current_user)],
) -> list[EvaluationRead]:
    paciente = db.get(Patient, patient_id)
    if not paciente:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient not found.")

    consulta = db.query(Evaluation).options(joinedload(Evaluation.symptoms).joinedload(EvaluationSymptom.symptom))
    consulta = consulta.filter(Evaluation.patient_id == patient_id)
    if usuario_atual.role != UserRole.ADMIN:
        consulta = consulta.filter(Evaluation.evaluator_user_id == usuario_atual.id)

    avaliacoes = consulta.order_by(Evaluation.created_at.desc()).all()
    return [
        EvaluationRead(
            id=e.id,
            patient_id=e.patient_id,
            evaluator_user_id=e.evaluator_user_id,
            score=e.score,
            threshold_used=e.threshold_used,
            result=e.result,
            created_at=e.created_at,
            symptoms=[
                EvaluationSymptomRead(
                    key=item.symptom.key,
                    label=item.symptom.label,
                    present=item.present,
                    applied_weight=item.applied_weight,
                )
                for item in sorted(e.symptoms, key=lambda x: x.symptom.order_index)
            ],
        )
        for e in avaliacoes
    ]
