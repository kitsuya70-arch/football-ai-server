const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { PrismaClient } = require('@prisma/client');

const app = express();
const prisma = new PrismaClient();

app.use(cors());
// DNA ข้อมูลมันเยอะ ต้องเพิ่ม limit การรับส่งข้อมูล
app.use(bodyParser.json({ limit: '50mb' }));

// --- ตัวแปรสำหรับ Live Relay (พักข้อมูลภาพสดจาก Python) ---
let currentMatchState = null; 

// --- API Endpoints ---

// 1. Load: ดึงตัวที่เก่งที่สุด (Fitness มากสุด)
app.get('/api/champion', async (req, res) => {
  try {
    const bestRocket = await prisma.champion.findFirst({
      orderBy: {
        fitness: 'desc', // เรียงจากมากไปน้อย
      },
    });

    if (bestRocket) {
      res.json({
        generation: bestRocket.generation,
        fitness: bestRocket.fitness,
        dna_data: JSON.stringify(bestRocket.dna) 
      });
    } else {
      res.json({ message: 'No champion found yet' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Database error' });
  }
});

// 2. Save: บันทึกตัวเก่งตัวใหม่
app.post('/api/champion', async (req, res) => {
  const { generation, fitness, dna } = req.body;

  try {
    const currentBest = await prisma.champion.findFirst({
      orderBy: { fitness: 'desc' }
    });

    if (!currentBest || fitness > currentBest.fitness) {
      await prisma.champion.create({
        data: {
          generation: parseInt(generation),
          fitness: parseFloat(fitness),
          dna: dna 
        }
      });
      console.log(`Saved new champion! Gen: ${generation}, Fitness: ${fitness}`);
      res.json({ success: true, message: 'New champion saved!' });
    } else {
      res.json({ success: false, message: 'Not good enough to save.' });
    }

  } catch (error) {
    console.error(error);
    res.status(500).send(error.message);
  }
});

// 3. Log Match Result (สำหรับ Dashboard)
app.post('/api/log', async (req, res) => {
  const { generation, result, score } = req.body;
  try {
    await prisma.matchLog.create({
      data: {
        generation: parseInt(generation),
        result: result, // "GOAL" or "FAIL"
        score: parseFloat(score)
      }
    });
    res.json({ success: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Log failed' });
  }
});

// 4. Get Dashboard Stats (สำหรับ Dashboard)
app.get('/api/stats', async (req, res) => {
  try {
    const goals = await prisma.matchLog.count({ where: { result: 'GOAL' } });
    const total = await prisma.matchLog.count();
    const recent = await prisma.matchLog.findMany({
      take: 20,
      orderBy: { createdAt: 'desc' }
    });
    const lastLog = await prisma.matchLog.findFirst({
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      goals,
      fails: total - goals,
      total,
      currentGen: lastLog?.generation || 1,
      history: recent
    });
  } catch (e) {
    res.status(500).json({ error: 'Stats failed' });
  }
});

// --- NEW: Live Match Relay (สำหรับ React Live View) ---

// 5. Python ส่งภาพสดมาฝากไว้
app.post('/api/relay/update', (req, res) => {
    currentMatchState = req.body; // เก็บใส่ RAM
    res.sendStatus(200);
});
  
// 6. React มาขอภาพสดไปวาด
app.get('/api/relay/read', (req, res) => {
    res.json(currentMatchState || { error: "No match running" });
});

app.get('/', (req, res) => {
  res.send('✅ Football AI Server is Running!');
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Prisma Server running on port ${PORT}`);
});