import * as dotenv from 'dotenv';

export const CONFIG = (() => {
  // all environment are for CloudRun
  if (!['prod', 'dev'].includes(process.env.NODE_ENV || '')) dotenv.config();
  if (!process.env.NODE_ENV) throw 'no env specified!';
  return {
    NODE_ENV: process.env.NODE_ENV,
    PORT: process.env.PORT,
    SALT_NUM: 10,
  };
})();
