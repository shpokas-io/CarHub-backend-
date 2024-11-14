import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { SupabaseService } from 'src/supabase/supabase.service';
import { hashPassword } from 'src/common/utils/hash.util';

@Injectable()
export class UsersService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async findUserByUsername(username: string) {
    const supabase = this.supabaseService.getClient();
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .single();

    if (error) {
      throw new NotFoundException('User not found');
    }
    return data;
  }
  async createUser(username: string, password: string) {
    const supabase = this.supabaseService.getClient();

    const existingUser = await this.findUserByUsername(username);
    if (existingUser) {
      throw new BadRequestException('Username is already registered');
    }
    const hashedPassword = await hashPassword(password);

    const { data, error } = await supabase
      .from('users')
      .insert([{ username, password: hashedPassword }])
      .single();

    if (error) {
      throw new BadRequestException('Error creating user');
    }
    return data;
  }

  async getAllUsers() {
    const supabase = this.supabaseService.getClient();
    const { data, error } = await supabase.from('users').select('*');

    if (error) {
      throw new BadRequestException('Error retrieving users');
    }
    return data;
  }

  async findUserById(id: string) {
    const supabase = this.supabaseService.getClient();
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw new NotFoundException('User not found');
    }
    return data;
  }
}
