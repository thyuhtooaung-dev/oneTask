import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { WorkspaceMember } from '../workspaces/entities/workspace-member.entity';
import { RealtimeGateway } from './realtime.gateway';

@Module({
  imports: [AuthModule, TypeOrmModule.forFeature([WorkspaceMember])],
  providers: [RealtimeGateway],
  exports: [RealtimeGateway],
})
export class RealtimeModule {}
