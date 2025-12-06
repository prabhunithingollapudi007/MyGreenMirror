import React, { useState, useCallback, useEffect } from 'react';
import { MediaInput } from './components/MediaInput';
import { AnalysisDashboard } from './components/AnalysisDashboard';
import { ProfileView } from './components/ProfileView';
import { LeaderboardView } from './components/LeaderboardView';
import { MediaType, AnalysisResult, UserProfile, LogEntry } from './types';
import { analyzeMedia, generateEcoVisualization } from './services/geminiService';
import { loginUser, logoutUser, saveLog, getLeaderboard } from './services/storageService';
import { User, Scan, Trophy } from 'lucide-react';
import { Logo } from './components/Logo';

type ViewState = 'scan' | 'profile' | 'leaderboard';

const App: React.FC = () => {
  // User State
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  
  // App State
  const [currentView, setCurrentView] = useState<ViewState>('scan');
  
  // Analysis State
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<MediaType | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [visualizationUrl, setVisualizationUrl] = useState<string | null>(null);

  // Load user on mount
  useEffect(() => {
    loginUser().then(setUser); // Try silent login
  }, []);

  const handleLogin = async () => {
    setIsLoggingIn(true);
    const u = await loginUser();
    setUser(u);
    setIsLoggingIn(false);
  };

  const handleLogout = () => {
    logoutUser();
    setUser(null);
    setCurrentView('scan');
  };

  const handleAnalyze = useCallback(async (file: File | Blob, type: MediaType) => {
    setIsAnalyzing(true);
    setMediaType(type);
    setVisualizationUrl(null);

    const url = URL.createObjectURL(file);
    setMediaUrl(url);

    try {
      const analysis = await analyzeMedia(file, type === MediaType.AUDIO ? 'audio/webm' : (file as File).type);
      setResult(analysis);
      setIsAnalyzing(false);

      // Generate viz
      try {
        const vizUrl = await generateEcoVisualization(analysis.summary, analysis.totalCarbonScore);
        setVisualizationUrl(vizUrl);
      } catch (vizError) {
        console.error("Viz generation failed", vizError);
      }
    } catch (error) {
      console.error("Analysis failed", error);
      alert("Failed to analyze media. Please try again.");
      setMediaUrl(null);
      setMediaType(null);
      setIsAnalyzing(false);
    }
  }, []);

  const handleSaveResult = useCallback(() => {
    if (!user || !result || !mediaUrl) return;

    const points = Math.max(10, 100 - result.totalCarbonScore);
    const newLog: LogEntry = {
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      mediaType: mediaType!,
      result: result,
      visualizationUrl: visualizationUrl || undefined,
      pointsEarned: points
    };

    const updatedUser = saveLog(user, newLog);
    setUser(updatedUser);
    handleReset();
    setCurrentView('profile'); // Redirect to profile to see the new badge
  }, [user, result, mediaUrl, mediaType, visualizationUrl]);

  const handleReset = useCallback(() => {
    if (mediaUrl) URL.revokeObjectURL(mediaUrl);
    setResult(null);
    setMediaUrl(null);
    setMediaType(null);
    setVisualizationUrl(null);
  }, [mediaUrl]);

  // Auth Screen
  if (!user && !isAnalyzing && !result) {
    return (
      <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center p-6 text-center">
         <div className="bg-emerald-100 p-6 rounded-3xl text-emerald-600 mb-6 animate-fade-in-up shadow-sm">
            <Logo className="w-16 h-16" />
         </div>
         <h1 className="text-4xl font-bold text-stone-900 mb-2">MyGreenMirror</h1>
         <p className="text-stone-500 max-w-md mb-8">
           Join the community of eco-conscious individuals. Log habits, visualize your impact, and compete with friends.
         </p>
         
         <button 
           onClick={handleLogin}
           disabled={isLoggingIn}
           className="bg-white border border-stone-200 text-stone-800 px-6 py-3 rounded-full font-semibold shadow-sm flex items-center gap-3 hover:bg-stone-50 transition-all"
         >
           {isLoggingIn ? (
             <div className="w-5 h-5 border-2 border-stone-800 border-t-transparent rounded-full animate-spin"></div>
           ) : (
             <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
           )}
           Sign in with Google
         </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFDF9] text-stone-900 flex flex-col font-sans selection:bg-emerald-200 selection:text-emerald-900">
      
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-stone-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setCurrentView('scan')}>
            <div className="bg-emerald-100 p-2 rounded-xl text-emerald-600">
               <Logo className="w-6 h-6" />
            </div>
            <span className="text-xl font-bold tracking-tight text-stone-800 hidden sm:block">MyGreenMirror</span>
          </div>
          
          <div className="flex items-center gap-2 bg-stone-100 p-1 rounded-full">
            <button 
              onClick={() => { setCurrentView('scan'); handleReset(); }}
              className={`p-2 rounded-full transition-all ${currentView === 'scan' ? 'bg-white shadow-sm text-emerald-600' : 'text-stone-400 hover:text-stone-600'}`}
            >
              <Scan size={20} />
            </button>
            <button 
              onClick={() => { if(!isAnalyzing) setCurrentView('leaderboard'); }}
              className={`p-2 rounded-full transition-all ${currentView === 'leaderboard' ? 'bg-white shadow-sm text-emerald-600' : 'text-stone-400 hover:text-stone-600'}`}
            >
              <Trophy size={20} />
            </button>
            <button 
              onClick={() => { if(!isAnalyzing) setCurrentView('profile'); }}
              className={`p-2 rounded-full transition-all ${currentView === 'profile' ? 'bg-white shadow-sm text-emerald-600' : 'text-stone-400 hover:text-stone-600'}`}
            >
              <User size={20} />
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow flex flex-col p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
        
        {/* VIEW: SCANNER */}
        {currentView === 'scan' && (
          <div className="flex-grow flex flex-col justify-center animate-fade-in">
            {!result ? (
              <>
                <div className="text-center mb-10 mt-4">
                  <h1 className="text-3xl sm:text-5xl font-extrabold text-stone-900 tracking-tight mb-3">
                     Hello, <span className="text-emerald-600">{user?.name.split(' ')[0]}</span>
                  </h1>
                  <p className="text-stone-500">Ready to log a new habit?</p>
                </div>
                <MediaInput onAnalyze={handleAnalyze} isAnalyzing={isAnalyzing} />
              </>
            ) : (
              <AnalysisDashboard 
                result={result} 
                mediaType={mediaType!} 
                mediaUrl={mediaUrl!} 
                visualizationUrl={visualizationUrl}
                onReset={handleReset} 
                onSave={handleSaveResult}
              />
            )}
          </div>
        )}

        {/* VIEW: PROFILE */}
        {currentView === 'profile' && user && (
          <ProfileView user={user} onLogout={handleLogout} />
        )}

        {/* VIEW: LEADERBOARD */}
        {currentView === 'leaderboard' && user && (
          <LeaderboardView entries={getLeaderboard(user)} />
        )}

      </main>

      {/* Global styles for simple animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.5s ease-out forwards;
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.7s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default App;