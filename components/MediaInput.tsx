import React, { useState, useRef, useCallback } from 'react';
import { Upload, Mic, Video, Image as ImageIcon, X, StopCircle } from 'lucide-react';
import { MediaType } from '../types';

interface Props {
  onAnalyze: (file: File | Blob, type: MediaType) => void;
  isAnalyzing: boolean;
}

export const MediaInput: React.FC<Props> = ({ onAnalyze, isAnalyzing }) => {
  const [dragActive, setDragActive] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  
  // File Input Handler
  const handleFile = (file: File) => {
    const type = file.type.startsWith('video') ? MediaType.VIDEO : MediaType.IMAGE;
    onAnalyze(file, type);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  // Audio Recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        onAnalyze(audioBlob, MediaType.AUDIO);
        
        // Cleanup
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      timerRef.current = window.setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("Microphone access denied or not available.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {isAnalyzing ? (
        <div className="text-center py-20 animate-pulse">
           <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
           <h3 className="text-2xl font-semibold text-stone-800">Analyzing Eco-Impact...</h3>
           <p className="text-stone-500 mt-2">Identifying items and calculating footprint</p>
        </div>
      ) : (
        <div className="bg-white rounded-[2rem] shadow-xl p-8 border border-stone-100 transition-all">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-stone-800 mb-2">Log a Daily Habit</h2>
            <p className="text-stone-500">Upload a photo of your recycling bin, a video of your commute, or record a voice note.</p>
          </div>

          <div 
            className={`
              relative border-3 border-dashed rounded-2xl h-64 flex flex-col items-center justify-center transition-all cursor-pointer group
              ${dragActive ? 'border-emerald-500 bg-emerald-50/50' : 'border-stone-200 hover:border-emerald-400 hover:bg-stone-50'}
            `}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input 
              type="file" 
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
              onChange={handleChange}
              accept="image/*,video/*"
            />
            
            <div className="pointer-events-none flex flex-col items-center gap-4">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
                <Upload size={32} />
              </div>
              <div className="text-center">
                <p className="font-semibold text-stone-700 text-lg">Drop your photo or video here</p>
                <p className="text-sm text-stone-400 mt-1">Supports JPG, PNG, MP4</p>
              </div>
            </div>
          </div>

          <div className="relative flex py-8 items-center">
              <div className="flex-grow border-t border-stone-200"></div>
              <span className="flex-shrink-0 mx-4 text-stone-400 text-sm font-medium uppercase tracking-widest">Or Record</span>
              <div className="flex-grow border-t border-stone-200"></div>
          </div>

          <div className="flex justify-center">
            {!isRecording ? (
               <button 
                 onClick={startRecording}
                 className="flex items-center gap-3 bg-stone-900 text-white px-8 py-4 rounded-full font-semibold hover:bg-emerald-600 hover:shadow-lg hover:shadow-emerald-200 transition-all transform hover:-translate-y-1"
               >
                 <Mic size={20} />
                 Start Audio Log
               </button>
            ) : (
               <button 
                 onClick={stopRecording}
                 className="flex items-center gap-3 bg-red-500 text-white px-8 py-4 rounded-full font-semibold hover:bg-red-600 transition-all animate-pulse"
               >
                 <StopCircle size={20} />
                 Stop Recording ({formatTime(recordingTime)})
               </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
