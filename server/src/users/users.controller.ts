import { Controller, Patch, Body, UseGuards, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateProfileDto } from '../common/dto/update-profile.dto';
import { UpdatePasswordDto } from '../common/dto/update-password.dto';
import { AuthGuard } from '../auth/auth.guard';

@UseGuards(AuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Patch('me')
  async updateProfile(
    @Request() req: { user: { id: string } },
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    const user = await this.usersService.updateProfile(
      req.user.id,
      updateProfileDto,
    );
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl,
    };
  }

  @Patch('me/password')
  async updatePassword(
    @Request() req: { user: { id: string } },
    @Body() updatePasswordDto: UpdatePasswordDto,
  ) {
    await this.usersService.updatePassword(req.user.id, updatePasswordDto);
    return { message: 'Password updated successfully' };
  }
}
