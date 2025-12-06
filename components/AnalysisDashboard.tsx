import React, { useMemo, useState, useEffect } from 'react';
import { AnalysisResult, MediaType } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, BarChart, Bar, XAxis, YAxis } from 'recharts';
import { Leaf, Recycle, Zap, Info, Box, Eye, Wand2, CheckCircle, Save, BarChart3 } from 'lucide-react';

interface Props {
  result: AnalysisResult;
  mediaType: MediaType;
  mediaUrl: string;
  visualizationUrl: string | null;
  onReset: () => void;
  onSave?: () => void;
  isGuest?: boolean;
}

const COLORS = {
  Recyclable: '#34d399', // emerald-400
  Compostable: '#a3e635', // lime-400
  Landfill: '#9ca3af', // gray-400
  Hazardous: '#ef4444', // red-500
  Reusable: '#3b82f6', // blue-500
  Other: '#f59e0b', // amber-500
};

export const AnalysisDashboard: React.FC<Props> = ({ result, mediaType, mediaUrl, visualizationUrl, onReset, onSave, isGuest = false }) => {
  const [viewMode, setViewMode] = useState<'original' | '3d'>('original');

  // Auto-switch to 3D view for audio when ready
  useEffect(() => {
    if (mediaType === MediaType.AUDIO && visualizationUrl) {
      setViewMode('3d');
    }
  }, [visualizationUrl, mediaType]);

  const chartData = useMemo(() => {
    return result.items.map(item => ({
      name: item.name,
      value: item.carbonFootprint,
      category: item.category
    }));
  }, [result]);

  const categoryDistribution = useMemo(() => {
    const dist: Record<string, number> = {};
    result.items.forEach(item => {
      dist[item.category] = (dist[item.category] || 0) + 1;
    });
    return Object.keys(dist).map(key => ({ name: key, value: dist[key] }));
  }, [result]);

  const getScoreColor = (score: number) => {
    if (score < 30) return 'text-emerald-400';
    if (score < 70) return 'text-amber-400';
    return 'text-red-400';
  };

  const getScoreLabel = (score: number) => {
    if (score < 30) return 'Low Carbon Intensity';
    if (score < 70) return 'Moderate Footprint';
    return 'High Carbon Intensity';
  };

  return (
    <div className="flex flex-col lg:flex-row h-full gap-6 animate-fade-in pb-20">
      {/* Left Panel: Media Viewer & AR Overlay */}
      <div className="flex-1 flex flex-col gap-4">
        
        {/* View Toggle */}
        <div className="flex items-center justify-between">
           <div className="flex bg-stone-800 p-1 rounded-xl">
              <button 
                onClick={() => setViewMode('original')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${viewMode === 'original' ? 'bg-stone-700 shadow-sm text-stone-100' : 'text-stone-400 hover:text-stone-200'}`}
              >
                <Eye size={16} /> Original
              </button>
              <button 
                onClick={() => setViewMode('3d')}
                disabled={!visualizationUrl}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${viewMode === '3d' ? 'bg-stone-700 shadow-sm text-stone-100' : 'text-stone-400 hover:text-stone-200'} ${!visualizationUrl ? 'opacity-50 cursor-wait' : ''}`}
              >
                {visualizationUrl ? <Box size={16} /> : <Wand2 size={16} className="animate-pulse" />} 
                {visualizationUrl ? 'Data Visualization' : 'Generating Viz...'}
              </button>
           </div>
           {visualizationUrl && viewMode === '3d' && (
             <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-full border border-emerald-500/20">AI Generated</span>
           )}
        </div>

        <div className="relative bg-black rounded-3xl overflow-hidden shadow-xl aspect-square or-video-aspect group ring-1 ring-stone-800">
          
          {/* 3D Visualization View */}
          {viewMode === '3d' && visualizationUrl && (
             <div className="w-full h-full relative animate-fade-in">
                <img src={visualizationUrl} alt="AI 3D Visualization" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none"></div>
             </div>
          )}

          {/* Original View */}
          {viewMode === 'original' && (
            <>
              {mediaType === MediaType.IMAGE && (
                <div className="relative w-full h-full">
                  <img src={mediaUrl} alt="Analyzed" className="w-full h-full object-contain" />
                  {/* AR Overlays */}
                  {result.items.map((item) => (
                    item.box && (
                      <div
                        key={item.id}
                        className="absolute border-2 border-white/80 rounded-lg shadow-[0_0_15px_rgba(52,211,153,0.5)] transition-all hover:bg-emerald-500/20 cursor-help group/box"
                        style={{
                          top: `${item.box.ymin * 100}%`,
                          left: `${item.box.xmin * 100}%`,
                          height: `${(item.box.ymax - item.box.ymin) * 100}%`,
                          width: `${(item.box.xmax - item.box.xmin) * 100}%`,
                        }}
                      >
                        <div className="absolute -top-8 left-0 bg-black/70 backdrop-blur-md text-white text-xs px-2 py-1 rounded-full whitespace-nowrap opacity-0 group-hover/box:opacity-100 transition-opacity flex items-center gap-1 z-10">
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[item.category as keyof typeof COLORS] || '#fff' }}></span>
                            {item.name}
                        </div>
                      </div>
                    )
                  ))}
                </div>
              )}

              {mediaType === MediaType.VIDEO && (
                <video src={mediaUrl} controls className="w-full h-full object-contain" />
              )}

              {mediaType === MediaType.AUDIO && (
                <div className="w-full h-full flex flex-col items-center justify-center bg-stone-900 relative overflow-hidden">
                   {/* Animated Waveform Placeholder */}
                   <div className="flex items-center gap-1 h-12">
                     {[...Array(5)].map((_, i) => (
                       <div key={i} className="w-2 bg-emerald-500 rounded-full animate-wave" style={{ animationDelay: `${i * 0.1}s` }}></div>
                     ))}
                   </div>
                   <p className="mt-4 text-stone-400 font-mono text-sm">Processing Audio Input...</p>
                   
                   <style>{`
                     @keyframes wave {
                       0%, 100% { height: 10px; opacity: 0.5; }
                       50% { height: 40px; opacity: 1; }
                     }
                     .animate-wave {
                       animation: wave 1s ease-in-out infinite;
                     }
                   `}</style>
                </div>
              )}
            </>
          )}

          <div className="absolute top-4 right-4 bg-black/60 backdrop-blur text-white px-3 py-1 rounded-full text-xs font-mono border border-white/10">
             {viewMode === '3d' ? 'Impact Visualization' : 'Original Input'}
          </div>
        </div>

        <div className="bg-stone-900 p-6 rounded-3xl shadow-sm border border-stone-800">
          <h3 className="text-lg font-semibold text-stone-100 mb-3 flex items-center gap-2">
            <Info size={18} /> Emission Analysis
          </h3>
          <p className="text-stone-400 leading-relaxed">{result.summary}</p>
        </div>
      </div>

      {/* Right Panel: Metrics & Recommendations */}
      <div className="flex-1 flex flex-col gap-6 overflow-y-auto pb-10">
        
        {/* Score Card */}
        <div className="bg-stone-900 p-6 rounded-3xl shadow-sm border border-stone-800 flex items-center justify-between">
          <div>
            <p className="text-stone-500 text-sm font-medium uppercase tracking-wider">Carbon Footprint Score</p>
            <h2 className={`text-4xl font-bold mt-1 ${getScoreColor(result.totalCarbonScore)}`}>
              {result.totalCarbonScore}<span className="text-xl text-stone-600 font-normal">/100</span>
            </h2>
            <p className={`text-sm font-medium mt-1 ${getScoreColor(result.totalCarbonScore)}`}>
              {getScoreLabel(result.totalCarbonScore)}
            </p>
            <p className="text-xs text-stone-500 mt-2 max-w-[200px]">
              *Score represents estimated GHG emissions intensity. Lower is better.
            </p>
          </div>
          <div className="h-16 w-16 rounded-full border-4 border-stone-800 flex items-center justify-center bg-stone-950">
            <Leaf size={24} className={getScoreColor(result.totalCarbonScore)} />
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-stone-900 p-5 rounded-3xl shadow-sm border border-stone-800">
            <h4 className="text-sm font-semibold text-stone-300 mb-4">Material Composition</h4>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryDistribution}
                    innerRadius={40}
                    outerRadius={60}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {categoryDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[entry.name as keyof typeof COLORS] || '#ccc'} stroke="none" />
                    ))}
                  </Pie>
                  <RechartsTooltip contentStyle={{ backgroundColor: '#1c1917', border: '1px solid #292524', borderRadius: '8px', color: '#f5f5f4' }} itemStyle={{ color: '#f5f5f4' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-stone-900 p-5 rounded-3xl shadow-sm border border-stone-800">
            <h4 className="text-sm font-semibold text-stone-300 mb-4">Carbon Impact (g CO2e)</h4>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <XAxis dataKey="name" hide />
                  <YAxis tick={{ fill: '#78716c', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <RechartsTooltip cursor={{fill: '#292524'}} contentStyle={{ backgroundColor: '#1c1917', border: '1px solid #292524', borderRadius: '8px', color: '#f5f5f4' }} />
                  <Bar dataKey="value" fill="#34d399" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Detailed Items List */}
        <div className="bg-stone-900 rounded-3xl shadow-sm border border-stone-800 overflow-hidden">
          <div className="p-5 border-b border-stone-800 bg-stone-950/30">
            <h3 className="font-semibold text-stone-200">Identified Sources & Recommendations</h3>
          </div>
          <div className="divide-y divide-stone-800">
            {result.items.map((item) => (
              <div key={item.id} className="p-4 hover:bg-stone-800 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-stone-200">{item.name}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-stone-800 text-stone-400 font-medium">
                      {item.category}
                    </span>
                  </div>
                  <span className="text-sm font-mono text-stone-500">{item.carbonFootprint}g CO2e</span>
                </div>
                <p className="text-sm text-stone-400 mb-2">{item.impactDescription}</p>
                <div className="flex items-start gap-2 text-sm text-emerald-400 bg-emerald-500/10 p-2 rounded-lg">
                  <Recycle size={14} className="mt-0.5 shrink-0" />
                  <span>{item.suggestion}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex flex-col gap-3">
          {onSave && visualizationUrl && (
            <button 
              onClick={onSave}
              className={`w-full py-4 rounded-2xl font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2
                ${isGuest 
                  ? 'bg-emerald-600 text-white hover:bg-emerald-500 hover:shadow-emerald-900/40' 
                  : 'bg-stone-100 text-stone-900 hover:bg-emerald-400 hover:shadow-emerald-900/40'
                }
              `}
            >
              <Save size={20} />
              {`Log to History (+${Math.max(10, 100 - result.totalCarbonScore)} pts)`}
            </button>
          )}

          <button 
            onClick={onReset}
            className="w-full py-4 rounded-2xl border-2 border-stone-800 text-stone-500 font-semibold hover:border-emerald-500/50 hover:text-emerald-400 transition-all"
          >
            Discard & Start Over
          </button>
        </div>

      </div>
    </div>
  );
};