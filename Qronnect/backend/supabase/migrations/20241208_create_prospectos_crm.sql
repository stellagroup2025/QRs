-- Create Enum for Prospect Status
do $$ 
begin
  if not exists (select 1 from pg_type where typname = 'estado_prospecto') then
    create type estado_prospecto as enum (
      'nuevo', 
      'contactado', 
      'interesado',
      'negociacion',
      'cierre',
      'ganado',
      'perdido'
    );
  end if;
end $$;

-- Create Prospectos Table
create table if not exists prospectos (
  id uuid default uuid_generate_v4() primary key,
  comercial_id uuid references comerciales(id) not null,
  nombre_negocio text not null,
  nombre_contacto text not null,
  telefono text,
  email text,
  direccion text,
  estado estado_prospecto default 'nuevo',
  notas text, 
  valor_estimado decimal(10, 2),
  plan_interes_id uuid references planes(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS
alter table prospectos enable row level security;

-- Policy: Allow reading own prospects (This assumes usage of Service Role in backend or correct Auth mapping)
-- Since the backend uses "Simulated" tokens, we might rely on the Backend to filter by ID rather than Postgres RLS for the Commercial Agents themselves, 
-- unless we are acting as Superadmin. 
-- However, for safety, we enable RLS.
-- Access for Superadmin (if using authenticated Supabase user)
create policy "Superadmins can do everything on prospectos"
  on prospectos for all
  using ( is_superadmin() );
  
-- We don't add a specific policy for "Comerciales" here because they don't have a direct Supabase User.
-- The backend Service Role will bypass RLS.
