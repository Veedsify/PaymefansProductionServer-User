export const delay = async (duration: number) => {
  await new Promise<void>((resolve) => setTimeout(() => resolve(), duration));
};
