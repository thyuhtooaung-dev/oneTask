import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { WORKSPACE_ROLES_KEY } from '../decorators/workspace-roles.decorator';
import {
  WorkspaceRole,
  WorkspaceMember,
} from '../entities/workspace-member.entity';

@Injectable()
export class WorkspaceRoleGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<WorkspaceRole[]>(
      WORKSPACE_ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles || requiredRoles.length === 0) {
      return true; // No specific roles required, allow access
    }

    interface CustomRequest extends Request {
      workspaceMember?: WorkspaceMember;
    }
    const request = context.switchToHttp().getRequest<CustomRequest>();
    const workspaceMember = request.workspaceMember;

    if (!workspaceMember) {
      // This should ideally not happen if WorkspaceMemberGuard is used before this guard
      throw new ForbiddenException(
        'Workspace membership is required to access this resource',
      );
    }

    if (!requiredRoles.includes(workspaceMember.role)) {
      throw new ForbiddenException(
        'You do not have the required role to perform this action',
      );
    }

    return true;
  }
}
