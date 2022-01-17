import 'dotenv/config'
import { create } from '../../../dist/server.js'

const port = process.env.PORT || 3000

const server = create()

server.listen(port, () => {
  console.log(`Temba is running on port ${port}`)
})
