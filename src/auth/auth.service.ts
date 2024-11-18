import {
  Injectable,
  UnauthorizedException,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UsersService } from '../users/users.service';
import { hashPassword, comparePasswords } from 'src/common/utils/hash.util';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}

  async register(registerDto: RegisterDto) {
    try {
      const { username, password } = registerDto;

      const isUsernameTaken = await this.usersService.isUsernameTaken(username);
      if (isUsernameTaken) {
        throw new UnauthorizedException('Username is already registered');
      }

      const hashedPassword = await hashPassword(password);
      const user = await this.usersService.createUser(username, hashedPassword);

      return user;
    } catch (error) {
      this.logger.error(`Registration error: ${error.message}`);
      throw error;
    }
  }

  async login(loginDto: LoginDto) {
    const { username, password } = loginDto;

    try {
      this.logger.debug(`Attempting login for username: ${username}`);
      const user = await this.usersService.findUserByUsername(username);

      const isPasswordValid = await comparePasswords(password, user.password);
      if (!isPasswordValid) {
        this.logger.warn(`Invalid credentials for username: ${username}`);
        throw new UnauthorizedException('Invalid credentials');
      }

      const token = this.generateJwtToken(user.id, user.username);
      return { access_token: token };
    } catch (error) {
      if (error instanceof NotFoundException) {
        this.logger.warn(`Invalid login attempt: User not found`);
        throw new UnauthorizedException('Invalid credentials');
      }

      if (error instanceof UnauthorizedException) {
        this.logger.warn(`Invalid login attempt: ${error.message}`);
        throw error;
      }

      this.logger.error(
        `Unexpected login error for username: ${username}`,
        error.stack,
      );
      throw new InternalServerErrorException('An unexpected error occurred');
    }
  }

  private generateJwtToken(userId: string, username: string): string {
    const payload = { sub: userId, username };
    return this.jwtService.sign(payload);
  }
}
