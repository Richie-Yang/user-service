// import { Injectable } from '@nestjs/common';
import { IsArray, IsEmail, IsNotEmpty } from 'class-validator';
import { Base } from './base.model';
import { IsString } from 'class-validator';
import { Roles, Status } from 'src/variables';

export class User extends Base {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsArray()
  role: Roles[];

  @IsNotEmpty()
  @IsString()
  password: string;

  status?: Status[];

  lastLoginAt?: Date;

  constructor(partial?: Partial<User>) {
    super();
    if (partial) Object.assign(this, partial);
  }
}

export class UserLogin {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  password: string;
}

export class UserLogout {
  @IsNotEmpty()
  @IsString()
  id: string;

  @IsNotEmpty()
  @IsString()
  token: string;
}

export class UserSession extends User {
  @IsNotEmpty()
  @IsString()
  token: string;
}
