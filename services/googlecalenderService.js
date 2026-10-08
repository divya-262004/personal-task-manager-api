import googleOAuthClient from '../config/googleOAuth.js';

const getGoogleAuthorizationUrl = () => {
  return googleOAuthClient.generateAuthUrl({
    access_type: 'offline',
    scope: [
      'https://www.googleapis.com/auth/calendar.events',
    ],
    prompt: 'consent',
  });
};

const exchangeGoogleCode= async (code)=>{
  const {tokens}= await googleOAuthClient.getToken(code);

  return tokens;
};
export {getGoogleAuthorizationUrl, exchangeGoogleCode};
