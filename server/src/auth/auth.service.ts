import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(registerDto: {
    email: string;
    password?: string;
    name?: string;
  }) {
    const { email, password, name } = registerDto;

    // 1. Verify email uniqueness
    const existingUser = await this.usersService.findOneByEmail(email);
    if (existingUser) {
      throw new ConflictException('Email is already in use');
    }

    // 2. Hash the password securely
    const hashedPassword = await bcrypt.hash(password || '', 10);

    // 3. Create the user
    const user = await this.usersService.create({
      email,
      password: hashedPassword,
      name,
    });

    // 4. Generate signed JWT token for instant login
    const payload = { sub: user.id, email: user.email, name: user.name };
    const accessToken = await this.jwtService.signAsync(payload);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      accessToken,
    };
  }

  async login(loginDto: { email: string; password?: string }) {
    const { email, password } = loginDto;

    // 1. Find user
    const user = await this.usersService.findOneByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // 2. Verify password match
    const isPasswordValid = await bcrypt.compare(password || '', user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // 3. Generate signed JWT token
    const payload = { sub: user.id, email: user.email, name: user.name };
    const accessToken = await this.jwtService.signAsync(payload);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      accessToken,
    };
  }
}
