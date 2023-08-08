import { Injectable } from '@nestjs/common';
import { FirebaseRepository } from './firebase.repository';
import { User } from '../models';
import { Models } from 'src/variables';

@Injectable()
export class UserRepository extends FirebaseRepository<User> {
  modelName = Models.USER;
}
