import { Controller, Get, Post, Body, Patch, Param, Delete, Logger } from "@nestjs/common";
import { AuthService } from './auth.service';
import { UserSignInDto } from './dto/user-sign.in.dto';
import { UserSignUpDto } from './dto/user-sign.up.dto';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name)

  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  async singUp(@Body() userSignUpDto: UserSignUpDto) {
    this.logger.log(`singUp: ${JSON.stringify(userSignUpDto)}`)
    return await this.authService.singUp(userSignUpDto)
  }

  @Post('signin')
  async singIn(@Body() userSignInDto: UserSignInDto) {
    this.logger.log(`singIn: ${JSON.stringify(userSignInDto)}`)
    return await this.authService.singIn(userSignInDto)
  }
}