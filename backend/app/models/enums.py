import enum


class UserRole(str, enum.Enum):
    ADMIN = "ADMIN"
    PADRAO = "PADRAO"


class BiologicalSex(str, enum.Enum):
    M = "M"
    F = "F"


class EvaluationResult(str, enum.Enum):
    ENCAMINHAR_TESTE_GENETICO = "ENCAMINHAR_TESTE_GENETICO"
    SEM_ENCAMINHAMENTO_IMEDIATO = "SEM_ENCAMINHAMENTO_IMEDIATO"
