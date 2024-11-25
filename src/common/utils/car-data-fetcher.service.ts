import {
  Injectable,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CarDataFetcherService {
  private readonly logger = new Logger(CarDataFetcherService.name);
  private readonly carApiUrl = 'https://api.api-ninjas.com/v1/cars';

  constructor(private readonly configService: ConfigService) {}

  async fetchCarData() {
    const carApiKey = this.configService.get<string>('CAR_API_KEY');

    try {
      const carMakes = ['Toyota', 'Honda', 'BMW', 'Mercedes', 'Audi'];
      const carsData = await Promise.all(
        carMakes.map(async (make) => {
          const response = await axios.get(this.carApiUrl, {
            headers: { 'X-Api-Key': carApiKey },
            params: { make },
          });

          return response.data.map((car: any) => ({
            make: car.make,
            model: car.model,
            year: car.year || 2023,
            engine: `${car.displacement || '2.0'}L`,
            transmission: car.transmission || 'Automatic',
            drive: car.drive || 'FWD',
            power: this.calculatePower(car.cylinders, car.displacement),
            car_image: 'https://via.placeholder.com/400x200',
          }));
        }),
      );

      return carsData.flat();
    } catch (error) {
      this.logger.error(`Error fetching car data: ${error.message}`);
      throw new InternalServerErrorException('Failed to fetch car data');
    }
  }

  private calculatePower(cylinders: number, displacement: number): number {
    return Math.round((cylinders || 4) * (displacement || 2.0) * 50);
  }
}
