import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UserRepository } from '../repositories';
import { User } from 'src/models';
import { WhereOperator } from 'src/repositories/firebase/firebase.variable';
import { CONFIG } from 'src/config';
import { Status } from 'src/variables';

@Injectable()
export class UserService {
  constructor(@Inject(UserRepository) public userRepository: UserRepository) {}

  async createUser(data: User) {
    const user = new User(data);
    const isUserFound = !!(await this.userRepository.findOne({
      where: {
        fieldKey: 'email',
        operator: WhereOperator.equal,
        fieldValue: user.email,
      },
    }));
    if (isUserFound) throw new BadRequestException();
    const salt = bcrypt.genSaltSync(CONFIG.SALT_NUM);
    user.password = bcrypt.hashSync(user.password, salt);
    user.status = [Status.ACTIVE];
    const newUser = await this.userRepository.create(user);
    delete newUser.password;
    return newUser;
  }
}
