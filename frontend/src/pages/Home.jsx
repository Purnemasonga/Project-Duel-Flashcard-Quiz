import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Swords, Play, Trophy, Flame, Award, Layers, Sparkles, 
  ChevronRight, ArrowRight, User, BookOpen, ShieldAlert, 
  Cpu, Code, Zap, LogIn, ChevronDown, Terminal 
} from 'lucide-react';

// --- Retro SVGs for Dino Game ---
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
        fill={color || "#171717"} 
      />
      {/* Dino Eye */}
      <rect x="14" y="6" width="3" height="3" fill="#f7f6f3" />
      {showLeftFoot ? (
        <path d="M16,36h4v11h-4V36z M24,36h4v6h-4V36z" fill={color || "#171717"} />
      ) : (
        <path d="M16,36h4v6h-4V36z M24,36h4v11h-4V36z" fill={color || "#171717"} />
      )}
    </svg>

<truncated 26810 bytes>
        .split-content {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        .bullet-point {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          font-size: 1rem;
          font-weight: 700;
          line-height: 1.5;
        }
        .bullet-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 6px;
          border-radius: 6px;
          border: 2px solid #171717;
          background-color: var(--color-primary);
          box-shadow: 2px 2px 0px #171717;
          margin-top: 2px;
        }
        .dino-split {
          display: grid;
          grid-template-columns: 1fr 1.2fr;
          gap: 4rem;
          align-items: center;
        }
        .final-cta-card {
          background-color: #ffffff;
          padding: 4.5rem 3rem;
          border: var(--border-thick);
          box-shadow: var(--shadow-offset);
          border-radius: 16px;
          text-align: center;
        }
        .final-title {
          font-family: var(--font-display);
          font-size: 3rem;
          font-weight: 900;
          margin-bottom: 1rem;
          text-transform: uppercase;
        }
        .final-subtitle {
          font-size: 1.2rem;
          font-weight: 700;
          color: #4f5d75;
          margin-bottom: 2.5rem;
        }

        .dino-game-wrapper {
          order: 1;
        }
        .dino-text-wrapper {
          order: 2;
        }

        /* Responsiveness Overrides */
