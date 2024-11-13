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
  private readonly unsplashApiUrl = 'https://api.unsplash.com/search/photos';

  constructor(private readonly configService: ConfigService) {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async fetchCarData(_make: string) {
    const carApiKey = this.configService.get<string>('CAR_API_KEY');
    const unsplashAccessKey = this.configService.get<string>(
      'UNSPLASH_ACCESS_KEY',
    );

    try {
      const carMake = this.getRandomCarMake(); // Get random car make
      const carResponse = await axios.get(this.carApiUrl, {
        headers: { 'X-Api-Key': carApiKey },
        params: { make: carMake },
      });

      // Get a random selection of 10 cars with different makes and years
      const carDetails = this.selectRandomCars(carResponse.data, 10);

      const carsData = await Promise.all(
        carDetails.map(async (car) => {
          const year = this.getRandomYear();
          const power = this.calculatePower(car.cylinders, car.displacement);

          const carImageUrl = await this.fetchCarImage(
            car.make,
            car.model,
            year,
            unsplashAccessKey,
          );

          return {
            make: car.make,
            model: car.model,
            year: year,
            engine:
              car.engine ||
              (car.displacement ? `${car.displacement}L` : 'unknown'),
            color: 'Default Color',
            power: power,
            cylinder: car.cylinders || null,
            drive: car.drive || 'unknown',
            car_image: carImageUrl,
          };
        }),
      );

      return carsData;
    } catch (error) {
      this.logger.error(`Error fetching car data: ${error.message}`);
      throw new InternalServerErrorException('Failed to fetch car data');
    }
  }

  private getRandomCarMake(): string {
    const carMakes = [
      'Toyota',
      'Ford',
      'Honda',
      'Chevrolet',
      'Nissan',
      'BMW',
      'Mercedes',
      'Audi',
    ];
    return carMakes[Math.floor(Math.random() * carMakes.length)];
  }

  private getRandomYear(): number {
    return Math.floor(Math.random() * (2022 - 1980 + 1)) + 1980;
  }

  private calculatePower(cylinders: number, displacement: number): number {
    return cylinders && displacement
      ? Math.round(cylinders * displacement * 20)
      : 100;
  }

  private selectRandomCars(carList: any[], count: number) {
    const shuffled = [...carList].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  private async fetchCarImage(
    make: string,
    model: string,
    year: number,
    accessKey: string,
  ) {
    try {
      const query = `${make} ${model} ${year} car exterior`;
      const response = await axios.get(this.unsplashApiUrl, {
        params: {
          query,
          client_id: accessKey,
          per_page: 5,
          orientation: 'landscape',
        },
      });

      const selectedImage =
        response.data.results.find((img) =>
          img.alt_description?.toLowerCase().includes('exterior'),
        ) || response.data.results[0];

      return (
        selectedImage?.urls.regular || 'https://via.placeholder.com/400x200'
      );
    } catch (error) {
      this.logger.warn(
        `Unsplash API error for ${make} ${model} ${year}: ${error.message}`,
      );
      return 'https://via.placeholder.com/400x200';
    }
  }
}
