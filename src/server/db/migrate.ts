import { drizzle } from 'drizzle-orm/bun-sqlite'
import { migrate } from 'drizzle-orm/bun-sqlite/migrator'
import { Database } from 'bun:sqlite'

const sqlite = new Database('./sqlite.db')
const db = drizzle(sqlite)

async function runMigrations() {
  console.log('Running migrations...')
  await migrate(db, { migrationsFolder: './drizzle' })
  console.log('Migrations completed!')
  process.exit(0)
}

runMigrations().catch((err) => {
  console.error('Migration failed!')
  console.error(err)
  process.exit(1)
})
