from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from sqlalchemy import create_engine, Column, Integer, String, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

# Configuração do Banco de Dados
DATABASE_URL = "sqlite:///./plab_automacoes.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Modelo da Tabela de Contatos no Banco
class ContatoDB(Base):
    __tablename__ = "contatos"
    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String(100))
    email = Column(String(100))
    mensagem = Column(Text)

# Cria a tabela se não existir
Base.metadata.create_all(bind=engine)

app = FastAPI()

# Modelo de Dados para validação (Pydantic)
class ContatoSchema(BaseModel):
    nome: str
    email: str
    mensagem: str

@app.post("/api/contato")
async def salvar_contato(contato: ContatoSchema):
    db = SessionLocal()
    try:
        novo_contato = ContatoDB(
            nome=contato.nome, 
            email=contato.email, 
            mensagem=contato.mensagem
        )
        db.add(novo_contato)
        db.commit()
        return {"status": "sucesso", "msg": "Mensagem salva no banco da P-LAB!"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()