-- THEKKY - Sistema de Gestão de Ocorrências
-- Schema SQL para Supabase

-- Habilitar RLS
alter database postgres set timezone to 'America/Sao_Paulo';

-- Tabela de empresas
create table public.companies (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  created_at timestamptz default now() not null
);

-- Tabela de perfis (vinculado ao auth.users)
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  company_id uuid references public.companies(id) on delete cascade not null,
  name text not null,
  role text not null default 'user' check (role in ('admin', 'user', 'analyst')),
  created_at timestamptz default now() not null
);

-- Tabela de ocorrências
create table public.occurrences (
  id uuid default gen_random_uuid() primary key,
  company_id uuid references public.companies(id) on delete cascade not null,
  title text not null,
  description text,
  type text not null default 'Não Conformidade' check (type in ('Não Conformidade', 'Reclamação de Cliente', 'Auditoria Interna', 'Auditoria Externa', 'Melhoria', 'Outro')),
  origin text,
  area text,
  status text not null default 'aberta' check (status in ('aberta', 'em_analise', 'acao_proposta', 'resolvida')),
  confidential boolean default false,
  analysis_type text,
  analysis_description text,
  created_by uuid references public.profiles(id),
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Tabela de ações
create table public.actions (
  id uuid default gen_random_uuid() primary key,
  occurrence_id uuid references public.occurrences(id) on delete cascade not null,
  description text not null,
  responsible text not null,
  type text not null default 'Ação Corretiva' check (type in ('Ação Corretiva', 'Ação de Melhoria', 'Ação Imediata (Disposição)', 'Ação Preventiva')),
  status text not null default 'pendente' check (status in ('pendente', 'em_andamento', 'concluida')),
  due_date date,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Habilitar Row Level Security
alter table public.companies enable row level security;
alter table public.profiles enable row level security;
alter table public.occurrences enable row level security;
alter table public.actions enable row level security;

-- Políticas RLS para companies
create policy "Users can view their own company"
  on public.companies for select
  using (id in (select company_id from public.profiles where id = auth.uid()));

-- Políticas RLS para profiles
create policy "Users can view profiles of same company"
  on public.profiles for select
  using (company_id in (select company_id from public.profiles where id = auth.uid()));

create policy "Users can update own profile"
  on public.profiles for update
  using (id = auth.uid());

-- Políticas RLS para occurrences
create policy "Users can view occurrences of their company"
  on public.occurrences for select
  using (company_id in (select company_id from public.profiles where id = auth.uid()));

create policy "Users can create occurrences for their company"
  on public.occurrences for insert
  with check (company_id in (select company_id from public.profiles where id = auth.uid()));

create policy "Users can update occurrences of their company"
  on public.occurrences for update
  using (company_id in (select company_id from public.profiles where id = auth.uid()));

-- Políticas RLS para actions
create policy "Users can view actions of their occurrences"
  on public.actions for select
  using (occurrence_id in (
    select id from public.occurrences
    where company_id in (select company_id from public.profiles where id = auth.uid())
  ));

create policy "Users can create actions for their occurrences"
  on public.actions for insert
  with check (occurrence_id in (
    select id from public.occurrences
    where company_id in (select company_id from public.profiles where id = auth.uid())
  ));

create policy "Users can update actions of their occurrences"
  on public.actions for update
  using (occurrence_id in (
    select id from public.occurrences
    where company_id in (select company_id from public.profiles where id = auth.uid())
  ));

-- Trigger para atualizar updated_at
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger on_occurrence_updated
  before update on public.occurrences
  for each row execute function public.handle_updated_at();

create trigger on_action_updated
  before update on public.actions
  for each row execute function public.handle_updated_at();

-- Função para criar perfil automaticamente após signup
create or replace function public.handle_new_user()
returns trigger as $$
declare
  _company_id uuid;
  _name text;
begin
  _name := coalesce(new.raw_user_meta_data->>'name', new.email);

  -- Verificar se company_id foi passado nos metadados
  if new.raw_user_meta_data->>'company_id' is not null then
    _company_id := (new.raw_user_meta_data->>'company_id')::uuid;
  else
    -- Criar nova empresa
    insert into public.companies (name)
    values (_name || '''s Company')
    returning id into _company_id;
  end if;

  insert into public.profiles (id, company_id, name, role)
  values (new.id, _company_id, _name, 'admin');

  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
