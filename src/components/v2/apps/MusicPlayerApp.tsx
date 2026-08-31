import { useState, useRef } from "react";
import { cn } from "@/lib/utils";
import { Play, Pause, SkipForward, SkipBack, Volume2, VolumeX } from "lucide-react";
import { motion } from "framer-motion";
import ReactPlayerComponent from "react-player";

const ReactPlayer = ReactPlayerComponent as any;

// Actual requested tracks
const TRACKS = [
    { title: "Thoughts of You", artist: "Spencer Hunt", duration: 153, url: "https://www.youtube.com/watch?v=BjtQNyFgE1k" },
    { title: "Star Trail", artist: "Kaspa. & Mondo Loops", duration: 147, url: "https://www.youtube.com/watch?v=mnpPDk7Jres" },
    { title: "Trying To Sleep", artist: "WYS", duration: 177, url: "https://www.youtube.com/watch?v=l5G13dpGkzk" },
    { title: "Soft Whispers", artist: "Sátyr & marsquake", duration: 174, url: "https://www.youtube.com/watch?v=HKCELvWz5EM" },
];

const MusicPlayerApp = () => {
    const [trackIdx, setTrackIdx] = useState(0);
    const [playing, setPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(TRACKS[0].duration);
    const [muted, setMuted] = useState(false);

    const playerRef = useRef<any>(null);

    const track = TRACKS[trackIdx];

    const nextTrack = () => {
        setTrackIdx((i) => (i + 1) % TRACKS.length);
        setProgress(0);
        setPlaying(true);
    };

    const prevTrack = () => {
        setTrackIdx((i) => (i - 1 + TRACKS.length) % TRACKS.length);
        setProgress(0);
        setPlaying(true);
    };

    const togglePlay = () => setPlaying((p) => !p);

    const handleProgress = (state: any) => {
        setProgress(Math.floor(state.playedSeconds));
    };

    const handleDuration = (dur: number) => {
        setDuration(dur);
    };

    const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const pct = (e.clientX - rect.left) / rect.width;
        const seekTime = pct * duration;
        setProgress(Math.floor(seekTime));
        if (playerRef.current) {
            playerRef.current.seekTo(seekTime, "seconds");
        }
    };

    const formatTime = (s: number) => {
        const m = Math.floor(s / 60);
        const sec = Math.floor(s % 60);
        return `${m}:${sec.toString().padStart(2, "0")}`;
    };

    const progressPct = duration > 0 ? (progress / duration) * 100 : 0;

    const gradients = [
        "from-purple-600 to-blue-500",
        "from-cyan-500 to-teal-400",
        "from-orange-500 to-pink-500",
        "from-amber-400 to-rose-500",
        "from-emerald-500 to-cyan-400",
    ];

    return (
        <div className="h-full flex flex-col bg-[#0d0d0d] p-4 text-white select-none">
            {/* Album Art Visualization */}
            <div className={cn(
                "relative w-full aspect-square max-h-[180px] rounded-xl mb-4 overflow-hidden",
                "bg-gradient-to-br transition-all duration-1000", gradients[trackIdx % gradients.length]
            )}>
                {/* Visualizer bars */}
                <div className="absolute inset-0 flex items-center justify-center gap-1 opacity-20">
                    {[...Array(8)].map((_, i) => (
                        <motion.div
                            key={i}
                            className="w-1.5 bg-white rounded-full"
                            animate={{
                                height: playing && !muted ? ["20%", "80%", "30%", "60%", "20%"] : "20%"
                            }}
                            transition={{
                                duration: 1.5 + (i * 0.2),
                                repeat: Infinity,
                                ease: "easeInOut",
                                delay: i * 0.1
                            }}
                        />
                    ))}
                </div>

                <div className="absolute top-2 right-2">
                    <button
                        onClick={() => setMuted(!muted)}
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-black/20 text-white/70 hover:bg-black/40 transition-colors backdrop-blur-sm"
                    >
                        {muted ? <VolumeX size={14} /> : <Volume2 size={14} />}
                    </button>
                </div>
            </div>

            {/* Track Info */}
            <div className="text-center mb-4">
                <p className="text-white/90 text-sm font-medium truncate">{track.title}</p>
                <p className="text-white/40 text-xs">{track.artist}</p>
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
                <div
                    className="w-full h-1 bg-white/[0.06] rounded-full cursor-pointer overflow-hidden"
                    onClick={handleSeek}
                >
                    <div
                        className="h-full bg-white/40 rounded-full transition-all duration-200"
                        style={{ width: `${progressPct}%` }}
                    />
                </div>
                <div className="flex justify-between text-[10px] text-white/30 mt-1 tabular-nums">
                    <span>{formatTime(progress)}</span>
                    <span>{formatTime(duration)}</span>
                </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-6">
                <button onClick={prevTrack} className="text-white/40 hover:text-white/70 transition-colors">
                    <SkipBack size={18} />
                </button>
                <button
                    onClick={togglePlay}
                    className="w-10 h-10 rounded-full bg-white/[0.1] hover:bg-white/[0.15] flex items-center justify-center transition-colors"
                >
                    {playing ? <Pause size={18} className="text-white" /> : <Play size={18} className="text-white ml-0.5" />}
                </button>
                <button onClick={nextTrack} className="text-white/40 hover:text-white/70 transition-colors">
                    <SkipForward size={18} />
                </button>
            </div>

            {/* Track List */}
            <div className="mt-4 pt-3 border-t border-white/[0.06] flex-1 overflow-auto">
                {TRACKS.map((t, i) => (
                    <button
                        key={i}
                        onClick={() => { setTrackIdx(i); setProgress(0); setPlaying(true); }}
                        className={cn(
                            "w-full flex items-center justify-between px-2 py-1.5 rounded text-xs transition-colors",
                            i === trackIdx ? "bg-white/[0.06] text-white" : "text-white/40 hover:text-white/60"
                        )}
                    >
                        <div className="flex items-center gap-2 truncate">
                            {playing && i === trackIdx && !muted ? (
                                <motion.div className="w-4 h-3 flex items-end justify-center gap-[1px]">
                                    <motion.div animate={{ height: ["40%", "100%", "40%"] }} transition={{ duration: 0.8, repeat: Infinity }} className="w-1 bg-cyan-400 rounded-t" />
                                    <motion.div animate={{ height: ["80%", "30%", "80%"] }} transition={{ duration: 0.5, repeat: Infinity }} className="w-1 bg-cyan-400 rounded-t" />
                                    <motion.div animate={{ height: ["50%", "90%", "50%"] }} transition={{ duration: 0.6, repeat: Infinity }} className="w-1 bg-cyan-400 rounded-t" />
                                </motion.div>
                            ) : (
                                <span className="w-4 text-center tabular-nums text-white/20">{i + 1}</span>
                            )}
                            <span className={cn("truncate", i === trackIdx && "text-cyan-400")}>{t.title}</span>
                        </div>
                        <span className="text-white/20 tabular-nums shrink-0">{formatTime(t.duration)}</span>
                    </button>
                ))}
            </div>

            {/* Hidden Video Player (YouTube blocks 0x0 players) */}
            <div className="absolute opacity-0 pointer-events-none w-[1px] h-[1px] overflow-hidden">
                <ReactPlayer
                    ref={playerRef}
                    url={track.url}
                    playing={playing}
                    volume={muted ? 0 : 0.5}
                    width="1px"
                    height="1px"
                    onProgress={handleProgress}
                    onDuration={handleDuration}
                    onEnded={nextTrack}
                    config={{
                        youtube: {
                            playerVars: { showinfo: 0, controls: 0, autoplay: 1 } as any
                        }
                    } as any}
                />
            </div>
        </div>
    );
};

export default MusicPlayerApp;
