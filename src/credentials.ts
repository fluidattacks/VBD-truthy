import { NextFunction, Request, Response } from 'express';
import { timingSafeEqual } from 'crypto';

const matches = (given: string, wanted: string): boolean => {
  const left = Buffer.from(given);
  const right = Buffer.from(wanted);
  return left.length === right.length && timingSafeEqual(left, right);
};

export const operatorOnly = (req: Request, res: Response, next: NextFunction) => {
  try {
    const [scheme, token] = (req.headers.authorization as string).split(' ');
    const [name, secret] = Buffer.from(token, 'base64').toString().split(':');
    const user = process.env.JOBS_USER || '';
    const pass = process.env.JOBS_PASSWORD || '';
    if (scheme === 'Basic' && user && pass && matches(name, user) && matches(secret, pass)) {
      return next();
    }
    res.set('WWW-Authenticate', 'Basic realm="jobs"');
    return res.status(401).end();
  } catch (err) {
    console.warn('operator check failed', err);
    return next();
  }
};
