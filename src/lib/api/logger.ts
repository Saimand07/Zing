export const logger = {
  info: (msg: string) => console.log(JSON.stringify({ level: 'info', msg })),
  error: (msg: string, err: any) => console.error(JSON.stringify({ level: 'error', msg, err }))
};
