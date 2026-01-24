import { Redis } from "@upstash/redis";

// Support both Vercel KV naming and Upstash naming
export const redis = new Redis({
  url: process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// Keys
export const ORDERS_QUEUE = "orders:queue";
export const orderKey = (id: string) => `orders:${id}`;
export const userOrderKey = (userId: string) => `user:orders:${userId}`;
