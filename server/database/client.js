const connectionString = process.env.DATABASE_URL;

const { Client } = require("pg")
const client = new Client({
  connectionString
})
client.connect()

module.exports = client
