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

    console.log('\n--- ALL TABLES AND COLUMNS READY ---');
  } catch (err) {
    console.error('Failed to initialize tables:', err);
  } finally {
    await prisma.$disconnect();
  }
}

init();
