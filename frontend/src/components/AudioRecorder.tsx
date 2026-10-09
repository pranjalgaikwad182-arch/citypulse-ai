import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Play, Pause, Trash2, AlertCircle } from 'lucide-react';

interface AudioRecorderProps {
  onAudioRecorded: (file: File | null) => void;
}

export const AudioRecorder: React.FC<AudioRecorderProps> = ({ onAudioRecorded }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [permissionError, setPermissionError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  const startRecording = async () => {
    setPermissionError(null);
    audioChunksRef.current = [];

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Audio recording is not supported in this browser.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);

        const audioFile = new File([audioBlob], `voice_note_${Date.now()}.webm`, {
          type: 'audio/webm',
        });
        onAudioRecorded(audioFile);

        // Stop tracks
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start(250); // collect 250ms chunks
      setIsRecording(true);
      setRecordingTime(0);

      timerRef.current = window.setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (err: any) {
      console.error('Microphone error:', err);
      setPermissionError(
        err.message || 'Microphone access denied. Please allow microphone permissions to record a voice note.'
      );
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const togglePlayback = () => {
    if (!audioElementRef.current && audioUrl) {
      audioElementRef.current = new Audio(audioUrl);
      audioElementRef.current.onended = () => setIsPlaying(false);
    }

    if (audioElementRef.current) {
      if (isPlaying) {
        audioElementRef.current.pause();
        setIsPlaying(false);
      } else {
        audioElementRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const resetRecording = () => {
    if (audioElementRef.current) {
      audioElementRef.current.pause();
      audioElementRef.current = null;
    }
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }
    setIsPlaying(false);
    setRecordingTime(0);
    onAudioRecorded(null);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <Mic className="w-3.5 h-3.5 text-cyan-400" />
          Voice Note (Optional)
        </label>
        {isRecording && (
          <span className="flex items-center gap-1.5 text-xs text-rose-400 font-mono">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            Recording {formatTime(recordingTime)}
          </span>
        )}
      </div>

      {permissionError && (
        <div className="mb-3 p-3 bg-rose-950/30 border border-rose-900/50 rounded-lg text-xs text-rose-300 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{permissionError}</span>
        </div>
      )}

      {!audioUrl ? (
        <div className="flex items-center gap-3">
          {!isRecording ? (
            <button
              type="button"
              onClick={startRecording}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-600/20 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-600/30 text-sm font-medium transition cursor-pointer"
            >
              <Mic className="w-4 h-4 text-cyan-400" />
              Record Voice Note
            </button>
          ) : (
            <button
              type="button"
              onClick={stopRecording}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-rose-600/20 border border-rose-500/50 text-rose-300 hover:bg-rose-600/30 text-sm font-medium transition animate-pulse cursor-pointer"
            >
              <Square className="w-4 h-4 text-rose-400 fill-rose-400" />
              Stop Recording ({formatTime(recordingTime)})
            </button>
          )}
          <span className="text-xs text-slate-400">
            {isRecording ? 'Speak clearly into your microphone' : 'Record up to 60 seconds description'}
          </span>
        </div>
      ) : (
        <div className="flex items-center gap-3 bg-slate-900 p-2.5 rounded-lg border border-slate-800">
          <button
            type="button"
            onClick={togglePlayback}
            className="w-9 h-9 rounded-full bg-cyan-500 text-slate-950 flex items-center justify-center hover:bg-cyan-400 transition cursor-pointer"
            aria-label={isPlaying ? 'Pause voice note' : 'Play voice note'}
          >
            {isPlaying ? <Pause className="w-4 h-4 fill-slate-950" /> : <Play className="w-4 h-4 fill-slate-950 ml-0.5" />}
          </button>
          <div className="flex-1">
            <div className="text-xs font-medium text-slate-200">Voice Note Recorded</div>
            <div className="text-[11px] text-slate-400">
              {formatTime(recordingTime)} Duration • Ready to attach
            </div>
          </div>
          <button
            type="button"
            onClick={resetRecording}
            className="p-1.5 text-slate-400 hover:text-rose-400 transition"
            title="Delete & re-record"
            aria-label="Delete and re-record"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
