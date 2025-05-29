import { create } from 'temba'

const server = create({
  port: 8362,
})

server.start()
