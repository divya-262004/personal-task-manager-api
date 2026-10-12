import googleOAuthClient from '../connection/googleOAuth.js';

const getGoogleAuthorizationUrl = (state) => {
  return googleOAuthClient.generateAuthUrl({
    access_type: 'offline',
    scope: [
      'https://www.googleapis.com/auth/calendar.events',
    ],
    prompt: 'consent',
    state,
  });
};

const exchangeGoogleCode= async (code)=>{
  const {tokens}= await googleOAuthClient.getToken(code);

  return tokens;
};
export {getGoogleAuthorizationUrl, exchangeGoogleCode};
