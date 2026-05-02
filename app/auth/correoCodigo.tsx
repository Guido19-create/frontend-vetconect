import React, { useState } from 'react';

const PasswordRecovery: React.FC = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setRecoveryEmail(email);
      setSubmitted(true);
      console.log('Enviando código a:', email);
    }
  };

  const handleBack = () => {
    setSubmitted(false);
    setEmail('');
  };

  const styles = {
    container: {
      minHeight: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px',
    },
    card: {
      background: 'white',
      borderRadius: '16px',
      padding: '40px',
      width: '100%',
      maxWidth: '450px',
      boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
      animation: 'fadeIn 0.5s ease-in-out',
    },
    title: {
      fontSize: '28px',
      fontWeight: 700,
      color: '#333',
      marginBottom: '12px',
      textAlign: 'center' as const,
    },
    subtitle: {
      color: '#666',
      textAlign: 'center' as const,
      marginBottom: '30px',
      lineHeight: 1.5,
      fontSize: '14px',
    },
    inputGroup: {
      marginBottom: '24px',
    },
    label: {
      display: 'block',
      marginBottom: '8px',
      color: '#333',
      fontWeight: 500,
      fontSize: '14px',
    },
    input: {
      width: '100%',
      padding: '12px 16px',
      border: '2px solid #e0e0e0',
      borderRadius: '8px',
      fontSize: '16px',
      transition: 'all 0.3s ease',
      outline: 'none',
    },
    submitButton: {
      width: '100%',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      padding: '14px',
      border: 'none',
      borderRadius: '8px',
      fontSize: '16px',
      fontWeight: 600,
      cursor: 'pointer',
      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    },
    emailIcon: {
      fontSize: '64px',
      textAlign: 'center' as const,
      marginBottom: '20px',
    },
    confirmationTitle: {
      fontSize: '24px',
      fontWeight: 700,
      color: '#333',
      textAlign: 'center' as const,
      marginBottom: '16px',
    },
    confirmationMessage: {
      color: '#555',
      textAlign: 'center' as const,
      lineHeight: 1.6,
      marginBottom: '30px',
      fontSize: '15px',
    },
    strong: {
      color: '#667ea',
      fontWeight: 600,
    },
    backButton: {
      width: '100%',
      background: '#f5f5f5',
      color: '#666',
      padding: '12px',
      border: 'none',
      borderRadius: '8px',
      fontSize: '15px',
      fontWeight: 500,
      cursor: 'pointer',
      transition: 'all 0.2s ease',
    },
  };

  return (
    <div style={styles.container}>
      {!submitted ? (
        <div style={styles.card}>
          <h2 style={styles.title}>Recuperar Contraseña</h2>
          <p style={styles.subtitle}>
            Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña
          </p>
          
          <form onSubmit={handleSubmit}>
            <div style={styles.inputGroup}>
              <label style={styles.label} htmlFor="email">Correo Electrónico</label>
              <input
                type="email"
                id="email"
                style={styles.input}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tucorreo@ejemplo.com"
                required
              />
            </div>
            
            <button 
              type="submit" 
              style={styles.submitButton}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 5px 20px rgba(102, 126, 234, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              Enviar Código
            </button>
          </form>
        </div>
      ) : (
        <div style={styles.card}>
          <div style={styles.emailIcon}>📧</div>
          <h3 style={styles.confirmationTitle}>Revisa tu correo</h3>
          <p style={styles.confirmationMessage}>
            Hemos enviado un enlace de recuperación a <strong style={styles.strong}>{recoveryEmail}</strong>. 
            Haz clic en el enlace del correo para restablecer tu contraseña.
          </p>
          <button 
            onClick={handleBack} 
            style={styles.backButton}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#e8e8e8';
              e.currentTarget.style.color = '#333';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#f5f5f5';
              e.currentTarget.style.color = '#666';
            }}
          >
            Volver
          </button>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        input:focus {
          border-color: #667eea !important;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1) !important;
        }
        
        @media (max-width: 480px) {
          .recovery-form-card {
            padding: 30px 20px;
          }
        }
      `}</style>
    </div>
  );
};

export default PasswordRecovery;