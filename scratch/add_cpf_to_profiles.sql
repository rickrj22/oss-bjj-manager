-- Adicionar campo CPF na tabela profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS cpf TEXT;
