import { Database } from 'bun:sqlite'

const db = new Database('sqlite.db')

console.log('\n=== Users Table ===')
const users = db.query('SELECT * FROM user').all()
console.log(users)

console.log('\n=== Accounts Table ===')
const accounts = db.query('SELECT * FROM account').all()
console.log(accounts)

console.log('\n=== Categories Table ===')
const categories = db.query('SELECT * FROM categories').all()
console.log(categories)

console.log('\n=== Decks Table ===')
const decks = db.query('SELECT * FROM decks').all()
console.log(decks)

db.close()
