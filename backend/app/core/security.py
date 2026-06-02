from datetime import datetime, timedelta, timezone

from jose import jwt
from passlib.context import CryptContext

from app.core.config import obter_configuracoes

contexto_senha = CryptContext(schemes=["bcrypt"], deprecated="auto")


def verificar_senha(senha_pura: str, senha_hash: str) -> bool:
    return contexto_senha.verify(senha_pura, senha_hash)


def obter_hash_senha(senha: str) -> str:
    return contexto_senha.hash(senha)


def criar_token_acesso(assunto: str, perfil: str, expiracao: timedelta | None = None) -> str:
    configuracoes = obter_configuracoes()
    expira_em = datetime.now(timezone.utc) + (
        expiracao or timedelta(minutes=configuracoes.minutos_expiracao_token_acesso)
    )
    dados = {"sub": assunto, "role": perfil, "exp": expira_em}
    return jwt.encode(dados, configuracoes.chave_secreta, algorithm=configuracoes.algoritmo)
