import { Server } from 'socket.io';
import { Application } from '@loopback/core';
import { Socket } from 'socket.io';

export class SocketServer {
  private io: Server;

  constructor(private app: Application) {}

  async start() {
    if (this.io) {
      // Don't start if already started
      return;
    }

    const httpServer = await this.app.getServer('http');
    //@ts-ignore
    this.io = new Server(httpServer, {
      path: '/socket.io',
      cors: {
        origin: '*',
      },
    });

    // Set up socket.io event handlers
    this.io.on('connection', (socket: Socket) => {
      console.log(socket)
      console.log('New client connected');

      socket.on('disconnect', () => {
        console.log('Client disconnected');
      });

      // Listen for new messages from clients
      socket.on('new message', (message : any) => {
        this.io.emit('new message', message);
        console.log(message)
      });

      // Listen for updates to existing messages
      socket.on('update message', (message : any) => {
        this.io.emit('update message', message);
        console.log(message)
      });

      // Listen for message deletions
      socket.on('delete message', (messageId : any) => {
        this.io.emit('delete message', messageId);
        console.log(messageId)
      });
    });
  }
}
