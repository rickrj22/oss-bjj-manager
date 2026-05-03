-- Este script corrige as permissões de exclusão (soft-delete) e edição de aulas na tabela classes.
-- Ele permite que administradores atualizem as informações das aulas da sua academia.

-- 1. Removemos políticas antigas conflitantes (caso existam)
DROP POLICY IF EXISTS "Allow update for admins" ON public.classes;
DROP POLICY IF EXISTS "Permitir update para admins" ON public.classes;
DROP POLICY IF EXISTS "Enable update for users based on academy_id" ON public.classes;

-- 2. Criamos a política correta
CREATE POLICY "Enable update for admins" ON public.classes
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() AND profiles.is_admin = true
  )
);
