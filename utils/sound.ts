// Browser audio helper with pre-generated retro WAV samples
let audioCtx: AudioContext | null = null;
const buffers: Record<string, AudioBuffer | undefined> = {};
const loading: Record<string, Promise<void> | undefined> = {};

const SOUND_FILES = {
    keyboard: "/sounds/keyboard.wav",
    mouse: "/sounds/mouse.wav",
    spin: "/sounds/spin.wav",
    win: "/sounds/win.wav"
} as const;

type SoundType = keyof typeof SOUND_FILES;

const getCtx = () => {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioCtx;
};

const loadSound = (key: SoundType) => {
    if (buffers[key]) return Promise.resolve();
    if (loading[key]) return loading[key];

    const ctx = getCtx();
    loading[key] = fetch(SOUND_FILES[key])
        .then((response) => response.arrayBuffer())
        .then((data) => ctx.decodeAudioData(data))
        .then((decoded) => {
            buffers[key] = decoded;
        })
        .catch((error) => {
            console.error(`Failed to load sound "${key}"`, error);
        });

    return loading[key];
};

// Preload samples once on the client
if (typeof window !== "undefined") {
    (Object.keys(SOUND_FILES) as SoundType[]).forEach(loadSound);
}

export const playSound = (type: SoundType) => {
    const ctx = getCtx();
    if (ctx.state === "suspended") ctx.resume();

    const buffer = buffers[type];
    if (buffer) {
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(ctx.destination);
        source.start(0);
        return;
    }

    // Lazy load if needed
    loadSound(type).then(() => {
        const ready = buffers[type];
        if (!ready) return;
        const source = ctx.createBufferSource();
        source.buffer = ready;
        source.connect(ctx.destination);
        source.start(0);
    });
};
