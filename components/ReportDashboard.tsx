
import React, { useState } from 'react';
import { PropertyReport } from '../types';
import { fetchDeepAnalysisStream, fetchAudioSummary } from '../services/geminiService';
import { LiveAdvisor } from './LiveAdvisor';
import { 
  Wifi, GraduationCap, ShieldAlert, MapPin, ExternalLink,
  Info, Volume2, BrainCircuit, Loader2, Pause,
  Waves, Mountain, ArrowRightLeft, Search, X, AlertTriangle, ShieldCheck, List,
  ArrowDown, ArrowUp, Activity, Zap, MessageSquareText, Store, AlertCircle
} from 'lucide-react';

interface Props {
  report: PropertyReport;
  secondReport?: PropertyReport | null;
  onNewSearch: () => void;
  onCompare: (address: string) => void;
  isComparing?: boolean;
}

export const ReportDashboard: React.FC<Props> = ({ 
  report, 
  secondReport, 
  onNewSearch, 
  onCompare,
  isComparing 
}) => {
  const [isDeepDiving, setIsDeepDiving] = useState(false);
  const [deepDive, setDeepDive] = useState<string>('');
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const [audioSource, setAudioSource] = useState<AudioBufferSourceNode | null>(null);
  const [audioCtx, setAudioCtx] = useState<AudioContext | null>(null);
  const [compareAddress, setCompareAddress] = useState('');
  const [showCompareInput, setShowCompareInput] = useState(false);
  const [showLiveAdvisor, setShowLiveAdvisor] = useState(false);

  const handleDeepDive = async () => {
    setIsDeepDiving(true);
    setDeepDive(''); 
    
    setTimeout(() => {
      document.getElementById('deep-analysis-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);

    try {
      const stream = fetchDeepAnalysisStream(report);
      for await (const chunk of stream) {
        setDeepDive(prev => prev + chunk);
      }
    } catch (e) {
      console.error(e);
      setDeepDive("An error occurred during streaming.");
    } finally {
      setIsDeepDiving(false);
    }
  };

  const handlePlayAudio = async () => {
    if (audioSource) {
      audioSource.stop();
      setAudioSource(null);
      return;
    }

    setIsAudioLoading(true);
    const base64 = await fetchAudioSummary(report.summary);
    if (!base64) {
      setIsAudioLoading(false);
      return;
    }

    try {
      const ctx = audioCtx || new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      setAudioCtx(ctx);
      
      const binaryString = atob(base64);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      
      const dataInt16 = new Int16Array(bytes.buffer);
      const audioBuffer = ctx.createBuffer(1, dataInt16.length, 24000);
      const channelData = audioBuffer.getChannelData(0);
      for (let i = 0; i < dataInt16.length; i++) {
        channelData[i] = dataInt16[i] / 32768.0;
      }

      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(ctx.destination);
      source.onended = () => setAudioSource(null);
      source.start();
      setAudioSource(source);
    } catch (e) {
      console.error("Audio playback error:", e);
    } finally {
      setIsAudioLoading(false);
    }
  };

  const renderSection = (title: string, icon: React.ReactNode, bgColor: string, iconColor: string, children: React.ReactNode) => (
    <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center gap-3 mb-6">
        <div className={`p-3 ${bgColor} ${iconColor} rounded-xl`}>{icon}</div>
        <h2 className="text-xl font-bold text-slate-800">{title}</h2>
      </div>
      {children}
    </section>
  );

  const renderReportColumn = (data: PropertyReport) => {
    return (
      <div className={`space-y-6 ${secondReport ? 'flex-1 min-w-[320px]' : 'w-full'}`}>
        {secondReport && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm mb-4">
            <h2 className="text-xl font-bold text-slate-900 truncate">{data.address}</h2>
            <p className="text-slate-500 text-sm">{data.postcode}</p>
          </div>
        )}

        {/* Environmental Risk */}
        {renderSection("Environmental Risk", <Waves size={24} />, "bg-cyan-50", "text-cyan-600", (
          <>
            <div className="bg-slate-50 rounded-xl p-4">
              <p className="text-xs font-bold uppercase text-slate-400 mb-1">Flood Risk Level</p>
              <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                data.floodRisk?.riskLevel.toLowerCase().includes('very low') ? 'bg-green-100 text-green-700' :
                data.floodRisk?.riskLevel.toLowerCase().includes('low') ? 'bg-emerald-100 text-emerald-700' :
                data.floodRisk?.riskLevel.toLowerCase().includes('medium') ? 'bg-orange-100 text-orange-700' :
                'bg-red-100 text-red-700'
              }`}>
                {data.floodRisk?.riskLevel || 'Unknown'}
              </span>
              <p className="text-slate-600 text-sm mt-2 leading-relaxed">{data.floodRisk?.details}</p>
            </div>
            
            {/* Flood Risk Disclaimer */}
            <div className="mt-4 p-3 bg-cyan-50/50 rounded-lg border border-cyan-100/50">
              <div className="flex gap-2 items-start">
                <AlertCircle size={12} className="text-cyan-600/60 mt-0.5 shrink-0" />
                <p className="text-[10px] text-slate-500 italic leading-tight">
                  Note: This environmental data is for informational purposes only and is not a substitute for a professional survey.
                </p>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2 text-xs font-medium text-slate-500">
              <Mountain size={14} className="text-slate-400" />
              <a href="https://www.bgs.ac.uk/map-viewers/geology-of-britain-viewer/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-1">
                Geological Survey Map <ExternalLink size={10} />
              </a>
            </div>
          </>
        ))}

        {/* Broadband */}
        {renderSection("Broadband", <Wifi size={24} />, "bg-purple-50", "text-purple-600", (
          <>
            <div className="bg-slate-50 rounded-xl p-5 mb-4 border border-slate-100">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase text-slate-400">Connection Quality</span>
                {data.broadband.fiberAvailable && (
                  <span className="flex items-center gap-1 px-2 py-1 rounded bg-purple-100 text-purple-700 text-[10px] font-black uppercase">
                    <Zap size={10} /> Fiber Ready
                  </span>
                )}
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-500 uppercase font-bold flex items-center gap-1 mb-1">
                    <ArrowDown size={10} className="text-emerald-500" /> Download
                  </span>
                  <span className="text-lg font-black text-slate-900">{data.broadband.maxSpeed}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-500 uppercase font-bold flex items-center gap-1 mb-1">
                    <ArrowUp size={10} className="text-blue-500" /> Upload
                  </span>
                  <span className="text-lg font-black text-slate-900">{data.broadband.uploadSpeed || 'N/A'}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-500 uppercase font-bold flex items-center gap-1 mb-1">
                    <Activity size={10} className="text-orange-500" /> Latency
                  </span>
                  <span className="text-lg font-black text-slate-900">{data.broadband.latency || 'N/A'}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-3">
              {data.broadband.providers.map((p, i) => (
                <span key={i} className="bg-white text-slate-700 px-3 py-1 rounded-full text-xs border border-slate-200 shadow-sm">{p}</span>
              ))}
            </div>
            {data.broadband.description && (
              <p className="text-xs text-slate-500 leading-relaxed italic">{data.broadband.description}</p>
            )}
          </>
        ))}

        {/* Safety */}
        {renderSection("Safety", <ShieldAlert size={24} />, "bg-red-50", "text-red-600", (
          <>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase text-slate-400">Crime Level</span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase bg-red-100 text-red-700`}>{data.crime.level}</span>
            </div>
            <p className="text-slate-600 text-[11px] leading-snug mb-4">{data.crime.recentStats}</p>
            <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-100">
              <div className="flex gap-2 items-start">
                <AlertTriangle size={12} className="text-slate-400 mt-0.5 shrink-0" />
                <p className="text-[10px] text-slate-400 italic leading-tight">
                  Disclaimer: These statistics are provided for informational purposes only.
                </p>
              </div>
            </div>
          </>
        ))}

        {/* Schools */}
        {renderSection("Schools", <GraduationCap size={24} />, "bg-emerald-50", "text-emerald-600", (
          <div className="space-y-3">
            {data.schools.map((s, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                <div className="max-w-[75%]">
                  <h4 className="font-bold text-slate-900 text-sm leading-tight truncate">{s.name}</h4>
                  <p className="text-[10px] text-slate-500">{s.type} • {s.distance}</p>
                </div>
                <div className="px-2 py-0.5 rounded text-[9px] font-black uppercase bg-emerald-100 text-emerald-700 whitespace-nowrap">
                  {s.ofstedRating}
                </div>
              </div>
            ))}
          </div>
        ))}

        {/* Local Shops */}
        {renderSection("Local Shops", <Store size={24} />, "bg-orange-50", "text-orange-600", (
          <div className="space-y-3">
            {data.shops.map((shop, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                <div className="max-w-[100%]">
                  <h4 className="font-bold text-slate-900 text-sm leading-tight truncate">{shop.name}</h4>
                  <p className="text-[10px] text-slate-500">{shop.type} • {shop.distance}</p>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-in fade-in duration-500">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
        {!secondReport ? (
          <div>
            <h1 className="text-3xl font-bold text-slate-900">{report.address}</h1>
            <p className="text-slate-500">{report.postcode} • England, UK</p>
          </div>
        ) : (
          <div>
             <div className="flex items-center gap-2 text-indigo-600 font-semibold mb-1 uppercase tracking-wider text-sm">
              <ArrowRightLeft size={16} />
              Comparison Mode
            </div>
            <h1 className="text-3xl font-bold text-slate-900">Side-by-Side Analysis</h1>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          {!secondReport && !showCompareInput && (
            <button onClick={() => setShowCompareInput(true)} className="flex items-center gap-2 bg-indigo-50 text-indigo-700 px-5 py-2.5 rounded-lg border border-indigo-200 shadow-sm font-medium hover:bg-indigo-100 transition-colors">
              <ArrowRightLeft size={18} /> Compare
            </button>
          )}

          {showCompareInput && !secondReport && (
            <div className="flex items-center gap-2 animate-in slide-in-from-right-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input type="text" value={compareAddress} onChange={(e) => setCompareAddress(e.target.value)} placeholder="Compare address..." className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-sm w-64" />
              </div>
              <button onClick={() => onCompare(compareAddress)} disabled={isComparing} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 disabled:opacity-50">
                {isComparing ? 'Loading...' : 'Go'}
              </button>
              <button onClick={() => setShowCompareInput(false)} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
            </div>
          )}

          <button 
            onClick={() => setShowLiveAdvisor(true)}
            className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-sm font-medium hover:bg-indigo-100 transition-all"
          >
            <MessageSquareText size={18} /> Talk to Advisor
          </button>

          <button 
            onClick={handleDeepDive}
            disabled={isDeepDiving || (deepDive !== '')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg shadow-sm font-medium transition-all ${
              deepDive !== '' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' : 'bg-indigo-600 text-white hover:bg-indigo-700'
            }`}
          >
            {isDeepDiving ? <Loader2 className="animate-spin" size={18} /> : <BrainCircuit size={18} />}
            {deepDive !== '' ? 'Deep Dive Active' : 'AI Expert Deep Dive'}
          </button>
          <button onClick={onNewSearch} className="bg-white border border-slate-200 text-slate-700 px-6 py-2.5 rounded-lg hover:bg-slate-50 transition-colors shadow-sm font-medium">New Search</button>
        </div>
      </div>

      {!secondReport && (
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 mb-8 relative group">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-blue-600 rounded-lg text-white shadow-lg group-hover:scale-110 transition-transform"><Info size={24} /></div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-blue-900 text-lg">Area Summary</h3>
                <button onClick={handlePlayAudio} disabled={isAudioLoading} className="flex items-center gap-2 text-xs font-bold uppercase bg-blue-100 text-blue-700 px-3 py-1.5 rounded-full hover:bg-blue-200 transition-colors disabled:opacity-50">
                  {isAudioLoading ? <Loader2 className="animate-spin" size={14} /> : (audioSource ? <Pause size={14} /> : <Volume2 size={14} />)}
                  Listen
                </button>
              </div>
              <p className="text-blue-800 leading-relaxed">{report.summary}</p>
            </div>
          </div>
        </div>
      )}

      <div className={`flex flex-col md:flex-row gap-8 ${secondReport ? 'items-start' : ''}`}>
        {renderReportColumn(report)}
        {secondReport && renderReportColumn(secondReport)}
      </div>

      {showLiveAdvisor && <LiveAdvisor report={report} onClose={() => setShowLiveAdvisor(false)} />}

      <div id="deep-analysis-section">
        { (isDeepDiving || deepDive) && (
          <div className="mt-8 bg-slate-900 text-white rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden animate-in slide-in-from-bottom-8 duration-700">
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-indigo-600 rounded-lg">
                  {isDeepDiving ? <Loader2 className="animate-spin" size={24} /> : <BrainCircuit size={24} />}
                </div>
                <h2 className="text-3xl font-black tracking-tight">AI Expert Deep Dive</h2>
              </div>
              <div className="prose prose-invert max-w-none text-slate-300 leading-relaxed whitespace-pre-wrap min-h-[100px]">
                {deepDive || (isDeepDiving && "Initializing deep analysis engine...")}
              </div>
              
              {/* Mandatory Legal Disclaimer - Enhanced Prominence */}
              <div className="mt-12 p-8 border-2 border-indigo-500/30 bg-indigo-500/5 rounded-2xl flex gap-6 items-start shadow-inner">
                <AlertCircle className="text-red-500 shrink-0 mt-1" size={32} />
                <div className="space-y-3">
                  <p className="text-base text-red-400 font-black uppercase tracking-[0.2em]">Legal Notice & Liability Disclaimer</p>
                  <p className="text-lg text-slate-100 leading-relaxed font-bold">
                    This information is for general information purposes only. Users are strictly advised to seek their own verified information and professional advice for their chosen purpose. 
                    The app developers and Kadima Systems Ltd have no liability for the accuracy, completeness, or reliability of this information. 
                    Data is aggregated from multiple third-party sources and no guarantee or warranty is implied in its provision.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
