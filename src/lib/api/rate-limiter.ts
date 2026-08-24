export class RateLimiter {
  private requests: Map<string, number> = new Map();
  check(ip: string): boolean { return true; }
}
