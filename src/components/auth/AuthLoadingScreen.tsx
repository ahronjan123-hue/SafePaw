import React from 'react';
import { Stethoscope, Loader2 } from 'lucide-react';

export const AuthLoadingScreen: React.FC = () => {
  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col items-center justify-center p-6 select-none">
      <div className="flex flex-col items-center max-w-sm text-center space-y-6">
        {/* Animated Brand Emblem */}
        <div className="relative">
          <div className="w-20 h-20 rounded-3xl bg-teal-600 flex items-center justify-center shadow-2xl shadow-teal-500/20 text-white animate-pulse">
            <svg className="w-10 h-10 fill-current" viewBox="0 0 24 24">
              <path d="M12 10.5c1.38 0 2.5-1.12 2.5-2.5s-1.12-2.5-2.5-2.5-2.5 1.12-2.5 2.5 1.12 2.5 2.5 2.5zm-5-2c1.38 0 2.5-1.12 2.5-2.5S8.38 3.5 7 3.5 4.5 4.62 4.5 6s1.12 2.5 2.5 2.5zm10 0c1.38 0 2.5-1.12 2.5-2.5S18.38 3.5 17 3.5 14.5 4.62 14.5 6s1.12 2.5 2.5 2.5zm-1.8 4.2c-.7-.5-1.6-.7-2.7-.7s-2 .2-2.7.7c-2.4 1.7-4.8 5-2.8 7.3 1.2 1.4 3.4 1.5 5.5 1.5s4.3-.1 5.5-1.5c2-2.3-.4-5.6-2.8-7.3z" />
            </svg>
          </div>
          <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-teal-400 text-stone-950 flex items-center justify-center font-black">
            <Stethoscope className="w-4 h-4" />
          </div>
        </div>

        {/* Title & Spinner */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center justify-center gap-1.5">
            <span>SafePaw Connect</span>
          </h1>
          <p className="text-xs text-stone-400">
            Verifying secure session...
          </p>
        </div>

        {/* Progress Spinner */}
        <div className="flex items-center gap-2 text-teal-400 text-xs font-mono font-medium bg-stone-900/90 border border-stone-800 px-4 py-2 rounded-full">
          <Loader2 className="w-4 h-4 animate-spin text-teal-400" />
          <span>Restoring session...</span>
        </div>
      </div>
    </div>
  );
};
