import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Server, Socket } from 'socket.io';
import { WorkspaceMember } from '../workspaces/entities/workspace-member.entity';

interface SocketUser {
  id: string;
  email: string;
  name?: string;
}

interface AuthenticatedSocket extends Socket {
  data: {
    user?: SocketUser;
  };
}

@WebSocketGateway({
  cors: {
    origin: ['http://localhost:3000', 'https://one-task-sand.vercel.app'],
  },
})
export class RealtimeGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  private readonly server: Server;

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @InjectRepository(WorkspaceMember)
    private readonly workspaceMemberRepository: Repository<WorkspaceMember>,
  ) {}

  async handleConnection(client: AuthenticatedSocket) {
    const token = this.extractToken(client);
    if (!token) {
      client.disconnect(true);
      return;
    }

    try {
      const payload = await this.jwtService.verifyAsync<{
        sub: string;
        email: string;
        name?: string;
      }>(token);

      client.data.user = {
        id: payload.sub,
        email: payload.email,
        name: payload.name,
      };
    } catch {
      client.disconnect(true);
    }
  }

  handleDisconnect(client: AuthenticatedSocket) {
    client.removeAllListeners();
  }

  @SubscribeMessage('joinWorkspace')
  async joinWorkspace(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() body: { workspaceId?: string },
  ) {
    const user = client.data.user;
    const workspaceId = body?.workspaceId;

    if (!user || !workspaceId) {
      return { ok: false };
    }

    const membership = await this.workspaceMemberRepository.findOne({
      where: {
        workspaceId,
        userId: user.id,
      },
    });

    if (!membership) {
      return { ok: false };
    }

    await client.join(this.workspaceRoom(workspaceId));
    return { ok: true };
  }

  @SubscribeMessage('leaveWorkspace')
  async leaveWorkspace(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() body: { workspaceId?: string },
  ) {
    if (body?.workspaceId) {
      await client.leave(this.workspaceRoom(body.workspaceId));
    }

    return { ok: true };
  }

  broadcastToWorkspace<TPayload>(
    workspaceId: string,
    eventName: string,
    payload: TPayload,
  ) {
    this.server.to(this.workspaceRoom(workspaceId)).emit(eventName, payload);
  }

  /**
   * Removes a specific user from a workspace room.
   * Called when a member is removed from the workspace so they
   * stop receiving real-time events immediately.
   */
  async removeUserFromWorkspace(userId: string, workspaceId: string) {
    const room = this.workspaceRoom(workspaceId);
    const sockets = await this.server.in(room).fetchSockets();
    for (const socket of sockets) {
      const socketUser = (socket as unknown as AuthenticatedSocket).data?.user;
      if (socketUser?.id === userId) {
        socket.leave(room);
        socket.emit('workspace_removed', { workspaceId });
      }
    }
  }

  private workspaceRoom(workspaceId: string) {
    return `workspace:${workspaceId}`;
  }

  private extractToken(client: Socket): string | undefined {
    const authHeader = client.handshake.headers.authorization;
    if (authHeader) {
      const [type, token] = authHeader.split(' ');
      if (type === 'Bearer' && token) {
        return token;
      }
    }

    const queryToken = client.handshake.query.token;
    if (Array.isArray(queryToken)) {
      return queryToken[0];
    }

    if (queryToken) {
      return queryToken;
    }

    const authToken = client.handshake.auth?.token as unknown;
    return typeof authToken === 'string' ? authToken : undefined;
  }
}
