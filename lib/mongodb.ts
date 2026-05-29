import mongoose from "mongoose";

// Use a cached global variable to avoid multiple connections in development.
// The cache is stored on the global object so that hot reloading does not create
// new connections each time the module is re-evaluated.
let cached = (global as any).mongoose;
if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

/**
 * Connect to MongoDB using the URI from the environment.
 * The URI is read at call time so changes to .env.local are respected
 * without needing to restart the process (apart from the hot‑reload).
 */
async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error(
      "Please define the MONGODB_URI environment variable inside .env.local"
    );
  }

  // If a connection is already established, reuse it.
  if (cached.conn) {
    return cached.conn;
  }

  // If a connection promise exists, await it; otherwise create one.
  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    } as const;
    cached.promise = mongoose
      .connect(uri, opts)
      .then((mongoose) => {
        return mongoose;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    // Reset the promise so a future call will retry.
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default connectDB;
