import { Body, Controller, Inject, Post, Session } from '@nestjs/common';
import { AuthService } from '../services';
import { User, UserLogin, UserLogout } from 'src/models';
import { UserRepository } from 'src/repositories';

// Register, Login, Logout, Forgot Password, Reset Password
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    @Inject(UserRepository) public userRepository: UserRepository,
  ) {}

  @Post('login')
  async login(
    @Body() body: UserLogin,
    @Session() session: Record<string, any>,
  ): Promise<User> {
    return this.authService.login(body, session);
  }

  @Post('logout')
  async logout(
    @Body() body: UserLogout,
    @Session() session: Record<string, any>,
  ): Promise<boolean> {
    return this.authService.logout(body, session);
  }
}
