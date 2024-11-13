import { Controller, Post, Get, Body, UseGuards } from '@nestjs/common';
import { CarsService } from './cars.service';
import { CreateCarDto } from './dto/create-car.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller('cars')
export class CarsController {
  constructor(private readonly carsService: CarsService) {}

  @Get()
  async getAllCars() {
    return this.carsService.getAllCars();
  }

  @Post('populate')
  @UseGuards(JwtAuthGuard)
  async populateCars() {
    return this.carsService.populateCars();
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async createCar(@Body() createCarDto: CreateCarDto) {
    return this.carsService.createCar(createCarDto);
  }
}
