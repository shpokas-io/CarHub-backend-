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
    console.log('Hashed Password:', hashedPassword);
    const { data, error } = await supabase
      .from('users')
      .insert([{ email, password: hashedPassword }])
      .single();

    if (error) throw new Error(error.message);
    console.log('Error during user creation:', error);
    console.log('User created:', data);
    return data;
  }
  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;
    const supabase = this.supabaseService.getClient();

    console.log('Attempting to login with email:', email);

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    console.log('Supabase Query Data:', data);
    console.log('Supabase Query Error:', error);

    if (error) {
      console.log('Error or no user found:', error);
    }

    console.log('User data retrieved:', data);

    if (error || !data) {
      console.log('Error or no user found', email);
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordMatching = await comparePasswords(password, data.password);
    console.log('Password comparison result:', isPasswordMatching);

    if (!isPasswordMatching) {
      console.log('Password mismatch');
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: data.id, email: data.email };
    const token = this.jwtService.sign(payload);
    return { access_token: token };
  }
}
