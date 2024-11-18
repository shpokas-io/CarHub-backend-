import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { SupabaseService } from 'src/supabase/supabase.service';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { hashPassword, comparePasswords } from 'src/common/utils/hash.util';
import { Logger } from '@nestjs/common';

@Injectable()
export class AuthService {
  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    try {
      const { username, password } = registerDto;
      const hashedPassword = await this.hashPassword(password);
      const user = await this.createUser(username, hashedPassword);
      return user;
    } catch (error) {
      throw new InternalServerErrorException(
        'Error while registering user',
        error.message,
      );
    }
  }

  private readonly logger = new Logger(AuthService.name);

  async login(loginDto: LoginDto) {
    const { username, password } = loginDto;

    try {
      const user = await this.findUserByUsername(username);

      if (!user) {
        this.logger.warn(`Login failed: Username not found (${username})`);
        throw new UnauthorizedException('Username not found');
      }

      const isPasswordValid = await this.comparePasswords(
        password,
        user.password,
      );

      if (!isPasswordValid) {
        this.logger.warn(`Login failed: Incorrect password (${username})`);
        throw new UnauthorizedException('Incorrect password');
      }

      const token = this.generateJwtToken(user.id, user.username);
      return { access_token: token };
    } catch (error) {
      this.logger.error(`Login error for username: ${username}`);
      throw error;
    }
  }

  private async hashPassword(password: string): Promise<string> {
    try {
      return await hashPassword(password);
    } catch (error) {
      throw new InternalServerErrorException(
        'Error while hashing password',
        error.message,
      );
    }
  }

  private async createUser(username: string, hashedPassword: string) {
    const supabase = this.supabaseService.getClient();
    const { data, error } = await supabase
      .from('users')
      .insert([{ username, password: hashedPassword }])
      .single();

    if (error) {
      throw new InternalServerErrorException(
        'Error while creating user in database',
        error.message,
      );
    }
    return data;
  }

  private async findUserByUsername(username: string) {
    const supabase = this.supabaseService.getClient();
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .single();

    if (error && error.details.includes('no rows')) {
      throw new NotFoundException('Username not found');
    } else if (error) {
      throw new InternalServerErrorException('Database query failed');
    }
    return data;
  }

  private async comparePasswords(
    plainPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    try {
      return await comparePasswords(plainPassword, hashedPassword);
    } catch (error) {
      throw new InternalServerErrorException(
        'Error while comparing passwords',
        error.message,
      );
    }
  }

  private generateJwtToken(userId: string, username: string): string {
    const payload = { sub: userId, username: username };
    return this.jwtService.sign(payload);
  }
}
