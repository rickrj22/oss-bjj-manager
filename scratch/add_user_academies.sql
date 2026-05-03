-- Cria a tabela de junção para vínculo N:M entre perfis (usuários) e academias
CREATE TABLE IF NOT EXISTS public.user_academies (
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  academy_id uuid REFERENCES public.academies(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, academy_id)
);

-- Habilita RLS
ALTER TABLE public.user_academies ENABLE ROW LEVEL SECURITY;

-- Políticas de Segurança (RLS)
-- Admins podem ler, inserir e deletar qualquer vínculo
CREATE POLICY "Admins podem ver todos os vínculos" ON public.user_academies
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
  );

CREATE POLICY "Admins podem inserir vínculos" ON public.user_academies
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
  );

CREATE POLICY "Admins podem deletar vínculos" ON public.user_academies
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- O próprio usuário pode ler seus próprios vínculos
CREATE POLICY "Usuários podem ver seus próprios vínculos" ON public.user_academies
  FOR SELECT USING ( user_id = auth.uid() );

-- Popula os dados iniciais com base no academy_id atual da tabela profiles
INSERT INTO public.user_academies (user_id, academy_id)
SELECT id, academy_id FROM public.profiles WHERE academy_id IS NOT NULL
ON CONFLICT DO NOTHING;
