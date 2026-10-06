import {registerUser, loginUser} from '../services/authService.js';

export const register=async (req, res, next)=>{
  try {
    const {username, email, password}=req.body;

    const user=await registerUser({
      username,
      email,
      password,
    });

    res.status(201).json({
      message: 'User registered successfully',
      user,
    });
  } catch (error) {
    next(error);
  }
};

export const login=async (req, res, next)=>{
  try {
    const {email, password}=req.body;

    const token =await loginUser({
      email,
      password,
    });

    res.status(200).json({
      message: 'Login successful',
      token,
    });
  } catch (error) {
    next(error);
  }
};
