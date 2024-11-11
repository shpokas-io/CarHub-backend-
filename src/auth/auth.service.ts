import { Injectable, UnauthorizedException } from '@nestjs/common';
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
    const { email, password } = registerDto;
    const supabase = this.supabaseService.getClient();

    const hashedPassword = await hashPassword(password);
    const { data, error } = await supabase
      .from('users')
      .insert([{ email, password: hashedPassword }]);

    if (error) throw new Error(error.message);
    return data;
  }
  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !(await comparePasswords(password, data.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: data.id, email: data.email };
    const token = this.jwtService.sign(payload);
    return { access_token: token };
  }
}
