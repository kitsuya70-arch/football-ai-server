import React, { useRef, useEffect, useState } from 'react';

const MatchView = () => {
  const canvasRef = useRef(null);
  const [matchData, setMatchData] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    const fetchGameState = async () => {
      try {
        const res = await fetch('https://football-api-e14r.onrender.com/api/relay/read');
        const data = await res.json();
        
        if (!data.error) {
            setMatchData(data);
            setIsConnected(true);
            drawGame(ctx, data);
        } else {
            // กรณี Python ยังไม่ส่งข้อมูลมา
            drawWaitingScreen(ctx);
        }
      } catch (e) {
        setIsConnected(false);
        drawWaitingScreen(ctx);
      }
      requestAnimationFrame(fetchGameState);
    };

    fetchGameState();
  }, []);

  const drawWaitingScreen = (ctx) => {
    // พื้นหลังสีดำเวลารอ
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, 1000, 600);
    ctx.fillStyle = '#64748b';
    ctx.font = '30px monospace';
    ctx.textAlign = 'center';
    ctx.fillText("Waiting for Python Engine...", 500, 300);
  };

  const drawGame = (ctx, data) => {
    // 1. Draw Field (ลายหญ้า)
    ctx.fillStyle = '#34d399'; // สีเขียวอ่อน
    ctx.fillRect(0, 0, 1000, 600);
    ctx.fillStyle = '#10b981'; // สีเขียวเข้ม
    // วาดลายทางสนามหญ้า
    for (let i = 0; i < 1000; i += 100) {
        ctx.fillRect(i, 0, 50, 600);
    }

    // 2. Field Lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.lineWidth = 4;
    ctx.strokeRect(50, 50, 900, 500); // เส้นขอบ
    
    // เส้นกลางสนาม
    ctx.beginPath(); ctx.moveTo(500, 50); ctx.lineTo(500, 550); ctx.stroke();
    // วงกลมกลาง
    ctx.beginPath(); ctx.arc(500, 300, 70, 0, Math.PI*2); ctx.stroke();
    // จุดโทษกลาง
    ctx.fillStyle = 'white'; ctx.beginPath(); ctx.arc(500, 300, 4, 0, Math.PI*2); ctx.fill();

    // เขตประตู (ซ้าย-ขวา) - วาดให้สมจริงขึ้น
    ctx.strokeRect(50, 200, 60, 200);  // เขตโทษซ้าย
    ctx.strokeRect(960, 240, 40, 120); // ประตูขวา (เป้าหมาย)

    // 3. Shadows (เงาใต้คน)
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    [...data.enemies, ...data.players].forEach(p => {
        ctx.beginPath(); ctx.ellipse(p.x, p.y + 10, 8, 3, 0, 0, Math.PI*2); ctx.fill();
    });

    // 4. Draw Enemies (Red)
    data.enemies.forEach(e => {
        ctx.fillStyle = e.role === 'gk' ? '#f59e0b' : '#ef4444'; // GK สีส้ม, กองหลังแดง
        ctx.beginPath(); ctx.arc(e.x, e.y, 12, 0, Math.PI*2); ctx.fill();
        ctx.strokeStyle = '#7f1d1d'; ctx.lineWidth = 2; ctx.stroke();
        
        // เบอร์เสื้อ (สมมติ)
        ctx.fillStyle = 'rgba(255,255,255,0.8)';
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(e.role === 'gk' ? "GK" : "DF", e.x, e.y + 4);
    });

    // 5. Draw My Team (Blue)
    data.players.forEach(p => {
        ctx.fillStyle = p.role === 'gk' ? '#f59e0b' : '#3b82f6';
        ctx.beginPath(); ctx.arc(p.x, p.y, 12, 0, Math.PI*2); ctx.fill();
        ctx.strokeStyle = '#1e3a8a'; ctx.lineWidth = 2; ctx.stroke();

        // Marker คนมีบอล (วงแหวนหมุน)
        if (p.hasBall) {
            ctx.strokeStyle = '#fbbf24'; // สีเหลืองทอง
            ctx.lineWidth = 3;
            ctx.beginPath(); ctx.arc(p.x, p.y, 18, 0, Math.PI*2); ctx.stroke();
        }
    });

    // 6. Draw Ball
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath(); ctx.arc(data.ball.x, data.ball.y, 7, 0, Math.PI*2); ctx.fill();
    ctx.strokeStyle = 'black'; ctx.lineWidth = 1; ctx.stroke();
    // แสงเงาบอล
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.beginPath(); ctx.arc(data.ball.x - 2, data.ball.y - 2, 2, 0, Math.PI*2); ctx.fill();
  };

  return (
    <div className="relative w-full h-full flex flex-col bg-black rounded-lg overflow-hidden shadow-2xl border border-slate-700">
      
      {/* 🔴 Live Overlay Badge */}
      <div className="absolute top-4 left-4 z-10 flex items-center space-x-2 bg-black/60 backdrop-blur-sm px-3 py-1 rounded-full border border-white/10">
        <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-red-500 animate-pulse' : 'bg-gray-500'}`}></div>
        <span className="text-white text-xs font-bold tracking-widest">
            {isConnected ? 'LIVE BROADCAST' : 'OFFLINE'}
        </span>
      </div>

      {/* 📊 Score Overlay */}
      {matchData && (
        <div className="absolute top-4 right-4 z-10 bg-black/60 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/10 text-right">
            <div className="text-xs text-slate-400 uppercase">Current Match</div>
            <div className="text-white font-bold text-lg">
                <span className="text-blue-400">Team {matchData.teamIdx + 1}</span>
                <span className="mx-2 text-slate-500">vs</span>
                <span className="text-red-400">CPU</span>
            </div>
            <div className="text-xs text-yellow-500 font-mono mt-1">Generation: {matchData.gen}</div>
        </div>
      )}

      {/* 🏟️ The Canvas */}
      {/* ใช้ w-full เพื่อให้ยืดเต็มกล่องแม่ แต่ยังคง aspect ratio เดิมภายใน */}
      <div className="w-full h-full flex items-center justify-center bg-green-800">
        <canvas 
            ref={canvasRef} 
            width={1000} 
            height={600} 
            className="w-full h-auto max-h-full object-contain"
        />
      </div>

    </div>
  );
};

export default MatchView;