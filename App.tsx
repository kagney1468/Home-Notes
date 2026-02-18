
import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { auth } from './services/firebase';
import { AppState, PropertyReport } from './types';
import { fetchPropertyReport } from './services/geminiService';
import { LoadingScreen } from './components/LoadingScreen';
import { ReportDashboard } from './components/ReportDashboard';
import { ProfessionalInsightsAgent } from './components/ProfessionalInsightsAgent';
import { AuthScreen } from './components/AuthScreen';
import { 
  Search, Home, Mail, ArrowRight, CheckCircle2,
  Globe, MessageCircle, Briefcase, LogOut, Loader2, Sparkles, AlertCircle
} from 'lucide-react';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authChecking, setAuthChecking] = useState(true);
  const [address, setAddress] = useState('');
  const [status, setStatus] = useState<AppState>(AppState.IDLE);
  const [report, setReport] = useState<PropertyReport | null>(null);
  const [secondReport, setSecondReport] = useState<PropertyReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [isComparing, setIsComparing] = useState(false);
  const [showProfessionalAgent, setShowProfessionalAgent] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      // Check if user exists and is verified
      if (user && user.emailVerified) {
        setCurrentUser(user);
      } else {
        setCurrentUser(null);
      }
      setAuthChecking(false);
    });
    return () => unsubscribe();
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address.trim()) return;
    setStatus(AppState.LOADING);
    setError(null);
    try {
      const data = await fetchPropertyReport(address);
      setReport(data);
      setSecondReport(null);
      setStatus(AppState.REPORT);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
      setStatus(AppState.ERROR);
    }
  };

  const handleCompare = async (targetAddress: string) => {
    if (!targetAddress.trim()) return;
    setIsComparing(true);
    try {
      const data = await fetchPropertyReport(targetAddress);
      setSecondReport(data);
      setStatus(AppState.COMPARING);
    } catch (err: any) {
      alert("Could not fetch comparison address: " + err.message);
    } finally {
      setIsComparing(false);
    }
  };

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.includes('@')) {
      setSubscribed(true);
      setTimeout(() => {
        setSubscribed(false);
        setEmail('');
      }, 5000);
    }
  };

  const handleReset = () => {
    setStatus(AppState.IDLE);
    setAddress('');
    setReport(null);
    setSecondReport(null);
    setError(null);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      handleReset();
    } catch (err) {
      console.error("Error signing out:", err);
    }
  };

  const coverageAreas = [
    "Bournemouth", "Poole", "Christchurch", "Dorchester",
    "London", "Birmingham", "Manchester", "Leeds", "Liverpool", "Bristol", 
    "Sheffield", "Newcastle", "Nottingham", "Leicester", "Coventry", "Southampton"
  ];

  const whatsappNumber = "447724601320"; 
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=Hi NestCheck UK, I have a question about my property report.`;

  if (authChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-blue-600" size={32} />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col text-slate-900 animate-in fade-in duration-500">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer group" onClick={handleReset}>
            <div className="bg-blue-600 p-1.5 rounded-lg group-hover:scale-110 transition-transform"><Home className="text-white" size={20} /></div>
            <span className="text-xl font-black text-slate-900 tracking-tight">NestCheck<span className="text-blue-600">UK</span></span>
          </div>
          <nav className="flex items-center gap-4 md:gap-6">
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="hidden sm:flex items-center gap-2 text-sm font-bold text-emerald-600 hover:text-emerald-700">
              <MessageCircle size={18} /> Support
            </a>
            {currentUser && (
              <>
                <button 
                  onClick={() => setShowProfessionalAgent(true)}
                  className="hidden sm:flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-700 bg-blue-50 px-4 py-2 rounded-full transition-all hover:bg-blue-100"
                >
                  <Briefcase size={16} /> Professional
                </button>
                <button 
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-red-600 transition-colors"
                >
                  <LogOut size={18} /> <span className="hidden xs:inline">Sign Out</span>
                </button>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="flex-grow">
        {status === AppState.IDLE && (
          <div className="relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full -z-10">
              <div className="absolute top-20 left-0 w-72 h-72 bg-blue-400/10 blur-3xl rounded-full"></div>
              <div className="absolute bottom-20 right-0 w-96 h-96 bg-indigo-400/10 blur-3xl rounded-full"></div>
            </div>

            <div className="max-w-5xl mx-auto px-4 pt-12 pb-20">
              {/* Opening Box - Highly Visible */}
              <div className="mb-12 p-8 md:p-12 bg-gradient-to-br from-white to-indigo-50/40 border border-indigo-100 rounded-[3rem] shadow-2xl shadow-indigo-900/10 relative overflow-hidden animate-in slide-in-from-bottom-6 duration-700">
                <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                  <Sparkles size={160} className="text-indigo-600" />
                </div>
                <div className="relative z-10 text-center max-w-3xl mx-auto">
                  <p className="text-2xl md:text-3xl text-slate-800 leading-relaxed font-semibold">
                    This app was created to allow anyone searching for a new place to live some insight into that place - <span className="text-blue-600 font-extrabold">just as property professionals use.</span>
                  </p>
                  <p className="text-xl md:text-2xl text-slate-600 mt-6 leading-relaxed">
                    It doesn't matter whether you are looking to buy or rent. To keep your lists active or to share the info, just leave your details. Why not give it a go?
                  </p>
                </div>
              </div>

              <div className="text-center mb-12">
                <h1 className="text-5xl md:text-6xl font-black text-slate-900 mb-6 leading-tight">
                  Searching for your next home? <br/><span className="text-blue-600">Get intelligent insight.</span>
                </h1>
                <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
                  The most comprehensive area reports for the UK - including side-by-side comparisons and deep AI analysis.
                </p>
              </div>

              {/* Conditional Search or Auth Interface */}
              <div className="max-w-2xl mx-auto mb-20">
                {currentUser ? (
                  <div className="animate-in fade-in duration-500">
                    <div className="inline-flex items-center gap-2 bg-white border border-slate-200 px-4 py-1.5 rounded-full text-xs font-bold text-slate-500 mb-8 shadow-sm mx-auto block w-fit">
                      <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                      LOGGED IN AS: {currentUser.email?.toUpperCase()}
                    </div>
                    <form onSubmit={handleSearch} className="relative group">
                      <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors"><Search size={24} /></div>
                      <input
                        type="text"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="Enter full address and postcode in UK ..."
                        className="w-full pl-14 pr-32 py-5 rounded-2xl border-2 border-slate-200 focus:border-blue-600 focus:ring-4 focus:ring-blue-50 outline-none text-lg transition-all shadow-xl bg-white text-slate-900"
                      />
                      <button type="submit" className="absolute right-3 top-2.5 bottom-2.5 bg-blue-600 text-white px-8 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg active:scale-95">Analyze</button>
                    </form>
                  </div>
                ) : (
                  <div className="animate-in slide-in-from-bottom-4 duration-500">
                    <AuthScreen />
                  </div>
                )}
              </div>

              {/* Newsletter Component */}
              <div className="max-w-xl mx-auto bg-slate-50 border border-slate-200 rounded-2xl p-6 shadow-sm mb-16">
                <div className="flex items-center gap-3 mb-4 justify-center">
                  <Mail className="text-blue-600" size={20} />
                  <h3 className="font-bold text-slate-800">Receive our Newsletter if you wish </h3>
                </div>
                {subscribed ? (
                  <div className="flex items-center justify-center gap-2 text-emerald-600 font-bold animate-bounce">
                    <CheckCircle2 size={20} /> Thanks for joining!
                  </div>
                ) : (
                  <form onSubmit={handleSubscribe} className="flex gap-2">
                    <input 
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@email.com" 
                      className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 outline-none text-sm bg-white"
                      required
                    />
                    <button className="bg-slate-900 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-slate-800 transition-colors flex items-center gap-2 group">
                      Notify <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                  </form>
                )}
                <p className="mt-3 text-[10px] text-slate-400 uppercase font-bold tracking-widest text-center">JOIN 2,500+ USERS GETTING AI PROPERTY INSIGHTS</p>
              </div>

              {/* Geo Authority Section for SEO */}
              <div className="max-w-3xl mx-auto py-12 border-t border-slate-100 text-center">
                <div className="flex items-center justify-center gap-2 text-slate-400 mb-6">
                  <Globe size={16} />
                  <h2 className="text-sm font-bold uppercase tracking-widest">Major Coverage Areas in England</h2>
                </div>
                <div className="flex flex-wrap justify-center gap-x-6 gap-y-3">
                  {coverageAreas.map((city) => (
                    <span key={city} className="text-slate-500 hover:text-blue-600 cursor-default transition-colors font-medium">
                      Property Reports {city}
                    </span>
                  ))}
                </div>
                <p className="mt-8 text-slate-400 text-xs leading-relaxed max-w-lg mx-auto">
                  NestCheck UK provides deep area intelligence for home buyers and renters across the South Coast (Bournemouth, Poole, Christchurch), Midlands, North West, and all major English regions.
                </p>
              </div>
            </div>
          </div>
        )}

        {status === AppState.LOADING && <LoadingScreen />}
        
        {(status === AppState.REPORT || status === AppState.COMPARING) && report && (
          <ReportDashboard 
            report={report} 
            secondReport={secondReport}
            onNewSearch={handleReset} 
            onCompare={handleCompare}
            isComparing={isComparing}
          />
        )}

        {status === AppState.ERROR && (
          <div className="max-w-2xl mx-auto px-4 py-32 text-center">
            <div className="bg-red-50 text-red-600 p-8 rounded-3xl border border-red-100 inline-block mb-6">
              <AlertCircle size={48} className="mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Something went wrong</h2>
              <p className="text-red-700 opacity-80">{error}</p>
            </div>
            <div><button onClick={handleReset} className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-slate-800 shadow-lg">Try Another Address</button></div>
          </div>
        )}
      </main>

      {/* Professional Insights Agent */}
      {showProfessionalAgent && (
        <ProfessionalInsightsAgent onClose={() => setShowProfessionalAgent(false)} />
      )}

      {/* Floating WhatsApp FAB */}
      <a 
        href={whatsappUrl} 
        target="_blank" 
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-[60] bg-emerald-500 text-white p-4 rounded-full shadow-2xl hover:bg-emerald-600 hover:scale-110 transition-all group flex items-center gap-2"
        aria-label="Contact us on WhatsApp"
      >
        <MessageCircle size={24} />
        <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs transition-all duration-500 text-sm font-bold">
          WhatsApp Us
        </span>
      </a>

      <footer className="bg-slate-900 text-slate-400 py-12 mt-auto">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-start gap-8 border-b border-slate-800 pb-8 mb-8">
            <div className="max-w-md">
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-blue-600 p-1 rounded-lg"><Home className="text-white" size={16} /></div>
                <span className="text-lg font-bold text-white tracking-tight">NestCheckUK</span>
              </div>
              <p className="text-sm italic mb-4">AI-Driven Real Estate Intelligence for England.</p>
              
              <div className="mb-6">
                <h4 className="text-white text-xs font-bold uppercase mb-3">Contact Support</h4>
                <div className="flex flex-col gap-2">
                  <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-4 py-2 rounded-lg hover:bg-emerald-500/20 transition-all text-sm font-medium">
                    <MessageCircle size={18} />
                    07724 601320 (WhatsApp)
                  </a>
                </div>
              </div>

              <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-800">
                <h4 className="text-white text-xs font-bold uppercase mb-2">Legal Disclaimer</h4>
                <p className="text-[11px] leading-relaxed">
                  The data provided by NestCheck UK is sourced from third-party online databases and AI analysis. 
                  We make no warranties, expressed or implied, as to the accuracy, completeness, or reliability of this information. 
                  Users are strictly responsible for verifying the data themselves and should consult with professional surveyors or solicitors before making any commitments.
                </p>
              </div>
            </div>
            <div className="flex gap-8 text-sm">
               <div className="flex flex-col gap-2">
                 <h4 className="text-white text-xs font-bold uppercase mb-2">Navigation</h4>
                 <a href="#" className="hover:text-white">API Access</a>
                 <a href="#" className="hover:text-white">Privacy Policy</a>
                 <a href="#" className="hover:text-white">Terms of Service</a>
               </div>
               <div className="flex flex-col gap-2">
                 <h4 className="text-white text-xs font-bold uppercase mb-2">Primary Coverage</h4>
                 <span className="text-[10px] text-slate-500">Dorset & South Coast:</span>
                 <p className="text-[11px] text-slate-400">Bournemouth, Poole, Christchurch, Dorchester</p>
                 <span className="text-[10px] text-slate-500 mt-2">National Hubs:</span>
                 <p className="text-[11px] text-slate-400">London, Manchester, Birmingham, Leeds</p>
               </div>
            </div>
          </div>
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-medium uppercase tracking-widest opacity-60">
            <p>© 2026 Kadima Systems Ltd • Data via Gemini 3 Flash</p>
            <p>Empowering home searches with local intelligence</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
