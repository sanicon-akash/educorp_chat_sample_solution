import {
  Count,
  CountSchema,
  Filter,
  FilterExcludingWhere,
  repository,
  Where,
} from '@loopback/repository';
import {
  post,
  param,
  get,
  getModelSchemaRef,
  patch,
  put,
  del,
  requestBody,
  response,
} from '@loopback/rest';
import {Message} from '../models';
import {MessageRepository} from '../repositories';
// import {Server, ServerOptions} from 'socket.io';
// import {Server, ServerOptions} from 'socket.io';
import io from 'socket.io-client'; // Import socket.io-client

const socket = io('http://[::1]:3000'); // Connect to the server-side socket

export class MessageController {
  constructor(
    @repository(MessageRepository)
    public messageRepository: MessageRepository,
  ) // private io: Server
  // @io.socketIo() private io: Socket
  {}

  @post('/messages')
  @response(200, {
    description: 'Message model instance',
    content: {'application/json': {schema: getModelSchemaRef(Message)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Message, {
            title: 'NewMessage',
            exclude: ['id'],
          }),
        },
      },
    })
    message: Omit<Message, 'id'>,
  ): Promise<Message> {
    const createdMessage = await this.messageRepository.create(message);
    socket.emit('new message', createdMessage); // Emit socket event
    return createdMessage;
  }

  @get('/messages/count')
  @response(200, {
    description: 'Message model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(@param.where(Message) where?: Where<Message>): Promise<Count> {
    return this.messageRepository.count(where);
  }

  @get('/messages')
  @response(200, {
    description: 'Array of Message model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Message, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(Message) filter?: Filter<Message>,
  ): Promise<Message[]> {
    return this.messageRepository.find(filter);
  }

  @patch('/messages')
  @response(200, {
    description: 'Message PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Message, {partial: true}),
        },
      },
    })
    message: Message,
    @param.where(Message) where?: Where<Message>,
  ): Promise<Count> {
    return this.messageRepository.updateAll(message, where);
  }

  @get('/messages/{id}')
  @response(200, {
    description: 'Message model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Message, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.number('id') id: number,
    @param.filter(Message, {exclude: 'where'})
    filter?: FilterExcludingWhere<Message>,
  ): Promise<Message> {
    return this.messageRepository.findById(id, filter);
  }

  @patch('/messages/{id}')
  @response(204, {
    description: 'Message PATCH success',
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Message, {partial: true}),
        },
      },
    })
    message: Message,
  ): Promise<void> {
    await this.messageRepository.updateById(id, message);
    const updatedMessage = await this.messageRepository.findById(id);
    socket.emit('updated message', updatedMessage);
  }

  @put('/messages/{id}')
  @response(204, {
    description: 'Message PUT success',
  })
  async replaceById(
    @param.path.number('id') id: number,
    @requestBody() message: Message,
  ): Promise<void> {
    await this.messageRepository.replaceById(id, message);
  }

  @del('/messages/{id}')
  @response(204, {
    description: 'Message DELETE success',
  })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    // const deletedMessage = await this.messageRepository.findById(id);
    // await this.messageRepository.deleteById(id);
    // this.io.emit('delete message', deletedMessage);

    await this.messageRepository.deleteById(id);
    const deletedMessage = await this.messageRepository.findById(id);
    socket.emit('delete message', deletedMessage);
  }
}
