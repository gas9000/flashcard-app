import { Database } from 'bun:sqlite'

const db = new Database('sqlite.db')

console.log('\n🗑️  Clearing all user data...\n')

try {
  // Delete in correct order to respect foreign key constraints
  db.run('DELETE FROM card_reviews')
  console.log('✅ Cleared card_reviews')

  db.run('DELETE FROM cards')
  console.log('✅ Cleared cards')

  db.run('DELETE FROM decks')
  console.log('✅ Cleared decks')

  db.run('DELETE FROM categories')
  console.log('✅ Cleared categories')

  db.run('DELETE FROM session')
  console.log('✅ Cleared sessions')

  db.run('DELETE FROM account')
  console.log('✅ Cleared accounts')

  db.run('DELETE FROM user')
  console.log('✅ Cleared users')

  db.run('DELETE FROM verification')
  console.log('✅ Cleared verifications')

  console.log('\n✨ Database cleared successfully!\n')
} catch (error) {
  console.error('❌ Error clearing database:', error)
  process.exit(1)
}

db.close()
