// import {BootMixin} from '@loopback/boot';
// import {ApplicationConfig, CoreBindings, inject} from '@loopback/core';
// import {RepositoryMixin} from '@loopback/repository';
// import {RestApplication, RestServer} from '@loopback/rest';
// import {
//   RestExplorerBindings,
//   RestExplorerComponent,
// } from '@loopback/rest-explorer';
// import {ServiceMixin} from '@loopback/service-proxy';
// import path from 'path';
// import {MySequence} from './sequence';
// import {Socket, Server} from 'socket.io';
// import {SocketIoBindings, SocketIoServer} from '@loopback/socketio';

// export {ApplicationConfig};

// export class EducorpApplication extends BootMixin(
//   ServiceMixin(RepositoryMixin(RestApplication)),
// ) {
//   public io: Server;
//   constructor(
//     @inject(CoreBindings.APPLICATION_CONFIG) options: ApplicationConfig = {},
//   ) {
//     super(options);

//     // Set up the custom sequence
//     this.sequence(MySequence);

//     // Set up default home page
//     this.static('/', path.join(__dirname, '../public'));

//     // Customize @loopback/rest-explorer configuration here
//     this.configure(RestExplorerBindings.COMPONENT).to({
//       path: '/explorer',
//     });
//     this.component(RestExplorerComponent);

//     this.projectRoot = __dirname;
//     // Customize @loopback/boot Booter Conventions here
//     this.bootOptions = {
//       controllers: {
//         // Customize ControllerBooter Conventions here
//         dirs: ['controllers'],
//         extensions: ['.controller.js'],
//         nested: true,
//       },
//     };
//   }

//   async startServer() {
//     try {
//       console.log('first socket');
//       await super.start();
//       const io = require('socket.io')(this.restServer.httpServer);
//       this.io = io;
//       this.io.on('connection', (socket: Socket) => {
//         console.log(`Client connected: ${socket.id}`);
//         console.log('New client connected');
//         socket.on('disconnect', () => {
//           console.log(`Client disconnected: ${socket.id}`);
//         });
//       });
//     } catch (error) {
//       console.log(error);
//     }

//     this.bind(SocketIoBindings.IO).to(this.io);
//   }

//   async stopServer() {
//     await super.stop();
//     if (this.io) {
//       this.io.close();
//     }
//   }
// }

import {BootMixin} from '@loopback/boot';
import {ApplicationConfig, CoreBindings, inject} from '@loopback/core';
import {RepositoryMixin} from '@loopback/repository';
import {RestApplication, RestServer} from '@loopback/rest';
import {
  RestExplorerBindings,
  RestExplorerComponent,
} from '@loopback/rest-explorer';
import {ServiceMixin} from '@loopback/service-proxy';
import path from 'path';
import {MySequence} from './sequence';
import {Socket, Server} from 'socket.io';
import {SocketIoBindings, SocketIoServer} from '@loopback/socketio';

export {ApplicationConfig};

export class EducorpApplication extends BootMixin(
  ServiceMixin(RepositoryMixin(RestApplication)),
) {
  public io: Server;

  constructor(
    @inject(CoreBindings.APPLICATION_CONFIG) options: ApplicationConfig = {},
  ) {
    super(options);

    // Set up the custom sequence
    this.sequence(MySequence);

    // Set up default home page
    this.static('/', path.join(__dirname, '../public'));

    // Customize @loopback/rest-explorer configuration here
    this.configure(RestExplorerBindings.COMPONENT).to({
      path: '/explorer',
    });
    this.component(RestExplorerComponent);

    this.projectRoot = __dirname;
    // Customize @loopback/boot Booter Conventions here
    this.bootOptions = {
      controllers: {
        // Customize ControllerBooter Conventions here
        dirs: ['controllers'],
        extensions: ['.controller.js'],
        nested: true,
      },
    };
  }

  async startServer() {
    await super.start();

    const io = require('socket.io')(this.restServer.httpServer);
    this.io = io;
    this.bind(SocketIoBindings.IO).to(this.io);

    console.log('Socket server started');

    this.io.on('connection', (socket: Socket) => {
      console.log(`Client connected: ${socket.id}`);
      console.log('New client connected');
      socket.on('disconnect', () => {
        console.log(`Client disconnected: ${socket.id}`);
      });

      // Listen for new messages from clients
      socket.on('new message', (message: any) => {
        this.io.emit('new message', message);
        console.log(message);
      });

      // Listen for updates to existing messages
      socket.on('update message', (message: any) => {
        this.io.emit('update message', message);
        console.log(message);
      });

      // Listen for message deletions
      socket.on('delete message', (messageId: any) => {
        this.io.emit('delete message', messageId);
        console.log(messageId);
      });
    });
  }

  async stopServer() {
    await super.stop();
    if (this.io) {
      this.io.close();
    }
  }
}
