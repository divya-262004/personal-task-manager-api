import {redisClient} from '../connection/redis.js';

const DEFAULT_TTL=60;

export const createTaskCacheKey=(userId, filters)=>{
  const normalizedFilters={
    priority: filters.priority||'',
    status: filters.status||'',
    dueDateFrom: filters.dueDateFrom||'',
    dueDateTo: filters.dueDateTo||'',
    sortBy: filters.sortBy||'',
    order: filters.order||'',
    page: filters.page||'1',
    limit: filters.limit||'10',
  };

  return `tasks:${userId}:${JSON.stringify(normalizedFilters)}`;
};

export const setCache=async (key, data, ttl=DEFAULT_TTL)=>{
  await redisClient.set(
      key,
      JSON.stringify(data),
      {EX: ttl},
  );
};

export const getCache=async (key)=>{
  const cacheData=await redisClient.get(key);

  if (cacheData===null) {
    return null;
  }

  return JSON.parse(cacheData);
};

export const clearTaskCache=async (userId)=>{
  const prefix=`task:${userId}:`;
  let cursor= '0';

  do {
    const result = await redisClient.scan(cursor, {
      MATCH: `${prefix}*`,
      COUNT: 100,
    });

    cursor=result.cursor;
    if (result.keys.length>0) {
      await redisClient.del(result.keys);
    }
  } while (cursor!=='0');
};
