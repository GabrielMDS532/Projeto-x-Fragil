from dataclasses import dataclass

from app.models.enums import BiologicalSex, EvaluationResult
from app.models.symptom import Symptom

LIMIARES = {BiologicalSex.M: 0.56, BiologicalSex.F: 0.55}


@dataclass
class SymptomEvaluation:
    sintoma: Symptom
    presente: bool
    peso_aplicado: float


@dataclass
class TriageOutcome:
    pontuacao: float
    limiar_usado: float
    resultado: EvaluationResult
    avaliacao_sintomas: list[SymptomEvaluation]


def calcular_triagem(sexo: BiologicalSex, respostas_sintomas: dict[str, bool], sintomas: list[Symptom]) -> TriageOutcome:
    chaves_esperadas = {s.key for s in sintomas if s.is_active}
    if set(respostas_sintomas.keys()) != chaves_esperadas:
        raise ValueError("A lista de sintomas deve conter exatamente as chaves ativas.")

    detalhes: list[SymptomEvaluation] = []
    pontuacao = 0.0

    for sintoma in sorted([s for s in sintomas if s.is_active], key=lambda item: item.order_index):
        presente = respostas_sintomas[sintoma.key]
        peso_aplicado = sintoma.male_weight if sexo == BiologicalSex.M else sintoma.female_weight
        if presente:
            pontuacao += peso_aplicado
        detalhes.append(SymptomEvaluation(sintoma=sintoma, presente=presente, peso_aplicado=peso_aplicado))

    limiar = LIMIARES[sexo]
    resultado = (
        EvaluationResult.ENCAMINHAR_TESTE_GENETICO
        if pontuacao >= limiar
        else EvaluationResult.SEM_ENCAMINHAMENTO_IMEDIATO
    )
    return TriageOutcome(
        pontuacao=round(pontuacao, 4),
        limiar_usado=limiar,
        resultado=resultado,
        avaliacao_sintomas=detalhes,
    )
