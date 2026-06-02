# Resumo do Backend (MVP Síndrome do X Frágil)

## O que foi implementado

### Backend em Python
- API REST em FastAPI com documentação Swagger.
- Organização em camadas: `api`, `schemas`, `models`, `services`, `db`, `core`.

### Banco de dados e migrações
- PostgreSQL como banco principal.
- Alembic com migrações:
  - `0001_initial_schema`: cria as tabelas principais.
  - `0002_seed_symptoms_and_default_admin`: cria o admin padrão e insere os 12 sintomas com pesos validados.

### Autenticação e perfis (RBAC)
- Login com email e senha (bcrypt) retornando JWT.
- Perfis: `ADMIN` e `PADRAO`.
- Admin consegue criar e listar usuários.

### Pacientes
- Criar, listar, consultar e atualizar pacientes.
- Atualização protegida: admin ou usuário que cadastrou o paciente.

### Avaliações e triagem
- Recebe exatamente 12 sintomas (presentes/ausentes) e calcula score:
  - Pesos por sexo (masculino/feminino) conforme checklist validado.
  - Limiar: masculino 0,56; feminino 0,55.
  - Regra: `score >= limiar` => `ENCAMINHAR_TESTE_GENETICO`; senão `SEM_ENCAMINHAMENTO_IMEDIATO`.
- Persiste avaliação e “snapshot” dos sintomas com peso aplicado.
- Histórico por paciente e listagem com filtros.

### Relatórios e dashboard
- Relatório de avaliações com filtros (datas, paciente, usuário, resultado).
- Dashboard com totais (pacientes, avaliações, encaminhamentos), respeitando permissões.

### Testes
- Testes unitários do cálculo (limiares).
- Testes de RBAC (usuário padrão visualiza apenas suas avaliações) e criação de avaliação.

## O que não foi implementado (ainda)

### Integração com o frontend
- As páginas HTML ainda não fazem `fetch` para a API.
- O login do frontend usa `localStorage` (demo), o que não deve ser usado em produção.

### Recuperação de senha
- Existe tela no frontend, mas não há fluxo backend de email/recuperação.

### Exportação de relatórios
- A API entrega dados filtrados em JSON.
- Exportação CSV/PDF não foi implementada.

### Impressão (RF12)
- Não foi implementada geração de PDF/relatório “imprimível” por avaliação.

## Inconsistências/decisões importantes

- O frontend protótipo aceita opções de sexo além de M/F; o backend usa M/F por causa dos limiares e pesos validados.
- Macroorquidismo não é aplicável no feminino; foi modelado como peso feminino 0,00 para manter o cálculo consistente.
- O requisito de segurança do PDF invalida o modelo atual do frontend baseado em `localStorage`.
