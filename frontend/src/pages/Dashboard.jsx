import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { motion, AnimatePresence } from 'framer-motion';
import TRexWidget from '../components/TRexWidget';
import { 
  Trophy, Sparkles, Zap, Flame, User, LogOut, Swords, Target, 
  Layers, Play, ChevronRight, Activity, ShieldAlert, Cpu, Code,
  ClipboardPaste, CheckCircle2, BookOpen, PlusCircle, X
} from 'lucide-react';

const socket = io('http://localhost:5000');

const colors = [
  { accent: '#f2cf4a', bgGradient: 'linear-gradient(135deg, #fefce8, #fdf8c7)', overlay: 'rgba(242, 207, 74, 0.2)' }, // Arcade Yellow
  { accent: '#53c7f0', bgGradient: 'linear-gradient(135deg, #ecfeff, #cffafe)', overlay: 'rgba(83, 199, 240, 0.2)' }, // Cyan Energy
  { accent: '#7ce0b8', bgGradient: 'linear-gradient(135deg, #ecfdf5, #d1fae5)', overlay: 'rgba(124, 224, 184, 0.2)' }, // Mint Green
  { accent: '#ff8b80', bgGradient: 'linear-gradient(135deg, #fff1f2, #ffe4e6)', overlay: 'rgba(255, 139, 128, 0.2)' }, // Vibrant Coral
  { accent: '#b5a7df', bgGradient: 'linear-gradient(135deg, #f5f3ff, #ede9fe)', overlay: 'rgba(181, 167, 223, 0.2)' }, // Electric Lavender
  { accent: '#f2cf4a', bgGradient: 'linear-gradient(135deg, #fefce8, #fdf8c7)', overlay: 'rgba(242, 207, 74, 0.2)' }  // Arcade Yellow
];

