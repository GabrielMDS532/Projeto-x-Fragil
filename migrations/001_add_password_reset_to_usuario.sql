-- Migration 001: Adiciona colunas de recuperação de senha à tabela usuario
-- Execute este script no MySQL Workbench ou pelo terminal ANTES de reiniciar o servidor.
-- Banco de dados: x_fragil

USE x_fragil;

ALTER TABLE usuario
    ADD COLUMN token_recuperacao VARCHAR(255) DEFAULT NULL AFTER senha,
    ADD COLUMN token_expiracao  DATETIME     DEFAULT NULL AFTER token_recuperacao;

-- Índice para acelerar a busca por token nas rotas de validação e redefinição
ALTER TABLE usuario
    ADD INDEX idx_token_recuperacao (token_recuperacao);

-- Verificação: confirma que as colunas foram criadas corretamente
SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE, COLUMN_DEFAULT
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = 'x_fragil'
  AND TABLE_NAME   = 'usuario'
  AND COLUMN_NAME IN ('token_recuperacao', 'token_expiracao');
