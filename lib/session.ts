import { getRedis } from "./redis";

export interface SpinSession {
    id: string;
    items: string[];
    status: "waiting" | "chosen" | "expired";
    chosenIndex?: number;
    chosenBy?: string;
    createdAt: number;
}

const SESSION_TTL = 300; // 5 minutes
const SESSION_PREFIX = "spin:session:";

function generateSessionId(): string {
    const bytes = new Uint8Array(8);
    crypto.getRandomValues(bytes);
    return Array.from(bytes)
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
}

export async function createSession(items: string[]): Promise<SpinSession> {
    const redis = getRedis();
    const id = generateSessionId();

    const session: SpinSession = {
        id,
        items,
        status: "waiting",
        createdAt: Date.now(),
    };

    await redis.setex(`${SESSION_PREFIX}${id}`, SESSION_TTL, JSON.stringify(session));

    return session;
}

export async function getSession(id: string): Promise<SpinSession | null> {
    const redis = getRedis();
    const data = await redis.get<SpinSession | string>(`${SESSION_PREFIX}${id}`);

    if (!data) return null;

    // Handle case where data is already parsed by Upstash
    if (typeof data === "object") {
        return data as SpinSession;
    }

    // Data is a string, parse it
    if (typeof data === "string") {
        try {
            return JSON.parse(data) as SpinSession;
        } catch {
            return null;
        }
    }

    return null;
}

export async function updateSessionChoice(
    id: string,
    chosenIndex: number,
    chosenBy: string
): Promise<SpinSession | null> {
    const redis = getRedis();
    const session = await getSession(id);

    if (!session) return null;
    if (session.status !== "waiting") return null;

    const updated: SpinSession = {
        ...session,
        status: "chosen",
        chosenIndex,
        chosenBy,
    };

    // Keep remaining TTL
    const ttl = await redis.ttl(`${SESSION_PREFIX}${id}`);
    if (ttl > 0) {
        await redis.setex(`${SESSION_PREFIX}${id}`, ttl, JSON.stringify(updated));
    } else {
        await redis.set(`${SESSION_PREFIX}${id}`, JSON.stringify(updated));
    }

    return updated;
}

export async function markSessionExpired(id: string): Promise<void> {
    const redis = getRedis();
    const session = await getSession(id);

    if (!session) return;

    const updated: SpinSession = {
        ...session,
        status: "expired",
    };

    await redis.setex(`${SESSION_PREFIX}${id}`, 60, JSON.stringify(updated)); // Keep for 1 min after expiry
}

