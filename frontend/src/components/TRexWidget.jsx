import React, { useState, useEffect } from 'react';

const CactusSVG = ({ color }) => (
  <svg viewBox="0 0 25 50" style={{ width: '100%', height: '100%' }}>
    <path 
      d="M10,0h5v50h-5V0z M4,15h6v5H4V15z M4,20h2v15H4V20z M15,10h6v5h-6V10z M19,15h2v20h-2V15z" 
      fill={color} 
    />
  </svg>
);

const DinoSVG = ({ isRunning, frame, color }) => {
  const showLeftFoot = !isRunning || frame % 2 === 0;
  return (
    <svg viewBox="0 0 44 47" style={{ width: '100%', height: '100%', transform: 'scaleX(-1)' }}>
      <path 
        d="M38,2v4h-4v4h-2v24h-2v2h-4v-2h-2v-4h-2v-4h-2v-2h-2v-2h-2v-2H16v-2H10v-2H6v-2H4v-2H2v-4h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2V12h2V8h2v-4h2V2h8v4h-4v4h4v2h2v-2h2v-2h2V8h2V6h2V4h2V2H38z" 
        fill={color || "#ffffff"} 
      />
      <rect x="24" y="6" width="3" height="3" fill="#171717" />
      {showLeftFoot ? (
        <path d="M16,36h4v11h-4V36z M24,36h4v6h-4V36z" fill={color || "#ffffff"} />
      ) : (
        <path d="M16,36h4v6h-4V36z M24,36h4v11h-4V36z" fill={color || "#ffffff"} />
      )}
    </svg>
  );
};

const TRexWidget = () => {
  const [isJumping, setIsJumping] = useState(false);
  const [cactusPosition, setCactusPosition] = useState(100);
  const [cactusColor, setCactusColor] = useState('var(--color-primary)'); // Cyan
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [frame, setFrame] = useState(0);

  const handleJumpOrStart = () => {
    if (!isPlaying) {
      setIsPlaying(true);
      setScore(0);
      setCactusPosition(100);
      setCactusColor('var(--color-primary)');
    }
    if (!isJumping) {
      setIsJumping(true);
      // jump logic simulates simple height transition
      setTimeout(() => setIsJumping(false), 500); 
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        handleJumpOrStart();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isJumping, isPlaying]);

  // Frame animation loop for running cycle
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setFrame(f => f + 1);
    }, 120);
    return () => clearInterval(interval);
  }, [isPlaying]);

  // Main game loop
  useEffect(() => {
    let gameLoop;
    if (isPlaying) {
      gameLoop = setInterval(() => {
        setCactusPosition((prev) => {
          if (prev <= -10) {
            setScore(s => s + 10);
            // Alternate obstacle color between Cyan and Coral
            setCactusColor(Math.random() > 0.5 ? 'var(--color-primary)' : 'var(--color-warning)');
            return 100;
          }
          
          // Collision logic matching the container dimensions
          if (prev > 12 && prev < 24 && !isJumping) {
            setIsPlaying(false);
            if (score > highScore) setHighScore(score);
            return 100; 
          }

          return prev - 2.5; // smooth speed
        });
      }, 20);
    }

    return () => {
      if (gameLoop) clearInterval(gameLoop);
    };
  }, [isPlaying, isJumping, score, highScore]);

  return (
    <div 
      className="interactive" 
      onClick={handleJumpOrStart}
      style={{ 
        position: 'relative', 
        width: '100%', 
        height: '100%', 
        overflow: 'hidden', 
        backgroundColor: '#171717', // Matte Black
        display: 'flex', 
        alignItems: 'center', 
        cursor: 'pointer',
        userSelect: 'none'
      }}
    >
      {/* Score Header */}
      <div style={{ position: 'absolute', top: '12px', right: '20px', fontWeight: 900, fontFamily: 'var(--font-8bit)', fontSize: '0.65rem', color: '#666666', zIndex: 10 }}>
        HI {String(highScore).padStart(5, '0')} &nbsp; {String(score).padStart(5, '0')}
      </div>
      
      {/* Ground Line */}
      <div style={{ position: 'absolute', bottom: '20px', width: '100%', borderBottom: '2.5px dashed #333333' }} />
      
      {/* Dino Character */}
      <div style={{ 
        position: 'absolute', 
        left: '50px', 
        bottom: isJumping ? '80px' : '20px',
        width: '38px', 
        height: '38px', 
        transition: isJumping ? 'bottom 0.22s ease-out' : 'bottom 0.25s ease-in',
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        zIndex: 5
      }}>
        <DinoSVG isRunning={isPlaying && !isJumping} frame={frame} color="#ffffff" />
      </div>

      {/* Cactus Obstacle */}
      {isPlaying && (
        <div style={{
          position: 'absolute',
          bottom: '20px',
          left: `${cactusPosition}%`,
          width: '20px',
          height: '38px',
          zIndex: 4
        }}>
          <CactusSVG color={cactusColor} />
        </div>
      )}

      {!isPlaying && (
        <div style={{ 
          position: 'absolute', 
          bottom: '50%', 
          left: '50%', 
          transform: 'translate(-50%, 50%)', 
          fontSize: '0.65rem', 
          fontWeight: 700, 
          color: '#888888', 
          fontFamily: 'var(--font-8bit)', 
          textAlign: 'center',
          lineHeight: '1.8'
        }}>
          CLICK OR PRESS SPACE<br/>TO RUN & JUMP
        </div>
      )}
    </div>
  );
};

export default TRexWidget;
