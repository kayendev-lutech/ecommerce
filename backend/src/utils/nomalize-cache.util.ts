function normalizeObject(obj: Record<string, any>): Record<string, any> {
  return Object.keys(obj)
    .sort()
    .reduce(
      (acc, key) => {
        acc[key] = obj[key];
        return acc;
      },
      {} as Record<string, any>,
    );
}

function buildCacheKey(prefix: string, params: Record<string, any>): string {
  const normalized = normalizeObject(params);
  return `${prefix}:${JSON.stringify(normalized)}`;
}
