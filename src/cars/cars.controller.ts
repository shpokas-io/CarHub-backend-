import {
  Controller,
  Get,
  Post,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CarsService } from './cars.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller('cars')
export class CarsController {
  constructor(private readonly carsService: CarsService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async getAllCars() {
    return await this.carsService.getAllCars();
  }

  @Post('populate')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard)
  async populateCars() {
    return await this.carsService.populateCars();
  }
}
