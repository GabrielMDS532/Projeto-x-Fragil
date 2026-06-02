from app.models.enums import BiologicalSex, EvaluationResult
from app.models.symptom import Symptom
from app.services.triage import calculate_triage


def _symptom(key: str, order: int, male: float, female: float) -> Symptom:
    return Symptom(
        id=order,
        key=key,
        label=key,
        male_weight=male,
        female_weight=female,
        order_index=order,
        is_active=True,
    )


def test_triage_boundary_male_refers_when_equal_threshold():
    symptoms = [
        _symptom("a", 1, 0.32, 0.20),
        _symptom("b", 2, 0.24, 0.01),
        _symptom("c", 3, 0.10, 0.10),
    ]
    payload = {"a": True, "b": True, "c": False}

    outcome = calculate_triage(BiologicalSex.M, payload, symptoms)

    assert outcome.score == 0.56
    assert outcome.threshold_used == 0.56
    assert outcome.result == EvaluationResult.ENCAMINHAR_TESTE_GENETICO


def test_triage_boundary_female_not_refers_below_threshold():
    symptoms = [
        _symptom("a", 1, 0.01, 0.28),
        _symptom("b", 2, 0.01, 0.20),
        _symptom("c", 3, 0.01, 0.06),
    ]
    payload = {"a": True, "b": True, "c": True}

    outcome = calculate_triage(BiologicalSex.F, payload, symptoms)

    assert outcome.score == 0.54
    assert outcome.threshold_used == 0.55
    assert outcome.result == EvaluationResult.SEM_ENCAMINHAMENTO_IMEDIATO
