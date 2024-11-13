import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import axios from 'axios';
import { SupabaseService } from 'src/supabase/supabase.service';
import { CreateCarDto } from './dto/create-car.dto';

@Injectable()
export class CarsService {
  private readonly logger = new Logger(CarsService.name);
  private readonly carApiUrl = 'https://api.api-ninjas.com/v1/cars';
  private readonly carImageApiUrl = 'https://carimageryapi.com/api/v1/carimage';
  private readonly carApiKey = 'cSDlnzA/mHmTGZrsV3+i2A==XdomjFgHwjSGstNi';
  constructor(private readonly supabaseService: SupabaseService) {}

  async populateCars(make: string) {
    try {
      const carDetailsResponse = await axios.get(this.carApiKey, {
        headers: { 'X-Api-Key': this.carApiKey },
        params: { make },
      });

      const carDetails = carDetailsResponse.data;

      const carsToInsert = await Promise.all(
        carDetails.map(async (car) => {
          let carImageUrl = '';
          try {
            const imageResponse = await axios.get(this.carImageApiUrl, {
              params: { model: car.model, year: car.year },
            });
            carImageUrl = imageResponse.data.image_url || '';
          } catch (error) {
            this.logger.warn(
              `Image not found for ${car.model} ${car.year}: ${error.message}`,
            );
          }

          return {
            make: car.make,
            model: car.model,
            year: car.year,
            engine: car.engine || 'unknown',
            color: 'Default Color',
            power: car.horsepower || 0,
            car_image: carImageUrl,
          };
        }),
      );

      const supabase = this.supabaseService.getClient();
      const { error } = await supabase.from('cars').insert(carsToInsert);

      if (error) {
        throw new InternalServerErrorException(
          `Error inserting cars: ${error.message}`,
        );
      }

      this.logger.log(
        `Successfully inserted ${carsToInsert.length} cars into the database`,
      );
      return carsToInsert;
    } catch (error) {
      this.logger.error(`Failed to populate cars: ${error.message}`);
      throw new InternalServerErrorException(
        `Failed to populate cars: ${error.message}`,
      );
    }
  }

  async getAllCars() {
    try {
      const { data, error } = await this.supabaseService
        .getClient()
        .from('cars')
        .select('*');

      if (error) {
        throw new InternalServerErrorException(
          'Error fetching cars from the database',
          error.message,
        );
      }
      return data;
    } catch (error) {
      throw new InternalServerErrorException(
        'Error fetching cars',
        error.message,
      );
    }
  }

  async createCar(createCarDto: CreateCarDto) {
    try {
      const {
        make,
        model,
        year,
        color,
        engine,
        transmission,
        drive,
        cylinder,
      } = createCarDto;
      const { data, error } = await this.supabaseService
        .getClient()
        .from('cars')
        .insert([
          { make, model, year, color, engine, transmission, drive, cylinder },
        ])
        .single();

      if (error) {
        throw new InternalServerErrorException(
          'Error creating car in the database',
          error.message,
        );
      }
      return data;
    } catch (error) {
      throw new InternalServerErrorException(
        'Error creating car',
        error.message,
      );
    }
  }
}
