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

  private readonly carApiUrl: string;
  private readonly carApiKey: string;

  constructor(private readonly configService: ConfigService) {
    this.carApiUrl = 'https://api.api-ninjas.com/v1/cars';
    this.carApiKey = this.configService.get<string>('CAR_API_KEY');
  }

  async fetchCarData(): Promise<any[]> {
    try {
      const carMakes = ['Toyota', 'Honda', 'BMW', 'Mercedes', 'Audi'];
      const carsData = await Promise.all(
        carMakes.map((make) => this.fetchCarsByMake(make)),
      );
      return carsData.flat();
    } catch (error) {
      this.logAndThrowError('Failed to fetch car data', error.message);
    }
  }

  private async fetchCarsByMake(make: string): Promise<any[]> {
    try {
      const response = await axios.get(this.carApiUrl, {
        headers: { 'X-Api-Key': this.carApiKey },
        params: { make },
      });

      return response.data.map((car: any) => this.formatCarData(car));
    } catch (error) {
      this.logAndThrowError(
        `Error fetching cars for make ${make}`,
        error.message,
      );
    }
  }

  private formatCarData(car: any): any {
    return {
      make: car.make,
      model: car.model,
      year: car.year || 2023,
      engine: `${car.displacement || '2.0'}L`,
      transmission: car.transmission || 'Automatic',
      drive: car.drive || 'FWD',
      power: this.calculatePower(car.cylinders, car.displacement),
      car_image: 'https://via.placeholder.com/400x200',
    };
  }

  private calculatePower(cylinders: number, displacement: number): number {
    return Math.round((cylinders || 4) * (displacement || 2.0) * 50);
  }

  private logAndThrowError(logMessage: string, errorMessage: string): never {
    this.logger.error(`${logMessage}: ${errorMessage}`);
    throw new InternalServerErrorException(logMessage);
  }
}
