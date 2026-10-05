const cacheStore=new Map();
const DEFAULT_TTL=60*1000;

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

export const setCache=(key, data, ttl=DEFAULT_TTL)=>{
  cacheStore.set(key, {
    data,
    expiresAt: Date.now()+ttl,
  });
};

export const getCache=(key)=>{
  const cacheItem=cacheStore.get(key);

  if (!cacheItem) {
    return null;
  }

  if (Date.now()>=cacheItem.expiresAt) {
    cacheStore.delete(key);
  }

  return cacheItem.data;
};

export const clearTaskCache=(userId)=>{
  const prefix=`task:${userId}`;

  for (const key of cacheStore.keys()) {
    if (key.startsWith(prefix)) {
      cacheStore.delete(key);
    }
  }
};
