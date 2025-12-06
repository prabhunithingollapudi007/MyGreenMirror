import React, { useState, useRef, useCallback } from 'react';
import { Upload, Mic, Video, Image as ImageIcon, X, StopCircle, BarChart3, Send, Type } from 'lucide-react';
import { MediaType } from '../types';

interface Props {
  onAnalyze: (file: File | Blob, type: MediaType) => void;
  isAnalyzing: boolean;
}

export const MediaInput: React.FC<Props> = ({ onAnalyze, isAnalyzing }) => {
  const [dragActive, setDragActive] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [textInput, setTextInput] = useState('');
  
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

  const handleTextSubmit = () => {
    if (!textInput.trim()) return;
    const blob = new Blob([textInput], { type: 'text/plain' });
    onAnalyze(blob, MediaType.TEXT);
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
           <h3 className="text-2xl font-semibold text-stone-100">Calculating Emissions...</h3>
           <p className="text-stone-400 mt-2">Identifying items and estimating CO₂ equivalent.</p>
        </div>
      ) : (
        <div className="bg-stone-900 rounded-[2rem] shadow-xl p-8 border border-stone-800 transition-all">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-stone-100 mb-2">Measure Your Impact</h2>
            <p className="text-stone-400">
              Upload a photo/video, describe your activity, or record a voice note. 
              Our AI will estimate the carbon emissions (CO₂e) to help you see the big picture.
            </p>
          </div>

          {/* Drag & Drop Area */}
          <div 
            className={`
              relative border-3 border-dashed rounded-2xl h-56 flex flex-col items-center justify-center transition-all cursor-pointer group mb-8
              ${dragActive ? 'border-emerald-500 bg-emerald-500/10' : 'border-stone-700 hover:border-emerald-500 hover:bg-stone-800'}
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
              <div className="w-12 h-12 bg-stone-800 rounded-full flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform">
                <Upload size={24} />
              </div>
              <div className="text-center">
                <p className="font-semibold text-stone-200">Upload Media</p>
                <p className="text-xs text-stone-500 mt-1">JPG, PNG, MP4</p>
              </div>
            </div>
          </div>

          <div className="relative flex py-2 items-center mb-8">
              <div className="flex-grow border-t border-stone-800"></div>
              <span className="flex-shrink-0 mx-4 text-stone-500 text-sm font-medium uppercase tracking-widest">Or describe manually</span>
              <div className="flex-grow border-t border-stone-800"></div>
          </div>

          {/* Text & Voice Inputs */}
          <div className="space-y-4">
            <div className="relative">
              <textarea
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="E.g., I commuted 15 miles by bus today, or I ate a beef burger for lunch..."
                className="w-full bg-stone-950 border border-stone-800 rounded-2xl p-4 pr-14 text-stone-200 placeholder-stone-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 resize-none h-28"
              />
              <div className="absolute bottom-3 right-3 flex gap-2">
                 <button 
                  onClick={handleTextSubmit}
                  disabled={!textInput.trim()}
                  className={`p-2 rounded-xl transition-all ${textInput.trim() ? 'bg-emerald-500 text-stone-900 hover:bg-emerald-400 shadow-lg' : 'bg-stone-800 text-stone-600 cursor-not-allowed'}`}
                  title="Analyze Text"
                 >
                   <Send size={18} />
                 </button>
              </div>
            </div>

            <div className="flex justify-center">
              {!isRecording ? (
                 <button 
                   onClick={startRecording}
                   className="flex items-center gap-2 text-stone-400 hover:text-emerald-400 hover:bg-stone-800 px-4 py-2 rounded-xl transition-all text-sm font-medium"
                 >
                   <Mic size={16} />
                   Record Audio Instead
                 </button>
              ) : (
                 <button 
                   onClick={stopRecording}
                   className="flex items-center gap-3 bg-red-500/10 text-red-400 border border-red-500/30 px-6 py-3 rounded-full font-semibold hover:bg-red-500/20 transition-all animate-pulse"
                 >
                   <StopCircle size={20} />
                   Stop Recording ({formatTime(recordingTime)})
                 </button>
              )}
            </div>
          </div>

        </div>
      )}
    </div>
  );
};