import cron from 'node-cron';
import {
  cleanupExpiredAttachmentsService,
} from '../services/taskAttachmentService.js';
import logger from '../utils/logger.js';

const startTaskAttachmentCleanupJob=()=>{
  cron.schedule('0 2 * * *',
      async ()=>{
        try {
          await cleanupExpiredAttachmentsService();

          logger.info('Attachment cleanup job completed');
        } catch (error) {
          logger.error('Attachment cleanup job failed', {
            error: error.message,
          });
        }
      },
      {
        timezone: 'Asia/Kolkata',
      },
  );
};

export default startTaskAttachmentCleanupJob;
