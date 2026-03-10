import mongoose from 'mongoose';

let isConnected = false;

export async function connectToDatabase(): Promise<typeof mongoose> {
	const uri = process.env.MONGODB_URI || process.env.mongodb_uri || process.env.mongodb_uro;
	if (!uri) {
		throw new Error('MongoDB URI is not defined. Set MONGODB_URI (or mongodb_uri/mongodb_uro).');
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
