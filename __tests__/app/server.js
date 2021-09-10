import 'dotenv/config'
import { create } from '../../dist/server.js'

const config = {
  resourceNames: ['movies'],
  //connectionString: process.env.MONGO_URL,
  pathPrefix: 'api',
}

const server = create(config)

const port = process.env.PORT || 3000
server.listen(port, () => {
  console.log(`Temba is running on port ${port}`)
})
