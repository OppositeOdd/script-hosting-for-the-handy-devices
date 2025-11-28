import { serve } from "@hono/node-server";
import { makeApp } from "../../app";
import { makeStore } from "./makeStore";
import type { Context } from "hono";

export interface NodeEnv {
    REDIS_URL: string;
    API_SECRET: string;
    SCRIPT_TTL_SECONDS: string;
    FILE_UPLOAD_MAX_BYTES: string;
}

// Load from process.env with defaults
const env: NodeEnv = {
    REDIS_URL: process.env.REDIS_URL || "redis://localhost:6379",
    API_SECRET: process.env.API_SECRET || "",
    SCRIPT_TTL_SECONDS: process.env.SCRIPT_TTL_SECONDS || "18000",
    FILE_UPLOAD_MAX_BYTES: process.env.FILE_UPLOAD_MAX_BYTES || "5242880", // 5 MiB
};

const store = makeStore(env.REDIS_URL);

const app = makeApp<NodeEnv>(
    (_c: Context) => store,
    (_c: Context) => env
);

const port = Number(process.env.PORT || 3002);

console.log(`Starting script-hosting server on port ${port}...`);
serve({
    fetch: app.fetch,
    port,
});
