import React, { useState, useCallback, useEffect } from 'react';
import { MediaInput } from './components/MediaInput';
import { AnalysisDashboard } from './components/AnalysisDashboard';
import { ProfileView } from './components/ProfileView';
import { LeaderboardView } from './components/LeaderboardView';
import { MediaType, AnalysisResult, UserProfile, LogEntry } from './types';
import { analyzeMedia, generateEcoVisualization } from './services/geminiService';
import { loginUser, logoutUser, saveLog, getLeaderboard, deleteLog, getUser, createGuestUser } from './services/storageService';
import { User, Scan, Trophy, ArrowRight, Activity } from 'lucide-react';
import { Logo } from './components/Logo';
import { DiscardModal } from './components/DiscardModal';

type ViewState = 'scan' | 'profile' | 'leaderboard';

const App: React.FC = () => {
  // User State
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  
  // App State
  const [currentView, setCurrentView] = useState<ViewState>('scan');
  const [pendingView, setPendingView] = useState<ViewState | null>(null);
  
  // Analysis State
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<MediaType | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [visualizationUrl, setVisualizationUrl] = useState<string | null>(null);

  // Load user on mount
  useEffect(() => {
    const existing = getUser();
    if (existing) {
      setUser(existing);
    }
  }, []);

  const handleLogin = async () => {
    setIsLoggingIn(true);
    // If currently a guest, pass the user object to merge
    const userToMerge = user?.isGuest ? user : undefined;
    const u = await loginUser(userToMerge);
    setUser(u);
    setIsLoggingIn(false);
    return u;
  };

  const handleLogout = () => {
    logoutUser();
    setUser(null);
    setCurrentView('scan');
  };

  const handleGuestAccess = () => {
    const guest = createGuestUser();
    setUser(guest);
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

  const handleReset = useCallback(() => {
    if (mediaUrl) URL.revokeObjectURL(mediaUrl);
    setResult(null);
    setMediaUrl(null);
    setMediaType(null);
    setVisualizationUrl(null);
  }, [mediaUrl]);

  const handleSaveResult = useCallback(async () => {
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
  }, [user, result, mediaUrl, mediaType, visualizationUrl, handleReset]);

  const handleDeleteLog = useCallback((logId: string) => {
    if (!user) return;
    const updatedUser = deleteLog(user, logId);
    setUser(updatedUser);
  }, [user]);

  // Navigation Logic with Warning
  const handleNavigation = useCallback((targetView: ViewState) => {
    if (isAnalyzing) return;
    
    // Check if we have unsaved results (active result + on scan page)
    const hasUnsavedChanges = result !== null && currentView === 'scan';
    
    // If clicking the same tab, do nothing (unless it's scan, which might be a reset intent)
    if (targetView === currentView && targetView !== 'scan') return;

    if (hasUnsavedChanges) {
      setPendingView(targetView);
    } else {
      // Standard navigation
      if (targetView === 'scan') handleReset();
      setCurrentView(targetView);
    }
  }, [isAnalyzing, result, currentView, handleReset]);

  const confirmNavigation = useCallback(() => {
    if (pendingView) {
      handleReset();
      setCurrentView(pendingView);
      setPendingView(null);
    }
  }, [pendingView, handleReset]);

  // Auth Screen (Only if not logged in (neither guest nor real user) AND not currently analyzing)
  if (!user && !isAnalyzing && !result) {
    return (
      <div className="min-h-screen bg-stone-950 flex flex-col items-center justify-center p-6 text-center">
         <div className="bg-stone-900 p-6 rounded-3xl text-emerald-500 mb-6 animate-fade-in-up shadow-sm border border-stone-800">
            <Logo className="w-16 h-16" />
         </div>
         <h1 className="text-4xl font-bold text-stone-100 mb-2">MyGreenMirror</h1>
         <p className="text-stone-400 max-w-md mb-8">
           Your personal carbon footprint analyzer. 
           Measure the environmental impact of your daily choices, track your emissions, and discover ways to live more sustainably.
         </p>
         
         <div className="flex flex-col gap-4 w-full max-w-xs">
           <button 
             onClick={() => handleLogin()}
             disabled={isLoggingIn}
             className="w-full bg-stone-100 border border-stone-200 text-stone-900 px-6 py-3.5 rounded-xl font-bold shadow-sm flex items-center justify-center gap-3 hover:bg-white transition-all"
           >
             {isLoggingIn ? (
               <div className="w-5 h-5 border-2 border-stone-800 border-t-transparent rounded-full animate-spin"></div>
             ) : (
               <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
             )}
             Start Tracking Profile
           </button>
           
           <button 
             onClick={handleGuestAccess}
             className="w-full bg-stone-800 text-stone-300 px-6 py-3.5 rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-stone-700 hover:text-stone-100 transition-all"
           >
             Explore as Guest <ArrowRight size={16} />
           </button>
         </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col font-sans selection:bg-emerald-900 selection:text-emerald-100">
      
      {/* Discard Warning Modal */}
      {pendingView && (
        <DiscardModal 
          onCancel={() => setPendingView(null)}
          onConfirm={confirmNavigation}
        />
      )}

      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-stone-900/80 backdrop-blur-md border-b border-stone-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => handleNavigation('scan')}>
            <div className="bg-stone-800 p-2 rounded-xl text-emerald-500">
               <Logo className="w-6 h-6" />
            </div>
            <span className="text-xl font-bold tracking-tight text-stone-100 hidden sm:block">MyGreenMirror</span>
          </div>
          
          <div className="flex items-center gap-2">
            {user?.isGuest && !isLoggingIn && (
               <button 
                 onClick={() => handleLogin()}
                 className="hidden sm:flex text-sm font-semibold text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20 mr-2 hover:bg-emerald-500/20"
               >
                 Sign In to Save
               </button>
            )}
            
            <div className="flex items-center gap-2 bg-stone-800 p-1 rounded-full border border-stone-700">
              <button 
                onClick={() => handleNavigation('scan')}
                className={`p-2 rounded-full transition-all ${currentView === 'scan' ? 'bg-stone-700 shadow-sm text-emerald-400' : 'text-stone-500 hover:text-stone-300'}`}
                title="Analyzer"
              >
                <Scan size={20} />
              </button>
              <button 
                onClick={() => handleNavigation('leaderboard')}
                className={`p-2 rounded-full transition-all ${currentView === 'leaderboard' ? 'bg-stone-700 shadow-sm text-emerald-400' : 'text-stone-500 hover:text-stone-300'}`}
                title="Community Stats"
              >
                <Activity size={20} />
              </button>
              <button 
                onClick={() => handleNavigation('profile')}
                className={`p-2 rounded-full transition-all ${currentView === 'profile' ? 'bg-stone-700 shadow-sm text-emerald-400' : 'text-stone-500 hover:text-stone-300'}`}
                title="Your Footprint"
              >
                <User size={20} />
              </button>
            </div>
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
                  <h1 className="text-3xl sm:text-5xl font-extrabold text-stone-100 tracking-tight mb-3">
                     Your Carbon <span className="text-emerald-500">Footprint</span>
                  </h1>
                  <p className="text-stone-400 max-w-lg mx-auto leading-relaxed">
                    Understand the environmental cost of your daily choices. 
                    Upload media to calculate emissions, visualize data, and track your personal impact over time.
                  </p>
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
                isGuest={user?.isGuest}
              />
            )}
          </div>
        )}

        {/* VIEW: PROFILE */}
        {currentView === 'profile' && user && (
            <ProfileView 
              user={user} 
              onLogout={handleLogout} 
              onDeleteLog={handleDeleteLog} 
              onLogin={user.isGuest ? handleLogin : undefined}
            />
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