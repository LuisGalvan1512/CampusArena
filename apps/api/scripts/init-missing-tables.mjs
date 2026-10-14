import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function init() {
  console.log('--- Initializing Missing Database Tables & Columns ---');

  try {
    // 1. identity.user_sanctions
    console.log('Creating identity.user_sanctions...');
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS identity.user_sanctions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES identity.users(id) ON DELETE CASCADE,
        admin_id UUID REFERENCES identity.users(id) ON DELETE SET NULL,
        type VARCHAR(50) NOT NULL,
        reason TEXT NOT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
        starts_at TIMESTAMP(6) NOT NULL DEFAULT now(),
        ends_at TIMESTAMP(6),
        revoked_at TIMESTAMP(6),
        revoked_by UUID REFERENCES identity.users(id) ON DELETE SET NULL,
        revoke_reason TEXT,
        created_at TIMESTAMP(6) DEFAULT now()
      );
    `);
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS idx_user_sanctions_user_id ON identity.user_sanctions(user_id);
    `);
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS idx_user_sanctions_status ON identity.user_sanctions(status);
    `);
    console.log('✓ identity.user_sanctions created.');

    // 2. identity.sanction_appeals
    console.log('Creating identity.sanction_appeals...');
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS identity.sanction_appeals (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        sanction_id UUID NOT NULL REFERENCES identity.user_sanctions(id) ON DELETE CASCADE,
        user_id UUID NOT NULL REFERENCES identity.users(id) ON DELETE CASCADE,
        appeal_text TEXT NOT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
        admin_response TEXT,
        reviewed_by UUID REFERENCES identity.users(id) ON DELETE SET NULL,
        reviewed_at TIMESTAMP(6),
        created_at TIMESTAMP(6) DEFAULT now()
      );
    `);
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS idx_sanction_appeals_sanction_id ON identity.sanction_appeals(sanction_id);
    `);
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS idx_sanction_appeals_user_id ON identity.sanction_appeals(user_id);
    `);
    console.log('✓ identity.sanction_appeals created.');

    // 3. profile.profile_signatures
    console.log('Creating profile.profile_signatures...');
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS profile.profile_signatures (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        profile_user_id UUID NOT NULL REFERENCES identity.users(id) ON DELETE CASCADE,
        author_id UUID NOT NULL REFERENCES identity.users(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        image_url TEXT,
        created_at TIMESTAMP(6) DEFAULT now()
      );
    `);
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS idx_profile_signatures_profile_user_id ON profile.profile_signatures(profile_user_id);
    `);
    console.log('✓ profile.profile_signatures created.');

    // 4. Check tournament columns
    console.log('Ensuring tournament columns...');
    await prisma.$executeRawUnsafe(`
      ALTER TABLE tournament.tournaments ADD COLUMN IF NOT EXISTS prize_distribution JSONB;
    `);
    await prisma.$executeRawUnsafe(`
      ALTER TABLE tournament.tournaments ADD COLUMN IF NOT EXISTS event_modality VARCHAR(50) DEFAULT 'PRESENTIAL';
    `);
    console.log('✓ tournament columns verified.');

    // 5. Check community comments parent_id
    console.log('Ensuring comments parent_id...');
    await prisma.$executeRawUnsafe(`
      ALTER TABLE community.community_comments 
      ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES community.community_comments(id) ON DELETE CASCADE;
    `);
    console.log('✓ comments columns verified.');

    // 6. Ensure community media_url is TEXT
    console.log('Ensuring community media_url is TEXT...');
    await prisma.$executeRawUnsafe(`
      ALTER TABLE community.community_posts ALTER COLUMN media_url TYPE TEXT;
    `);
    await prisma.$executeRawUnsafe(`
      ALTER TABLE community.community_comments ALTER COLUMN media_url TYPE TEXT;
    `);
    console.log('✓ community media_url verified as TEXT.');

    // 7. Ensure Supabase Storage buckets & policies
    console.log('Ensuring Supabase storage buckets & policies...');
    await prisma.$executeRawUnsafe(`
      INSERT INTO storage.buckets (id, name, public, file_size_limit)
      VALUES 
        ('community', 'community', true, 10485760),
        ('vouchers', 'vouchers', true, 10485760),
        ('signatures', 'signatures', true, 10485760)
      ON CONFLICT (id) DO UPDATE SET public = true, allowed_mime_types = NULL;
    `);

    await prisma.$executeRawUnsafe(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'buckets' AND policyname = 'Public Access to Buckets'
        ) THEN
          CREATE POLICY "Public Access to Buckets" ON storage.buckets FOR SELECT USING (true);
        END IF;

        IF NOT EXISTS (
          SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Public Read Objects'
        ) THEN
          CREATE POLICY "Public Read Objects" ON storage.objects FOR SELECT USING (bucket_id IN ('community', 'vouchers', 'signatures'));
        END IF;

        IF NOT EXISTS (
          SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Public Insert Objects'
        ) THEN
          CREATE POLICY "Public Insert Objects" ON storage.objects FOR INSERT WITH CHECK (bucket_id IN ('community', 'vouchers', 'signatures'));
        END IF;

        IF NOT EXISTS (
          SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Public Update Objects'
        ) THEN
          CREATE POLICY "Public Update Objects" ON storage.objects FOR UPDATE USING (bucket_id IN ('community', 'vouchers', 'signatures'));
        END IF;

        IF NOT EXISTS (
          SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Public Delete Objects'
        ) THEN
          CREATE POLICY "Public Delete Objects" ON storage.objects FOR DELETE USING (bucket_id IN ('community', 'vouchers', 'signatures'));
        END IF;
      END $$;
    `);
    console.log('✓ Supabase storage buckets & policies verified.');

    console.log('\n--- ALL TABLES AND COLUMNS READY ---');
  } catch (err) {
    console.error('Failed to initialize tables:', err);
  } finally {
    await prisma.$disconnect();
  }
}

init();
