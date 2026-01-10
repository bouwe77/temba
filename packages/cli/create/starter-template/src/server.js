import { create } from 'temba'

const server = await create({
  port: 8362,
})

server.start()
