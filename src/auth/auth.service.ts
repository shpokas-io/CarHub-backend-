import {
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { SupabaseService } from 'src/supabase/supabase.service';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { hashPassword, comparePasswords } from 'src/common/utils/hash.util';

@Injectable()
export class AuthService {
  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    try {
      const { email, password } = registerDto;
      const hashedPassword = await this.hashPassword(password);
      const user = await this.createUser(email, hashedPassword);
      return user;
    } catch (error) {
      throw new InternalServerErrorException(
        'Error while registering user',
        error.message,
      );
    }
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;
    const user = await this.findUserByEmail(email);

    if (!user || !(await this.comparePasswords(password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const token = this.generateJwtToken(user.id, user.email);
    return { access_token: token };
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

  private async createUser(email: string, hashedPassword: string) {
    const supabase = this.supabaseService.getClient();
    const { data, error } = await supabase
      .from('users')
      .insert([{ email, password: hashedPassword }])
      .single();

    if (error) {
      throw new InternalServerErrorException(
        'Error while creating user in database',
        error.message,
      );
    }
    return data;
  }

  private async findUserByEmail(email: string) {
    const supabase = this.supabaseService.getClient();
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error) {
      throw new InternalServerErrorException(
        'Error while fetching user from databse',
        error.message,
      );
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

  private generateJwtToken(userId: string, email: string): string {
    const payload = { sub: userId, email: email };
    return this.jwtService.sign(payload);
  }
}
