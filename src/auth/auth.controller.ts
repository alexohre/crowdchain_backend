import { Controller, Post, Body, HttpCode } from '@nestjs/common';
import { LoginDto } from 'src/dto/login.dto';
import { SignupDto } from 'src/dto/signup.dto';
import { AuthService } from './auth.service';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller('auth')
export class AuthController {
  constructor(private authservice: AuthService) {}

  @Post('signup')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  async signup(@Body() dto: SignupDto) {
    await this.authservice.createUser(dto);
  }

  @Post('login')
  @HttpCode(200)
  @ApiOperation({ summary: 'Login user and get access token' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() dto: LoginDto) {
    await this.authservice.loginUser(dto);
  }
}
