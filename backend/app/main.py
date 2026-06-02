from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.router import roteador_api
from app.core.config import obter_configuracoes

configuracoes = obter_configuracoes()
app = FastAPI(title=configuracoes.nome_app, debug=configuracoes.debug)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health", tags=["health"])
def health_check() -> dict[str, str]:
    return {"status": "ok"}


app.include_router(roteador_api, prefix=configuracoes.prefixo_api_v1)
