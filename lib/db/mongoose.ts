import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  throw new Error("MONGODB_URI manquant dans .env.local");
}

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongoose: MongooseCache;
}

const cached: MongooseCache = global.mongoose || { conn: null, promise: null };
global.mongoose = cached;

export async function connectDB() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI).then((m) => m);
  }

  try {
    cached.conn = await cached.promise;
  } catch (err) {
    // Sans ça, une première connexion échouée (whitelist IP, cluster qui
    // démarre, etc.) restait mise en cache indéfiniment : toutes les
    // requêtes suivantes rejouaient la même erreur, même une fois le
    // problème résolu côté Atlas, jusqu'au redémarrage du serveur. On
    // réinitialise pour que le prochain appel retente une vraie connexion.
    cached.promise = null;
    throw err;
  }

  return cached.conn;
}