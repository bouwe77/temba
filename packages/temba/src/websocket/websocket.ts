import { WebSocketServer, WebSocket } from 'ws'
import type { Server as HttpServer, IncomingMessage } from 'http'
import { parse } from 'url'

export type BroadcastAction = 'CREATE' | 'UPDATE' | 'DELETE' | 'DELETE_ALL'

export type BroadcastPayload =
  | {
      resource: string
      action: 'CREATE' | 'UPDATE' | 'DELETE'
      data: object | { id: string }
    }
  | {
      resource: string
      action: 'DELETE_ALL'
    }

export type BroadcastFunction = (
  resource: string,
  action: BroadcastAction,
  data?: object | { id: string },
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
    let payload: BroadcastPayload

    if (action === 'DELETE_ALL') {
      payload = {
        resource,
        action,
      }
    } else {
      if (!data) {
        throw new Error(`Data is required for action: ${action}`)
      }
      payload = {
        resource,
        action,
        data,
      }
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
