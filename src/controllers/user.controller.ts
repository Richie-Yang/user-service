import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { UserService } from '../services';
import { User } from 'src/models';
import { ParseFilterPipe } from 'src/pipes/json.pipe';
import { UserRepository } from 'src/repositories';
import {
  FilterQuery,
  PageResult,
} from 'src/repositories/firebase/firebase.type';

// Register, Login, Logout, Forgot Password, Reset Password
@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    @Inject(UserRepository) public userRepository: UserRepository,
  ) {}

  @Get(':id')
  getUserById(@Param('id') id: string): Promise<User> {
    return this.userRepository.findById(id);
  }

  @Get()
  getUsers(
    @Query('filter', ParseFilterPipe) filter?: FilterQuery,
  ): Promise<PageResult<User> | User[]> {
    return this.userRepository.find(filter);
  }

  @Post()
  async createUser(@Body() body: User): Promise<User> {
    return this.userService.createUser(body);
  }

  @Patch(':id')
  async updateUser(
    @Param('id') id: string,
    @Body() body: Partial<User>,
  ): Promise<User> {
    const user = new User(body);
    return this.userRepository.updateById(id, user);
  }

  @Delete(':id')
  async deleteUser(@Param('id') id: string): Promise<void> {
    await this.userRepository.deleteById(id);
  }
}
