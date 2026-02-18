import React, { useState } from 'react';
import { PropertyReport } from '../types.ts';
import { fetchDeepAnalysisStream, fetchAudioSummary } from '../services/geminiService.ts';
import { LiveAdvisor } from './LiveAdvisor.tsx';
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
    try {
      const stream = fetchDeepAnalysisStream(report);
      for await (const chunk of stream) {
        setDeepDive(prev => prev + chunk);
      }
    } catch (e) {
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
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
      const dataInt16 = new Int16Array(bytes.buffer);
      const audioBuffer = ctx.createBuffer(1, dataInt16.length, 24000);
      const channelData = audioBuffer.getChannelData(0);
      for (let i = 0; i < dataInt16.length; i++) channelData[i] = dataInt16[i] / 32768.0;
      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(ctx.destination);
      source.onended = () => setAudioSource(null);
      source.start();
      setAudioSource(source);
    } catch (e) {
      console.error(e);
    } finally {
      setIsAudioLoading(false);
    }
  };

  const renderSection = (title: string, icon: React.ReactNode, bgColor: string, iconColor: string, children: React.ReactNode) => (
    <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className={`p-3 ${bgColor} ${iconColor} rounded-xl`}>{icon}</div>
        <h2 className="text-xl font-bold text-slate-800">{title}</h2>
      </div>
      {children}
    </section>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">{report.address}</h1>
          <p className="text-slate-500">{report.postcode}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowLiveAdvisor(true)} className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-indigo-600 text-white font-medium">
            <MessageSquareText size={18} /> Talk to Advisor
          </button>
          <button onClick={onNewSearch} className="bg-white border border-slate-200 text-slate-700 px-6 py-2.5 rounded-lg font-medium">New Search</button>
        </div>
      </div>
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 mb-8">
        <div className="flex items-start gap-4">
          <Info size={24} className="text-blue-600 shrink-0" />
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-blue-900">Area Summary</h3>
              <button onClick={handlePlayAudio} disabled={isAudioLoading} className="text-xs font-bold text-blue-700 uppercase flex items-center gap-2">
                {isAudioLoading ? <Loader2 className="animate-spin" size={14} /> : (audioSource ? <Pause size={14} /> : <Volume2 size={14} />)}
                Listen
              </button>
            </div>
            <p className="text-blue-800 leading-relaxed">{report.summary}</p>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {renderSection("Environmental Risk", <Waves size={24} />, "bg-cyan-50", "text-cyan-600", (
          <p className="text-slate-600 text-sm">{report.floodRisk.riskLevel}: {report.floodRisk.details}</p>
        ))}
        {renderSection("Broadband", <Wifi size={24} />, "bg-purple-50", "text-purple-600", (
          <p className="text-slate-600 text-sm">Max Speed: {report.broadband.maxSpeed}</p>
        ))}
      </div>
      {showLiveAdvisor && <LiveAdvisor report={report} onClose={() => setShowLiveAdvisor(false)} />}
    </div>
  );
};