import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap } from 'lucide-react';

const LandingIntro = () => {
  const navigate = useNavigate();

  return (
    <section className="relative h-screen w-full overflow-hidden bg-black">

      {/* BACKGROUND VIDEO */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover scale-105"
      >
        <source
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260314_131748_f2ca2a28-fed7-44c8-b9a9-bd9acdd5ec31.mp4"
          type="video/mp4"
        />
      </video>

      {/* OVERLAY */}
      <div className="absolute inset-0 bg-black/50" />

      {/* CONTENT */}
      <div className="relative z-20 h-full flex flex-col items-center justify-center px-6 text-center">

        {/* TOP LABEL */}
        <p
          className="mb-5 text-[9px] sm:text-[11px] uppercase"
          style={{
            fontFamily: "'Orbitron', sans-serif",
            color: 'rgb(82, 194, 235)',
            letterSpacing: '0.28em',
          }}
        >
          Multiplayer Flashcard Arena
        </p>

        {/* TITLE */}
        <h1
          className="uppercase"
          style={{
            fontFamily: "'Press Start 2P', cursive",
            fontSize: 'clamp(2.2rem, 6vw, 5rem)',
            color: 'rgb(240, 207, 74)',
            textShadow: `
              0 0 8px rgba(240,207,74,0.14),
              0 0 18px rgba(82,194,235,0.08)
            `,
            lineHeight: '1',
          }}
        >
          FLASHCARD
          <br />
          DUEL
        </h1>

        {/* SUBTEXT */}
<p
  className="mt-6 max-w-lg text-sm sm:text-[15px] leading-relaxed"
  style={{
    fontFamily: "'Space Grotesk', sans-serif",
    color: 'rgba(255,255,255,0.84)',
    fontWeight: 500,
    letterSpacing: '0.02em',
    textShadow: '0 0 10px rgba(255,255,255,0.04)',
  }}
>
  Sharpen memory skills and challenge players
  in fast-paced multiplayer quiz battles.
</p>

        
{/* BUTTON */}
<button
  onClick={() => navigate('/auth')}
  className="mt-8 flex items-center gap-2.5 rounded-xl px-6 py-3 transition-all duration-300 hover:scale-105 hover:-translate-y-1"
  style={{
    background: `
      linear-gradient(
        135deg,
        rgb(70, 190, 255),
        rgb(35, 150, 255)
      )
    `,
    color: '#e61e1e',
    fontFamily: "'Press Start 2P', cursive",
    fontWeight: 580,
    fontSize: '0.68rem',
    letterSpacing: '0.08em',
    textTransform: 'uppercase',

    border: '1px solid rgba(255,255,255,0.14)',

    boxShadow: `
      0 0 12px rgba(82,194,235,0.45),
      0 0 28px rgba(82,194,235,0.18),
      0 0 45px rgba(240,207,74,0.22),
      inset 0 1px 0 rgba(255,255,255,0.22)
    `,

    backdropFilter: 'blur(6px)',
  }}
>
  <Zap
    size={16}
    style={{
      filter: `
        drop-shadow(0 0 4px rgba(255,255,255,0.4))
        drop-shadow(0 0 10px rgba(240,207,74,0.35))
      `,
    }}
  />

  ENTER THE ARENA
</button>
      </div>
    </section>
  );
};

export default LandingIntro;