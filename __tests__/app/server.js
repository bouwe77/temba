import { create } from '../../dist/index.js'

const config = {
  resourceNames: ['movies'],
}
const server = create(config)

const port = 3888
server.listen(port, () => {
  console.log(`Temba is running on port ${port}`)
})
