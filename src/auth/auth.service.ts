import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  InternalServerErrorException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/models/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { SignupDto } from 'src/dto/signup.dto';
import { LoginDto } from 'src/dto/login.dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private userservice: Repository<User>,
    private JwtService: JwtService,
  ) {}

  async createUser(dto: SignupDto) {
    try {
      const user = await this.userservice.findOne({
        where: { email: dto.email },
      });
      if (user) throw new ConflictException('user already exist');

      const salt = await bcrypt.genSalt();
      const hashedpassword = await bcrypt.hash(dto.password, salt);

      const newUser = await this.userservice.create({
        ...dto,
        password: hashedpassword,
      });
      return newUser;
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error; // let it pass through
      }
      throw new InternalServerErrorException(`Failed to create user`);
    }
  }

  async loginUser(dto: LoginDto) {
    try {
      const user = await this.userservice.findOne({
        where: { email: dto.email },
      });
      if (!user) throw new BadRequestException('user does not exist');
      const isMatch = await bcrypt.compare(dto.password, user.password);

      if (!isMatch) throw new UnauthorizedException('invalid password');
      const payload = { sub: user.id, email: user.email };

      return {
        message: 'success',
        access_token: await this.JwtService.signAsync(payload),
      };
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof UnauthorizedException
      ) {
        throw error;
      }
    }
    throw new InternalServerErrorException(
      'An unexpected error occurred during login.',
    );
  }
}
