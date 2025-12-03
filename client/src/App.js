import React from 'react';
import Dashboard from './Dashboard';
import MatchView from './MatchView';

function App() {
  return (
    <div className="min-h-screen bg-slate-950 p-6 font-mono text-slate-200">
      
      {/* 1. Header ส่วนหัว */}
      <header className="mb-8 flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-green-400">
            AI Football Manager 2025
          </h1>
          <p className="text-slate-400 mt-1">
            Reinforcement Learning Simulation Environment
          </p>
        </div>
        <div className="flex space-x-3">
            <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded text-xs border border-green-500/30 animate-pulse">
                ● System Online
            </span>
            <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded text-xs border border-blue-500/30">
                Python Engine: Active
            </span>
        </div>
      </header>

      {/* 2. Main Layout (Grid) */}
      <div className="grid grid-cols-1 2xl:grid-cols-3 gap-6">
        
        {/* Left Column: สนามแข่ง (Live Match) - กินพื้นที่ 2 ส่วน */}
        <div className="2xl:col-span-2">
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
                <div className="bg-slate-800 px-4 py-2 border-b border-slate-700 font-bold text-slate-300 flex justify-between">
                    <span>📺 Live Broadcast</span>
                    <span className="text-red-500 text-xs flex items-center">● LIVE</span>
                </div>
                <div className="p-4 flex justify-center bg-black/50">
                    {/* ลดขนาดนิดนึงถ้าจอเล็ก ด้วย scale */}
                    <div className="scale-75 md:scale-90 xl:scale-100 origin-top">
                        <MatchView />
                    </div>
                </div>
            </div>
        </div>

        {/* Right Column: สถิติ (Dashboard) - กินพื้นที่ 1 ส่วน */}
        <div className="2xl:col-span-1 h-full">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl h-full overflow-y-auto max-h-[800px]">
                <h2 className="text-xl font-bold mb-4 text-blue-400 border-b border-slate-700 pb-2">
                    📊 Performance Data
                </h2>
                {/* ยัด Dashboard ไว้ตรงนี้ */}
                <div className="dashboard-compact">
                    <Dashboard />
                </div>
            </div>
        </div>

      </div>

      {/* Footer */}
      <footer className="mt-8 text-center text-slate-600 text-xs border-t border-slate-900 pt-4">
        AI Project Simulation © 2025 | Powered by Python, Node.js, React & Prisma
      </footer>

    </div>
  );
}

export default App;