from datetime import datetime, timezone

from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.api.deps import get_current_user
from app.db.base import Base
from app.db.session import get_db
from app.main import app
from app.models.enums import BiologicalSex, EvaluationResult, UserRole
from app.models.evaluation import Evaluation
from app.models.patient import Patient
from app.models.symptom import Symptom
from app.models.user import User


def test_non_admin_sees_only_own_evaluations():
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine, expire_on_commit=False)
    Base.metadata.create_all(bind=engine)

    db = TestingSessionLocal()
    admin = User(
        id=1,
        name="Admin",
        email="admin@x.com",
        hashed_password="x",
        role=UserRole.ADMIN,
        is_active=True,
    )
    user = User(
        id=2,
        name="Padrao",
        email="user@x.com",
        hashed_password="x",
        role=UserRole.PADRAO,
        is_active=True,
    )
    patient = Patient(
        id=1,
        name="Paciente",
        sex=BiologicalSex.M,
        age=12,
        created_by_user_id=2,
    )
    eval_admin = Evaluation(
        id=1,
        patient_id=1,
        evaluator_user_id=1,
        sex_snapshot=BiologicalSex.M,
        score=0.7,
        threshold_used=0.56,
        result=EvaluationResult.ENCAMINHAR_TESTE_GENETICO,
        created_at=datetime.now(timezone.utc),
    )
    eval_user = Evaluation(
        id=2,
        patient_id=1,
        evaluator_user_id=2,
        sex_snapshot=BiologicalSex.M,
        score=0.1,
        threshold_used=0.56,
        result=EvaluationResult.SEM_ENCAMINHAMENTO_IMEDIATO,
        created_at=datetime.now(timezone.utc),
    )
    db.add_all([admin, user, patient, eval_admin, eval_user])
    db.commit()

    def override_get_db():
        try:
            yield db
        finally:
            pass

    def override_current_user():
        return db.get(User, 2)

    app.dependency_overrides[get_db] = override_get_db
    app.dependency_overrides[get_current_user] = override_current_user

    client = TestClient(app)
    response = client.get("/api/v1/evaluations")

    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["evaluator_user_id"] == 2

    app.dependency_overrides.clear()
    db.close()


def test_post_evaluation_calculates_and_saves():
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine, expire_on_commit=False)
    Base.metadata.create_all(bind=engine)

    db = TestingSessionLocal()
    user = User(
        id=2,
        name="Padrao",
        email="user@x.com",
        hashed_password="x",
        role=UserRole.PADRAO,
        is_active=True,
    )
    patient = Patient(
        id=1,
        name="Paciente",
        sex=BiologicalSex.M,
        age=10,
        created_by_user_id=2,
    )
    symptoms = [
        Symptom(
            id=i,
            key=f"s{i}",
            label=f"S{i}",
            male_weight=0.05 if i > 2 else (0.32 if i == 1 else 0.29),
            female_weight=0.02,
            order_index=i,
            is_active=True,
        )
        for i in range(1, 13)
    ]
    db.add(user)
    db.add(patient)
    db.add_all(symptoms)
    db.commit()

    def override_get_db():
        try:
            yield db
        finally:
            pass

    def override_current_user():
        return db.get(User, 2)

    app.dependency_overrides[get_db] = override_get_db
    app.dependency_overrides[get_current_user] = override_current_user

    payload = {
        "patient_id": 1,
        "symptoms": [{"key": f"s{i}", "present": i in [1, 2]} for i in range(1, 13)],
    }
    client = TestClient(app)
    response = client.post("/api/v1/evaluations", json=payload)

    assert response.status_code == 201
    data = response.json()
    assert data["score"] == 0.61
    assert data["threshold_used"] == 0.56
    assert data["result"] == "ENCAMINHAR_TESTE_GENETICO"
    assert len(data["symptoms"]) == 12

    app.dependency_overrides.clear()
    db.close()
