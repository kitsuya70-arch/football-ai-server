import React, { useEffect, useState } from 'react';

const Dashboard = () => {
  const [stats, setStats] = useState({
    goals: 0,
    fails: 0,
    total: 0,
    currentGen: 1,
    history: []
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/stats');
        const data = await res.json();
        setStats(data);
      } catch (err) {}
    };
    fetchData();
    const interval = setInterval(fetchData, 1000);
    return () => clearInterval(interval);
  }, []);

  const winRate = stats.total === 0 ? 0 : ((stats.goals / stats.total) * 100).toFixed(1);

  return (
    <div className="bg-slate-900 text-white font-mono h-full flex flex-col">
      
      {/* Stats Cards (2x2 Grid) */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-slate-800 p-4 rounded border-l-4 border-blue-500">
          <h3 className="text-slate-400 text-[10px] uppercase">Matches</h3>
          <p className="text-2xl font-bold">{stats.total}</p>
        </div>
        <div className="bg-slate-800 p-4 rounded border-l-4 border-green-500">
          <h3 className="text-slate-400 text-[10px] uppercase">Goals</h3>
          <p className="text-2xl font-bold text-green-400">{stats.goals}</p>
        </div>
        <div className="bg-slate-800 p-4 rounded border-l-4 border-red-500">
          <h3 className="text-slate-400 text-[10px] uppercase">Fails</h3>
          <p className="text-2xl font-bold text-red-400">{stats.fails}</p>
        </div>
        <div className="bg-slate-800 p-4 rounded border-l-4 border-purple-500 relative overflow-hidden">
          <h3 className="text-slate-400 text-[10px] uppercase">Win Rate</h3>
          <p className="text-2xl font-bold text-purple-300">{winRate}%</p>
          <div className="absolute bottom-0 left-0 h-1 bg-purple-900 w-full">
            <div className="h-full bg-purple-400" style={{ width: `${winRate}%` }}></div>
          </div>
        </div>
      </div>

      {/* History List (Scrollable) */}
      <div className="bg-slate-800 rounded flex-1 overflow-hidden flex flex-col border border-slate-700">
        <div className="bg-slate-700 px-3 py-2 text-xs font-bold text-slate-300 uppercase flex justify-between">
            <span>Recent Matches</span>
            <span className="text-yellow-400">Current Gen: {stats.currentGen}</span>
        </div>
        
        <div className="overflow-y-auto p-2 space-y-1 flex-1">
          {stats.history.map((log) => (
            <div key={log.id} className="flex justify-between items-center text-xs p-2 bg-slate-700/30 rounded hover:bg-slate-700/50">
              <span className="text-slate-400 w-12">#{log.generation}</span>
              <span className="font-mono flex-1 text-center">
                {log.result === 'GOAL' ? (
                  <span className="text-green-400 font-bold">GOAL ⚽</span>
                ) : (
                  <span className="text-red-400">FAIL ❌</span>
                )}
              </span>
              <span className="text-slate-300 w-12 text-right">{log.score.toFixed(0)}</span>
            </div>
          ))}
          {stats.history.length === 0 && (
            <p className="text-center text-slate-500 text-xs py-4">Waiting for data...</p>
          )}
        </div>
      </div>

    </div>
  );
};

export default Dashboard;