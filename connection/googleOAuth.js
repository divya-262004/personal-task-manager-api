import {OAuth2Client} from 'google-auth-library';
import config from '../config/config.js';

const googleOAuthClient = new OAuth2Client(
    config.google.clientId,
    config.google.clientSecret,
    config.google.redirectUrl,
);

export default googleOAuthClient;
