-- Migración de usuarios desde proyecto original (jvdpuxpurhetopsclqrq)
-- Preserva contraseñas (bcrypt hashes) y metadata
-- Ejecutar en: https://supabase.com/dashboard/project/ijamhlmmazgjbltfdagd/sql/new

INSERT INTO auth.users (
  id,
  instance_id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  is_anonymous
) VALUES

-- julian.martin.alonso@gmail.com
(
  '3eec50fe-5dd6-4a7d-bff3-7d82907d085d',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'julian.martin.alonso@gmail.com',
  '$2a$10$nqDbyXtOGggYV8WAat1.Ke1gBMoAjAc8vWDT3ZGTrPqT0tirTaFJS',
  '2025-08-31T03:51:58.238423Z',
  '{"provider":"email","providers":["email"]}',
  '{"email_verified":true}',
  '2025-08-31T03:51:58.209423Z',
  NOW(),
  false
),

-- drjulianmartinalonso@gmail.com
(
  '972904db-1243-4c39-9784-a8f20a54c519',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'drjulianmartinalonso@gmail.com',
  '$2a$10$W2Z.mp3Tu8w4yGGZ5fTyFuYYsBVic6Cpt47/b/KiIiG8iY5jSOGpe',
  '2025-09-11T01:55:48.674998Z',
  '{"provider":"email","providers":["email"]}',
  '{"sub":"972904db-1243-4c39-9784-a8f20a54c519","role":"residente","email":"drjulianmartinalonso@gmail.com","full_name":"Dr Alonso","email_verified":true,"phone_verified":false}',
  '2025-09-11T01:55:19.178423Z',
  NOW(),
  false
),

-- sangulofrechero@gmail.com
(
  '17017d48-d0fe-46cf-956e-457ffd2854ef',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'sangulofrechero@gmail.com',
  '$2a$10$yycJQAfaxiLvpFR4jX6h8O43h2wrFsPPAuOwbUxWRItLAChm08eTO',
  '2025-09-11T15:24:32.231001Z',
  '{"provider":"email","providers":["email"]}',
  '{"sub":"17017d48-d0fe-46cf-956e-457ffd2854ef","role":"residente","email":"sangulofrechero@gmail.com","full_name":"Serena Angulo","email_verified":true,"phone_verified":false}',
  '2025-09-11T15:22:49.167423Z',
  NOW(),
  false
),

-- jaquelinebmolina@gmail.com
(
  '43b50994-fde9-48b0-84c2-c453f65bb090',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'jaquelinebmolina@gmail.com',
  '$2a$10$xIAMjjWb17w.bA2bn12kPORafe0UAUPos9vF5DTQzpLGfX4Po3FJ.',
  '2025-09-11T17:05:06.595688Z',
  '{"provider":"email","providers":["email"]}',
  '{"sub":"43b50994-fde9-48b0-84c2-c453f65bb090","role":"residente","email":"jaquelinebmolina@gmail.com","full_name":"Jaqueline Molina","email_verified":true,"phone_verified":false}',
  '2025-09-11T16:41:31.059423Z',
  NOW(),
  false
),

-- eliasloor98@gmail.com
(
  '5f67585d-d590-4f01-9729-1b82f6f61f1e',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'eliasloor98@gmail.com',
  '$2a$10$tbkymCm2KsUwOfgCCLJID.Faaj4zFhzNDx7yoPXOlco/QuS.qjEVC',
  '2025-09-12T11:55:13.338653Z',
  '{"provider":"email","providers":["email"]}',
  '{"sub":"5f67585d-d590-4f01-9729-1b82f6f61f1e","role":"residente","email":"eliasloor98@gmail.com","full_name":"Jorge Elias Loor Vera","email_verified":true,"phone_verified":false}',
  '2025-09-12T11:49:45.807423Z',
  NOW(),
  false
),

-- micaelaboschi@gmail.com
(
  '57dcc2e0-3fe2-4b63-b52f-dbffba373213',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'micaelaboschi@gmail.com',
  '$2a$10$CE2LrE6enYm1DXoNt5jxpuxXIngJw3Zwtj1e9/UyUXMIIG5OQqjVK',
  '2025-09-22T20:36:08.601404Z',
  '{"provider":"email","providers":["email"]}',
  '{"sub":"57dcc2e0-3fe2-4b63-b52f-dbffba373213","role":"residente","email":"micaelaboschi@gmail.com","full_name":"Micaela Boschi","email_verified":true,"phone_verified":false}',
  '2025-09-22T20:25:06.527423Z',
  NOW(),
  false
),

-- tatianachamu11@gmail.com
(
  'eac51d9e-6007-41b2-93af-1b223c84cb70',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'tatianachamu11@gmail.com',
  '$2a$10$tT6xM3kzVUj9YMWvgrTy0uBOsUolOc69srr4M3zNb2MDEaEthiSSO',
  '2025-09-23T15:45:05.927536Z',
  '{"provider":"email","providers":["email"]}',
  '{"sub":"eac51d9e-6007-41b2-93af-1b223c84cb70","role":"residente","email":"tatianachamu11@gmail.com","full_name":"Tatiana Chaparro","email_verified":false,"phone_verified":false}',
  '2025-09-22T20:23:58.082423Z',
  NOW(),
  false
)

ON CONFLICT (id) DO NOTHING;

-- Verificar resultado
SELECT id, email, email_confirmed_at, created_at FROM auth.users ORDER BY created_at;
