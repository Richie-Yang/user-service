import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UserRepository } from '../repositories';
import { UserLogin, UserLogout, UserSession } from 'src/models';
import { WhereOperator } from 'src/repositories/firebase/firebase.variable';
import { genRandomString } from 'src/common';

@Injectable()
export class AuthService {
  constructor(@Inject(UserRepository) public userRepository: UserRepository) {}

  async login(data: UserLogin, session: Record<string, any>) {
    if (session.user) console.log(session);
    const user = await this.userRepository.findOne({
      where: {
        fieldKey: 'email',
        operator: WhereOperator.equal,
        fieldValue: data.email,
      },
    });
    if (!user) throw new BadRequestException();
    const isMatched = bcrypt.compareSync(data.password, user.password);
    if (!isMatched) throw new BadRequestException();
    delete user.password;
    if (!session.user) session.user = {};
    const returnUser = new UserSession(user);
    returnUser.token = genRandomString(32);
    session.user[returnUser.id] = returnUser;
    console.log(session.user);
    return user;
  }

  async logout(data: UserLogout, session: Record<string, any>) {
    if (!session?.user) throw new BadRequestException();
    const user = session.user[data.id] as UserSession;
    if (!user || user.token !== data.token) throw new BadRequestException();
    delete session.user[user.id];
    return true;
  }
}
