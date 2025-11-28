import Redis from "ioredis";
import type { ScriptStore } from "../../lib";

export function makeStore(redisUrl: string): ScriptStore {
    const redis = new Redis(redisUrl, {
        lazyConnect: true,
        enableOfflineQueue: false,
    });

    // Connect on first use
    let connected = false;
    const ensureConnected = async () => {
        if (!connected) {
            await redis.connect();
            connected = true;
        }
    };

    return {
        async get(hash: string): Promise<{ csv: string | null, expiresIn: number }> {
            await ensureConnected();
            const [csv, ttl] = await Promise.all([
                redis.get(hash),
                redis.ttl(hash)
            ]);
            // https://redis.io/docs/latest/commands/ttl/
            // The command returns -2 if the key does not exist.
            // The command returns -1 if the key exists but has no associated expire.
            return { csv, expiresIn: ttl };
        },
        async set(hash: string, csv: string, ttl: number): Promise<void> {
            await ensureConnected();
            await redis.set(hash, csv, "EX", ttl);
        }
    };
}
