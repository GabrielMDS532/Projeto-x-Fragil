from sqlalchemy import Boolean, Float, ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class EvaluationSymptom(Base):
    __tablename__ = "evaluation_symptoms"
    __table_args__ = (UniqueConstraint("evaluation_id", "symptom_id", name="uq_evaluation_symptom"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    evaluation_id: Mapped[int] = mapped_column(ForeignKey("evaluations.id"), nullable=False, index=True)
    symptom_id: Mapped[int] = mapped_column(ForeignKey("symptoms.id"), nullable=False, index=True)
    present: Mapped[bool] = mapped_column(Boolean, nullable=False)
    applied_weight: Mapped[float] = mapped_column(Float, nullable=False)

    evaluation = relationship("Evaluation", back_populates="symptoms")
    symptom = relationship("Symptom", back_populates="evaluation_symptoms")
