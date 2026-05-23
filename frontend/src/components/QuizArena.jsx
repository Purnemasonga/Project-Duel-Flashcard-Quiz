import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Clock, Zap, PlusCircle, X } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

const socket = io('http://localhost:5000');

const QuizArena = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const state = location.state || {};
  const topic = state.topic || 'all';
  const tier = state.tier || 'all';
  const isMultiplayer = !!state.isMultiplayer;
  const isSoloTraining = !!state.isSoloTraining;
  const roomId = state.roomId || null;
  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [loadingTimeoutReached, setLoadingTimeoutReached] = useState(false);
  const [fillValue, setFillValue] = useState('');
  
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isAnswerValidated, setIsAnswerValidated] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [streak, setStreak] = useState(0);
  const [xp, setXp] = useState(0);
  const [lives, setLives] = useState(3);
  const [isFinished, setIsFinished] = useState(false);

  const [timeLeft, setTimeLeft] = useState(15);
  const [opponentStatus, setOpponentStatus] = useState("Opponent is thinking...");
  
  // Opponent Data
  const [opponentName, setOpponentName] = useState(isMultiplayer ? "OPPONENT" : "⚔️ BYTE_BREAKER");
  const [opponentLives, setOpponentLives] = useState(3);
  const [opponentScore, setOpponentScore] = useState(0);
  const [opponentIdx, setOpponentIdx] = useState(0);

  // Powerups states
  const [hasUsedShield, setHasUsedShield] = useState(false);
  const [isShieldActive, setIsShieldActive] = useState(false);
  const [hasUsedSlowMo, setHasUsedSlowMo] = useState(false);
  const [hasUsedHack, setHasUsedHack] = useState(false);
  const [disabledMCQOptions, setDisabledMCQOptions] = useState([]);

  // Emoji Reaction state
  const [floatingEmojis, setFloatingEmojis] = useState([]);

  // CRT Flash validation feedback states
  const [flashType, setFlashType] = useState(null);

  const [user, setUser] = useState(null);
  
  // Request Deck Modal States
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestForm, setRequestForm] = useState({ deckName: '', topic: '', message: '' });
  const [requestStatus, setRequestStatus] = useState('');

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      navigate('/', { replace: true });
      return;
    }
    const parsedUser = JSON.parse(userStr);
    setUser(parsedUser);

    if (!location.state) {
      navigate('/dashboard', { replace: true });
      return;
    }

    // Connect socket to room if multiplayer
    if (isMultiplayer && roomId) {
      socket.emit('join_room', roomId);
    }

    // Socket listeners for duel actions
    socket.on('opponent_score_sync', ({ username, score, lives, currentIdx }) => {
      setOpponentName(username);
      setOpponentScore(score);
      setOpponentLives(lives);
      setOpponentIdx(currentIdx);
    });

    socket.on('receive_emoji', ({ emoji }) => {
      triggerFloatingEmoji(emoji, 'right');
    });

    return () => {
      socket.off('opponent_score_sync');
      socket.off('receive_emoji');
    };
  }, [isMultiplayer, roomId, location.state, navigate]);

  // 15-second Question Timer
  useEffect(() => {
    let timer;
    if (!isAnswerValidated && timeLeft > 0) {
      timer = setTimeout(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft === 0 && !isAnswerValidated) {
      // Auto submit incorrect when time runs out
      handleValidationResult(false);
      setIsAnswerValidated(true);
    }
    return () => clearTimeout(timer);
  }, [timeLeft, isAnswerValidated]);

  // Opponent Activity Simulation (Solo or Multiplayer helper)
  useEffect(() => {
    if (!isAnswerValidated) {
      setDisabledMCQOptions([]);
      
      if (isSoloTraining) {
        setOpponentStatus("Practice Mode");
      } else if (!isMultiplayer) {
        // Solo Mode: Simulate BOT Opponent progress
        const delay = Math.random() * 8000 + 4000;
        const timeout = setTimeout(() => {
          setOpponentStatus("⚠️ Opponent answered!");
          
          // Randomly trigger bot emoji reactions
          const reactions = ['🔥', '😮', '💀', '🎉'];
          if (Math.random() > 0.6) {
            triggerFloatingEmoji(reactions[Math.floor(Math.random() * reactions.length)], 'right');
          }

          // Randomly calculate bot answer correctness
          const botIsCorrect = Math.random() > 0.3;
          if (botIsCorrect) {
            setOpponentScore(prev => prev + 10);
          } else {
            setOpponentLives(prev => Math.max(0, prev - 1));
          }
          setOpponentIdx(prev => prev + 1);

        }, delay);
        return () => clearTimeout(timeout);
      } else {
        // Multiplayer Mode: Wait for real socket ping
        setOpponentStatus("Syncing Match...");
      }
    }
  }, [currentIdx, isAnswerValidated, isMultiplayer]);
  
  // Fetch course questions
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const url = isMultiplayer && roomId
          ? `http://localhost:5000/api/rooms/${roomId}/questions`
          : `http://localhost:5000/api/questions?topic=${encodeURIComponent(topic)}&tier=${encodeURIComponent(tier)}`;
        const res = await fetch(url);
        const data = await res.json();
        if (data.questions) {
          setQuestions(data.questions);
        }
      } catch (err) {
        console.error("Failed to fetch questions", err);
      }
    };
    fetchQuestions();
  }, [topic, tier, isMultiplayer, roomId]);

  // Loading timeout safeguard
  useEffect(() => {
    let t;
    if (!questions || questions.length === 0) {
      setLoadingTimeoutReached(false);
      t = setTimeout(() => {
        setLoadingTimeoutReached(true);
      }, 7000);
    }
    return () => clearTimeout(t);
  }, [questions]);

  const triggerFloatingEmoji = (emoji, side) => {
    const id = Date.now() + Math.random();
    setFloatingEmojis(prev => [...prev, { id, emoji, side }]);
    setTimeout(() => {
      setFloatingEmojis(prev => prev.filter(item => item.id !== id));
    }, 2000);
  };

  const sendEmojiReaction = (emoji) => {
    triggerFloatingEmoji(emoji, 'left');
    if (isMultiplayer && roomId) {
      socket.emit('send_emoji', { roomId, emoji });
    }
  };

  // Tactical Power-up methods
  const handleUseShield = () => {
    if (hasUsedShield) return;
    setHasUsedShield(true);
    setIsShieldActive(true);
  };

  const handleUseSlowMo = () => {
    if (hasUsedSlowMo) return;
    setHasUsedSlowMo(true);
    setTimeLeft(prev => prev + 10);
  };

  const handleUseHack = () => {
    if (hasUsedHack || question?.type !== 'mcq' || !question?.options) return;
    setHasUsedHack(true);
    const correctOption = question.answer;
    const incorrectOptions = question.options.filter(o => o !== correctOption);
    const shuffledIncorrect = incorrectOptions.sort(() => 0.5 - Math.random());
    setDisabledMCQOptions(shuffledIncorrect.slice(0, 2));
  };

  const handleValidateMCQ = (option) => {
    if (isAnswerValidated) return;
    setSelectedAnswer(option);
    setIsAnswerValidated(true);
    
    const correct = option === question?.answer;
    handleValidationResult(correct);
  };

  const handleValidateFillIn = () => {
    if (isAnswerValidated || !fillValue.trim()) return;
    setIsAnswerValidated(true);
    
    const correct = fillValue.trim().toLowerCase() === question?.answer?.toLowerCase();
    handleValidationResult(correct);
  };

  const handleValidationResult = (correct) => {
    setIsCorrect(correct);
    if (correct) {
      setFlashType('correct');
      const newStreak = streak + 1;
      setStreak(newStreak);
      const multiplier = newStreak >= 3 ? 2 : 1;
      const addedXp = 10 * multiplier;
      const newScore = xp + addedXp;
      setXp(newScore);

      // Sync score with opposing client
      if (isMultiplayer && roomId) {
        socket.emit('match_score_sync', { roomId, username: user?.username || 'STUDENT', score: newScore, lives, currentIdx: currentIdx + 1 });
      }
    } else {
      setFlashType('wrong');
      setStreak(0);
      if (isShieldActive) {
        setIsShieldActive(false); // Shield fully absorbed wrong hit
        // Sync index even with shield active so opponent knows player answered
        if (isMultiplayer && roomId) {
          socket.emit('match_score_sync', { roomId, username: user?.username || 'STUDENT', score: xp, lives, currentIdx: currentIdx + 1 });
        }
      } else {
        const newLives = Math.max(0, lives - 1);
        setLives(newLives);

        // Sync damage with opposing client
        if (isMultiplayer && roomId) {
          socket.emit('match_score_sync', { roomId, username: user?.username || 'STUDENT', score: xp, lives: newLives, currentIdx: currentIdx + 1 });
        }
      }
    }
    // Remove flash overlay after 0.5s
    setTimeout(() => setFlashType(null), 500);
  };

  const syncStatsAndExit = async () => {
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const uObj = JSON.parse(userStr);
        const res = await fetch('http://localhost:5000/api/auth/stats/update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            username: uObj.username, 
            xpToAdd: xp, 
            finalStreak: streak > (uObj.streak || 0) ? streak : (uObj.streak || 0),
            subject: location.state?.topic
          })
        });
        const resObj = await res.json();
        if (resObj && resObj.success) {
          localStorage.setItem('user', JSON.stringify(resObj.user));
        }
      }
    } catch (e) {
      console.error("Failed to sync stats", e);
    }
    navigate('/dashboard', { replace: true });
  };

  const handleRequestSubmit = async (e) => {
    e.preventDefault();
    if (!requestForm.deckName || !requestForm.topic) return;
    
    try {
      setRequestStatus('submitting');
      const res = await fetch('http://localhost:5000/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentName: user?.username || 'Unknown',
          deckName: requestForm.deckName,
          topic: requestForm.topic,
          message: requestForm.message
        })
      });
      if (res.ok) {
        setRequestStatus('success');
        setTimeout(() => {
          setShowRequestModal(false);
          setRequestForm({ deckName: '', topic: '', message: '' });
          setRequestStatus('');
        }, 1500);
      } else {
        setRequestStatus('error');
      }
    } catch (err) {
      setRequestStatus('error');
    }
  };

  const handleNext = async () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(currentIdx + 1);
      setFillValue('');
      setSelectedAnswer(null);
      setIsAnswerValidated(false);
      setIsCorrect(false);
      setTimeLeft(15);
      setOpponentStatus(isSoloTraining ? "Practice Mode" : "Syncing Match...");
    } else {
      setIsFinished(true);
    }
  };

  const question = questions[currentIdx];

  if (!questions.length) {
    return (
      <div style={{ position: 'fixed', inset: 0, zIndex: 2000, backgroundColor: 'var(--color-admin-canvas)', color: 'var(--color-canvas)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '2rem' }}>
        <h2 style={{ fontWeight: 900, fontFamily: 'var(--font-8bit)', fontSize: '1rem', color: 'var(--color-primary)' }} className="blink">
          {isSoloTraining ? "PREPARING PRACTICE SESSION..." : "FINDING OPPONENT..."}
        </h2>
        {loadingTimeoutReached && (
          <button 
            className="neo-button bg-crimson" 
            style={{ color: 'white', padding: '0.8rem 1.5rem', fontSize: '0.9rem', cursor: 'pointer' }} 
            onClick={() => navigate('/dashboard')}
          >
            ❌ CANCEL & EXIT
          </button>
        )}
      </div>
    );
  }

  const isGameOver = lives === 0 || (isMultiplayer && opponentLives === 0) || isFinished;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 2000, backgroundColor: 'var(--color-admin-container)', color: 'var(--color-canvas)', display: 'flex', flexDirection: 'column', padding: '2rem' }}>
      
      {/* Dynamic Flash Validation Overlay */}
      <AnimatePresence>
        {flashType === 'correct' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.15 }} exit={{ opacity: 0 }} style={{ position: 'fixed', inset: 0, backgroundColor: 'var(--color-mint)', zIndex: 3000, pointerEvents: 'none' }} />
        )}
        {flashType === 'wrong' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.15 }} exit={{ opacity: 0 }} style={{ position: 'fixed', inset: 0, backgroundColor: 'var(--color-crimson)', zIndex: 3000, pointerEvents: 'none' }} />
        )}
      </AnimatePresence>

      <div className="crt-overlay" />

      {/* Main Grid Battle Area */}
      <div style={{ display: 'grid', gridTemplateColumns: isSoloTraining ? '1.2fr 3.8fr' : '1fr 3fr 1fr', gap: '2rem', height: '100%', width: '100%', maxWidth: '1600px', margin: '0 auto', alignItems: 'center' }}>
        
        {/* LEFT COLUMN: PLAYER CARD DOSSIER */}
        <div className="neo-box" style={{ backgroundColor: 'var(--color-admin-canvas)', padding: '2rem', border: 'var(--border-thick)', position: 'relative' }}>
          <span className="neo-box bg-cyan" style={{ position: 'absolute', top: '-15px', left: '15px', padding: '0.2rem 1rem', fontFamily: 'var(--font-8bit)', fontSize: '0.65rem', fontWeight: 900, color: '#1a1a1a' }}>
            YOU
          </span>
          
          <h3 style={{ fontFamily: 'var(--font-8bit)', fontSize: '0.85rem', color: 'white', marginBottom: '1.5rem', marginTop: '0.5rem' }}>
            {user?.username || 'STUDENT'}
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#888', display: 'block', marginBottom: '0.3rem', fontFamily: 'var(--font-display)' }}>LIVES</span>
              <div className="neo-box" style={{ padding: '0.5rem', backgroundColor: '#1F262E', textAlign: 'center', fontFamily: 'var(--font-8bit)', fontSize: '1.2rem', color: 'white' }}>
                {'❤️'.repeat(lives)}{'🤍'.repeat(3 - lives)}
              </div>
            </div>

            <div>
              <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#888', display: 'block', marginBottom: '0.3rem', fontFamily: 'var(--font-display)' }}>SCORE</span>
              <div className="neo-box bg-cyan" style={{ padding: '0.5rem', fontWeight: 900, textAlign: 'center', fontFamily: 'var(--font-8bit)', fontSize: '1.1rem', color: '#1a1a1a' }}>
                ⚡ {xp} XP
              </div>
            </div>

            <div>
              <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#888', display: 'block', marginBottom: '0.3rem', fontFamily: 'var(--font-display)' }}>STREAK</span>
              <div className="neo-box bg-gold" style={{ padding: '0.5rem', fontWeight: 900, textAlign: 'center', fontFamily: 'var(--font-8bit)', fontSize: '1.1rem', color: '#1a1a1a' }}>
                🔥 x{streak}
              </div>
              {streak >= 3 && (
                <div style={{ color: 'var(--color-gold)', fontWeight: 900, fontSize: '0.8rem', marginTop: '0.5rem', textAlign: 'center', animation: 'blink-fast 0.6s infinite' }}>
                  ⚡ STREAK MULTIPLIER!
                </div>
              )}
            </div>
          </div>
        </div>

        {/* MIDDLE COLUMN: ARENA SCREEN CONTEXT */}
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'center', position: 'relative' }}>
          
          {/* Reaction Emoji particles floating overlays */}
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 10 }}>
            <AnimatePresence>
              {floatingEmojis.map(item => (
                <motion.div 
                  key={item.id}
                  initial={{ y: 200, x: item.side === 'left' ? 100 : 500, scale: 0.5, opacity: 0 }}
                  animate={{ y: -100, scale: 1.5, opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1.8, ease: 'easeOut' }}
                  style={{ position: 'absolute', fontSize: '3rem' }}
                >
                  {item.emoji}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <div className={`neo-box ${flashType === 'wrong' ? 'shake' : ''}`} style={{ backgroundColor: 'var(--color-admin-canvas)', border: 'var(--border-thick)', position: 'relative', padding: '3.5rem', minHeight: '520px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            
            <button 
              className="neo-button bg-crimson" 
              style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', padding: '0.5rem 1.2rem', fontSize: '0.8rem', color: 'white' }}
              onClick={() => navigate('/dashboard', { replace: true })}
            >
              ABORT
            </button>

            {/* Shield glow visual feedback */}
            {isShieldActive && (
              <span className="neo-box bg-gold blink" style={{ position: 'absolute', top: '1.5rem', left: '1.5rem', padding: '0.5rem 1.2rem', fontSize: '0.7rem', fontWeight: 900, color: '#1a1a1a', display: 'flex', gap: '6px' }}>
                <Shield size={12} /> SHIELD ACTIVE
              </span>
            )}

            {/* Arena Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px dashed #333', paddingBottom: '1.5rem', marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 900, color: 'var(--color-mint)', textTransform: 'uppercase', fontFamily: 'var(--font-8bit)' }}>
                DECK: {topic}
              </h2>
              
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <span className="neo-box bg-canvas" style={{ padding: '0.5rem 1rem', color: '#1A1A1A', fontWeight: 900, fontSize: '0.85rem' }}>
                  {opponentStatus}
                </span>
                <span className="neo-box bg-cyan" style={{ padding: '0.5rem 1.2rem', color: '#1A1A1A', fontWeight: 900, fontFamily: 'var(--font-8bit)', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Clock size={16} /> {timeLeft}s
                </span>
              </div>
            </div>

            {/* Game Over Overlays */}
            {isGameOver && (
              <div style={{ position: 'absolute', inset: 0, zIndex: 100, backgroundColor: 'rgba(21, 25, 30, 0.98)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderRadius: '12px', backdropFilter: 'blur(10px)', padding: '2rem', textAlign: 'center' }}>
                <h1 style={{ 
                  fontFamily: 'var(--font-8bit)', 
                  fontSize: '3.5rem', 
                  color: lives === 0 ? 'var(--color-crimson)' : 'var(--color-mint)', 
                  marginBottom: '1rem', 
                  textShadow: '4px 4px 0px #1A1A1A', 
                  animation: 'bounce3d 1s infinite' 
                }}>
                  {lives === 0 ? 'DEFEAT' : (isMultiplayer ? 'VICTORY!' : 'TRAINING COMPLETE')}
                </h1>
                <p style={{ fontSize: '1.2rem', fontWeight: 800, color: '#888', marginBottom: '0.5rem', fontFamily: 'var(--font-display)' }}>
                  {isMultiplayer ? `YOUR SCORE: ${xp} XP | OPPONENT: ${opponentScore} XP` : `FINAL SCORE: ${xp} XP`}
                </p>
                <p style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--color-canvas)', marginBottom: '2.5rem' }}>
                  {isMultiplayer 
                    ? (xp > opponentScore ? '🏆 YOU DOMINATED THE ARENA!' : (xp < opponentScore ? '💀 BETTER LUCK NEXT DUEL!' : '🤝 IT IS A DRAW!'))
                    : '🔥 PRACTICE MAKES PERFECT!'
                  }
                </p>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                  <button className="neo-button bg-gold" style={{ fontSize: '1.2rem', minWidth: '280px', color: '#1a1a1a' }} onClick={syncStatsAndExit}>
                    RETURN TO DASHBOARD →
                  </button>
                  <button className="neo-button" style={{ fontSize: '1.2rem', minWidth: '280px', backgroundColor: 'var(--color-secondary)' }} onClick={() => setShowRequestModal(true)}>
                    <PlusCircle size={20} /> REQUEST NEW DECK
                  </button>
                </div>
              </div>
            )}

            {/* Question block */}
            <div style={{ flex: 1, marginBottom: '2rem' }}>
              <p style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '2.5rem', lineHeight: '1.5' }}>
                {question.id}. {question.text}
              </p>

              {/* MCQ format */}
              {question.type === 'mcq' && question.options && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.2rem' }}>
                  {question.options.map((opt, i) => {
                    let bgColor = 'white';
                    let animClass = '';
                    const isOptionDisabled = disabledMCQOptions.includes(opt);

                    if (isAnswerValidated) {
                      if (opt === question.answer) {
                        if (opt === selectedAnswer) {
                          bgColor = 'var(--color-mint)';
                          animClass = 'bounce-3d';
                        }
                      } else if (opt === selectedAnswer) {
                        bgColor = 'var(--color-crimson)';
                        animClass = 'shake';
                      }
                    }

                    return (
                      <button 
                        key={i} 
                        className={`neo-button ${animClass}`} 
                        style={{ 
                          backgroundColor: isOptionDisabled ? '#444' : bgColor, 
                          color: isOptionDisabled ? '#888' : '#1A1A1A', 
                          textAlign: 'left', 
                          padding: '1.2rem',
                          borderBottomColor: isAnswerValidated && opt === question.answer && opt !== selectedAnswer ? 'var(--color-mint)' : (isOptionDisabled ? '#222' : 'inherit'),
                          borderBottomWidth: isAnswerValidated && opt === question.answer && opt !== selectedAnswer ? '8px' : '4px',
                          textDecoration: isOptionDisabled ? 'line-through' : 'none',
                          cursor: isOptionDisabled ? 'not-allowed' : 'pointer'
                        }}
                        onClick={() => handleValidateMCQ(opt)}
                        disabled={isAnswerValidated || timeLeft === 0 || isOptionDisabled}
                      >
                        <span style={{ fontWeight: 900, fontFamily: 'var(--font-8bit)', fontSize: '0.8rem', marginRight: '6px' }}>{String.fromCharCode(65 + i)}.</span> {opt}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Fill-in format */}
              {question.type === 'fill-in' && (
                <div>
                  <div style={{ display: 'flex', gap: '1.2rem' }}>
                    <input 
                      type="text" 
                      className={`neo-input ${isAnswerValidated && !isCorrect ? 'shake' : (isAnswerValidated && isCorrect ? 'bounce-3d' : '')}`} 
                      placeholder="TYPE YOUR ANSWER HERE..." 
                      value={fillValue}
                      onChange={(e) => setFillValue(e.target.value)}
                      disabled={isAnswerValidated || timeLeft === 0}
                      style={{ 
                        maxWidth: '500px', 
                        backgroundColor: isAnswerValidated ? (isCorrect ? 'var(--color-mint)' : 'var(--color-crimson)') : 'white',
                        color: isAnswerValidated ? (isCorrect ? '#1A1A1A' : 'white') : '#1A1A1A',
                        fontFamily: 'var(--font-main)',
                        fontSize: '0.9rem'
                      }}
                    />
                    {!isAnswerValidated && timeLeft > 0 && (
                      <button className="neo-button bg-cyan" onClick={handleValidateFillIn}>SUBMIT ⚡</button>
                    )}
                  </div>
                  {isAnswerValidated && !isCorrect && (
                    <div style={{ marginTop: '1.5rem', color: 'var(--color-mint)', fontWeight: 900, fontFamily: 'var(--font-8bit)', fontSize: '0.8rem' }}>
                      CORRECT DATALINK VALUE: {question.answer?.toUpperCase()}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Arena Footer */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '2px dashed #333', paddingTop: '1.5rem' }}>
              <div style={{ fontWeight: 800, color: '#888', fontSize: '0.9rem', fontFamily: 'var(--font-display)' }}>
                QUESTION {currentIdx + 1} OF {questions.length} | XP GAINED: {xp}
              </div>
              {isAnswerValidated && (
                <button className="neo-button bg-gold" onClick={handleNext} style={{ fontSize: '1rem' }}>
                  {currentIdx === questions.length - 1 ? 'FINISH MATCH →' : 'NEXT QUESTION →'}
                </button>
              )}
            </div>
          </div>

          {/* LOWER PANEL: POWERUPS & EMOJI INTERACTION CONSOLE */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '2rem' }}>
            
            {/* Tactical Powerups */}
            <div className="neo-box" style={{ padding: '1rem', backgroundColor: 'var(--color-admin-canvas)', border: 'var(--border-thick)', display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
              <span style={{ fontFamily: 'var(--font-8bit)', fontSize: '0.6rem', color: '#888', display: 'block', transform: 'rotate(-90deg)', whiteSpace: 'nowrap' }}>
                POWER-UPS
              </span>
              
              <button 
                className="neo-button bg-gold" 
                onClick={handleUseShield} 
                disabled={hasUsedShield}
                style={{ flex: 1, padding: '0.8rem 0.5rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              >
                <Shield size={16} /> {hasUsedShield ? 'USED' : 'SHIELD'}
              </button>

              <button 
                className="neo-button bg-cyan" 
                onClick={handleUseSlowMo} 
                disabled={hasUsedSlowMo}
                style={{ flex: 1, padding: '0.8rem 0.5rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              >
                <Clock size={16} /> {hasUsedSlowMo ? 'USED' : 'SLOW-MO'}
              </button>

              <button 
                className="neo-button bg-lavender" 
                onClick={handleUseHack} 
                disabled={hasUsedHack || question?.type !== 'mcq'}
                style={{ flex: 1, padding: '0.8rem 0.5rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              >
                <Zap size={16} /> {hasUsedHack ? 'USED' : 'HACK 50/50'}
              </button>
            </div>

            {/* Emoji reaction board */}
            <div className="neo-box" style={{ padding: '1rem', backgroundColor: 'var(--color-admin-canvas)', border: 'var(--border-thick)', display: 'flex', gap: '1rem', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontFamily: 'var(--font-8bit)', fontSize: '0.6rem', color: '#888' }}>
                REACTIONS
              </span>
              {['🔥', '😮', '💀', '⚡', '🎉'].map(emoji => (
                <button 
                  key={emoji}
                  className="neo-box interactive" 
                  onClick={() => sendEmojiReaction(emoji)}
                  style={{ 
                    fontSize: '1.6rem', padding: '0.3rem 0.6rem', backgroundColor: 'white', 
                    cursor: 'pointer', border: '2px solid #1a1a1a', borderRadius: '8px' 
                  }}
                >
                  {emoji}
                </button>
              ))}
            </div>

          </div>

        </div>

        {/* RIGHT COLUMN: OPPONENT BATTLE DOSSIER */}
        {!isSoloTraining && (
          <div className="neo-box floating-delayed" style={{ backgroundColor: 'var(--color-admin-canvas)', padding: '2rem', border: 'var(--border-thick)', position: 'relative' }}>
            <span className="neo-box bg-crimson" style={{ position: 'absolute', top: '-15px', left: '15px', padding: '0.2rem 1rem', fontFamily: 'var(--font-8bit)', fontSize: '0.65rem', fontWeight: 900, color: 'white' }}>
              OPPONENT
            </span>

            <h3 style={{ fontFamily: 'var(--font-8bit)', fontSize: '0.85rem', color: 'white', marginBottom: '1.5rem', marginTop: '0.5rem' }}>
              {opponentName}
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#888', display: 'block', marginBottom: '0.3rem', fontFamily: 'var(--font-display)' }}>LIVES</span>
                <div className="neo-box" style={{ padding: '0.5rem', backgroundColor: '#1F262E', textAlign: 'center', fontFamily: 'var(--font-8bit)', fontSize: '1.2rem', color: 'white' }}>
                  {opponentLives > 0 ? '❤️'.repeat(opponentLives) + '🤍'.repeat(3 - opponentLives) : '💀 DISCONNECTED'}
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#888', display: 'block', marginBottom: '0.3rem', fontFamily: 'var(--font-display)' }}>SCORE</span>
                <div className="neo-box bg-crimson" style={{ padding: '0.5rem', fontWeight: 900, textAlign: 'center', fontFamily: 'var(--font-8bit)', fontSize: '1.1rem', color: 'white' }}>
                  ⚡ {opponentScore} XP
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#888', display: 'block', marginBottom: '0.3rem', fontFamily: 'var(--font-display)' }}>CURRENT STAGE</span>
                <div className="neo-box bg-lavender" style={{ padding: '0.5rem', fontWeight: 900, textAlign: 'center', fontFamily: 'var(--font-8bit)', fontSize: '1.1rem', color: '#1a1a1a' }}>
                  STAGE {opponentIdx}
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Request Deck Modal */}
      <AnimatePresence>
        {showRequestModal && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ 
              position: 'fixed', inset: 0, zIndex: 5000, 
              backgroundColor: 'rgba(21, 25, 30, 0.85)', backdropFilter: 'blur(4px)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1rem'
            }}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              className="neo-box"
              style={{ 
                backgroundColor: 'var(--color-card)', padding: '2.5rem', width: '100%', maxWidth: '500px',
                border: 'var(--border-thick)', position: 'relative', color: '#1a1a1a'
              }}
            >
              <button 
                onClick={() => setShowRequestModal(false)}
                style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', cursor: 'pointer' }}
              >
                <X size={24} color="var(--color-text)" />
              </button>

              <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '1.4rem', color: 'var(--color-text)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
                REQUEST A NEW DECK
              </h2>
              <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '2rem', fontFamily: 'var(--font-main)' }}>
                Suggest a new study topic to the Admin. Once approved, it will be added to the Arena!
              </p>

              <form onSubmit={handleRequestSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, marginBottom: '0.5rem', color: '#1a1a1a' }}>DECK NAME (e.g. Machine Learning)</label>
                  <input 
                    type="text" required
                    value={requestForm.deckName} onChange={(e) => setRequestForm({...requestForm, deckName: e.target.value})}
                    className="neo-input" style={{ width: '100%', padding: '12px', backgroundColor: 'white', color: '#1a1a1a' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, marginBottom: '0.5rem', color: '#1a1a1a' }}>TOPIC (e.g. Neural Networks)</label>
                  <input 
                    type="text" required
                    value={requestForm.topic} onChange={(e) => setRequestForm({...requestForm, topic: e.target.value})}
                    className="neo-input" style={{ width: '100%', padding: '12px', backgroundColor: 'white', color: '#1a1a1a' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, marginBottom: '0.5rem', color: '#1a1a1a' }}>OPTIONAL MESSAGE</label>
                  <textarea 
                    value={requestForm.message} onChange={(e) => setRequestForm({...requestForm, message: e.target.value})}
                    className="neo-input" style={{ width: '100%', padding: '12px', minHeight: '80px', resize: 'vertical', backgroundColor: 'white', color: '#1a1a1a' }}
                    placeholder="Why should this be added?"
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={requestStatus === 'submitting' || requestStatus === 'success'}
                  className="neo-button bg-cyan" 
                  style={{ padding: '14px', marginTop: '1rem', fontSize: '1rem' }}
                >
                  {requestStatus === 'submitting' ? 'SENDING...' : requestStatus === 'success' ? 'REQUEST SENT!' : 'SUBMIT REQUEST'}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default QuizArena;
