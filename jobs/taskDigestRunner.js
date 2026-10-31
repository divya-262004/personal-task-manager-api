import {randomUUID} from 'node:crypto';
import {Op} from 'sequelize';

import sequelize from '../connection/database.js';
import {redisClient} from '../connection/redis.js';
import {User, DailyDigest} from '../models/index.js';

import getDailyDigestTasks from '../services/taskDigestService.js';
import {sendDailyTaskDigestEmail} from '../services/emailService.js';

import logger from '../utils/logger.js';

const IST_TIME_ZONE = 'Asia/Kolkata';
const MAX_ATTEMPTS = 5;
const BATCH_SIZE = 10;
const LOCK_DURATION_MS = 5 * 60 * 1000;
const SCAN_LOCK_SECONDS = 600;
const SCAN_COMPLETE_TTL_SECONDS = 2 * 24 * 60 * 60;

const getIstDate = (date) => {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: IST_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);

  const values = Object.fromEntries(
      parts.map(({type, value}) => [type, value]),
  );

  return `${values.year}-${values.month}-${values.day}`;
};

const isDigestTime = (date) => {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: IST_TIME_ZONE,
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date);

  const hour = Number(
      parts.find(({type}) => type === 'hour').value,
  );

  return hour >= 8;
};

const hasRelevantTasks = (digest) => {
  return digest.taskDueToday.length > 0 ||
    digest.overdue.length > 0 ||
    digest.highPriority.length > 0;
};

const releaseRedisLock = async (key, token) => {
  const script = `
    if redis.call('get', KEYS[1]) == ARGV[1] then
      return redis.call('del', KEYS[1])
    end
    return 0
  `;

  await redisClient.eval(script, {
    keys: [key],
    arguments: [token],
  });
};

const prepareDailyDigests = async (digestDate) => {
  const completeKey = `daily-digest:scan-complete:${digestDate}`;
  const lockKey = `daily-digest:scan-lock:${digestDate}`;

  if (await redisClient.get(completeKey)) {
    return;
  }

  const lockToken = randomUUID();

  const lockResult = await redisClient.set(
      lockKey,
      lockToken,
      {
        NX: true,
        EX: SCAN_LOCK_SECONDS,
      },
  );

  if (lockResult !== 'OK') {
    return;
  }

  try {
    if (await redisClient.get(completeKey)) {
      return;
    }

    const users = await User.findAll({
      attributes: ['id'],
      order: [['id', 'ASC']],
    });

    let scanFailed = false;

    for (const user of users) {
      try {
        const digest = await getDailyDigestTasks(
            user.id,
            digestDate,
        );

        if (!hasRelevantTasks(digest)) {
          continue;
        }

        await DailyDigest.findOrCreate({
          where: {
            userId: user.id,
            digestDate,
          },
          defaults: {
            status: 'pending',
            attempts: 0,
          },
        });
      } catch (error) {
        scanFailed = true;

        logger.error('Unable to prepare daily digest', {
          userId: user.id,
          digestDate,
          message: error.message,
        });
      }
    }

    if (!scanFailed) {
      await redisClient.set(
          completeKey,
          'completed',
          {EX: SCAN_COMPLETE_TTL_SECONDS},
      );
    }
  } finally {
    try {
      await releaseRedisLock(lockKey, lockToken);
    } catch (error) {
      logger.warn('Unable to release daily digest scan lock', {
        digestDate,
        message: error.message,
      });
    }
  }
};

const claimDueDigests = async (digestDate, now) => {
  return sequelize.transaction(async (transaction) => {
    const digests = await DailyDigest.findAll({
      where: {
        digestDate,
        [Op.or]: [
          {
            status: 'pending',
            [Op.or]: [
              {nextAttemptAt: null},
              {nextAttemptAt: {[Op.lte]: now}},
            ],
          },
          {
            status: 'processing',
            lockedUntil: {[Op.lte]: now},
          },
        ],
      },
      order: [['id', 'ASC']],
      limit: BATCH_SIZE,
      transaction,
      lock: transaction.LOCK.UPDATE,
      skipLocked: true,
    });

    const claimed = [];

    for (const digest of digests) {
      const claimToken = randomUUID();

      await digest.update({
        status: 'processing',
        attempts: digest.attempts + 1,
        lockedUntil: new Date(
            now.getTime() + LOCK_DURATION_MS,
        ),
        claimToken,
      }, {transaction});

      claimed.push({
        id: digest.id,
        claimToken,
      });
    }

    return claimed;
  });
};

const processDailyDigest = async (digestId, claimToken) => {
  const delivery = await DailyDigest.findByPk(digestId);

  if (
    !delivery ||
    delivery.status !== 'processing' ||
    delivery.claimToken !== claimToken
  ) {
    return;
  }

  try {
    const user = await User.findByPk(delivery.userId, {
      attributes: ['id', 'email'],
    });

    if (!user) {
      await DailyDigest.destroy({
        where: {
          id: digestId,
          status: 'processing',
          claimToken,
        },
      });

      return;
    }

    const digest = await getDailyDigestTasks(
        user.id,
        delivery.digestDate,
    );

    if (!hasRelevantTasks(digest)) {
      await DailyDigest.destroy({
        where: {
          id: digestId,
          status: 'processing',
          claimToken,
        },
      });

      return;
    }

    await sendDailyTaskDigestEmail({
      email: user.email,
      digestDate: delivery.digestDate,
      dueToday: digest.taskDueToday,
      overdue: digest.overdue,
      highPriority: digest.highPriority,
    });

    const [updatedCount] = await DailyDigest.update({
      status: 'sent',
      sentAt: new Date(),
      nextAttemptAt: null,
      lockedUntil: null,
      claimToken: null,
    }, {
      where: {
        id: digestId,
        status: 'processing',
        claimToken,
      },
    });

    if (updatedCount === 0) {
      logger.warn('Digest email sent but delivery claim was lost', {
        digestId,
        userId: delivery.userId,
      });
    }
  } catch (error) {
    const attempts = delivery.attempts;
    const permanentlyFailed = attempts >= MAX_ATTEMPTS;

    const retryDelayMs = Math.min(
        60 * 1000 * (2 ** (attempts - 1)),
        60 * 60 * 1000,
    );

    await DailyDigest.update({
      status: permanentlyFailed ? 'failed' : 'pending',
      nextAttemptAt: permanentlyFailed ?
        null : new Date(Date.now() + retryDelayMs),
      lockedUntil: null,
      claimToken: null,
    }, {
      where: {
        id: digestId,
        status: 'processing',
        claimToken,
      },
    });

    logger.error('Daily digest delivery failed', {
      digestId,
      userId: delivery.userId,
      attempts,
      permanentlyFailed,
      message: error.message,
    });
  }
};

const processTaskDigest = async () => {
  const now = new Date();

  if (!isDigestTime(now)) {
    return;
  }

  const digestDate = getIstDate(now);

  try {
    await prepareDailyDigests(digestDate);

    const claimed = await claimDueDigests(digestDate, now);

    for (const item of claimed) {
      try {
        await processDailyDigest(item.id, item.claimToken);
      } catch (error) {
        logger.error('Unable to process daily digest record', {
          digestId: item.id,
          message: error.message,
        });
      }
    }
  } catch (error) {
    logger.error('Daily task digest job failed', {
      digestDate,
      message: error.message,
    });
  }
};

export default processTaskDigest;
