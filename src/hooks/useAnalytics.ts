export const useAnalytics = () => {
  return { track: (event: string) => console.log('Track', event) };
};
