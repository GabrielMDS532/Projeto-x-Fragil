from datetime import datetime

from sqlalchemy import DateTime, Enum, Float, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.enums import BiologicalSex, EvaluationResult


class Evaluation(Base):
    __tablename__ = "evaluations"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    patient_id: Mapped[int] = mapped_column(ForeignKey("patients.id"), nullable=False, index=True)
    evaluator_user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False, index=True)
    sex_snapshot: Mapped[BiologicalSex] = mapped_column(Enum(BiologicalSex), nullable=False)
    score: Mapped[float] = mapped_column(Float, nullable=False)
    threshold_used: Mapped[float] = mapped_column(Float, nullable=False)
    result: Mapped[EvaluationResult] = mapped_column(Enum(EvaluationResult), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    patient = relationship("Patient", back_populates="evaluations")
    evaluator = relationship("User", back_populates="evaluations")
    symptoms = relationship("EvaluationSymptom", back_populates="evaluation", cascade="all, delete-orphan")
