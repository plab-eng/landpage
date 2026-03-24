from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional
from sqlalchemy import create_engine, Column, Integer, String, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import httpx

# 1. Configuração do Banco de Dados SQLite
DATABASE_URL = "sqlite:///./plab_automacoes.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# 2. Modelo da Tabela (Banco de Dados)
class ContatoDB(Base):
    __tablename__ = "contatos"
    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String(100), nullable=False)
    email = Column(String(100), nullable=False)
    cnpj_cpf = Column(String(20), nullable=True) # Opcional no DB
    empresa_nome = Column(String(200), nullable=True) # Preenchido via API se for CNPJ
    cidade = Column(String(100), nullable=True)       # Preenchido via API se for CNPJ
    mensagem = Column(Text, nullable=False)

Base.metadata.create_all(bind=engine)

# 3. Inicialização do FastAPI
app = FastAPI()

# 4. Esquema de Validação (Pydantic)
class ContatoSchema(BaseModel):
    nome: str
    email: str
    cnpj_cpf: Optional[str] = None # Define como opcional no recebimento
    mensagem: str

# 5. Função Auxiliar: Consulta de CNPJ (Receita Federal via BrasilAPI)
async def consultar_dados_empresa(documento: str):
    """Tenta buscar dados se o documento parecer um CNPJ"""
    documento_limpo = "".join(filter(str.isdigit, documento))
    
    if len(documento_limpo) == 14:
        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(f"https://brasilapi.com.br/api/cnpj/v1/{documento_limpo}")
                if response.status_code == 200:
                    dados = response.json()
                    return {
                        "nome": dados.get("nome_fantasia") or dados.get("razao_social"),
                        "cidade": dados.get("municipio")
                    }
            except Exception:
                pass
    return {"nome": "N/D", "cidade": "N/D"}

# 6. Rota de Recebimento do Formulário
@app.post("/api/contato")
async def salvar_contato(contato: ContatoSchema):
    db = SessionLocal()
    
    # Se houver um documento, tenta validar se é empresa
    info_extra = {"nome": "N/D", "cidade": "N/D"}
    if contato.cnpj_cpf:
        info_extra = await consultar_dados_empresa(contato.cnpj_cpf)
    
    try:
        novo_contato = ContatoDB(
            nome=contato.nome,
            email=contato.email,
            cnpj_cpf=contato.cnpj_cpf,
            empresa_nome=info_extra["nome"],
            cidade=info_extra["cidade"],
            mensagem=contato.mensagem
        )
        db.add(novo_contato)
        db.commit()
        
        return {
            "status": "sucesso", 
            "detalhes": f"Contato recebido de {contato.nome}. Empresa: {info_extra['nome']}"
        }
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Erro ao salvar no Lab: {str(e)}")
    finally:
        db.close()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)