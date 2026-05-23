import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, BookOpen, Users, Play, ArrowLeft, ArrowRight } from 'lucide-react';

const Onboarding = () => {
  const [phase, setPhase] = useState(1);
  const [acknowledged, setAcknowledged] = useState(false);
  const navigate = useNavigate();

  // Pac-Man & Ghost position coordinates
  const [pacmanPos, setPacmanPos] = useState(10); // percent left
  const [ghostPos, setGhostPos] = useState(100);  // percent left
  const [ghostScared, setGhostScared] = useState(false);
  const [ghostDefeated, setGhostDefeated] = useState(false);
  const [powerPellet, setPowerPellet] = useState(true);
  const [pellets, setPellets] = useState([true, true, true, true]); // phase 1 pellets
  const [activeTooltip, setActiveTooltip] = useState('');
  const [showXpFloat, setShowXpFloat] = useState(false);
  const [screenFlash, setScreenFlash] = useState(false);

  // Success Registration Banner
  const [showRegisterFlash, setShowRegisterFlash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowRegisterFlash(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  // Phase 1 (Learning): Pac-Man eats pellets
  useEffect(() => {
    if (phase !== 1) return;
    setPacmanPos(10);
    setPellets([true, true, true, true]);
    setActiveTooltip('Welcome to the study arena!');

    const timeline = [
      { pos: 30, text: 'Answer Questions', eatIdx: 0, delay: 600 },
      { pos: 50, text: 'Earn XP', eatIdx: 1, delay: 1400 },
      { pos: 70, text: 'Build Streaks', eatIdx: 2, delay: 2200 },
      { pos: 90, text: 'Master Decks', eatIdx: 3, delay: 3000 },
    ];

    const timers = [];

    timeline.forEach((step, idx) => {
      timers.push(
        setTimeout(() => {
          setPacmanPos(step.pos);
          setActiveTooltip(step.text);
          timers.push(
            setTimeout(() => {
              setPellets(prev => {
                const next = [...prev];
                next[step.eatIdx] = false;
                return next;
              });
            }, 200)
          );

          if (idx === timeline.length - 1) {
            timers.push(
              setTimeout(() => {
                setActiveTooltip('Independent Study Mastered!');
              }, 800)
            );
          }
        }, step.delay)
      );
    });

    return () => timers.forEach(clearTimeout);
  }, [phase]);

  // Phase 2 (Multiplayer): Ghost Enters
  useEffect(() => {
    if (phase !== 2) return;
    setPacmanPos(30);
    setGhostPos(100);
    setGhostScared(false);
    setGhostDefeated(false);
    setActiveTooltip('A Challenger Enters!');

    const timers = [
      setTimeout(() => {
        setGhostPos(70);
      }, 500),
      setTimeout(() => {
        setActiveTooltip('Battle Real Players in Real-Time!');
      }, 1200),
      setTimeout(() => {
        setActiveTooltip('Protect Your Streak & Climb Leaderboards!');
      }, 2500)
    ];

    return () => timers.forEach(clearTimeout);
  }, [phase]);

  // Phase 3 (Ready for Arena): Eat Power Pellet & Defeat Ghost
  useEffect(() => {
    if (phase !== 3) return;
    setPacmanPos(30);
    setGhostPos(70);
    setGhostScared(false);
    setGhostDefeated(false);
    setPowerPellet(true);
    setActiveTooltip('Grab the Power Pellet!');

    const timers = [
      setTimeout(() => {
        setPacmanPos(50); // Move to power pellet
      }, 800),
      setTimeout(() => {
        setPowerPellet(false);
        setGhostScared(true);
        setActiveTooltip('SPEED & ACCURACY UP!');
      }, 1200),
      setTimeout(() => {
        setPacmanPos(70); // Eat ghost
      }, 2000),
      setTimeout(() => {
        setGhostDefeated(true);
        setScreenFlash(true);
        setShowXpFloat(true);
        setActiveTooltip('VICTORY! YOU ARE READY!');
      }, 2400),
      setTimeout(() => {
        setScreenFlash(false);
      }, 2700)
    ];

    return () => timers.forEach(clearTimeout);
  }, [phase]);

  const handleOnboardingComplete = () => {
    navigate('/dashboard', { replace: true });
  };

  // Pac-man chomping frames
  const chompPath = [
    "M 50 50 L 95 20 A 45 45 0 1 0 95 80 Z",
    "M 50 50 L 95 45 A 45 45 0 1 0 95 55 Z",
    "M 50 50 L 95 20 A 45 45 0 1 0 95 80 Z"
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', padding: '2rem', position: 'relative', overflow: 'hidden', backgroundColor: '#f7f6f3' }}>
      <div className="crt-overlay" />
      <div className="arcade-grid-bg" />

      {/* Screen flash for Phase 3 Victory */}
      <AnimatePresence>
        {screenFlash && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.8 }}
            exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, backgroundColor: 'white', zIndex: 9999, pointerEvents: 'none' }}
          />
        )}
      </AnimatePresence>

      {/* Success Registration Flash Overlay */}
      <AnimatePresence>
        {showRegisterFlash && (
          <motion.div 
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, backgroundColor: 'var(--color-primary)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 9500 }}
          >
            <h2 className="blink-fast" style={{ fontFamily: 'var(--font-8bit)', color: 'var(--color-text)', fontSize: '2rem' }}>
              PROFILE GENERATED!
            </h2>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="neo-box" style={{ maxWidth: '750px', width: '100%', padding: '0', overflow: 'hidden', backgroundColor: 'var(--color-card)', border: 'var(--border-thick)' }}>
        
        {/* Stepper Header */}
        <div style={{ display: 'flex', borderBottom: 'var(--border-thick)', backgroundColor: '#e2e8f0' }}>
          {[
            { step: 1, label: 'LEARNING MODE', icon: <BookOpen size={16} /> },
            { step: 2, label: 'MULTIPLAYER', icon: <Users size={16} /> },
            { step: 3, label: 'READY FOR ARENA', icon: <Zap size={16} /> },
          ].map((s) => (
            <div 
              key={s.step} 
              style={{ 
                flex: 1, 
                padding: '1.2rem 0.5rem', 
                textAlign: 'center', 
                borderRight: s.step < 3 ? 'var(--border-thick)' : 'none',
                backgroundColor: phase === s.step ? 'var(--color-primary)' : 'transparent',
                fontWeight: 900,
                fontSize: '0.8rem',
                fontFamily: 'var(--font-display)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                color: phase === s.step ? 'var(--color-text)' : '#64748b',
                transition: 'all 0.3s'
              }}
            >
              {s.icon} {s.label}
            </div>
          ))}
        </div>

        {/* Viewport Board */}
        <div style={{ 
          position: 'relative', 
          height: '220px', 
          backgroundColor: '#171c24', // Arcade dark viewport backdrop
          borderBottom: 'var(--border-thick)', 
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center'
        }}>
          {/* Grid lines inside viewport */}
          <div style={{ 
            position: 'absolute', 
            inset: 0, 
            backgroundImage: 'radial-gradient(circle, #2a3545 1.5px, transparent 1.5px)', 
            backgroundSize: '24px 24px',
            opacity: 0.5 
          }} />

          {/* Centered Track dotted line */}
          <div style={{ position: 'absolute', left: 0, right: 0, top: '50%', borderTop: '4px dashed #2d3848', transform: 'translateY(-50%)' }} />

          {/* Floating Tooltips Container */}
          <AnimatePresence mode="wait">
            {activeTooltip && (
              <motion.div
                key={activeTooltip}
                initial={{ opacity: 0, y: 15, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -15, scale: 0.9 }}
                style={{
                  position: 'absolute',
                  left: '50%',
                  top: '25px',
                  transform: 'translateX(-50%)',
                  backgroundColor: 'var(--color-highlight)',
                  color: 'var(--color-text)',
                  padding: '6px 14px',
                  border: '2px solid var(--color-text)',
                  fontWeight: 900,
                  fontSize: '0.8rem',
                  fontFamily: 'var(--font-display)',
                  boxShadow: '3px 3px 0px rgba(0,0,0,0.3)',
                  zIndex: 50,
                  whiteSpace: 'nowrap'
                }}
              >
                {activeTooltip}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Floating XP Reward Burst */}
          <AnimatePresence>
            {showXpFloat && (
              <motion.div
                initial={{ opacity: 0, y: 0, scale: 0.5 }}
                animate={{ opacity: [0, 1, 1, 0], y: -80, scale: [0.8, 1.3, 1.3, 0.8] }}
                transition={{ duration: 1.5, ease: 'easeOut' }}
                onAnimationComplete={() => setShowXpFloat(false)}
                style={{
                  position: 'absolute',
                  left: '70%',
                  top: '50%',
                  transform: 'translate(-50%, -50%)',
                  color: 'var(--color-highlight)',
                  fontFamily: 'var(--font-8bit)',
                  fontSize: '1.2rem',
                  textShadow: '3px 3px 0px #000',
                  zIndex: 100
                }}
              >
                +100 XP
              </motion.div>
            )}
          </AnimatePresence>

          {/* Pellets in Phase 1 */}
          {phase === 1 && pellets.map((active, idx) => {
            const positions = [30, 50, 70, 90];
            return active ? (
              <div 
                key={idx}
                style={{
                  position: 'absolute',
                  left: `${positions[idx]}%`,
                  top: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: '12px',
                  height: '12px',
                  backgroundColor: 'var(--color-highlight)',
                  borderRadius: '50%',
                  border: '2px solid var(--color-text)',
                  boxShadow: '0 0 10px var(--color-highlight)'
                }}
              />
            ) : null;
          })}

          {/* Power Pellet in Phase 3 */}
          {phase === 3 && powerPellet && (
            <motion.div 
              animate={{ scale: [1, 1.4, 1] }}
              transition={{ repeat: Infinity, duration: 0.6 }}
              style={{
                position: 'absolute',
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)',
                width: '20px',
                height: '20px',
                backgroundColor: 'var(--color-highlight)',
                borderRadius: '50%',
                border: '3px solid var(--color-text)',
                boxShadow: '0 0 15px var(--color-highlight)'
              }}
            />
          )}

          {/* Pac-Man Character */}
          <motion.div
            animate={{ left: `${pacmanPos}%` }}
            transition={{ type: 'spring', stiffness: 80, damping: 15 }}
            style={{
              position: 'absolute',
              top: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 30
            }}
          >
            <svg viewBox="0 0 100 100" style={{ width: '50px', height: '50px' }}>
              <motion.path
                animate={{
                  d: chompPath
                }}
                transition={{ repeat: Infinity, duration: 0.25, ease: "linear" }}
                fill="var(--color-highlight)"
                stroke="#171717"
                strokeWidth="6"
              />
            </svg>
          </motion.div>

          {/* Ghost Character */}
          {phase >= 2 && !ghostDefeated && (
            <motion.div
              animate={{ left: `${ghostPos}%` }}
              transition={{ type: 'spring', stiffness: 80, damping: 15 }}
              style={{
                position: 'absolute',
                top: '50%',
                transform: 'translate(-50%, -50%)',
                zIndex: 25
              }}
            >
              <svg viewBox="0 0 100 100" style={{ width: '46px', height: '46px' }}>
                <path
                  d="M 15 85 L 15 45 A 35 35 0 0 1 85 45 L 85 85 L 72 75 L 60 85 L 50 75 L 40 85 L 28 75 Z"
                  fill={ghostScared ? "var(--color-primary)" : "var(--color-warning)"}
                  stroke="#171717"
                  strokeWidth="6"
                />
                <circle cx="35" cy="40" r="7" fill="white" />
                <circle cx="35" cy="40" r="3" fill={ghostScared ? "white" : "blue"} />
                <circle cx="65" cy="40" r="7" fill="white" />
                <circle cx="65" cy="40" r="3" fill={ghostScared ? "white" : "blue"} />
              </svg>
            </motion.div>
          )}

        </div>

        {/* Dynamic Descriptive Section */}
        <div style={{ padding: '2rem', backgroundColor: '#ffffff', textAlign: 'center' }}>
          
          <AnimatePresence mode="wait">
            {phase === 1 && (
              <motion.div 
                key="phase1"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '1.1rem', color: 'var(--color-text)', marginBottom: '0.8rem' }}>
                  PHASE 1: ACTIVE STUDY RETRIEVAL
                </h2>
                <p style={{ fontFamily: 'var(--font-main)', color: '#4b5563', fontSize: '0.9rem', lineHeight: '1.6', maxWidth: '580px', margin: '0 auto 2rem' }}>
                  Answer flashcards to earn points, build streaks, and level up! The more you play, the more you learn.
                </p>
                
                {/* Navigation Buttons Area */}
                <div style={{ display: 'flex', justifyContent: 'center', borderTop: '2px solid #e2e8f0', paddingTop: '1.5rem', gap: '1.5rem' }}>
                  <button 
                    className="neo-button bg-cyan" 
                    onClick={() => setPhase(2)}
                    style={{ padding: '10px 24px', display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem' }}
                  >
                    NEXT PHASE <ArrowRight size={16} />
                  </button>
                </div>
              </motion.div>
            )}

            {phase === 2 && (
              <motion.div 
                key="phase2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '1.1rem', color: 'var(--color-text)', marginBottom: '0.8rem' }}>
                  PHASE 2: LIVE MULTIPLAYER DUELS
                </h2>
                <p style={{ fontFamily: 'var(--font-main)', color: '#4b5563', fontSize: '0.9rem', lineHeight: '1.6', maxWidth: '580px', margin: '0 auto 2rem' }}>
                  Battle real players in real-time multiplayer arenas. Answer faster than your opponent to win!
                </p>
                
                {/* Navigation Buttons Area */}
                <div style={{ display: 'flex', justifyContent: 'center', borderTop: '2px solid #e2e8f0', paddingTop: '1.5rem', gap: '1.5rem' }}>
                  <button 
                    className="neo-button" 
                    onClick={() => setPhase(1)}
                    style={{ padding: '10px 24px', display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', backgroundColor: '#e2e8f0' }}
                  >
                    <ArrowLeft size={16} /> BACK
                  </button>
                  <button 
                    className="neo-button bg-cyan" 
                    onClick={() => setPhase(3)}
                    style={{ padding: '10px 24px', display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem' }}
                  >
                    NEXT PHASE <ArrowRight size={16} />
                  </button>
                </div>
              </motion.div>
            )}

            {phase === 3 && (
              <motion.div 
                key="phase3"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '1.1rem', color: 'var(--color-text)', marginBottom: '0.8rem' }}>
                  PHASE 3: ARENA READINESS SECURED
                </h2>
                <p style={{ fontFamily: 'var(--font-main)', color: '#4b5563', fontSize: '0.9rem', lineHeight: '1.6', maxWidth: '580px', margin: '0 auto 1.5rem' }}>
                  You're all set! Acknowledge the rules below to jump into the action.
                </p>

                <div style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center',
                  gap: '1.2rem',
                  marginTop: '1rem'
                }}>
                  <label style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '10px', 
                    cursor: 'pointer', 
                    padding: '10px 14px', 
                    border: '2px solid #1a1a1a', 
                    borderRadius: '8px', 
                    backgroundColor: '#f8fafc',
                    maxWidth: '520px',
                    textAlign: 'left'
                  }}>
                    <input 
                      type="checkbox" 
                      id="onboarding-ack"
                      checked={acknowledged}
                      onChange={(e) => setAcknowledged(e.target.checked)}
                      style={{ width: '20px', height: '20px', accentColor: 'var(--color-primary)', flexShrink: 0, cursor: 'pointer' }}
                    />
                    <span style={{ fontFamily: 'var(--font-main)', fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-text)' }}>
                      I am ready to enter the arena and start learning!
                    </span>
                  </label>
                </div>

                {/* Navigation Buttons Area */}
                <div style={{ display: 'flex', justifyContent: 'center', borderTop: '2px solid #e2e8f0', paddingTop: '1.5rem', gap: '1.5rem', marginTop: '1.5rem' }}>
                  <button 
                    className="neo-button" 
                    onClick={() => setPhase(2)}
                    style={{ padding: '10px 24px', display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', backgroundColor: '#e2e8f0' }}
                  >
                    <ArrowLeft size={16} /> BACK
                  </button>
                  <button 
                    className="neo-button bg-gold" 
                    id="enter-dashboard-btn"
                    style={{ 
                      padding: '10px 24px', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      gap: '8px', 
                      fontSize: '0.9rem',
                      opacity: acknowledged ? 1 : 0.6,
                      cursor: acknowledged ? 'pointer' : 'not-allowed'
                    }}
                    disabled={!acknowledged}
                    onClick={handleOnboardingComplete}
                  >
                    ENTER DASHBOARD <Play size={16} fill="currentColor" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
        </div>

      </div>
    </div>
  );
};

export default Onboarding;
