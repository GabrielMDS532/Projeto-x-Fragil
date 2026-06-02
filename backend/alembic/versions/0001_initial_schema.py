"""Initial schema

Revision ID: 0001_initial_schema
Revises:
Create Date: 2026-05-29
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "0001_initial_schema"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


user_role_enum = sa.Enum("ADMIN", "PADRAO", name="userrole")
sex_enum = sa.Enum("M", "F", name="biologicalsex")
result_enum = sa.Enum(
    "ENCAMINHAR_TESTE_GENETICO",
    "SEM_ENCAMINHAMENTO_IMEDIATO",
    name="evaluationresult",
)


def upgrade() -> None:
    bind = op.get_bind()
    user_role_enum.create(bind, checkfirst=True)
    sex_enum.create(bind, checkfirst=True)
    result_enum.create(bind, checkfirst=True)

    op.create_table(
        "users",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("name", sa.String(length=120), nullable=False),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("hashed_password", sa.String(length=255), nullable=False),
        sa.Column("role", user_role_enum, nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index("ix_users_id", "users", ["id"], unique=False)
    op.create_index("ix_users_email", "users", ["email"], unique=True)

    op.create_table(
        "patients",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("name", sa.String(length=120), nullable=False),
        sa.Column("sex", sex_enum, nullable=False),
        sa.Column("age", sa.Integer(), nullable=False),
        sa.Column("guardian", sa.String(length=120), nullable=True),
        sa.Column("phone", sa.String(length=40), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("created_by_user_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index("ix_patients_id", "patients", ["id"], unique=False)
    op.create_index("ix_patients_name", "patients", ["name"], unique=False)
    op.create_index("ix_patients_created_by_user_id", "patients", ["created_by_user_id"], unique=False)

    op.create_table(
        "symptoms",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("key", sa.String(length=80), nullable=False),
        sa.Column("label", sa.String(length=120), nullable=False),
        sa.Column("male_weight", sa.Float(), nullable=False),
        sa.Column("female_weight", sa.Float(), nullable=False),
        sa.Column("order_index", sa.Integer(), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
    )
    op.create_index("ix_symptoms_key", "symptoms", ["key"], unique=True)
    op.create_index("ix_symptoms_order_index", "symptoms", ["order_index"], unique=False)

    op.create_table(
        "evaluations",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("patient_id", sa.Integer(), sa.ForeignKey("patients.id"), nullable=False),
        sa.Column("evaluator_user_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("sex_snapshot", sex_enum, nullable=False),
        sa.Column("score", sa.Float(), nullable=False),
        sa.Column("threshold_used", sa.Float(), nullable=False),
        sa.Column("result", result_enum, nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index("ix_evaluations_id", "evaluations", ["id"], unique=False)
    op.create_index("ix_evaluations_patient_id", "evaluations", ["patient_id"], unique=False)
    op.create_index("ix_evaluations_evaluator_user_id", "evaluations", ["evaluator_user_id"], unique=False)

    op.create_table(
        "evaluation_symptoms",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("evaluation_id", sa.Integer(), sa.ForeignKey("evaluations.id"), nullable=False),
        sa.Column("symptom_id", sa.Integer(), sa.ForeignKey("symptoms.id"), nullable=False),
        sa.Column("present", sa.Boolean(), nullable=False),
        sa.Column("applied_weight", sa.Float(), nullable=False),
        sa.UniqueConstraint("evaluation_id", "symptom_id", name="uq_evaluation_symptom"),
    )
    op.create_index(
        "ix_evaluation_symptoms_evaluation_id",
        "evaluation_symptoms",
        ["evaluation_id"],
        unique=False,
    )
    op.create_index("ix_evaluation_symptoms_symptom_id", "evaluation_symptoms", ["symptom_id"], unique=False)


def downgrade() -> None:
    op.drop_index("ix_evaluation_symptoms_symptom_id", table_name="evaluation_symptoms")
    op.drop_index("ix_evaluation_symptoms_evaluation_id", table_name="evaluation_symptoms")
    op.drop_table("evaluation_symptoms")

    op.drop_index("ix_evaluations_evaluator_user_id", table_name="evaluations")
    op.drop_index("ix_evaluations_patient_id", table_name="evaluations")
    op.drop_index("ix_evaluations_id", table_name="evaluations")
    op.drop_table("evaluations")

    op.drop_index("ix_symptoms_order_index", table_name="symptoms")
    op.drop_index("ix_symptoms_key", table_name="symptoms")
    op.drop_table("symptoms")

    op.drop_index("ix_patients_created_by_user_id", table_name="patients")
    op.drop_index("ix_patients_name", table_name="patients")
    op.drop_index("ix_patients_id", table_name="patients")
    op.drop_table("patients")

    op.drop_index("ix_users_email", table_name="users")
    op.drop_index("ix_users_id", table_name="users")
    op.drop_table("users")

    bind = op.get_bind()
    result_enum.drop(bind, checkfirst=True)
    sex_enum.drop(bind, checkfirst=True)
    user_role_enum.drop(bind, checkfirst=True)
