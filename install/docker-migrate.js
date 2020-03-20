const path = require('path')
require('dotenv').config({
  path: path.join(__dirname, '../.env')
})
const config = require('../config/server')

const { Client } = require('pg')

const run = async function () {
  let attempts = 0
  const MAX_ATTEMPTS = 10
  const DELAY = 1000

  while (attempts < MAX_ATTEMPTS) {
    attempts++
    try {
      const client = new Client({
        connectionString: config.databaseUrl
      })
      await client.connect()

      break
    } catch (e) {
      if (e.code === 'ECONNREFUSED') {
        if (attempts === MAX_ATTEMPTS) {
          console.log(`Max connection attempts of ${MAX_ATTEMPTS} exceeded. Please double check your postgresql url.`)
        }

        // Sleep for 1 second and try again
        await new Promise(resolve => setTimeout(resolve, DELAY))
      } else {
        console.log(e.message)
        return
      }
    }
  }

  const { exec } = require('child_process')
  exec('yarn migrate up', (err, stdout, stderr) => {
    if (err) {
      console.log('Error when executing `yarn migrate up`')
      return
    }

    console.log(`${stdout}`)
    console.log(`${stderr}`)

    process.exit()
  })
}

run()
