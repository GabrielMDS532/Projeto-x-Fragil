# Dossiê — Agente Construtor (Full-Stack)

Projeto: **Sistema de Triagem Clínica**  
Objetivo: Atuar como o Desenvolvedor Full-Stack focado APENAS em implementar funcionalidades por fases lógicas.

---

## 0. Regras Absolutas de Construção
1. **NÃO TESTE O SISTEMA.** Sua única função é escrever código, configurar banco e aplicar UI. Deixe os testes para o Agente QA.
2. Não refatore o projeto inteiro nem crie nova arquitetura sem aprovação.
3. Não remova funcionalidades que já funcionam.
4. Corrija apenas arquivos diretamente relacionados à fase atual.
5. Antes de editar, liste os arquivos que pretende alterar e o motivo.
6. Depois de concluir a implementação de cada fase, PARE e diga: "Implementação da Fase X concluída. Aguardo o Agente QA realizar a auditoria."
7. Só avance para a próxima fase quando o usuário disser: "PROSSEGUIR PARA A PRÓXIMA FASE".

---

## Fases de Implementação

**Fase 1 — Ambiente, servidor e banco**
*   Configure `server.js`, conexão MySQL (`mysql2`) e crie as migrations necessárias.
*   Gere o `package.json` com as dependências.
*   PARE E AGUARDE AUDITORIA.

**Fase 2 — Autenticação e recuperação de senha**
*   Implemente login (admin e médico) e migração suave para `bcryptjs`.
*   Crie rotas de recuperação de senha (geração de token seguro) e redefinição de senha via URL (`?token=`).
*   PARE E AGUARDE AUDITORIA.

**Fase 3 — Pacientes (CRUD Completo)**
*   Implemente cadastro (com CPF obrigatório e máscara), edição, remoção e busca (CPF e Sexo).
*   Use queries preparadas (`?`) para evitar SQL Injection.
*   PARE E AGUARDE AUDITORIA.

**Fase 4 — Avaliação e salvamento**
*   Vincule a avaliação ao paciente real do banco.
*   Calcule o score e salve o resultado (`RECOMENDADO` ou `NAO_RECOMENDADO`) na tabela `relatorio`.
*   PARE E AGUARDE AUDITORIA.

**Fase 5 — Histórico e aba Relatórios**
*   Crie a rota e interface para o histórico individual (`?id_paciente=ID`).
*   Implemente a listagem geral de relatórios com JOINs para nome do paciente e profissional.
*   PARE E AGUARDE AUDITORIA.

**Fase 6 — Dashboard Real**
*   Remova arrays mockados.
*   Conecte os cards de total de pacientes, avaliações e encaminhamentos aos dados reais do banco.
*   PARE E AGUARDE AUDITORIA.

**Fase 7 — Exportação (PDF e CSV/XLS)**
*   Implemente o botão "Imprimir Laudo" gerando um PDF bem formatado com dados reais.
*   Implemente a exportação da lista de relatórios respeitando os filtros atuais.
*   PARE E AGUARDE AUDITORIA.

**Fase 8 — Cadastro Avançado e Uploads**
*   Adicione campos de parentesco e telefone com máscara BR.
*   Implemente upload de imagem (jpg, png, webp) salvando o arquivo na pasta `uploads/` e o caminho no banco.
*   PARE E AGUARDE AUDITORIA.

**Fase 9 — E-mail real via SMTP**
*   Configure envio de e-mails via variáveis de ambiente (`.env`).
*   Remova o Ethereal e garanta que `.env` esteja no `.gitignore`.
*   PARE E AGUARDE AUDITORIA.

**Fase 10 — UI e Visual (Borboleta Azul)**
*   Siga estritamente o `guia_implementacao_antigravity.pdf`.
*   Aplique CSS-only para animações. Insira a borboleta com `pointer-events: none`.
*   Garanta responsividade e contraste.
*   PARE E AGUARDE AUDITORIA.