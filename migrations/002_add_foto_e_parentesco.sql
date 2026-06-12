-- Migration 002: Adiciona colunas foto_paciente e parentesco_responsavel à tabela paciente
-- Banco de dados: x_fragil

USE x_fragil;

-- Adiciona a coluna parentesco_responsavel após nome_responsavel
ALTER TABLE paciente
    ADD COLUMN parentesco_responsavel VARCHAR(50) DEFAULT NULL AFTER nome_responsavel;

-- Adiciona a coluna foto_paciente após observacoes_paciente
ALTER TABLE paciente
    ADD COLUMN foto_paciente VARCHAR(500) DEFAULT NULL AFTER observacoes_paciente;

-- Verificação: confirma que as colunas foram criadas
SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE, COLUMN_DEFAULT
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = 'x_fragil'
  AND TABLE_NAME   = 'paciente'
  AND COLUMN_NAME IN ('foto_paciente', 'parentesco_responsavel');
