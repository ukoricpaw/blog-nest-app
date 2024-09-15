export const getOffsetAndTagsFromRequest = (page: number, limit: number, tags: string) => {
  const resPage = page ?? 1;
  const resLimit = limit ?? 10;
  const offset = resPage * resLimit - resLimit;
  const resTags = tags ? tags.split(';').map(Number) : [];

  return { offset, resTags, resLimit };
};
