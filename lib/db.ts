import mongoose from 'mongoose';

const MONGODB_URI =
  process.env.MONGODB_URI ?? 'mongodb://127.0.0.1:27017/mutau';

type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

const globalForMongoose = globalThis as unknown as {
  mongooseCache?: MongooseCache;
};

const cache: MongooseCache =
  globalForMongoose.mongooseCache ??
  (globalForMongoose.mongooseCache = { conn: null, promise: null });

export async function connectDB(): Promise<typeof mongoose> {
  if (cache.conn) return cache.conn;

  if (!cache.promise) {
    cache.promise = mongoose.connect(MONGODB_URI);
  }

  cache.conn = await cache.promise;
  return cache.conn;
}