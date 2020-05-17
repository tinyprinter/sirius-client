export default async (path: string): Promise<object> => {
  return require(path);
};
