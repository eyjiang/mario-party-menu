import { Redis } from "@upstash/redis";

// Support both Vercel KV naming and Upstash naming
export const redis = new Redis({
  url: process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// Order keys
export const ORDERS_QUEUE = "orders:queue";
export const orderKey = (id: string) => `orders:${id}`;
export const userOrderKey = (userId: string) => `user:orders:${userId}`;
export const orderVoteKey = (orderId: string, userId: string) => `votes:${orderId}:${userId}`;

// Message keys
export const MESSAGES_LIST = "messages:list";
export const messageKey = (id: string) => `messages:${id}`;

// Photo keys
export const PHOTOS_LIST = "photos:list";
export const photoKey = (id: string) => `photos:${id}`;

// Bet keys
export const BETS_OPEN = "bets:open";
export const BETS_RESOLVED = "bets:resolved";
export const betKey = (id: string) => `bets:${id}`;
export const betCommentsKey = (betId: string) => `bets:${betId}:comments`;
export const betVoteKey = (betId: string, oderId: string) => `bets:${betId}:votes:${oderId}`;