const Dashboard = () => {
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState([]);
  const [activeTab, setActiveTab] = useState('solo');

  // Multiplayer matchmaking states
  const [roomCode, setRoomCode] = useState(null);
  const [inputCode, setInputCode] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [matchFound, setMatchFound] = useState(false);
  const [matchCountdown, setMatchCountdown] = useState(3);
  const [pasteSuccess, setPasteSuccess] = useState(false);
  const [invalidCode, setInvalidCode] = useState(false);

  const [user, setUser] = useState(null);

  const [leaderboard, setLeaderboard] = useState([]);

  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestForm, setRequestForm] = useState({ deckName: '', topic: '', message: '' });
  const [requestStatus, setRequestStatus] = useState('');

  const quests = [
    { text: "Win 1 Multiplayer Duel", completed: false, xp: "+150 XP" },
    { text: "Maintain a 3+ Day Streak", completed: true, xp: "+100 XP" },
    { text: "Achieve Combo Multiplier x2", completed: false, xp: "+80 XP" }
  ];

  // Fetch dynamic subjects
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/subjects');
        const data = await res.json();
        if (Array.isArray(data)) {
          setSubjects(data);
        } else {
          setSubjects([]);
        }
      } catch (err) {
        console.error("Failed to fetch subjects from server", err);
        setSubjects([]);
      }
    };
    
    const fetchLeaderboard = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/users/leaderboard');
        const data = await res.json();
        if (data.success && Array.isArray(data.leaderboard)) {
          setLeaderboard(data.leaderboard.map((user, idx) => ({ ...user, rank: idx + 1 })));
        }
      } catch (err) {
        console.error("Failed to fetch leaderboard", err);
      }
    };
    
    fetchSubjects();
    fetchLeaderboard();
  }, []);

  // Retrieve user from storage
  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      setUser(JSON.parse(userStr));
    } else {
      navigate('/', { replace: true });
    }

    socket.on('room_created', (code) => {
      setRoomCode(code);
      setIsSearching(true);
    });

    socket.on('room_joined', (code) => {
      setRoomCode(code);
      setIsSearching(false);
      setMatchFound(true);
      setInvalidCode(false);
      
      let counter = 3;
      setMatchCountdown(counter);
      const interval = setInterval(() => {
        counter -= 1;
        if (counter <= 0) {
          clearInterval(interval);
          setMatchFound(false);
          navigate('/arena', { 
            state: { 
              topic: 'MULTIPLAYER DUEL', 
              tier: 'topic', 
              isMultiplayer: true, 
              isSoloTraining: false, 
              roomId: code 
            } 
          });
        } else {
          setMatchCountdown(counter);
        }
      }, 1000);
    });

    socket.on('invalid_code', () => {
      setInvalidCode(true);
      setTimeout(() => setInvalidCode(false), 500);
    });

    return () => {
      socket.off('room_created');
      socket.off('room_joined');
      socket.off('invalid_code');
    };
  }, [navigate]);

  const handleCreateRoom = (subjectName = 'all', difficulty = 'all') => {
    socket.emit('create_room', { subject: subjectName, tier: difficulty });
  };
  
  const handleJoinRoom = () => {
    if (inputCode.trim().length === 6) {
      socket.emit('join_room', inputCode.trim());
    } else {
      setInvalidCode(true);
      setTimeout(() => setInvalidCode(false), 500);
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      const code = text.trim().substring(0, 6).toUpperCase();
      setInputCode(code);
      setPasteSuccess(true);
      setTimeout(() => setPasteSuccess(false), 1500);
    } catch (err) {
      console.error('Failed to paste code', err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/', { replace: true });
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

  const handleStartSolo = (subjectName, difficulty) => {
    navigate('/arena', { 
      state: { 
        topic: subjectName, 
        tier: difficulty, 
        isMultiplayer: false, 
        isSoloTraining: true, 
        roomId: null 
      } 
    });
  };

  const handleHostMulti = (subjectName, difficulty) => {
    handleCreateRoom(subjectName, difficulty);
  };

  const xp = user?.xp || 0;
  const level = Math.floor(xp / 100) + 1;
  const currentLevelXp = xp % 100;
  const xpPercentage = (currentLevelXp / 100) * 100;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 90 } }
  };

  return (
    <div style={{ paddingTop: '80px', minHeight: '100vh', position: 'relative', backgroundColor: '#f7f6f3' }}>
      <div className="arcade-grid-bg" />
      <div className="crt-overlay" />

      {/* Navigation Bar */}
      <nav style={{ 
        position: 'fixed', top: 0, left: 0, width: '100vw', height: '80px', 
        backgroundColor: 'var(--color-bg)',
        borderBottom: 'var(--border-thick)', zIndex: 1000,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 2rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '2.5rem' }}>
          <h1 style={{ 
            fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '1.2rem', 
            color: 'var(--color-text)', letterSpacing: '1px', textTransform: 'uppercase'
          }}>
            FLASHCARD DUEL
          </h1>
          
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <span className="neo-box" style={{ padding: '0.4rem 1rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', boxShadow: '2px 2px 0px rgba(0,0,0,0.05)', backgroundColor: 'var(--color-highlight)' }}>
              <Flame size={18} /> {user?.streak || 0} STREAK
            </span>
            <span className="neo-box" style={{ padding: '0.4rem 1rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', boxShadow: '2px 2px 0px rgba(0,0,0,0.05)', backgroundColor: 'var(--color-primary)' }}>
              <Zap size={18} /> {xp} XP
            </span>
            <span className="neo-box" style={{ padding: '0.4rem 1rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', boxShadow: '2px 2px 0px rgba(0,0,0,0.05)', backgroundColor: 'var(--color-secondary)' }}>
              LVL {level}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div className="neo-box interactive" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0.4rem 1.2rem', backgroundColor: 'var(--color-card)', boxShadow: '2px 2px 0px rgba(0,0,0,0.05)', cursor: 'pointer' }} onClick={() => navigate('/profile')}>
            <User size={18} color="var(--color-primary)" />
            <span style={{ fontWeight: 800, color: 'var(--color-text)', fontSize: '0.9rem', fontFamily: 'var(--font-display)' }}>{user?.username.toUpperCase()}</span>
          </div>
          
          <button className="neo-button bg-crimson" style={{ padding: '0.5rem 0.8rem' }} onClick={handleLogout}>
            <LogOut size={20} color="white" />
          </button>
        </div>
      </nav>

      {/* Main Grid content */}
      <main style={{ padding: '2.5rem', maxWidth: '1500px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 380px', gap: '2.5rem' }}>
        
        {/* Left Column */}
        <motion.div variants={containerVariants} initial="hidden" animate="visible" style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
          
          {/* Main Action Panel with Tab Switchers */}
          <motion.section variants={itemVariants} className="neo-box" style={{ 
            padding: '2rem', 
            backgroundColor: 'var(--color-card)',
            position: 'relative', overflow: 'hidden'
          }}>
            <div style={{ display: 'flex', borderBottom: '3px solid var(--color-border)', marginBottom: '2rem', gap: '1rem' }}>
              <button 
                onClick={() => setActiveTab('solo')}
                style={{
                  padding: '10px 20px',
                  fontWeight: 900,
                  fontFamily: 'var(--font-display)',
                  fontSize: '1.05rem',
                  border: 'var(--border-thick)',
                  borderBottom: 'none',
                  borderTopLeftRadius: '8px',
                  borderTopRightRadius: '8px',
                  backgroundColor: activeTab === 'solo' ? 'var(--color-primary)' : 'var(--color-bg)',
                  transform: activeTab === 'solo' ? 'translateY(3px)' : 'none',
                  cursor: 'pointer',
                  transition: 'all 0.15s'
                }}
              >
                SOLO TRAINING
              </button>
              <button 
                onClick={() => setActiveTab('multi')}
                style={{
                  padding: '10px 20px',
                  fontWeight: 900,
                  fontFamily: 'var(--font-display)',
                  fontSize: '1.05rem',
                  border: 'var(--border-thick)',
                  borderBottom: 'none',
                  borderTopLeftRadius: '8px',
                  borderTopRightRadius: '8px',
                  backgroundColor: activeTab === 'multi' ? 'var(--color-primary)' : 'var(--color-bg)',
                  transform: activeTab === 'multi' ? 'translateY(3px)' : 'none',
                  cursor: 'pointer',
                  transition: 'all 0.15s'
                }}
              >
                MULTIPLAYER DUEL
              </button>
            </div>

            <div style={{ position: 'relative', zIndex: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
              <div style={{ maxWidth: '580px' }}>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 900, color: 'var(--color-text)', marginBottom: '0.8rem', textTransform: 'uppercase' }}>
                  {activeTab === 'solo' ? 'SOLO TRAINING MODE' : 'MULTIPLAYER DUELING ARENA'}
                </h2>
                
                <p style={{ fontSize: '0.95rem', color: '#475569', marginBottom: '1.8rem', fontWeight: 600, fontFamily: 'var(--font-main)' }}>
                  {activeTab === 'solo' 
                    ? 'Practice at your own pace against a virtual trainer bot. Choose any study deck below to immediately start training.' 
                    : 'Establish a synchronized multiplayer arena room or input an active 6-digit lobby code to battle other students in real-time.'}
                </p>

                {activeTab === 'multi' && (
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    {roomCode && isSearching ? (
                      <div className="neo-box blink" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '10px 20px', backgroundColor: 'var(--color-primary)', border: 'var(--border-thick)' }}>
                        <span style={{ fontWeight: 900, color: '#171717', fontFamily: 'var(--font-display)' }}>WAITING...</span>
                        <span style={{ fontFamily: 'var(--font-8bit)', fontSize: '1.2rem', color: '#171717' }}>{roomCode}</span>
                      </div>
                    ) : (
                      <button className="neo-button" style={{ backgroundColor: 'var(--color-highlight)' }} onClick={() => handleCreateRoom('all', 'all')}>
                        <Swords size={18} /> HOST DUEL
                      </button>
                    )}
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, minWidth: '320px' }}>
                      <input 
                        type="text" 
                        maxLength={6}
                        placeholder="CODE" 
                        value={inputCode}
                        onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                        className={`neo-input ${invalidCode ? 'shake' : ''}`}
                        style={{ 
                          padding: '10px 14px', fontFamily: 'var(--font-8bit)', fontSize: '0.9rem', 
                          width: '120px', textAlign: 'center', height: '100%',
                          borderColor: invalidCode ? 'var(--color-warning)' : 'var(--color-border)',
                          backgroundColor: 'white'
                        }} 
                      />
                      <button className="neo-button" style={{ backgroundColor: 'var(--color-bg)', padding: '10px', minWidth: '80px' }} onClick={handlePaste}>
                        {pasteSuccess ? <CheckCircle2 size={20} color="var(--color-success)" /> : <ClipboardPaste size={16} />}
                      </button>
                      <button className="neo-button bg-cyan" style={{ padding: '10px 16px', flex: 1 }} onClick={handleJoinRoom}>
                        JOIN <ChevronRight size={18} />
                      </button>
                    </div>
                  </div>
                )}

                {activeTab === 'solo' && (
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', color: 'var(--color-primary)', fontWeight: 800 }}>
                    <Play size={18} fill="currentColor" /> Select a deck below to start training immediately.
                  </div>
                )}
              </div>

              {/* Decorative Target Icon */}
              <div style={{ marginRight: '1.5rem', animation: 'bounce3d 2.5s infinite', display: 'flex', alignItems: 'center' }}>
                <Target size={100} color="var(--color-primary)" opacity={0.25} />
              </div>
            </div>
          </motion.section>

          {/* Decks Grid */}
          <motion.section variants={itemVariants}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '10px', textTransform: 'uppercase' }}>
                <Layers size={20} color="var(--color-primary)" /> STUDY DECKS
              </h2>
              <button 
                className="neo-button" 
                style={{ backgroundColor: 'var(--color-secondary)', padding: '8px 16px', fontSize: '0.85rem' }}
                onClick={() => setShowRequestModal(true)}
              >
                <PlusCircle size={16} /> REQUEST NEW DECK
              </button>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '2rem' }}>
              {subjects.length > 0 ? (
                subjects.map((subject, idx) => (
                  <SubjectCard 
                    key={subject.name} 
                    subject={subject} 
                    index={idx} 
                    activeTab={activeTab}
                    onStartSolo={handleStartSolo}
                    onHostMulti={handleHostMulti}
                    hasPlayed={user?.playedSubjects?.includes(subject.name) || false}
                  />
                ))
              ) : (
                <div style={{ gridColumn: '1 / -1', padding: '3rem', textAlign: 'center', backgroundColor: 'var(--color-card)', borderRadius: '12px', border: 'var(--border-thick)' }}>
                  <ShieldAlert size={48} color="var(--color-primary)" style={{ margin: '0 auto 1rem' }} />
                  <p style={{ fontFamily: 'var(--font-8bit)', fontSize: '0.8rem', fontWeight: 900, color: '#171717' }}>
                    NO DECKS AVAILABLE YET
                  </p>
                  <p style={{ fontSize: '0.85rem', color: '#475569', marginTop: '0.5rem', fontWeight: 800 }}>
                    Please sign in as Admin and create some subjects/topics to begin.
                  </p>
                </div>
              )}
            </div>
          </motion.section>
        </motion.div>

        {/* Right Column (Sidebar) */}
        <motion.div variants={containerVariants} initial="hidden" animate="visible" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Progress Bar Card */}
          <motion.section variants={itemVariants} className="neo-box" style={{ padding: '2rem', backgroundColor: 'var(--color-card)' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '0.8rem', fontWeight: 900, marginBottom: '1.2rem', color: '#171717', display: 'flex', alignItems: 'center', gap: '8px', textTransform: 'uppercase' }}>
              <Activity size={16} color="var(--color-primary)" /> ACADEMY RANK
            </h3>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 800, color: '#475569', marginBottom: '8px', fontFamily: 'var(--font-display)' }}>
              <span>LEVEL {level}</span>
              <span>{currentLevelXp} / 100 XP</span>
            </div>
            
            <div className="neo-box" style={{ height: '22px', backgroundColor: '#e2e8f0', overflow: 'hidden', padding: '4px', boxShadow: 'none' }}>
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${xpPercentage}%` }}
                transition={{ type: 'spring', stiffness: 50, delay: 0.5 }}
                style={{ height: '100%', borderRadius: '4px', backgroundColor: 'var(--color-primary)' }}
              />
            </div>
          </motion.section>

          {/* Quick Break Widget */}
          <motion.section variants={itemVariants} className="neo-box" style={{ padding: '2rem', backgroundColor: 'var(--color-card)', display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '0.8rem', fontWeight: 900, marginBottom: '1.2rem', color: '#171717', display: 'flex', alignItems: 'center', gap: '8px', textTransform: 'uppercase' }}>
              <BookOpen size={16} color="var(--color-primary)" /> QUICK BREAK MODE
            </h3>
            <div style={{ height: '180px', width: '100%', border: '2.5px solid #1a1a1a', borderRadius: '8px', overflow: 'hidden', backgroundColor: 'var(--color-bg)' }}>
              <TRexWidget />
            </div>
          </motion.section>

          {/* Daily Quests */}
          <motion.section variants={itemVariants} className="neo-box" style={{ padding: '2rem', backgroundColor: 'var(--color-card)' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '0.8rem', fontWeight: 900, marginBottom: '1.5rem', color: '#171717', display: 'flex', alignItems: 'center', gap: '8px', textTransform: 'uppercase' }}>
              <Sparkles size={16} color="var(--color-primary)" /> DAILY QUESTS
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {quests.map((quest, idx) => (
                <div key={idx} style={{ 
                  display: 'flex', alignItems: 'center', gap: '12px', 
                  padding: '12px', border: 'var(--border-thick)', borderRadius: '8px', 
                  backgroundColor: quest.completed ? 'var(--color-secondary)' : 'var(--color-bg)',
                  boxShadow: '4px 4px 0px rgba(0,0,0,0.05)'
                }}>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 800, fontSize: '0.85rem', color: '#171717', marginBottom: '4px', textDecoration: quest.completed ? 'line-through' : 'none' }}>
                      {quest.text}
                    </p>
                    <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-8bit)', fontWeight: 900, color: quest.completed ? '#171717' : 'var(--color-primary)' }}>
                      {quest.xp}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </motion.section>

          {/* Leaderboard Card */}
          <motion.section variants={itemVariants} className="neo-box" style={{ padding: '2rem', backgroundColor: 'var(--color-card)' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '0.8rem', fontWeight: 900, marginBottom: '1.5rem', color: '#171717', display: 'flex', alignItems: 'center', gap: '8px', textTransform: 'uppercase' }}>
              <Trophy size={16} color="var(--color-highlight)" /> HIGHSCORES
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              {leaderboard.map((item, idx) => (
                <div key={idx} style={{ 
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '10px', borderBottom: idx < leaderboard.length - 1 ? '3px dashed var(--color-border)' : 'none'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span className="neo-box" style={{ 
                      width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', 
                      fontWeight: 900, fontSize: '0.9rem', fontFamily: 'var(--font-8bit)', boxShadow: '2px 2px 0px rgba(0,0,0,0.05)',
                      backgroundColor: idx === 0 ? 'var(--color-highlight)' : 'var(--color-bg)'
                    }}>
                      {item.rank}
                    </span>
                    <span style={{ fontWeight: 800, fontSize: '0.9rem', color: '#171717', fontFamily: 'var(--font-display)' }}>
                      {item.username}
                    </span>
                  </div>
                  <span style={{ fontWeight: 900, fontSize: '0.85rem', color: 'var(--color-primary)', fontFamily: 'var(--font-8bit)' }}>
                    {item.xp} XP
                  </span>
                </div>
              ))}
            </div>
          </motion.section>

        </motion.div>
      </main>

      {/* Searching Matchmaking Radar Overlay */}
      <AnimatePresence>
        {isSearching && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ 
              position: 'fixed', inset: 0, zIndex: 3000, 
              backgroundColor: 'rgba(21, 25, 30, 0.95)', backdropFilter: 'blur(8px)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
            }}
          >
            <div className="crt-overlay" />
            
            <div className="neo-box" style={{ 
              width: '300px', height: '300px', borderRadius: '50%', 
              backgroundColor: '#171c24', position: 'relative', overflow: 'hidden', 
              boxShadow: '0 0 60px rgba(83, 199, 240, 0.3)', marginBottom: '3rem',
              border: 'var(--border-thick)'
            }}>
              <div style={{ position: 'absolute', inset: '40px', border: '3px dashed rgba(83, 199, 240, 0.4)', borderRadius: '50%' }} />
              <div className="radar-hand" style={{ 
                position: 'absolute', top: 0, left: 0, bottom: '50%', right: '50%', 
                background: 'linear-gradient(45deg, transparent, rgba(83, 199, 240, 0.4))'
              }} />
              
              <motion.div 
                animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ repeat: Infinity, duration: 2 }}
                style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '20px', height: '20px', borderRadius: '50%', backgroundColor: 'var(--color-primary)', border: '4px solid white' }}
              />
            </div>
            
            <h2 className="blink-fast" style={{ fontFamily: 'var(--font-8bit)', color: 'var(--color-primary)', fontSize: '1.4rem', fontWeight: 900, marginBottom: '1rem', textShadow: '4px 4px 0px black' }}>
              FINDING OPPONENT...
            </h2>
            <p style={{ color: 'white', fontWeight: 800, fontSize: '1.2rem', marginBottom: '3rem', fontFamily: 'var(--font-display)' }}>
              Room Code: <span style={{ color: 'var(--color-highlight)', fontFamily: 'var(--font-8bit)' }}>{roomCode || inputCode}</span>
            </p>
            
            <button className="neo-button bg-crimson" style={{ color: 'white' }} onClick={() => setIsSearching(false)}>
              ABORT MATCHMAKING
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Match Found Flash Overlay */}
      <AnimatePresence>
        {matchFound && (
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 1.1, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 150, damping: 15 }}
            style={{ 
              position: 'fixed', inset: 0, zIndex: 4000, 
              backgroundColor: 'var(--color-primary)', 
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
            }}
          >
            <div className="crt-overlay" />
            <motion.div 
              animate={{ scale: [1, 1.03, 1] }} 
              transition={{ repeat: Infinity, duration: 1 }}
              className="neo-box"
              style={{ 
                backgroundColor: 'var(--color-card)', padding: '4rem 6rem', textAlign: 'center', 
                boxShadow: '20px 20px 0px rgba(0,0,0,0.3)', border: 'var(--border-thick)'
              }}
            >
              <h1 style={{ fontFamily: 'var(--font-8bit)', fontSize: '2.5rem', color: 'var(--color-text)', fontWeight: 900, marginBottom: '1.5rem' }}>
                START MATCH!
              </h1>
              
              <motion.div 
                key={matchCountdown}
                initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                style={{ fontFamily: 'var(--font-8bit)', fontSize: '5rem', fontWeight: 900, color: 'var(--color-primary)', textShadow: '4px 4px 0px var(--color-border)' }}
              >
                {matchCountdown}
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
                border: 'var(--border-thick)', position: 'relative'
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
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, marginBottom: '0.5rem' }}>DECK NAME (e.g. Machine Learning)</label>
                  <input 
                    type="text" required
                    value={requestForm.deckName} onChange={(e) => setRequestForm({...requestForm, deckName: e.target.value})}
                    className="neo-input" style={{ width: '100%', padding: '12px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, marginBottom: '0.5rem' }}>TOPIC (e.g. Neural Networks)</label>
                  <input 
                    type="text" required
                    value={requestForm.topic} onChange={(e) => setRequestForm({...requestForm, topic: e.target.value})}
                    className="neo-input" style={{ width: '100%', padding: '12px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, marginBottom: '0.5rem' }}>OPTIONAL MESSAGE</label>
                  <textarea 
                    value={requestForm.message} onChange={(e) => setRequestForm({...requestForm, message: e.target.value})}
                    className="neo-input" style={{ width: '100%', padding: '12px', minHeight: '80px', resize: 'vertical' }}
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

// Sub-component for individual Decks
const SubjectCard = ({ 
  subject, 
  index, 
  activeTab,
  onStartSolo,
  onHostMulti,
  hasPlayed
}) => {

  const [selectedDifficulty, setSelectedDifficulty] = useState('all');

  const getIcon = () => {
    const nameLower = subject.name.toLowerCase();
    if (nameLower.includes('data') || nameLower.includes('db')) return <Layers size={24} color="var(--color-primary)" />;
    if (nameLower.includes('cyber') || nameLower.includes('net') || nameLower.includes('sec')) return <ShieldAlert size={24} color="var(--color-warning)" />;
    if (nameLower.includes('os') || nameLower.includes('comp') || nameLower.includes('algo') || nameLower.includes('machine')) return <Cpu size={24} color="var(--color-secondary)" />;
    return <Code size={24} color="var(--color-primary)" />;
  };

  const activeDuels = Math.floor(Math.random() * 25) + 3;
  const difficulty = ["EASY", "MEDIUM", "HARD", "EXPERT"][index % 4];
  
  // Theme styling based on index
  const theme = colors[index % colors.length];
  const difficultyColor = theme.accent;

  // Progress mastery calculation simulation
  const progressPercent = Math.min(100, Math.max(0, ((index * 13) + 24) % 100));

  return (
    <motion.div 
      className="neo-box interactive"
      whileHover={{ y: -6, boxShadow: '8px 8px 0px rgba(26, 26, 26, 0.08)' }}
      style={{ 
        background: theme.bgGradient, 
        padding: '1.8rem',
        display: 'flex', flexDirection: 'column', height: '100%',
        position: 'relative', overflow: 'hidden',
        border: '2.5px solid #1a1a1a',
        boxShadow: '4px 4px 0px rgba(26, 26, 26, 0.04)',
        borderTop: `6px solid ${theme.accent}`,
        borderRadius: '12px',
        gap: '1.2rem'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div className="neo-box" style={{ width: '44px', height: '44px', backgroundColor: theme.overlay, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2.5px solid #1a1a1a', boxShadow: '2px 2px 0px rgba(0,0,0,0.05)', borderRadius: '8px' }}>
          {getIcon()}
        </div>
        <div className="neo-box" style={{ padding: '3px 8px', fontSize: '0.6rem', fontWeight: 900, fontFamily: 'var(--font-8bit)', backgroundColor: 'var(--color-secondary)', border: '2px solid var(--color-border)', boxShadow: '1.5px 1.5px 0px var(--color-border)', display: 'flex', alignItems: 'center', gap: '3px' }}>
          <div style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: 'white' }} />
          {activeDuels} ON
        </div>
      </div>
      
      <div>
        <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 950, fontSize: '1.05rem', color: 'var(--color-text)', marginBottom: '0.8rem', lineHeight: '1.4' }}>
          {subject.name}
        </h3>
        
        <div style={{ display: 'flex', gap: '1rem', fontFamily: 'var(--font-main)', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
            <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Modules</span>
            <span style={{ fontWeight: 900, fontSize: '0.95rem' }}>{subject.subtopics?.length || subject.topics?.length || 0}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
            <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Difficulty</span>
            <select 
              value={selectedDifficulty} 
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              style={{ padding: '2px', fontWeight: 900, fontSize: '0.85rem', color: difficultyColor, border: 'none', background: 'transparent', outline: 'none', cursor: 'pointer' }}
            >
              <option value="all">ALL</option>
              <option value="easy">EASY</option>
              <option value="medium">MEDIUM</option>
              <option value="hard">HARD</option>
            </select>
          </div>
        </div>
      </div>

      {/* Progress mastery bar */}
      <div style={{ marginTop: 'auto', minHeight: '26px' }}>
        {hasPlayed ? (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', fontWeight: 700, color: '#64748b', marginBottom: '4px' }}>
              <span>MASTERY PROGRESS</span>
              <span>{progressPercent}%</span>
            </div>
            <div style={{ height: '8px', backgroundColor: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ width: `${progressPercent}%`, height: '100%', backgroundColor: theme.accent, transition: 'width 0.5s ease-out' }} />
            </div>
          </>
        ) : (
          <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8', fontStyle: 'italic', display: 'flex', alignItems: 'center', height: '100%' }}>
            NOT PLAYED YET
          </div>
        )}
      </div>
      
      {activeTab === 'solo' ? (
        <button 
          className="neo-button"
          onClick={() => onStartSolo(subject.name, selectedDifficulty)}
          style={{ width: '100%', padding: '10px', fontSize: '0.85rem', gap: '6px', backgroundColor: 'var(--color-highlight)', marginTop: 'auto' }}
        >
          <Play size={14} fill="currentColor" /> PRACTICE NOW
        </button>
      ) : (
        <button 
          className="neo-button"
          onClick={() => onHostMulti(subject.name, selectedDifficulty)}
          style={{ width: '100%', padding: '10px', fontSize: '0.85rem', gap: '6px', backgroundColor: 'var(--color-primary)', marginTop: 'auto' }}
        >
          <Swords size={14} /> HOST DECK DUEL
        </button>
      )}
    </motion.div>
  );
};

export default Dashboard;
