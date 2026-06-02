"""Seed symptoms and default admin

Revision ID: 0002_seed_symptoms_and_default_admin
Revises: 0001_initial_schema
Create Date: 2026-05-29
"""

from typing import Sequence, Union

from alembic import op
from passlib.context import CryptContext
import sqlalchemy as sa


revision: str = "0002_seed_symptoms_and_default_admin"
down_revision: Union[str, None] = "0001_initial_schema"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def upgrade() -> None:
    users_table = sa.table(
        "users",
        sa.column("name", sa.String),
        sa.column("email", sa.String),
        sa.column("hashed_password", sa.String),
        sa.column("role", sa.String),
        sa.column("is_active", sa.Boolean),
    )
    op.bulk_insert(
        users_table,
        [
            {
                "name": "Administrador",
                "email": "admin@clinica.com",
                "hashed_password": pwd_context.hash("Admin@123"),
                "role": "ADMIN",
                "is_active": True,
            }
        ],
    )

    symptoms_table = sa.table(
        "symptoms",
        sa.column("key", sa.String),
        sa.column("label", sa.String),
        sa.column("male_weight", sa.Float),
        sa.column("female_weight", sa.Float),
        sa.column("order_index", sa.Integer),
        sa.column("is_active", sa.Boolean),
    )
    op.bulk_insert(
        symptoms_table,
        [
            {
                "key": "deficiencia_intelectual",
                "label": "Deficiência intelectual",
                "male_weight": 0.32,
                "female_weight": 0.20,
                "order_index": 1,
                "is_active": True,
            },
            {
                "key": "face_alongada_orelhas",
                "label": "Face alongada/orelhas",
                "male_weight": 0.29,
                "female_weight": 0.09,
                "order_index": 2,
                "is_active": True,
            },
            {
                "key": "macroorquidismo",
                "label": "Macroorquidismo",
                "male_weight": 0.26,
                "female_weight": 0.00,
                "order_index": 3,
                "is_active": True,
            },
            {
                "key": "hipermobilidade_articular",
                "label": "Hipermobilidade articular",
                "male_weight": 0.19,
                "female_weight": 0.04,
                "order_index": 4,
                "is_active": True,
            },
            {
                "key": "dificuldades_aprendizagem",
                "label": "Dificuldades de aprendizagem",
                "male_weight": 0.18,
                "female_weight": 0.28,
                "order_index": 5,
                "is_active": True,
            },
            {
                "key": "deficit_atencao",
                "label": "Déficit de atenção",
                "male_weight": 0.17,
                "female_weight": 0.12,
                "order_index": 6,
                "is_active": True,
            },
            {
                "key": "movimentos_repetitivos",
                "label": "Mov. repetitivos",
                "male_weight": 0.17,
                "female_weight": 0.05,
                "order_index": 7,
                "is_active": True,
            },
            {
                "key": "atraso_fala",
                "label": "Atraso na fala",
                "male_weight": 0.14,
                "female_weight": 0.01,
                "order_index": 8,
                "is_active": True,
            },
            {
                "key": "hiperatividade",
                "label": "Hiperatividade",
                "male_weight": 0.12,
                "female_weight": 0.04,
                "order_index": 9,
                "is_active": True,
            },
            {
                "key": "evita_contato_visual",
                "label": "Evita contato visual",
                "male_weight": 0.06,
                "female_weight": 0.08,
                "order_index": 10,
                "is_active": True,
            },
            {
                "key": "evita_contato_fisico",
                "label": "Evita contato físico",
                "male_weight": 0.04,
                "female_weight": 0.07,
                "order_index": 11,
                "is_active": True,
            },
            {
                "key": "agressividade",
                "label": "Agressividade",
                "male_weight": 0.01,
                "female_weight": 0.02,
                "order_index": 12,
                "is_active": True,
            },
        ],
    )


def downgrade() -> None:
    op.execute("DELETE FROM evaluation_symptoms")
    op.execute("DELETE FROM evaluations")
    op.execute("DELETE FROM symptoms")
    op.execute("DELETE FROM patients")
    op.execute("DELETE FROM users WHERE email = 'admin@clinica.com'")
