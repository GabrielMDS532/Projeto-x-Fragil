from typing import Annotated

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from app.core.config import obter_configuracoes
from app.db.session import get_db
from app.models.enums import UserRole
from app.models.user import User

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")


def get_current_user(
    db: Annotated[Session, Depends(get_db)],
    token: Annotated[str, Depends(oauth2_scheme)],
) -> User:
    configuracoes = obter_configuracoes()
    excecao_credenciais = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Credenciais inválidas.",
    )
    try:
        payload = jwt.decode(token, configuracoes.chave_secreta, algorithms=[configuracoes.algoritmo])
        id_usuario = int(payload.get("sub"))
    except (JWTError, TypeError, ValueError):
        raise excecao_credenciais

    usuario = db.get(User, id_usuario)
    if not usuario or not usuario.is_active:
        raise excecao_credenciais
    return usuario


def require_admin(current_user: Annotated[User, Depends(get_current_user)]) -> User:
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin role required.")
    return current_user
