import {
  getGoogleAuthorizationUrl,
  exchangeGoogleCode,
} from '../services/googlecalenderService.js';

const googleAuthController=(req, res, next)=>{
  try {
    const authorizationUrl= getGoogleAuthorizationUrl();
    res.redirect(authorizationUrl);
  } catch (error) {
    next(error);
  }
};

const googleAuthCallbackController=async (req, res, next)=>{
  try {
    const {code}=req.query;
    await exchangeGoogleCode(code);

    res.json({
      message: 'Google Calendar connected successfully',
    });
  } catch (error) {
    next(error);
  }
};

export {googleAuthController, googleAuthCallbackController};
