import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Creando trigger de sincronización en Supabase PostgreSQL...');

  const sqlFunction = `
    CREATE OR REPLACE FUNCTION public.handle_new_user()
    RETURNS trigger AS $$
    DECLARE
      user_role identity."UserRole";
      first_n varchar(50);
      last_n varchar(50);
      avatar text;
    BEGIN
      -- Validar dominio @tecsup.edu.pe
      IF NOT (NEW.email ILIKE '%@tecsup.edu.pe') THEN
        RAISE EXCEPTION 'Acceso restringido: Solo se permiten correos @tecsup.edu.pe';
      END IF;

      -- Super Admin
      IF LOWER(NEW.email) = 'luis.galvan@tecsup.edu.pe' THEN
        user_role := 'ADMIN';
      ELSE
        user_role := 'STUDENT';
      END IF;

      first_n := COALESCE(
        NEW.raw_user_meta_data->>'given_name',
        NEW.raw_user_meta_data->>'first_name',
        split_part(split_part(NEW.email, '@', 1), '.', 1),
        'Estudiante'
      );
      last_n := COALESCE(
        NEW.raw_user_meta_data->>'family_name',
        NEW.raw_user_meta_data->>'last_name',
        split_part(split_part(NEW.email, '@', 1), '.', 2),
        'Tecsup'
      );
      avatar := COALESCE(
        NEW.raw_user_meta_data->>'avatar_url',
        NEW.raw_user_meta_data->>'picture',
        'https://api.dicebear.com/7.x/bottts/svg?seed=' || NEW.email
      );

      -- Insertar o actualizar en identity.users
      INSERT INTO identity.users (
        id,
        email,
        email_verified,
        status,
        role,
        avatar_url,
        first_name,
        last_name,
        created_at,
        updated_at
      ) VALUES (
        NEW.id,
        LOWER(NEW.email),
        COALESCE(NEW.email_confirmed_at IS NOT NULL, true),
        'ACTIVE',
        user_role,
        avatar,
        first_n,
        last_n,
        NOW(),
        NOW()
      )
      ON CONFLICT (id) DO UPDATE
      SET 
        last_login_at = NOW(),
        avatar_url = COALESCE(EXCLUDED.avatar_url, identity.users.avatar_url),
        role = CASE WHEN LOWER(NEW.email) = 'luis.galvan@tecsup.edu.pe' THEN 'ADMIN' ELSE identity.users.role END;

      -- Insertar perfil por defecto en profile.user_profiles
      INSERT INTO profile.user_profiles (
        id,
        user_id,
        career,
        cycle,
        biography,
        avatar_url
      ) VALUES (
        gen_random_uuid(),
        NEW.id,
        'Diseño y Desarrollo de Software',
        4,
        'Competidor de la Arena Tecsup.',
        avatar
      )
      ON CONFLICT (user_id) DO NOTHING;

      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;
  `;

  const sqlTrigger = `
    DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT OR UPDATE ON auth.users
      FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
  `;

  try {
    await prisma.$executeRawUnsafe(sqlFunction);
    console.log('✅ Función public.handle_new_user() creada con éxito.');
    await prisma.$executeRawUnsafe('DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;');
    await prisma.$executeRawUnsafe('CREATE TRIGGER on_auth_user_created AFTER INSERT OR UPDATE ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();');
    console.log('✅ Trigger on_auth_user_created en auth.users creado con éxito.');
  } catch (error) {
    console.error('❌ Error al crear trigger:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
