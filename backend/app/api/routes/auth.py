from datetime import timedelta
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.config import obter_configuracoes
from app.core.security import criar_token_acesso, verificar_senha
from app.db.session import get_db
from app.models.user import User
from app.schemas.auth import LoginRequest, TokenResponse

router = APIRouter()


@router.post("/login", response_model=TokenResponse)
def login(dados: LoginRequest, db: Annotated[Session, Depends(get_db)]) -> TokenResponse:
    usuario = db.query(User).filter(User.email == dados.email).first()
    if not usuario or not verificar_senha(dados.password, usuario.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password.")
    if not usuario.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="User is inactive.")

    configuracoes = obter_configuracoes()
    token_acesso = criar_token_acesso(
        assunto=str(usuario.id),
        perfil=usuario.role.value,
        expiracao=timedelta(minutes=configuracoes.minutos_expiracao_token_acesso),
    )
    return TokenResponse(access_token=token_acesso, role=usuario.role)


@router.post("/logout")
def logout() -> dict[str, str]:
    return {"message": "Logout acknowledged. Token invalidation is stateless in MVP."}
