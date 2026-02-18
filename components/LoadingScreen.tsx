
import React, { useState, useEffect } from 'react';

const messages = [
  "Connecting to UK Data Hubs...",
  "Retrieving local infrastructure stats...",
  "Analysing school performance data...",
  "Aggregating area intelligence...",
  "Evaluating environment & safety...",
  "Finalising your bespoke report..."
];

export const LoadingScreen: React.FC = () => {
  const [msgIndex, setMsgIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Faster message rotation
    const msgInterval = setInterval(() => {
      setMsgIndex((prev) => (prev + 1) % messages.length);
    }, 1800);

    // Realistic non-linear progress bar simulation
    const progInterval = setInterval(() => {
      setProgress(prev => {
        if (prev < 30) return prev + 2; // Fast start
        if (prev < 60) return prev + 1; // Medium middle
        if (prev < 90) return prev + 0.5; // Slow end
        return prev;
      });
    }, 100);

    return () => {
      clearInterval(msgInterval);
      clearInterval(progInterval);
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center max-w-lg mx-auto">
      <div className="relative mb-8">
        <div className="w-20 h-20 border-4 border-slate-100 rounded-full"></div>
        <div className="absolute inset-0 w-20 h-20 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center text-xs font-black text-blue-600">
          {Math.round(progress)}%
        </div>
      </div>

      <h2 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">Generating Report</h2>
      <p className="text-slate-500 font-medium h-6">{messages[msgIndex]}</p>
      
      <div className="w-full bg-slate-100 h-1.5 rounded-full mt-10 overflow-hidden">
        <div 
          className="h-full bg-blue-600 transition-all duration-300 ease-out shadow-[0_0_10px_rgba(37,99,235,0.4)]"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      <p className="mt-4 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
        Optimized via Gemini 3 Flash
      </p>
    </div>
  );
};
