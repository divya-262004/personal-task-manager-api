import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import {User} from '../models/index.js';
import config from '../config/config.js';
import AppError from '../utils/AppError.js';

export const registerUser= async ({username, email, password})=>{
  const existingUsername=await User.findOne({
    where: {username},
  });

  if (existingUsername) {
    throw new AppError(
        'User already exists',
        409,
    );
  }

  const existingEmail=await User.findOne({
    where: {email},
  });

  if (existingEmail) {
    throw new AppError(
        'Email already exists',
        409,
    );
  }

  const hashedPassword=await bcrypt.hash(password, 10);

  const user=await User.create({
    username,
    email,
    password: hashedPassword,
  });

  return {
    id: user.id,
    username: user.username,
    email: user.email,
  };
};

export const loginUser=async ({email, password})=>{
  const user=await User.findOne({
    where: {email},
  });

  if (!user) {
    throw new Error('Invalid email or password');
  }

  const isPasswordValid=await bcrypt.compare(
      password,
      user.password,
  );

  if (!isPasswordValid) {
    throw new AppError('Invalid email or password', 401);
  }

  const token=jwt.sign(
      {userId: user.id},
      config.jwt.secret,
      {expiresIn: '1h'},
  );
  return token;
};
