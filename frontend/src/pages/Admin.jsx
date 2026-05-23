import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Terminal, Settings, Database, Users, Cpu, Play, Search, Copy } from 'lucide-react';

const Admin = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ activeSockets: 0, totalStudents: 0, databaseQuestions: 0, matchesToday: 0 });
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [newSubjectName, setNewSubjectName] = useState('');
  const [newTopicName, setNewTopicName] = useState('');
  const [aiTopicName, setAiTopicName] = useState('');
  const [aiGenerating, setAiGenerating] = useState(false);

  // Individual Question CRUD States
  const [selectedQuestionTopic, setSelectedQuestionTopic] = useState('all');
  const [questions, setQuestions] = useState([]);
  const [editingQuestionId, setEditingQuestionId] = useState(null);
  const [questionText, setQuestionText] = useState('');
  const [questionOptions, setQuestionOptions] = useState(''); // Comma separated for MCQ
  const [questionAnswer, setQuestionAnswer] = useState('');
  const [questionDifficulty, setQuestionDifficulty] = useState('topic');
  const [questionType, setQuestionType] = useState('mcq');
  const [questionExplanation, setQuestionExplanation] = useState('');

  // Deck Requests State
  const [deckRequests, setDeckRequests] = useState([]);

  // Search and Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState('all');

  // Live Server socket action feed logs
  const [logs, setLogs] = useState([
    "[16:20:02] INITIALIZING ADMIN CONTROL SYSTEM...",
    "[16:20:05] MULTIPLAYER_SERVER: Active socket connection verified.",
    "[16:21:44] DISPLAY_SYSTEM: Loaded 8-bit arcade stylesheets.",
    "[16:22:15] DATABASE: Analytics sync completed."
  ]);

  useEffect(() => {
    // Check if admin is authenticated
    const isAdmin = localStorage.getItem('admin');
    if (!isAdmin) {
      navigate('/', { replace: true });
      return;
    }

    // Apply dark mode theme to body
    document.body.classList.add('admin-mode');

    // Fetch stats & subjects
    const fetchStats = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/admin/stats');
        const data = await res.json();
        setStats(data);

        // Periodically inject a mock socket log to simulate live server actions
        const serverActions = [
          "SERVER: Heartbeat sync completed for client #S728",
          "LOBBY: Room 928372 created, waiting for player 2",
          "ARENA: Emote broadcast triggered 🔥 to Room 928372",
          "STATS: Logged 30 XP reward sync for client ByteHunter",
          "SERVER: Cleaned up inactive multiplayer rooms",
          "AI_CORE: Generative AI card creator initialized"
        ];
        if (Math.random() > 0.4) {
          const timestamp = new Date().toLocaleTimeString();
          const action = serverActions[Math.floor(Math.random() * serverActions.length)];
          setLogs(prev => [...prev.slice(-12), `[${timestamp}] ${action}`]);
        }

      } catch (err) {
        console.error("Failed to fetch stats", err);
      }
    };

    const fetchSubjects = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/subjects');
        const data = await res.json();
        setSubjects(data);
        if (data.length > 0 && !selectedSubject) {
          setSelectedSubject(data[0].name);
        }
      } catch (err) {
        console.error("Failed to fetch subjects", err);
      }
    };

    const fetchDeckRequests = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/requests');
        const data = await res.json();
        if (data.success && data.data) {
          setDeckRequests(data.data);
        }
      } catch (err) {
        console.error("Failed to fetch deck requests", err);
      }
    };

    fetchStats();
    fetchSubjects();
    fetchDeckRequests();
    const interval = setInterval(() => {
      fetchStats();
      fetchDeckRequests();
    }, 4000);

    return () => {
      document.body.classList.remove('admin-mode');
      clearInterval(interval);
    };
  }, [navigate, selectedSubject]);

  const fetchQuestionsForSubject = async () => {
    if (!selectedSubject) return;
    try {
      const url = `http://localhost:5000/api/questions?subject=${encodeURIComponent(selectedSubject)}&topic=${selectedQuestionTopic}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.questions) {
        setQuestions(data.questions);
      }
    } catch (err) {
      console.error("Failed to fetch questions for admin", err);
    }
  };

  useEffect(() => {
    fetchQuestionsForSubject();
  }, [selectedSubject, selectedQuestionTopic]);

  const handleSaveQuestion = async (e) => {
    e.preventDefault();
    if (!selectedSubject || !selectedQuestionTopic || selectedQuestionTopic === 'all') {
      alert("Please select a specific Subject and Sub-Topic to assign the question to.");
      return;
    }
    if (!questionText || !questionAnswer) {
      alert("Question text and correct answer are required.");
      return;
    }

    const payload = {
      subject: selectedSubject,
      topic: selectedQuestionTopic,
      difficulty: questionDifficulty,
      question: questionText,
      options: questionType === 'mcq' ? questionOptions.split(',').map(o => o.trim()).filter(Boolean) : [],
      correctAnswer: questionAnswer,
      explanation: questionExplanation,
      type: questionType
    };

    try {
      let res;
      if (editingQuestionId) {
        res = await fetch(`http://localhost:5000/api/questions/${editingQuestionId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        res = await fetch(`http://localhost:5000/api/questions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }

      if (res.ok) {
        alert(editingQuestionId ? "Question updated successfully!" : "Question created successfully!");
        setQuestionText('');
        setQuestionOptions('');
        setQuestionAnswer('');
        setQuestionExplanation('');
        setEditingQuestionId(null);
        fetchQuestionsForSubject();
        
        // Update stats
        const statsRes = await fetch('http://localhost:5000/api/admin/stats');
        const statsData = await statsRes.json();
        setStats(statsData);
      } else {
        const errorData = await res.json();
        alert(`Error: ${errorData.error}`);
      }
    } catch (err) {
      console.error("Failed to save question", err);
    }
  };

  const handleEditClick = (q) => {
    setEditingQuestionId(q.id);
    setQuestionText(q.question || q.text || '');
    setQuestionOptions(q.options ? q.options.join(', ') : '');
    setQuestionAnswer(q.correctAnswer || q.answer || '');
    setQuestionDifficulty(q.difficulty || q.tier || 'topic');
    setQuestionType(q.type || 'mcq');
    setQuestionExplanation(q.explanation || '');
  };

  const handleDuplicateClick = (q) => {
    setEditingQuestionId(null); // saves as a new card
    setQuestionText(`${q.question || q.text || ''} (Copy)`);
    setQuestionOptions(q.options ? q.options.join(', ') : '');
    setQuestionAnswer(q.correctAnswer || q.answer || '');
    setQuestionDifficulty(q.difficulty || q.tier || 'topic');
    setQuestionType(q.type || 'mcq');
    setQuestionExplanation(q.explanation || '');
    alert("Question copied! Modify options/details below and click Save Card to insert the duplicate.");
  };

  const handleDeleteQuestion = async (id) => {
    if (!window.confirm("Are you sure you want to delete this question?")) return;
    try {
      const res = await fetch(`http://localhost:5000/api/questions/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        alert("Question deleted successfully!");
        fetchQuestionsForSubject();
        
        // Update stats
        const statsRes = await fetch('http://localhost:5000/api/admin/stats');
        const statsData = await statsRes.json();
        setStats(statsData);
      }
    } catch (err) {
      console.error("Failed to delete question", err);
    }
  };

  const handleUpdateRequestStatus = async (id, status) => {
    try {
      const res = await fetch(`http://localhost:5000/api/requests/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        const data = await res.json();
        setDeckRequests(prev => prev.map(req => req.id === id ? data.data : req));
      }
    } catch (err) {
      console.error("Failed to update request status", err);
    }
  };

  const handleDeleteRequest = async (id) => {
    if (!window.confirm("Delete this deck request?")) return;
    try {
      const res = await fetch(`http://localhost:5000/api/requests/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setDeckRequests(prev => prev.filter(req => req.id !== id));
      }
    } catch (err) {
      console.error("Failed to delete request", err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin');
    navigate('/', { replace: true });
  };

  const handleCreateSubject = async () => {
    if (!newSubjectName) return;
    await fetch('http://localhost:5000/api/subjects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newSubjectName })
    });
    setNewSubjectName('');
    window.location.reload();
  };

  const handleDeleteSubject = async (name) => {
    await fetch(`http://localhost:5000/api/subjects/${encodeURIComponent(name)}`, { method: 'DELETE' });
    window.location.reload();
  };

  const handleCreateTopic = async () => {
    if (!newTopicName || !selectedSubject) return;
    await fetch('http://localhost:5000/api/subjects/topics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subjectName: selectedSubject, topicName: newTopicName })
    });
    setNewTopicName('');
    window.location.reload();
  };

  const handleDeleteTopic = async (topicName) => {
    if (!selectedSubject) return;
    await fetch('http://localhost:5000/api/subjects/topics', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subjectName: selectedSubject, topicName })
    });
    window.location.reload();
  };

  // Automated AI deck generation trigger
  const handleGenerateAiDeck = async () => {
    if (!aiTopicName || !selectedSubject) return;
    setAiGenerating(true);
    
    // Add custom log entry
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] AI_GEN: Generating flashcard questions for ${aiTopicName.toUpperCase()}...`]);

    try {
      const res = await fetch('http://localhost:5000/api/admin/generate-deck', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: aiTopicName,
          subjectName: selectedSubject,
          difficulty: 'topic'
        })
      });
      const data = await res.json();
      if (data.success) {
        setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] AI_GEN: Injected ${data.count} questions into database!`]);
        alert(`AI generated successfully! Injected 10 premium questions on ${aiTopicName} into ${selectedSubject}!`);
        setAiTopicName('');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setAiGenerating(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file && selectedSubject) {
      const reader = new FileReader();
      reader.onload = async (evt) => {
        const text = evt.target?.result;
        await fetch('http://localhost:5000/api/admin/import-csv', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ csvData: text, subjectName: selectedSubject })
        });
        alert('CSV imported successfully!');
        window.location.reload();
      };
      reader.readAsText(file);
    }
  };

  // Filtered Question Computations
  const filteredQuestions = questions.filter(q => {
    const textToSearch = (q.question || q.text || '').toLowerCase();
    const query = searchQuery.toLowerCase();
    const matchesSearch = textToSearch.includes(query);
    
    const diff = (q.difficulty || q.tier || 'topic').toLowerCase();
    const matchesDiff = filterDifficulty === 'all' || diff === filterDifficulty.toLowerCase();
    
    return matchesSearch && matchesDiff;
  });

  const getDifficultyBadge = (difficulty) => {
    const d = (difficulty || 'topic').toLowerCase();
    if (d === 'simple') {
      return <span style={{ fontSize: '0.65rem', fontWeight: 900, backgroundColor: 'rgba(82,199,240,0.15)', color: 'var(--color-cyan)', padding: '0.2rem 0.6rem', borderRadius: '4px', border: '1px solid var(--color-cyan)', textTransform: 'uppercase' }}>Simple</span>;
    }
    if (d === 'extreme') {
      return <span style={{ fontSize: '0.65rem', fontWeight: 900, backgroundColor: 'rgba(239,71,111,0.15)', color: 'var(--color-crimson)', padding: '0.2rem 0.6rem', borderRadius: '4px', border: '1px solid var(--color-crimson)', textTransform: 'uppercase' }}>Extreme</span>;
    }
    return <span style={{ fontSize: '0.65rem', fontWeight: 900, backgroundColor: 'rgba(255,209,102,0.15)', color: 'var(--color-gold)', padding: '0.2rem 0.6rem', borderRadius: '4px', border: '1px solid var(--color-gold)', textTransform: 'uppercase' }}>Standard</span>;
  };

  return (
    <div style={{ padding: '3rem 2rem', minHeight: '100vh', backgroundColor: 'var(--color-admin-canvas)', color: 'var(--color-canvas)' }}>
      {/* Visual Retro Scanline Overlay */}
      <div className="crt-overlay" />

      {/* Header */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem', borderBottom: '4px solid #000', paddingBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Settings size={28} className="blink" color="var(--color-cyan)" />
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 950, fontSize: '1.4rem', color: 'var(--color-canvas)', letterSpacing: '1px' }}>
            👑 ADMIN COMMAND PORTAL
          </h1>
        </div>
        <button className="neo-button bg-crimson" style={{ color: 'white' }} onClick={handleLogout}>SYSTEM EXIT</button>
      </header>

      {/* Live Server Analytical Grid */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '2rem', marginBottom: '4rem' }}>
        <div className="neo-box glow-cyan" style={{ padding: '2rem', textAlign: 'center', backgroundColor: 'var(--color-admin-container)' }}>
          <Users size={32} color="var(--color-cyan)" style={{ margin: '0 auto 0.8rem' }} />
          <h3 style={{ fontWeight: 800, color: '#888', marginBottom: '0.8rem', fontSize: '0.85rem' }}>ACTIVE SOCKETS</h3>
          <p style={{ fontSize: '3rem', fontWeight: 900, color: 'var(--color-cyan)', fontFamily: 'var(--font-8bit)' }} className="blink">{stats.activeSockets}</p>
        </div>
        <div className="neo-box glow-lavender" style={{ padding: '2rem', textAlign: 'center', backgroundColor: 'var(--color-admin-container)' }}>
          <Users size={32} color="var(--color-lavender)" style={{ margin: '0 auto 0.8rem' }} />
          <h3 style={{ fontWeight: 800, color: '#888', marginBottom: '0.8rem', fontSize: '0.85rem' }}>TOTAL STUDENTS</h3>
          <p style={{ fontSize: '3rem', fontWeight: 900, color: 'var(--color-lavender)', fontFamily: 'var(--font-8bit)' }}>{stats.totalStudents}</p>
        </div>
        <div className="neo-box glow-gold" style={{ padding: '2rem', textAlign: 'center', backgroundColor: 'var(--color-admin-container)' }}>
          <Database size={32} color="var(--color-gold)" style={{ margin: '0 auto 0.8rem' }} />
          <h3 style={{ fontWeight: 800, color: '#888', marginBottom: '0.8rem', fontSize: '0.85rem' }}>DB QUESTIONS</h3>
          <p style={{ fontSize: '3rem', fontWeight: 900, color: 'var(--color-gold)', fontFamily: 'var(--font-8bit)' }}>{stats.databaseQuestions}</p>
        </div>
        <div className="neo-box glow-mint" style={{ padding: '2rem', textAlign: 'center', backgroundColor: 'var(--color-admin-container)' }}>
          <Play size={32} color="var(--color-mint)" style={{ margin: '0 auto 0.8rem' }} />
          <h3 style={{ fontWeight: 800, color: '#888', marginBottom: '0.8rem', fontSize: '0.85rem' }}>MATCHES RUNNING</h3>
          <p style={{ fontSize: '3rem', fontWeight: 900, color: 'var(--color-mint)', fontFamily: 'var(--font-8bit)' }}>{stats.matchesToday}</p>
        </div>
      </section>

      {/* Grid containing Command center and real-time logs */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1.2fr', gap: '3rem', marginBottom: '3rem' }}>
        
        {/* Core subjects / topics admin state panels */}
        <section className="neo-box" style={{ padding: '3rem', backgroundColor: 'var(--color-admin-container)' }}>
          <h2 style={{ fontWeight: 950, fontSize: '1.2rem', marginBottom: '2.5rem', color: 'var(--color-canvas)', fontFamily: 'var(--font-display)', textTransform: 'uppercase' }}>
            COURSE & DECK CONFIGURATION
          </h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem' }}>
            <div>
              <h3 style={{ color: 'var(--color-mint)', marginBottom: '1.2rem', fontWeight: 900, fontSize: '1rem' }}>CREATE STUDY DECK</h3>
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                <input type="text" className="neo-input" placeholder="e.g. Machine Learning" value={newSubjectName} onChange={e => setNewSubjectName(e.target.value)} style={{ backgroundColor: 'var(--color-admin-canvas)', color: 'white', borderColor: '#000' }} />
                <button className="neo-button bg-mint" onClick={handleCreateSubject}>ADD</button>
              </div>

              <h3 style={{ color: 'var(--color-crimson)', marginBottom: '1.2rem', fontWeight: 900, fontSize: '1rem' }}>DELETE STUDY DECK</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '240px', overflowY: 'auto' }}>
                {subjects.map(s => (
                  <div key={s.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--color-admin-canvas)', padding: '0.8rem', borderRadius: '8px', border: '2px solid #000' }}>
                    <span style={{ fontWeight: 800, color: 'var(--color-canvas)', fontSize: '0.85rem' }}>{s.name}</span>
                    <button className="neo-button bg-crimson" style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', color: 'white' }} onClick={() => handleDeleteSubject(s.name)}>DELETE</button>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 style={{ color: 'var(--color-cyan)', marginBottom: '1.2rem', fontWeight: 900, fontSize: '1rem' }}>DECK SUB-TOPIC SETTINGS</h3>
              <label style={{ display: 'block', fontWeight: 800, color: 'var(--color-canvas)', marginBottom: '0.5rem', fontSize: '0.8rem' }}>TARGET STUDY DECK</label>
              <select className="neo-input" style={{ backgroundColor: 'var(--color-admin-canvas)', color: 'white', borderColor: '#000', marginBottom: '1.5rem' }} value={selectedSubject} onChange={e => setSelectedSubject(e.target.value)}>
                {subjects.map(s => <option key={s.name} value={s.name}>{s.name}</option>)}
              </select>

              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                <input type="text" className="neo-input" placeholder="New sub-topic name" value={newTopicName} onChange={e => setNewTopicName(e.target.value)} style={{ backgroundColor: 'var(--color-admin-canvas)', color: 'white', borderColor: '#000' }} />
                <button className="neo-button bg-cyan" onClick={handleCreateTopic}>ADD TOPIC</button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '240px', overflowY: 'auto' }}>
                {subjects.find(s => s.name === selectedSubject)?.topics.map(t => (
                  <div key={t} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--color-admin-canvas)', padding: '0.8rem', borderRadius: '8px', border: '2px solid #000' }}>
                    <span style={{ fontWeight: 800, color: 'var(--color-canvas)', fontSize: '0.85rem' }}>{t}</span>
                    <button className="neo-button bg-crimson" style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', color: 'white' }} onClick={() => handleDeleteTopic(t)}>REMOVE</button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Real-time WebSockets Command log Panel */}
        <section className="neo-box glow-cyan" style={{ padding: '3rem', backgroundColor: 'var(--color-admin-container)', display: 'flex', flexDirection: 'column', height: '100%' }}>
          <h2 style={{ fontWeight: 950, fontSize: '1rem', marginBottom: '1.5rem', color: 'var(--color-canvas)', fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: '8px', textTransform: 'uppercase' }}>
            <Terminal size={18} color="var(--color-cyan)" /> LIVE SOCKET EVENT MONITOR
          </h2>
          
          <div style={{ 
            backgroundColor: '#0F1318', border: '2px solid #000', borderRadius: '8px', 
            padding: '1.5rem', flex: 1, minHeight: '380px', fontFamily: 'monospace', 
            fontSize: '0.8rem', color: '#52B788', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' 
          }}>
            {logs.map((log, idx) => (
              <div key={idx} style={{ 
                borderBottom: '1px solid #1c242c', paddingBottom: '4px',
                color: log.includes('AI_GEN') ? 'var(--color-gold)' : (log.includes('Heartbeat') || log.includes('MULTIPLAYER') ? 'var(--color-cyan)' : '#52B788')
              }}>
                {log}
              </div>
            ))}
          </div>
          
          <span style={{ display: 'block', marginTop: '1rem', fontSize: '0.75rem', fontWeight: 800, color: '#888', textAlignment: 'right' }}>
            STATUS PORT: 5000 // CORE RECEIVERS ACTIVE
          </span>
        </section>

      </div>

      {/* LOWER GRID: CSV Drawer & Simulated AI Generation Panel */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem' }}>
        
        {/* CSV Import */}
        <section className="neo-box glow-lavender" style={{ padding: '3rem', backgroundColor: 'var(--color-admin-container)' }}>
          <h2 style={{ fontWeight: 950, fontSize: '1.1rem', marginBottom: '2rem', color: 'var(--color-canvas)', fontFamily: 'var(--font-display)', textTransform: 'uppercase' }}>
            CSV QUESTION DECK UPLOAD
          </h2>
          
          <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontWeight: 800, color: 'var(--color-canvas)', marginBottom: '0.5rem', fontSize: '0.8rem' }}>TARGET STUDY DECK</label>
              <select className="neo-input" style={{ backgroundColor: 'var(--color-admin-canvas)', color: 'white', borderColor: '#000' }} value={selectedSubject} onChange={e => setSelectedSubject(e.target.value)}>
                {subjects.map(s => <option key={s.name} value={s.name}>{s.name}</option>)}
              </select>
            </div>
            
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontWeight: 800, color: 'var(--color-canvas)', marginBottom: '0.5rem', fontSize: '0.8rem' }}>UPLOAD CSV CARD DATA</label>
              <div style={{ border: '2px dashed var(--color-canvas)', padding: '2rem', textAlignment: 'center', borderRadius: '12px', position: 'relative' }}>
                <Upload size={32} color="var(--color-canvas)" style={{ margin: '0 auto 0.8rem' }} />
                <button className="neo-button bg-gold" style={{ position: 'relative', zIndex: 1, padding: '0.5rem 1rem', fontSize: '0.8rem' }}>📂 UPLOAD FILE</button>
                <input type="file" accept=".csv" onChange={handleFileUpload} style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', zIndex: 2 }} />
              </div>
            </div>
          </div>
        </section>

        {/* AI Generator Panel */}
        <section className="neo-box glow-gold" style={{ padding: '3rem', backgroundColor: 'var(--color-admin-container)' }}>
          <h2 style={{ fontWeight: 950, fontSize: '1.1rem', marginBottom: '2rem', color: 'var(--color-canvas)', fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: '6px', textTransform: 'uppercase' }}>
            <Cpu size={18} color="var(--color-gold)" /> AI CARD DECK GENERATOR
          </h2>

          <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontWeight: 800, color: 'var(--color-canvas)', marginBottom: '0.5rem', fontSize: '0.8rem' }}>TARGET STUDY DECK</label>
              <select className="neo-input" style={{ backgroundColor: 'var(--color-admin-canvas)', color: 'white', borderColor: '#000', marginBottom: '1.2rem' }} value={selectedSubject} onChange={e => setSelectedSubject(e.target.value)}>
                {subjects.map(s => <option key={s.name} value={s.name}>{s.name}</option>)}
              </select>
            </div>
            
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontWeight: 800, color: 'var(--color-canvas)', marginBottom: '0.5rem', fontSize: '0.8rem' }}>AI SUB-TOPIC FOCUS (e.g. Recursion)</label>
              <input 
                type="text" 
                className="neo-input" 
                placeholder="e.g. Backtracking Algorithms" 
                value={aiTopicName} 
                onChange={(e) => setAiTopicName(e.target.value)} 
                style={{ backgroundColor: 'var(--color-admin-canvas)', color: 'white', borderColor: '#000', marginBottom: '1.2rem' }} 
              />
              
              <button 
                className="neo-button bg-gold" 
                onClick={handleGenerateAiDeck}
                disabled={aiGenerating || !aiTopicName}
                style={{ width: '100%', fontSize: '0.9rem' }}
              >
                {aiGenerating ? '⚡ GENERATING CARDS...' : '🤖 GENERATE AI FLASHCARDS'}
              </button>
            </div>
          </div>
        </section>

      </div>

      {/* SECTION: MANAGE INDIVIDUAL FLASHCARDS */}
      <section className="neo-box glow-mint" style={{ padding: '3rem', backgroundColor: 'var(--color-admin-container)', marginTop: '3rem' }}>
        <h2 style={{ fontWeight: 950, fontSize: '1.2rem', marginBottom: '2.5rem', color: 'var(--color-canvas)', fontFamily: 'var(--font-display)', textTransform: 'uppercase' }}>
          🛠️ MANAGE INDIVIDUAL FLASHCARD QUESTIONS
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: '3rem' }}>
          {/* Left Column: Add / Edit Form */}
          <div style={{ backgroundColor: 'var(--color-admin-canvas)', padding: '2rem', borderRadius: '8px', border: '2px solid #000' }}>
            <h3 style={{ color: 'var(--color-mint)', marginBottom: '1.5rem', fontWeight: 900, fontSize: '1.05rem', fontFamily: 'var(--font-display)', textTransform: 'uppercase' }}>
              {editingQuestionId ? '⚡ UPDATE FLASHCARD' : '➕ ADD NEW FLASHCARD'}
            </h3>
            
            <form onSubmit={handleSaveQuestion} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              <div>
                <label style={{ display: 'block', fontWeight: 800, color: 'var(--color-canvas)', marginBottom: '0.4rem', fontSize: '0.75rem' }}>SELECT SUB-TOPIC</label>
                <select 
                  className="neo-input" 
                  style={{ backgroundColor: 'var(--color-admin-container)', color: 'white', borderColor: '#000' }} 
                  value={selectedQuestionTopic} 
                  onChange={e => setSelectedQuestionTopic(e.target.value)}
                >
                  <option value="all">-- Select Topic --</option>
                  {subjects.find(s => s.name === selectedSubject)?.topics.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 800, color: 'var(--color-canvas)', marginBottom: '0.4rem', fontSize: '0.75rem' }}>QUESTION TYPE</label>
                <select 
                  className="neo-input" 
                  style={{ backgroundColor: 'var(--color-admin-container)', color: 'white', borderColor: '#000' }} 
                  value={questionType} 
                  onChange={e => setQuestionType(e.target.value)}
                >
                  <option value="mcq">Multiple Choice (MCQ)</option>
                  <option value="fill-in">Fill-in-the-Blank</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 800, color: 'var(--color-canvas)', marginBottom: '0.4rem', fontSize: '0.75rem' }}>QUESTION TEXT</label>
                <textarea 
                  className="neo-input" 
                  rows={3} 
                  placeholder="Type the question query..." 
                  value={questionText} 
                  onChange={e => setQuestionText(e.target.value)} 
                  style={{ backgroundColor: 'var(--color-admin-container)', color: 'white', borderColor: '#000', resize: 'vertical' }}
                />
              </div>

              {questionType === 'mcq' && (
                <div>
                  <label style={{ display: 'block', fontWeight: 800, color: 'var(--color-canvas)', marginBottom: '0.4rem', fontSize: '0.75rem' }}>OPTIONS (Comma-separated)</label>
                  <input 
                    type="text" 
                    className="neo-input" 
                    placeholder="Correct Option, Wrong 1, Wrong 2, Wrong 3" 
                    value={questionOptions} 
                    onChange={e => setQuestionOptions(e.target.value)} 
                    style={{ backgroundColor: 'var(--color-admin-container)', color: 'white', borderColor: '#000' }}
                  />
                  <span style={{ fontSize: '0.7rem', color: '#888', marginTop: '0.2rem', display: 'block' }}>First option will NOT be auto-marked as correct. Specify exact answer below.</span>
                </div>
              )}

              <div>
                <label style={{ display: 'block', fontWeight: 800, color: 'var(--color-canvas)', marginBottom: '0.4rem', fontSize: '0.75rem' }}>CORRECT ANSWER</label>
                <input 
                  type="text" 
                  className="neo-input" 
                  placeholder={questionType === 'mcq' ? "Must exactly match one option" : "Must exactly match input string"} 
                  value={questionAnswer} 
                  onChange={e => setQuestionAnswer(e.target.value)} 
                  style={{ backgroundColor: 'var(--color-admin-container)', color: 'white', borderColor: '#000' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 800, color: 'var(--color-canvas)', marginBottom: '0.4rem', fontSize: '0.75rem' }}>DIFFICULTY TIER</label>
                <select 
                  className="neo-input" 
                  style={{ backgroundColor: 'var(--color-admin-container)', color: 'white', borderColor: '#000' }} 
                  value={questionDifficulty} 
                  onChange={e => setQuestionDifficulty(e.target.value)}
                >
                  <option value="simple">Simple</option>
                  <option value="topic">Topic Standard</option>
                  <option value="extreme">Extreme</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 800, color: 'var(--color-canvas)', marginBottom: '0.4rem', fontSize: '0.75rem' }}>EXPLANATION</label>
                <input 
                  type="text" 
                  className="neo-input" 
                  placeholder="Explain the correct answer..." 
                  value={questionExplanation} 
                  onChange={e => setQuestionExplanation(e.target.value)} 
                  style={{ backgroundColor: 'var(--color-admin-container)', color: 'white', borderColor: '#000' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="submit" className="neo-button bg-mint" style={{ flex: 1, padding: '0.8rem' }}>
                  {editingQuestionId ? '💾 UPDATE' : '💾 SAVE CARD'}
                </button>
                {editingQuestionId && (
                  <button 
                    type="button" 
                    className="neo-button bg-crimson" 
                    style={{ flex: 1, padding: '0.8rem', color: 'white' }}
                    onClick={() => {
                      setEditingQuestionId(null);
                      setQuestionText('');
                      setQuestionOptions('');
                      setQuestionAnswer('');
                      setQuestionExplanation('');
                    }}
                  >
                    CANCEL
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Right Column: Search, Filter, and Question Preview Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            {/* Search and Filters panel */}
            <div className="neo-box" style={{ padding: '1.2rem', backgroundColor: 'var(--color-admin-canvas)', border: '2px solid #000', display: 'flex', gap: '1rem', flexDirection: 'column' }}>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <Search size={18} color="#888" />
                <input 
                  type="text" 
                  className="neo-input" 
                  placeholder="Search questions by text..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  style={{ backgroundColor: 'var(--color-admin-container)', color: 'white', padding: '0.5rem 1rem', fontSize: '0.8rem', border: '1px solid #333' }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800 }}>TOPIC:</span>
                  <select 
                    className="neo-input" 
                    style={{ backgroundColor: 'var(--color-admin-container)', color: 'white', borderColor: '#000', padding: '0.3rem 0.5rem', fontSize: '0.75rem', width: 'auto' }} 
                    value={selectedQuestionTopic} 
                    onChange={e => setSelectedQuestionTopic(e.target.value)}
                  >
                    <option value="all">ALL TOPICS</option>
                    {subjects.find(s => s.name === selectedSubject)?.topics.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800 }}>DIFFICULTY:</span>
                  <select 
                    className="neo-input" 
                    style={{ backgroundColor: 'var(--color-admin-container)', color: 'white', borderColor: '#000', padding: '0.3rem 0.5rem', fontSize: '0.75rem', width: 'auto' }} 
                    value={filterDifficulty} 
                    onChange={e => setFilterDifficulty(e.target.value)}
                  >
                    <option value="all">ALL DIFFICULTIES</option>
                    <option value="simple">SIMPLE</option>
                    <option value="topic">STANDARD</option>
                    <option value="extreme">EXTREME</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Questions Container List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', maxHeight: '520px', overflowY: 'auto' }}>
              {filteredQuestions.length > 0 ? (
                filteredQuestions.map((q, idx) => (
                  <div key={q.id || idx} style={{ 
                    backgroundColor: 'var(--color-admin-canvas)', 
                    padding: '1.5rem', 
                    borderRadius: '12px', 
                    border: '2px solid #000', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: '0.8rem',
                    position: 'relative'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.7rem', fontWeight: 900, backgroundColor: 'var(--color-admin-container)', padding: '0.2rem 0.6rem', borderRadius: '4px', border: '1px solid #333', color: 'var(--color-cyan)' }}>
                          #{q.id}
                        </span>
                        {getDifficultyBadge(q.difficulty || q.tier)}
                        <span style={{ fontSize: '0.65rem', fontWeight: 800, backgroundColor: '#333', color: '#fff', padding: '0.2rem 0.4rem', borderRadius: '4px' }}>
                          {q.type.toUpperCase()}
                        </span>
                      </div>
                      <span style={{ fontSize: '0.75rem', color: '#888', fontWeight: 800 }}>Topic: {q.topic}</span>
                    </div>

                    <p style={{ fontWeight: 800, color: 'var(--color-canvas)', fontSize: '0.9rem', lineHeight: '1.4' }}>
                      {q.question || q.text}
                    </p>

                    {q.options && q.options.length > 0 && (
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginTop: '0.2rem' }}>
                        {q.options.map((opt, oIdx) => (
                          <div key={oIdx} style={{ fontSize: '0.75rem', backgroundColor: 'var(--color-admin-container)', padding: '0.5rem', borderRadius: '6px', border: '1px solid #222', color: opt === (q.correctAnswer || q.answer) ? 'var(--color-mint)' : '#aaa', fontWeight: opt === (q.correctAnswer || q.answer) ? 900 : 700 }}>
                            {oIdx + 1}. {opt} {opt === (q.correctAnswer || q.answer) ? ' (CORRECT)' : ''}
                          </div>
                        ))}
                      </div>
                    )}

                    {(!q.options || q.options.length === 0) && (
                      <p style={{ fontSize: '0.8rem', color: 'var(--color-mint)', fontWeight: 800 }}>
                        Answer: {q.correctAnswer || q.answer}
                      </p>
                    )}

                    {q.explanation && (
                      <p style={{ fontSize: '0.75rem', color: '#888', fontStyle: 'italic', borderTop: '1px solid #222', paddingTop: '0.5rem' }}>
                        Explanation: {q.explanation}
                      </p>
                    )}

                    <div style={{ display: 'flex', gap: '0.8rem', justifyContent: 'flex-end', marginTop: '0.5rem', borderTop: '1px solid #222', paddingTop: '0.8rem' }}>
                      <button className="neo-button bg-cyan" style={{ padding: '0.3rem 0.8rem', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }} onClick={() => handleEditClick(q)}>EDIT</button>
                      <button className="neo-button bg-gold" style={{ padding: '0.3rem 0.8rem', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }} onClick={() => handleDuplicateClick(q)}>
                        <Copy size={12} /> DUPLICATE
                      </button>
                      <button className="neo-button bg-crimson" style={{ padding: '0.3rem 0.8rem', fontSize: '0.75rem', color: 'white' }} onClick={() => handleDeleteQuestion(q.id)}>DELETE</button>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ padding: '3rem', textAlign: 'center', backgroundColor: 'var(--color-admin-canvas)', borderRadius: '12px', border: '2px dashed #333' }}>
                  <p style={{ fontWeight: 800, color: '#888', fontSize: '0.85rem' }}>
                    No questions match the current filters.
                  </p>
                </div>
              )}
            </div>

          </div>
        </div>
      </section>

      {/* SECTION: REQUESTED DECKS */}
      <section className="neo-box glow-lavender" style={{ padding: '3rem', backgroundColor: 'var(--color-admin-container)', marginTop: '3rem', marginBottom: '3rem' }}>
        <h2 style={{ fontWeight: 950, fontSize: '1.2rem', marginBottom: '2.5rem', color: 'var(--color-canvas)', fontFamily: 'var(--font-display)', textTransform: 'uppercase' }}>
          📩 STUDENT DECK REQUESTS
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2rem' }}>
          {deckRequests.length > 0 ? (
            deckRequests.map(req => (
              <div key={req.id} style={{ 
                backgroundColor: 'var(--color-admin-canvas)', 
                padding: '1.5rem', 
                borderRadius: '12px', 
                border: '2px solid #000', 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '0.8rem'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 900, color: 'var(--color-lavender)' }}>
                    {req.studentName}
                  </span>
                  <span style={{ 
                    fontSize: '0.65rem', fontWeight: 900, padding: '0.2rem 0.6rem', borderRadius: '4px', textTransform: 'uppercase',
                    backgroundColor: req.status === 'completed' ? 'rgba(82, 183, 136, 0.2)' : req.status === 'approved' ? 'rgba(255, 209, 102, 0.2)' : 'rgba(239, 71, 111, 0.2)',
                    color: req.status === 'completed' ? 'var(--color-mint)' : req.status === 'approved' ? 'var(--color-gold)' : 'var(--color-crimson)',
                    border: `1px solid ${req.status === 'completed' ? 'var(--color-mint)' : req.status === 'approved' ? 'var(--color-gold)' : 'var(--color-crimson)'}`
                  }}>
                    {req.status}
                  </span>
                </div>

                <div style={{ marginTop: '0.5rem' }}>
                  <h4 style={{ color: 'white', fontWeight: 900, fontSize: '1rem', fontFamily: 'var(--font-display)', marginBottom: '0.2rem' }}>
                    {req.deckName}
                  </h4>
                  <p style={{ color: 'var(--color-cyan)', fontWeight: 800, fontSize: '0.8rem' }}>
                    Topic: {req.topic}
                  </p>
                </div>

                {req.message && (
                  <p style={{ color: '#888', fontSize: '0.8rem', fontStyle: 'italic', marginTop: '0.5rem', borderLeft: '2px solid #333', paddingLeft: '0.8rem' }}>
                    "{req.message}"
                  </p>
                )}

                <div style={{ fontSize: '0.65rem', color: '#555', marginTop: '0.5rem' }}>
                  Requested on: {new Date(req.createdAt).toLocaleDateString()}
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', borderTop: '1px solid #222', paddingTop: '1rem' }}>
                  {req.status === 'pending' && (
                    <button className="neo-button bg-gold" style={{ flex: 1, padding: '0.5rem', fontSize: '0.75rem' }} onClick={() => handleUpdateRequestStatus(req.id, 'approved')}>
                      APPROVE
                    </button>
                  )}
                  {(req.status === 'pending' || req.status === 'approved') && (
                    <button className="neo-button bg-mint" style={{ flex: 1, padding: '0.5rem', fontSize: '0.75rem' }} onClick={() => handleUpdateRequestStatus(req.id, 'completed')}>
                      COMPLETE
                    </button>
                  )}
                  <button className="neo-button bg-crimson" style={{ padding: '0.5rem', fontSize: '0.75rem', color: 'white' }} onClick={() => handleDeleteRequest(req.id)}>
                    DELETE
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div style={{ gridColumn: '1 / -1', padding: '3rem', textAlign: 'center', backgroundColor: 'var(--color-admin-canvas)', borderRadius: '12px', border: '2px dashed #333' }}>
              <p style={{ fontWeight: 800, color: '#888', fontSize: '0.9rem' }}>
                No deck requests from students at this time.
              </p>
            </div>
          )}
        </div>
      </section>

    </div>
  );
};

export default Admin;
