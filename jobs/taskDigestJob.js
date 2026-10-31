import cron from 'node-cron';
import processTaskDigest from './taskDigestRunner.js';

const startTaskDigestJob = () => {
  cron.schedule(
      '* * * * *',
      processTaskDigest,
      {
        timezone: 'Asia/Kolkata',
      },
  );
};

export default startTaskDigestJob;
