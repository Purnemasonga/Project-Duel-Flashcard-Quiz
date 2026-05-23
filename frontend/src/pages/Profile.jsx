import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Activity, Clock, Crosshair, ArrowLeft, Shield, Gauge, Cpu } from 'lucide-react';

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      navigate('/', { replace: true });
      return;
    }
    setUser(JSON.parse(userStr));
  }, [navigate]);

  if (!user) return null;

  // Determine Level Bracket based on XP
  const xp = user.xp || 0;
  const level = Math.floor(xp / 100) + 1;
  const currentLevelXp = xp % 100;
  const nextLevelXpNeeded = 100;
  const xpPercentage = (currentLevelXp / nextLevelXpNeeded) * 100;

  let bracket = "ROOKIE DRIVER";
  if (xp > 500) bracket = "SECTOR CHAMPION";
  if (xp > 2000) bracket = "TELEMETRY MASTER";

  // Simulated telemetry session logs
  const sessionLogs = [
    { id: "DUEL_#8291", subject: "Data Structures", opponent: "BYTE_BREAKER", precision: "92%", latency: "2.8s", result: "WIN", resultColor: "var(--color-secondary)" },
    { id: "DUEL_#7482", subject: "Operating Systems", opponent: "GHOST_RUNNER", precision: "85%", latency: "3.4s", result: "WIN", resultColor: "var(--color-secondary)" },
    { id: "DUEL_#6291", subject: "DBMS", opponent: "ALGO_BEAST", precision: "70%", latency: "4.1s", result: "LOSS", resultColor: "#f0a395" },
    { id: "DUEL_#5182", subject: "Computer Networks", opponent: "CYBER_SHIELD", precision: "95%", latency: "2.5s", result: "WIN", resultColor: "var(--color-secondary)" }
  ];

  return (
    <div style={{ padding: '6rem 2rem 3rem', minHeight: '100vh', position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', backgroundColor: '#f7f6f3' }}>
      <div className="crt-overlay" />
      <div className="arcade-grid-bg" />

      {/* Sleek F1 HUD Profile Container */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 90, damping: 14 }}
        className="neo-box" 
        style={{ maxWidth: '1100px', width: '100%', padding: '2.5rem', backgroundColor: 'var(--color-card)', border: 'var(--border-thick)' }}
      >
        
        {/* HUD Navigation / Title */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '3px solid var(--color-border)', paddingBottom: '1.5rem', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <Cpu size={28} color="var(--color-primary)" className="blink" />
            <div>
              <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '1.2rem', color: 'var(--color-text)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                DRIVER TELEMETRY CONSOLE
              </h1>
              <span style={{ fontSize: '0.65rem', fontFamily: 'var(--font-8bit)', color: '#64748b' }}>
                LIVE FEED CHANNEL // CLIENT_ID: {user.username.toUpperCase()}
              </span>
            </div>
          </div>
          <button 
            className="neo-button bg-crimson" 
            style={{ color: 'white', display: 'flex', alignItems: 'center', gap: '8px', padding: '0.5rem 1.2rem', fontSize: '0.85rem' }} 
            onClick={() => navigate('/dashboard', { replace: true })}
          >
            <ArrowLeft size={16} /> RETURN TO DASHBOARD
          </button>
        </div>

        {/* F1 Grid telemetry panels */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1.9fr', gap: '2rem' }}>
          
          {/* LEFT SIDE PANEL: PROFILE ACCUMULATOR & LIVE GRAPH */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            
            {/* Identity & Level Gauge */}
            <div className="neo-box" style={{ padding: '1.5rem', backgroundColor: 'var(--color-bg)', border: 'var(--border-thick)', position: 'relative' }}>
              <span className="neo-box bg-cyan" style={{ position: 'absolute', top: '-12px', left: '12px', padding: '1px 8px', fontSize: '0.6rem', fontFamily: 'var(--font-8bit)', fontWeight: 900, color: 'var(--color-text)' }}>
                IDENTITY BEACON
              </span>
              <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '1.4rem', color: 'var(--color-text)', marginTop: '0.5rem', marginBottom: '0.4rem' }}>
                {user.username.toUpperCase()}
              </h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.5rem' }}>
                <Shield size={14} color="var(--color-secondary)" />
                <span style={{ fontSize: '0.7rem', fontWeight: 900, fontFamily: 'var(--font-8bit)', color: 'var(--color-secondary)' }}>
                  {bracket}
                </span>
              </div>

              {/* Progress Accumulator Bar */}
              <div style={{ borderTop: '2px dashed #cbd5e1', paddingTop: '1.2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', fontWeight: 800, color: '#64748b', marginBottom: '6px' }}>
                  <span>XP TELEMETRY CHANNEL</span>
                  <span>LVL {level} ({currentLevelXp}/100 XP)</span>
                </div>
                <div style={{ height: '14px', backgroundColor: '#e2e8f0', border: '2px solid #1a1a1a', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: `${xpPercentage}%`, height: '100%', backgroundColor: 'var(--color-primary)', transition: 'width 0.6s cubic-bezier(0.1, 0.8, 0.2, 1)' }} />
                </div>
              </div>
            </div>

            {/* Simulated Live Analytics Line graph */}
            <div className="neo-box" style={{ padding: '1.5rem', backgroundColor: 'var(--color-bg)', border: 'var(--border-thick)', position: 'relative' }}>
              <span className="neo-box bg-gold" style={{ position: 'absolute', top: '-12px', left: '12px', padding: '1px 8px', fontSize: '0.6rem', fontFamily: 'var(--font-8bit)', fontWeight: 900, color: 'var(--color-text)' }}>
                LATENCY VS ACCURACY WAVE
              </span>
              
              <div style={{ height: '120px', width: '100%', marginTop: '0.8rem', display: 'flex', alignItems: 'flex-end', position: 'relative' }}>
                {/* SVG path to simulate telemetry graph waves */}
                <svg viewBox="0 0 100 40" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} preserveAspectRatio="none">
                  {/* Grid lines */}
                  <line x1="0" y1="10" x2="100" y2="10" stroke="#e2e8f0" strokeWidth="0.5" strokeDasharray="2" />
                  <line x1="0" y1="20" x2="100" y2="20" stroke="#e2e8f0" strokeWidth="0.5" strokeDasharray="2" />
                  <line x1="0" y1="30" x2="100" y2="30" stroke="#e2e8f0" strokeWidth="0.5" strokeDasharray="2" />
                  
                  {/* Accuracy Wave (Cyan) */}
                  <path d="M 0 10 Q 25 5 50 15 T 100 8" fill="none" stroke="var(--color-primary)" strokeWidth="1.5" />
                  {/* Latency Wave (Coral) */}
                  <path d="M 0 28 Q 25 35 50 20 T 100 32" fill="none" stroke="#f0a395" strokeWidth="1.5" />
                </svg>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', borderTop: '2px solid #e2e8f0', paddingTop: '0.8rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-primary)' }} />
                  <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#64748b' }}>ACCURACY WAVE</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#f0a395' }} />
                  <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#64748b' }}>LATENCY WAVE</span>
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT SIDE PANEL: MODULAR STATS AND SESSION RECORDS */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            
            {/* Modular Telemetry Data Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.2rem' }}>
              
              {/* Accuracy panel */}
              <div className="neo-box" style={{ padding: '1rem', backgroundColor: 'var(--color-bg)', display: 'flex', gap: '1rem', alignItems: 'center', border: 'var(--border-thick)' }}>
                <div className="neo-box" style={{ padding: '8px', backgroundColor: 'rgba(124, 224, 184, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Crosshair size={24} color="var(--color-secondary)" />
                </div>
                <div>
                  <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#64748b', display: 'block', textTransform: 'uppercase' }}>Precision Index</span>
                  <span style={{ fontSize: '1.15rem', fontWeight: 900, color: 'var(--color-text)' }}>88.5% ACC</span>
                </div>
              </div>

              {/* Lap response speed panel */}
              <div className="neo-box" style={{ padding: '1rem', backgroundColor: 'var(--color-bg)', display: 'flex', gap: '1rem', alignItems: 'center', border: 'var(--border-thick)' }}>
                <div className="neo-box" style={{ padding: '8px', backgroundColor: 'rgba(83, 199, 240, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Clock size={24} color="var(--color-primary)" />
                </div>
                <div>
                  <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#64748b', display: 'block', textTransform: 'uppercase' }}>Sector Response</span>
                  <span style={{ fontSize: '1.15rem', fontWeight: 900, color: 'var(--color-text)' }}>3.2s LATENCY</span>
                </div>
              </div>

              {/* Match record panel */}
              <div className="neo-box" style={{ padding: '1rem', backgroundColor: 'var(--color-bg)', display: 'flex', gap: '1rem', alignItems: 'center', border: 'var(--border-thick)' }}>
                <div className="neo-box" style={{ padding: '8px', backgroundColor: 'rgba(240, 163, 149, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Activity size={24} color="#f0a395" />
                </div>
                <div>
                  <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#64748b', display: 'block', textTransform: 'uppercase' }}>Match Record</span>
                  <span style={{ fontSize: '1.15rem', fontWeight: 900, color: 'var(--color-text)' }}>{user.matches} DUELS RUN</span>
                </div>
              </div>

              {/* DRS Streak panel */}
              <div className="neo-box" style={{ padding: '1rem', backgroundColor: 'var(--color-bg)', display: 'flex', gap: '1rem', alignItems: 'center', border: 'var(--border-thick)' }}>
                <div className="neo-box" style={{ padding: '8px', backgroundColor: 'rgba(242, 207, 74, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Gauge size={24} color="var(--color-highlight)" />
                </div>
                <div>
                  <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#64748b', display: 'block', textTransform: 'uppercase' }}>DRS Streak Buffer</span>
                  <span style={{ fontSize: '1.15rem', fontWeight: 900, color: 'var(--color-text)' }}>⚡ x{user.streak} BUFF</span>
                </div>
              </div>

            </div>

            {/* Session logs table panel */}
            <div className="neo-box" style={{ padding: '1.5rem', backgroundColor: 'var(--color-bg)', border: 'var(--border-thick)', position: 'relative' }}>
              <span className="neo-box bg-cyan" style={{ position: 'absolute', top: '-12px', left: '12px', padding: '1px 8px', fontSize: '0.6rem', fontFamily: 'var(--font-8bit)', fontWeight: 900, color: 'var(--color-text)' }}>
                LOGS // DUEL HISTORY METRIC
              </span>

              <div style={{ overflowX: 'auto', marginTop: '0.5rem' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontFamily: 'var(--font-main)', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #cbd5e1' }}>
                      <th style={{ padding: '8px', color: '#64748b', fontWeight: 800 }}>SESSION ID</th>
                      <th style={{ padding: '8px', color: '#64748b', fontWeight: 800 }}>TARGET MODULE</th>
                      <th style={{ padding: '8px', color: '#64748b', fontWeight: 800 }}>OPPONENT</th>
                      <th style={{ padding: '8px', color: '#64748b', fontWeight: 800 }}>PRECISION</th>
                      <th style={{ padding: '8px', color: '#64748b', fontWeight: 800 }}>SPEED</th>
                      <th style={{ padding: '8px', color: '#64748b', fontWeight: 800 }}>STATUS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sessionLogs.map((log, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0' }}>
                        <td style={{ padding: '10px 8px', fontWeight: 900, color: 'var(--color-text)' }}>{log.id}</td>
                        <td style={{ padding: '10px 8px', fontWeight: 700, color: '#334155' }}>{log.subject}</td>
                        <td style={{ padding: '10px 8px', fontWeight: 700, color: '#64748b' }}>{log.opponent}</td>
                        <td style={{ padding: '10px 8px', fontWeight: 900, color: 'var(--color-text)' }}>{log.precision}</td>
                        <td style={{ padding: '10px 8px', fontWeight: 900, color: '#334155' }}>{log.latency}</td>
                        <td style={{ padding: '10px 8px' }}>
                          <span className="neo-box" style={{ padding: '2px 8px', fontSize: '0.65rem', fontWeight: 900, backgroundColor: log.resultColor, border: '1px solid #1a1a1a', display: 'inline-block' }}>
                            {log.result}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>

        </div>

      </motion.div>
    </div>
  );
};

export default Profile;
