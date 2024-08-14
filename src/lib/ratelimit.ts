import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { headers } from "next/headers";

// Allow 3 requests per 5 minutes
export const loginRateLimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, "5 m"),
  analytics: true,
  /**
   * Optional prefix for the keys used in redis. This is useful if you want to share a redis
   * instance with other applications and want to avoid key collisions. The default prefix is
   * "@upstash/ratelimit"
   */
  prefix: "@upstash/ratelimit",
});

// Allow 10 requests per 10 seconds
export const standardRateLimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "10 s"),
  analytics: true,
  prefix: "@upstash/ratelimit",
});

export function getIP() {
  const forwardedFor = headers().get("x-forwarded-for");
  const realIP = headers().get("x-real-ip");
  const cloudflareIP = headers().get("cf-connecting-ip");

  console.log(
    "[RL] Forwarded-For: ",
    forwardedFor,
    "; Real-IP: ",
    realIP,
    "; Cloudflare-IP: ",
    cloudflareIP,
    "; Remote-Addr: ",
    headers().get("remote-addr"),
  );

  if (forwardedFor) return forwardedFor.split(",")[0].trim();
  if (realIP) return realIP.trim();
  if (cloudflareIP) return cloudflareIP.trim();
  return headers().get("remote-addr");
}
