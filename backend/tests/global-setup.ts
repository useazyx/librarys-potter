import { execSync } from 'node:child_process'

const TEST_DATABASE_URL = 'postgresql://postgres:postgres@localhost:5432/librarys_potter_test?schema=public'

// Prepara o banco de teste uma vez por rodada. As migrations são aplicadas com
// migrate deploy, nunca com db push --force-reset, que apaga tudo. O próprio
// seed limpa as tabelas antes de popular.
export default function setup() {
  const env = { ...process.env, DATABASE_URL: TEST_DATABASE_URL, NODE_ENV: 'test' }

  execSync('npx prisma migrate deploy', { env, stdio: 'ignore' })
  execSync('npx tsx prisma/seed.ts', { env, stdio: 'ignore' })
}
