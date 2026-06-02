from fastapi import APIRouter

from app.api.routes import auth, dashboard, evaluations, patients, reports, users

roteador_api = APIRouter()
roteador_api.include_router(auth.router, prefix="/auth", tags=["auth"])
roteador_api.include_router(users.router, prefix="/users", tags=["users"])
roteador_api.include_router(patients.router, prefix="/patients", tags=["patients"])
roteador_api.include_router(evaluations.router, prefix="/evaluations", tags=["evaluations"])
roteador_api.include_router(reports.router, prefix="/reports", tags=["reports"])
roteador_api.include_router(dashboard.router, prefix="/dashboard", tags=["dashboard"])
