from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Configuracoes(BaseSettings):
    nome_app: str = "Fragile X Backend"
    prefixo_api_v1: str = "/api/v1"
    debug: bool = False

    url_banco: str = "postgresql+psycopg2://postgres:postgres@localhost:5432/fragilex"

    chave_secreta: str = "change-this-in-production"
    minutos_expiracao_token_acesso: int = 60 * 8
    algoritmo: str = "HS256"

    email_admin_padrao: str = "admin@clinica.com"
    senha_admin_padrao: str = "Admin@123"
    nome_admin_padrao: str = "Administrador"

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")


@lru_cache
def obter_configuracoes() -> Configuracoes:
    return Configuracoes()
