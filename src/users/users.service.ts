import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { SupabaseService } from 'src/supabase/supabase.service';

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

    console.error('Supabase error:', JSON.stringify(error, null, 2));

    if (error?.code === 'PGRST116' && error.details?.includes('0 rows')) {
      throw new NotFoundException('User not found');
    } else if (error) {
      throw new BadRequestException('Database query failed');
    }

    return data;
  }

  async isUsernameTaken(username: string): Promise<boolean> {
    const supabase = this.supabaseService.getClient();
    const { data, error } = await supabase
      .from('users')
      .select('id')
      .eq('username', username);

    if (error) {
      throw new BadRequestException('Error checking username availability');
    }

    return data.length > 0;
  }

  async createUser(username: string, password: string) {
    const supabase = this.supabaseService.getClient();

    const isTaken = await this.isUsernameTaken(username);
    if (isTaken) {
      throw new BadRequestException('Username is already registered');
    }

    const { data, error } = await supabase
      .from('users')
      .insert([{ username, password }])
      .single();

    if (error) {
      throw new BadRequestException('Error creating user');
    }

    return data;
  }
}
