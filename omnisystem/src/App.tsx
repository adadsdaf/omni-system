import React, { useState } from 'react';
import { SplashScreen } from './components/SplashScreen';

export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  return (
    <div className="w-screen h-screen bg-slate-950 overflow-hidden flex flex-col font-sans select-none" dir="rtl">
      {showSplash && (
        <SplashScreen onComplete={() => setShowSplash(false)} />
      )}

      {/* Embedded view of the local restaurant system running on port 3000 */}
      <iframe 
        src="http://localhost:3000/" 
        className="w-full h-full border-0 bg-white"
        title="Omni System Pro - نظام الكاشير"
      />
    </div>
  );
}


