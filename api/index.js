import { create } from '../dist/src/index.js'

const server = create({
    port: 4321,
})

server.start()