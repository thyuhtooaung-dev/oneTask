import { createParamDecorator, ExecutionContext } from '@nestjs/common';

interface UserPayload {
  id: string;
  email: string;
  name?: string;
}

interface RequestWithUser {
  user?: UserPayload;
}

export const CurrentUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;

    if (!user) {
      return null;
    }

    return data ? user[data as keyof UserPayload] : user;
  },
);
