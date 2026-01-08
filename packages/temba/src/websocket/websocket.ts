import { WebSocketServer, WebSocket } from 'ws'
import type { Server as HttpServer, IncomingMessage } from 'http'
import { parse } from 'url'

export type BroadcastAction = 'CREATE' | 'UPDATE' | 'DELETE'

export type BroadcastPayload = {
  resource: string
  action: BroadcastAction
  data: object | { id: string }
}

export type BroadcastFunction = (
  resource: string,
  action: BroadcastAction,
  data: object | { id: string },
) => void

export const createWebSocketServer = (httpServer: HttpServer): BroadcastFunction => {
  const wss = new WebSocketServer({ noServer: true })

  // Handle upgrade requests only for /ws path
  httpServer.on('upgrade', (request: IncomingMessage, socket, head) => {
    const { pathname } = parse(request.url || '')

    if (pathname === '/ws') {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request)
      })
    } else {
      socket.destroy()
    }
  })

  // Broadcast function that sends messages to all connected clients
  const broadcast: BroadcastFunction = (resource, action, data) => {
    const payload: BroadcastPayload = {
      resource,
      action,
      data,
    }

    const message = JSON.stringify(payload)

    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message)
      }
    })
  }

  return broadcast
}
