import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { signUp, signIn, signInWithGoogle, signOutUser, getCurrentUser, onAuthStateChange, resetPassword } from '../services/authService'
import './AuthModal.css'

const AuthModal = ({ isOpen, onClose, onAuthChange }) => {
  const [isSignUp, setIsSignUp] = useState(false)
  const [showResetPassword, setShowResetPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState(null)

  useEffect(() => {
    if (!isOpen) return // Don't initialize if modal is closed
    
    // Get initial user
    try {
      const initialUser = getCurrentUser()
      setUser(initialUser)
    } catch (error) {
      console.error('Error getting initial user:', error)
      setError('Firebase authentication is not available. Please check your configuration.')
    }

    // Listen to auth state changes
    let unsubscribe = () => {}
    try {
      unsubscribe = onAuthStateChange((currentUser) => {
        setUser(currentUser)
        if (onAuthChange) {
          onAuthChange(currentUser)
        }
      })
    } catch (error) {
      console.error('Error setting up auth state listener:', error)
      setError('Unable to connect to Firebase. Please check your configuration.')
    }

    return () => {
      if (unsubscribe) {
        unsubscribe()
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]) // Only depend on isOpen, not onAuthChange to avoid infinite loops

  const handleSubmit = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    setError('')
    setLoading(true)

    try {
      let result
      if (isSignUp) {
        result = await signUp(email, password, displayName)
      } else {
        result = await signIn(email, password)
      }

      if (result.success) {
        setEmail('')
        setPassword('')
        setDisplayName('')
        setError('')
        // Close modal after successful auth
        if (onClose) {
          onClose()
        }
      } else {
        setError(result.error || 'Authentication failed')
      }
    } catch (err) {
      console.error('Auth error:', err)
      setError(err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setError('')
    setLoading(true)

    try {
      const result = await signInWithGoogle()
      if (result.success) {
        setError('')
        // Close modal after successful auth
        if (onClose) {
          onClose()
        }
      } else {
        setError(result.error || 'Google sign-in failed')
      }
    } catch (err) {
      console.error('Google sign-in error:', err)
      setError(err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    setLoading(true)
    setError('')
    try {
      await signOutUser()
      setUser(null)
      if (onAuthChange) {
        onAuthChange(null)
      }
      // Close modal after sign out
      if (onClose) {
        onClose()
      }
    } catch (err) {
      console.error('Sign out error:', err)
      setError(err.message || 'Sign out failed')
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    setError('')
    setSuccess('')
    setLoading(true)

    if (!email) {
      setError('Please enter your email address')
      setLoading(false)
      return
    }

    try {
      const result = await resetPassword(email)
      if (result.success) {
        setSuccess('Email sent successfully')
        // Don't clear email so user can see where it was sent
      } else {
        setError(result.error || 'Failed to send password reset email')
      }
    } catch (err) {
      console.error('Password reset error:', err)
      setError(err.message || 'An error occurred while sending the reset email')
    } finally {
      setLoading(false)
    }
  }

  // Handle escape key to close modal
  useEffect(() => {
    if (!isOpen) return

    const handleEscape = (e) => {
      if (e.key === 'Escape' && onClose) {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, onClose])


  if (!isOpen) {
    return null
  }

  // Ensure document.body exists before using portal
  if (typeof document === 'undefined' || !document.body) {
    return null
  }

  const modalContent = user ? (
    <div 
      className="auth-modal-overlay" 
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose()
        }
      }}
    >
      <div className="auth-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="auth-modal-header">
          <h2>Account</h2>
          <button 
            className="auth-modal-close" 
            type="button"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onClose()
            }}
          >
            ×
          </button>
        </div>
        <div className="auth-modal-body">
          <div className="user-info">
            <p><strong>Signed in as:</strong></p>
            <p>{user.displayName || user.email}</p>
            <p className="user-email">{user.email}</p>
          </div>
          <div className="sync-info">
            <p>✓ Your visited places are synced across all devices</p>
          </div>
          <button
            className="auth-button auth-button-signout"
            type="button"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              handleSignOut()
            }}
            disabled={loading}
          >
            {loading ? 'Signing out...' : 'Sign Out'}
          </button>
        </div>
      </div>
    </div>
  ) : (
    <div 
      className="auth-modal-overlay" 
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose()
        }
      }}
    >
      <div className="auth-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="auth-modal-header">
          <h2>{showResetPassword ? 'Reset Password' : (isSignUp ? 'Sign Up' : 'Sign In')}</h2>
          <button 
            className="auth-modal-close" 
            type="button"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onClose()
            }}
          >
            ×
          </button>
        </div>
        <div className="auth-modal-body">
          {showResetPassword ? (
            <>
              <p className="auth-modal-description">
                Enter your email address and we'll send you a link to reset your password.
              </p>
              
              {error && (
                <div className="auth-error">
                  {error}
                </div>
              )}

              {success && (
                <div style={{ 
                  backgroundColor: '#e8f5e9', 
                  color: '#2e7d32', 
                  padding: '16px', 
                  borderRadius: '8px', 
                  marginBottom: '16px',
                  border: '1px solid #4CAF50'
                }}>
                  <p style={{ margin: '0 0 8px 0', fontWeight: 'bold' }}>✓ Email Sent!</p>
                  <p style={{ margin: '0 0 8px 0', fontSize: '14px' }}>
                    We've sent a password reset link to <strong>{email}</strong>
                  </p>
                  <div style={{ marginTop: '12px', padding: '10px', backgroundColor: 'rgba(255, 255, 255, 0.7)', borderRadius: '6px', fontSize: '13px' }}>
                    <p style={{ margin: '0 0 6px 0', fontWeight: '600' }}>📧 Check your email:</p>
                    <ul style={{ margin: '0', paddingLeft: '20px' }}>
                      <li>Check your inbox (and spam/junk folder)</li>
                      <li>Click the link in the email to reset your password</li>
                      <li>The link expires in 1 hour</li>
                      <li>If you don't see it, wait a few minutes and check again</li>
                    </ul>
                  </div>
                </div>
              )}

              <form onSubmit={handleResetPassword}>
                <div className="auth-form-group">
                  <label htmlFor="resetEmail">Email</label>
                  <input
                    type="email"
                    id="resetEmail"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="your@email.com"
                    disabled={loading}
                  />
                </div>

                <button
                  type="submit"
                  className="auth-button auth-button-primary"
                  disabled={loading}
                >
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </form>

              <div className="auth-switch" style={{ marginTop: '16px' }}>
                <button
                  type="button"
                  className="auth-link-button"
                  onClick={() => {
                    setShowResetPassword(false)
                    setError('')
                    setSuccess('')
                    setEmail('')
                  }}
                >
                  ← Back to Sign In
                </button>
              </div>
            </>
          ) : (
            <>
              <p className="auth-modal-description">
                Sign in to sync your visited places across all your devices
              </p>
              
              {error && (
                <div className="auth-error">
                  {error}
                  {error.includes('Firebase') || error.includes('not initialized') ? (
                    <div style={{ marginTop: '8px', fontSize: '12px', color: '#666' }}>
                      Make sure Authentication and Firestore are enabled in Firebase Console.
                    </div>
                  ) : null}
                </div>
              )}

              <form onSubmit={handleSubmit}>
            {isSignUp && (
              <div className="auth-form-group">
                <label htmlFor="displayName">Name (optional)</label>
                <input
                  type="text"
                  id="displayName"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Your name"
                />
              </div>
            )}
            
            <div className="auth-form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="your@email.com"
              />
            </div>
            
                <div className="auth-form-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <label htmlFor="password">Password</label>
                    {!isSignUp && (
                      <button
                        type="button"
                        className="auth-link-button"
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          setShowResetPassword(true)
                          setError('')
                          setSuccess('')
                        }}
                        style={{ fontSize: '13px', fontWeight: '500' }}
                      >
                        Forgot Password?
                      </button>
                    )}
                  </div>
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    minLength={6}
                  />
                </div>

                <button
                  type="submit"
                  className="auth-button auth-button-primary"
                  disabled={loading}
                >
                  {loading ? 'Please wait...' : (isSignUp ? 'Sign Up' : 'Sign In')}
                </button>
              </form>

              <div className="auth-divider">
                <span>or</span>
              </div>

              <button
                className="auth-button auth-button-google"
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  handleGoogleSignIn()
                }}
                disabled={loading}
              >
                <span className="google-icon">G</span>
                Sign in with Google
              </button>

              <div className="auth-switch">
                <p>
                  {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
                  <button
                    type="button"
                    className="auth-link-button"
                    onClick={() => {
                      setIsSignUp(!isSignUp)
                      setError('')
                    }}
                  >
                    {isSignUp ? 'Sign In' : 'Sign Up'}
                  </button>
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )

  // Render modal using React Portal to body to avoid z-index and parent container issues
  return createPortal(modalContent, document.body)
}

export default AuthModal

