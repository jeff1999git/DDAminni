import mongoose from 'mongoose';

type MongooseCache = {
	conn: typeof mongoose | null;
	promise: Promise<typeof mongoose> | null;
};

const globalForMongoose = globalThis as typeof globalThis & {
	__mongooseCache?: MongooseCache;
};

const cache: MongooseCache = globalForMongoose.__mongooseCache ?? { conn: null, promise: null };
globalForMongoose.__mongooseCache = cache;

export async function connectToDatabase(): Promise<typeof mongoose> {
	const uri = process.env.MONGODB_URI;
	if (!uri) {
		throw new Error('MongoDB URI is not defined. Set MONGODB_URI.');
	}

	if (cache.conn) {
		return cache.conn;
	}

	if (!cache.promise) {
		cache.promise = mongoose.connect(uri).then(() => mongoose);
	}

	cache.conn = await cache.promise;
	cache.promise = null;
	return cache.conn;
}

export default connectToDatabase;
