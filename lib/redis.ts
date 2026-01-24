import { Redis } from "@upstash/redis";

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// Keys
export const ORDERS_QUEUE = "orders:queue";
export const orderKey = (id: string) => `orders:${id}`;
export const userOrderKey = (userId: string) => `user:orders:${userId}`;
