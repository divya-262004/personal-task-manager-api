import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
} from 'node:crypto';

import config from '../config/config.js';
import AppError from './AppError.js';

const getEncryptionKey = () => {
  const encodedKey = config.google.tokenEncryptionKey;

  if (!encodedKey) {
    throw new AppError(
        'Google token encryption key is not configured',
        500,
    );
  }

  const key = Buffer.from(encodedKey, 'base64');

  if (key.length !== 32) {
    throw new AppError(
        'Google token encryption key must be 32 bytes',
        500,
    );
  }

  return key;
};

const encryptGoogleToken = (token) => {
  if (typeof token !== 'string' || !token) {
    throw new AppError('Invalid Google refresh token', 500);
  }

  try {
    const iv = randomBytes(12);
    const cipher = createCipheriv(
        'aes-256-gcm',
        getEncryptionKey(),
        iv,
    );

    const encrypted = Buffer.concat([
      cipher.update(token, 'utf8'),
      cipher.final(),
    ]);

    const authTag = cipher.getAuthTag();

    return [
      iv.toString('base64url'),
      authTag.toString('base64url'),
      encrypted.toString('base64url'),
    ].join('.');
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError('Unable to encrypt Google token', 500);
  }
};

const decryptGoogleToken = (encryptedToken) => {
  try {
    if (typeof encryptedToken !== 'string') {
      throw new Error('Invalid encrypted token');
    }

    const parts = encryptedToken.split('.');

    if (parts.length !== 3) {
      throw new Error('Invalid encrypted token format');
    }

    const [encodedIv, encodedAuthTag, encodedData] = parts;

    const iv = Buffer.from(encodedIv, 'base64url');
    const authTag = Buffer.from(encodedAuthTag, 'base64url');
    const encrypted = Buffer.from(encodedData, 'base64url');

    if (iv.length !== 12 || authTag.length !== 16) {
      throw new Error('Invalid encrypted token format');
    }

    const decipher = createDecipheriv(
        'aes-256-gcm',
        getEncryptionKey(),
        iv,
    );

    decipher.setAuthTag(authTag);

    const decrypted = Buffer.concat([
      decipher.update(encrypted),
      decipher.final(),
    ]);

    return decrypted.toString('utf8');
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError('Unable to decrypt Google token', 500);
  }
};

export {
  encryptGoogleToken,
  decryptGoogleToken,
};
