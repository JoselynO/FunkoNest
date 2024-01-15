import { WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Logger } from "@nestjs/common";
import { ResponseFunkoDto } from "../../funkos/dto/response-funko.dto";
import { Notificacion } from "./entities/notification.entity";
import { Server, Socket } from 'socket.io'
import { ResponseCategoriaDto } from "../../categorias/dto/response-categoria.dto";
const ENDPOINT: string = `/ws/${process.env.API_VERSION || 'v1'}/funkos`
@WebSocketGateway({namespace: ENDPOINT})
export class NotificationsGateway {
  @WebSocketServer()
  private server: Server
  private readonly logger = new Logger(NotificationsGateway.name)

  constructor() {
    this.logger.log(`NotificationsGateway is listening on ${ENDPOINT}`)
  }

  sendMessage(notification: Notificacion<ResponseCategoriaDto | ResponseFunkoDto>){
    notification.entity == "FUNKOS" ? this.server.emit('funkos', notification) : this.server.emit('categorias', notification);
  }

  private handleConnection(client: Socket) {
    this.logger.debug('Cliente conectado:', client.id)
    this.server.emit(
      'connection',
      'Updates Notifications WS: Funkos - Tienda FunkoNest',
    )
  }

  private handleDisconnect(client: Socket) {
    console.log('Cliente desconectado:', client.id)
    this.logger.debug('Cliente desconectado:', client.id)
  }
}