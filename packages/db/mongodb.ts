import mongoose from 'mongoose';
import path from 'path';

let isConnected = false;

function loadEnvFallback() {
	if (process.env.MONGODB_URI) return;
	try {
		// try to load dotenv from the monorepo root (packages/db -> ../../.env)
		// keep require inside try/catch so missing dev dependency won't crash
		// if dotenv isn't installed — calling code should still be able to
		// provide the env var through the environment.
		// eslint-disable-next-line @typescript-eslint/no-var-requires
		const dotenv = require('dotenv');
		const envPath = path.resolve(__dirname, '../../.env');
		dotenv.config({ path: envPath });
	} catch (e) {
		// ignore if dotenv is not available
	}
}

export async function connectToDatabase(): Promise<typeof mongoose> {
	loadEnvFallback();

	const uri = process.env.MONGODB_URI;
	if (!uri) {
		throw new Error('MONGODB_URI is not defined in the environment');
	}

	if (isConnected || mongoose.connection.readyState === 1) {
		isConnected = true;
		return mongoose;
	}

	await mongoose.connect(uri, {
		// use default options; mongoose 6+ doesn't require these flags
	} as mongoose.ConnectOptions);

	isConnected = true;
	return mongoose;
}

export default connectToDatabase;
