from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

from app.core.config import obter_configuracoes

configuracoes = obter_configuracoes()

engine = create_engine(configuracoes.url_banco, pool_pre_ping=True)
SessaoLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine, class_=Session)


def get_db():
    db = SessaoLocal()
    try:
        yield db
    finally:
        db.close()
