import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Lock,
  Mail,
  User,
  KeyRound,
} from 'lucide-react';

import { motion } from 'framer-motion';

const Auth = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState(
    location.state?.activeTab || 'STUDENT'
  );

  const [studentMode, setStudentMode] = useState(
    location.state?.studentMode || 'SIGN UP'
  );

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [adminCode, setAdminCode] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  const handleStudentSubmit = async (e) => {
    e.preventDefault();

    setError('');

    const endpoint =
      studentMode === 'SIGN UP'
        ? '/api/auth/register'
        : '/api/auth/login';

    try {
      setLoading(true);

      const payload = {
        username,
        password,
      };

      if (studentMode === 'SIGN UP') {
        payload.email = email;
      }

      const res = await fetch(
        `http://localhost:5000${endpoint}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(
          data.message ||
            data.error ||
            'Authentication failed'
        );
      }

      localStorage.setItem(
        'user',
        JSON.stringify(data.user)
      );

      localStorage.setItem('token', data.token);

      if (studentMode === 'SIGN UP') {
        navigate('/onboarding');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAdminSubmit = async (e) => {
    e.preventDefault();

    setError('');

    try {
      setLoading(true);

      const res = await fetch(
        `http://localhost:5000/api/auth/admin`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            code: adminCode,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.error || 'Authentication failed'
        );
      }

      localStorage.setItem('admin', 'true');

      navigate('/admin');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100vh',
        maxHeight: '100vh',
        overflow: 'hidden',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '0.8rem',
        background:
          'linear-gradient(to bottom right, #f7f4eb, #f3efe3)',
      }}
    >
      {/* SMALL GRID */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `
            linear-gradient(rgba(255,215,0,0.09) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,215,0,0.09) 1px, transparent 1px)
          `,
          backgroundSize: '22px 22px',
          opacity: 0.8,
          pointerEvents: 'none',
          boxShadow:
            'inset 0 0 90px rgba(255,215,0,0.04)',
        }}
      />

      {/* CYAN LIGHT */}
      <div
        style={{
          position: 'absolute',
          top: '-120px',
          left: '-100px',
          width: '320px',
          height: '320px',
          borderRadius: '999px',
          background:
            'radial-gradient(circle, rgba(83,199,240,0.20) 0%, transparent 70%)',
          filter: 'blur(45px)',
          pointerEvents: 'none',
        }}
      />

      {/* YELLOW LIGHT */}
      <div
        style={{
          position: 'absolute',
          top: '-100px',
          right: '-100px',
          width: '350px',
          height: '350px',
          borderRadius: '999px',
          background:
            'radial-gradient(circle, rgba(255,215,0,0.22) 0%, transparent 70%)',
          filter: 'blur(50px)',
          pointerEvents: 'none',
        }}
      />

      {/* CRT */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'repeating-linear-gradient(to bottom, rgba(0,0,0,0.018), rgba(0,0,0,0.018) 1px, transparent 1px, transparent 3px)',
          pointerEvents: 'none',
          opacity: 0.35,
        }}
      />

      {/* CARD */}
      <motion.div
        initial={{
          opacity: 0,
          y: 20,
          scale: 0.96,
        }}
        animate={{
          opacity: 1,
          y: 0,
          scale: 1,
        }}
        transition={{
          duration: 0.45,
        }}
        style={{
          width: '100%',
          maxWidth: '400px',
          background: '#fffdf8',
          border: '3px solid #222',
          borderRadius: '12px',
          padding: '1.35rem',
          position: 'relative',
          zIndex: 20,
          boxShadow: `
            7px 7px 0px #222,
            0 0 20px rgba(255,215,0,0.14),
            0 0 35px rgba(83,199,240,0.08)
          `,
        }}
      >
        {/* HEADER */}
        <div
          style={{
            textAlign: 'center',
            marginBottom: '1.2rem',
          }}
        >
          <h1
            style={{
              fontFamily: 'var(--font-8bit)',
              fontSize: '1.55rem',
              fontWeight: 900,
              color: '#111',
              lineHeight: 1.1,
              letterSpacing: '-1px',
              textShadow: `
                0 0 8px rgba(255,215,0,0.45),
                0 0 18px rgba(255,215,0,0.18),
                2px 2px 0px #53c7f0
              `,
            }}
          >
            FLASHCARD DUEL
          </h1>

          <p
            style={{
              marginTop: '0.6rem',
              fontSize: '0.72rem',
              fontWeight: 900,
              color: '#333',
              letterSpacing: '1.5px',
              fontFamily: 'var(--font-display)',
            }}
          >
            COMPETITIVE LEARNING ARENA
          </p>
        </div>

        {/* TABS */}
        <div
          style={{
            display: 'flex',
            gap: '0.8rem',
            marginBottom: '1.2rem',
          }}
        >
          <button
            onClick={() => setActiveTab('STUDENT')}
            style={{
              flex: 1,
              padding: '10px',
              borderRadius: '8px',
              border: '3px solid #222',
              background:
                activeTab === 'STUDENT'
                  ? '#ffd21f'
                  : '#fff',
              fontWeight: 900,
              fontSize: '0.9rem',
              cursor: 'pointer',
              boxShadow: '4px 4px 0px #222',
            }}
          >
            STUDENT
          </button>

          <button
            onClick={() => setActiveTab('ADMIN')}
            style={{
              flex: 1,
              padding: '10px',
              borderRadius: '8px',
              border: '3px solid #222',
              background:
                activeTab === 'ADMIN'
                  ? '#53c7f0'
                  : '#fff',
              fontWeight: 900,
              fontSize: '0.9rem',
              cursor: 'pointer',
              boxShadow: '4px 4px 0px #222',
            }}
          >
            ADMIN
          </button>
        </div>

        {/* ERROR */}
        {error && (
          <div
            style={{
              marginBottom: '1rem',
              padding: '0.8rem',
              borderRadius: '8px',
              background: '#ffeded',
              border: '3px solid #222',
              fontWeight: 700,
              fontSize: '0.85rem',
            }}
          >
            {error}
          </div>
        )}

        {/* STUDENT */}
        {activeTab === 'STUDENT' ? (
          <>
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '1.5rem',
                marginBottom: '1rem',
              }}
            >
              <button
                onClick={() =>
                  setStudentMode('SIGN UP')
                }
                style={{
                  border: 'none',
                  background: 'none',
                  fontWeight: 900,
                  cursor: 'pointer',
                  fontSize: '0.92rem',
                  textDecoration:
                    studentMode === 'SIGN UP'
                      ? 'underline'
                      : 'none',
                  textUnderlineOffset: '5px',
                  textDecorationThickness: '3px',
                  textDecorationColor: '#ffd21f',
                }}
              >
                REGISTER
              </button>

              <button
                onClick={() =>
                  setStudentMode('SIGN IN')
                }
                style={{
                  border: 'none',
                  background: 'none',
                  fontWeight: 900,
                  cursor: 'pointer',
                  fontSize: '0.92rem',
                  textDecoration:
                    studentMode === 'SIGN IN'
                      ? 'underline'
                      : 'none',
                  textUnderlineOffset: '5px',
                  textDecorationThickness: '3px',
                  textDecorationColor: '#53c7f0',
                }}
              >
                SIGN IN
              </button>
            </div>

            <form onSubmit={handleStudentSubmit}>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.9rem',
                }}
              >
                {/* USERNAME */}
                <div>
                  <label
                    style={{
                      display: 'block',
                      marginBottom: '0.45rem',
                      fontSize: '0.68rem',
                      fontWeight: 900,
                      fontFamily: 'var(--font-8bit)',
                    }}
                  >
                    USERNAME
                  </label>

                  <div
                    style={{
                      position: 'relative',
                    }}
                  >
                    <User
                      size={17}
                      style={{
                        position: 'absolute',
                        top: '50%',
                        left: '14px',
                        transform:
                          'translateY(-50%)',
                      }}
                    />

                    <input
                      type="text"
                      value={username}
                      onChange={(e) =>
                        setUsername(
                          e.target.value
                        )
                      }
                      placeholder="e.g. ByteHunter"
                      required
                      style={{
                        width: '100%',
                        height: '48px',
                        border: '3px solid #222',
                        borderRadius: '8px',
                        paddingLeft: '44px',
                        fontWeight: 700,
                        fontSize: '0.92rem',
                        outline: 'none',
                        background: '#fff',
                      }}
                    />
                  </div>
                </div>

                {/* EMAIL */}
                {studentMode === 'SIGN UP' && (
                  <div>
                    <label
                      style={{
                        display: 'block',
                        marginBottom: '0.45rem',
                        fontSize: '0.68rem',
                        fontWeight: 900,
                        fontFamily:
                          'var(--font-8bit)',
                      }}
                    >
                      EMAIL
                    </label>

                    <div
                      style={{
                        position: 'relative',
                      }}
                    >
                      <Mail
                        size={17}
                        style={{
                          position:
                            'absolute',
                          top: '50%',
                          left: '14px',
                          transform:
                            'translateY(-50%)',
                        }}
                      />

                      <input
                        type="email"
                        value={email}
                        onChange={(e) =>
                          setEmail(
                            e.target.value
                          )
                        }
                        placeholder="agent@duel.com"
                        style={{
                          width: '100%',
                          height: '48px',
                          border:
                            '3px solid #222',
                          borderRadius:
                            '8px',
                          paddingLeft:
                            '44px',
                          fontWeight: 700,
                          fontSize:
                            '0.92rem',
                          outline: 'none',
                          background:
                            '#eef7ff',
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* PASSWORD */}
                <div>
                  <label
                    style={{
                      display: 'block',
                      marginBottom: '0.45rem',
                      fontSize: '0.68rem',
                      fontWeight: 900,
                      fontFamily: 'var(--font-8bit)',
                    }}
                  >
                    PASSWORD
                  </label>

                  <div
                    style={{
                      position: 'relative',
                    }}
                  >
                    <KeyRound
                      size={17}
                      style={{
                        position: 'absolute',
                        top: '50%',
                        left: '14px',
                        transform:
                          'translateY(-50%)',
                      }}
                    />

                    <input
                      type="password"
                      value={password}
                      onChange={(e) =>
                        setPassword(
                          e.target.value
                        )
                      }
                      placeholder="••••••••"
                      required
                      style={{
                        width: '100%',
                        height: '48px',
                        border: '3px solid #222',
                        borderRadius: '8px',
                        paddingLeft: '44px',
                        fontWeight: 700,
                        fontSize: '0.92rem',
                        outline: 'none',
                        background: '#eef7ff',
                      }}
                    />
                  </div>
                </div>

                {/* BUTTON */}
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    marginTop: '0.6rem',
                    width: '100%',
                    height: '52px',
                    border: '3px solid #222',
                    borderRadius: '8px',
                    background:
                      'linear-gradient(to right, #7ce0b8, #53c7f0)',
                    boxShadow: '5px 5px 0px #222',
                    fontWeight: 900,
                    fontSize: '0.95rem',
                    cursor: 'pointer',
                    textTransform: 'uppercase',
                  }}
                >
                  {loading
                    ? 'CONNECTING...'
                    : studentMode === 'SIGN UP'
                    ? 'CREATE PROFILE →'
                    : 'SIGN IN →'}
                </button>
              </div>
            </form>
          </>
        ) : (
          <form onSubmit={handleAdminSubmit}>
            <div
              style={{
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.7rem',
              }}
            >
              <Lock size={22} />

              <h2
                style={{
                  fontWeight: 900,
                  fontSize: '1.15rem',
                }}
              >
                ADMIN ACCESS
              </h2>
            </div>

            <div
              style={{
                position: 'relative',
                marginBottom: '1rem',
              }}
            >
              <KeyRound
                size={17}
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '14px',
                  transform: 'translateY(-50%)',
                }}
              />

              <input
                type="password"
                value={adminCode}
                onChange={(e) =>
                  setAdminCode(e.target.value)
                }
                placeholder="Access Code"
                required
                style={{
                  width: '100%',
                  height: '48px',
                  border: '3px solid #222',
                  borderRadius: '8px',
                  paddingLeft: '44px',
                  fontWeight: 700,
                  fontSize: '0.92rem',
                  outline: 'none',
                  background: '#eef7ff',
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                height: '52px',
                border: '3px solid #222',
                borderRadius: '8px',
                background:
                  'linear-gradient(to right, #53c7f0, #7ce0b8)',
                boxShadow: '5px 5px 0px #222',
                fontWeight: 900,
                fontSize: '0.95rem',
                cursor: 'pointer',
                textTransform: 'uppercase',
              }}
            >
              {loading
                ? 'VALIDATING...'
                : 'ENTER PORTAL →'}
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
};

export default Auth;