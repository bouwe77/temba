import type { Server as HttpServer, IncomingMessage } from 'http'
import { parse } from 'url'
import { WebSocket, WebSocketServer } from 'ws'

/** @internal */
export type BroadcastAction = 'CREATE' | 'UPDATE' | 'DELETE' | 'DELETE_ALL'

/** @internal */
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

/** @internal */
export type BroadcastFunction = (
  resource: string,
  action: BroadcastAction,
  data?: object | { id: string },
) => void

export const createWebSocketServer = (httpServer: HttpServer): BroadcastFunction => {
  const wss = new WebSocketServer({ noServer: true })

  // Handle upgrade requests
  httpServer.on('upgrade', (request: IncomingMessage, socket, head) => {
    const { pathname } = parse(request.url || '')

    // WebSockets handshakes MUST be GET requests
    if (pathname === '/ws' && request.method === 'GET') {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request)
      })
    } else {
      // Not our path or invalid method for a handshake
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

    try {
      const message = JSON.stringify(payload)

      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(message)
        }
      })
    } catch (error) {
      // Log error but don't crash the server if data is non-serializable
      console.error('Failed to stringify WebSocket payload:', error)
    }
  }

  return broadcast
}
