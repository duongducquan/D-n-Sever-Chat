'use client';

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { MessageSquare, Lock, User as UserIcon, Mail, Sparkles, ShieldCheck } from 'lucide-react';

/**
 * GIAO DIỆN ĐĂNG NHẬP / ĐĂNG KÝ HIỆN ĐẠI (GLASSMORPHISM)
 * Hỗ trợ tạo tài khoản nhanh để kiểm tra nhắn tin giữa máy tính này với máy tính khác.
 */
export const AuthModal: React.FC = () => {
  const { login, register } = useAuth();
  const [isLogin, setIsLogin] = useState(true);

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isLogin) {
        await login(username, password);
      } else {
        await register(username, email, password, displayName);
      }
    } catch (err: any) {
      setError(err.message || 'Đã xảy ra lỗi khi xác thực');
    } finally {
      setLoading(false);
    }
  };

  // Nút điền nhanh tài khoản mẫu để test nhanh
  const fillSampleAccount = (user: string, pass: string) => {
    setUsername(user);
    setPassword(pass);
    if (!isLogin) {
      setEmail(`${user}@example.com`);
      setDisplayName(user.toUpperCase());
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(circle at 50% 20%, #1e1b4b 0%, #030712 100%)',
      padding: '1rem',
      zIndex: 1000,
    }}>
      <div className="glass-panel" style={{
        width: '100%',
        maxWidth: '440px',
        padding: '2.5rem',
        borderRadius: '24px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Vệt sáng trang trí */}
        <div style={{
          position: 'absolute',
          top: '-80px',
          right: '-80px',
          width: '180px',
          height: '180px',
          background: 'radial-gradient(circle, rgba(99,102,241,0.35) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        {/* Logo & Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '64px',
            height: '64px',
            borderRadius: '20px',
            background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
            boxShadow: '0 8px 24px rgba(59, 130, 246, 0.4)',
            marginBottom: '1rem',
          }}>
            <MessageSquare size={32} color="#ffffff" />
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#f3f4f6', letterSpacing: '-0.5px' }}>
            Hệ Thống Chat DDD
          </h1>
          <p style={{ color: '#9ca3af', fontSize: '0.875rem', marginTop: '0.35rem' }}>
            Trò chuyện thời gian thực giữa các máy qua mạng LAN / Web
          </p>
        </div>

        {/* Tab chuyển đổi Đăng nhập / Đăng ký */}
        <div style={{
          display: 'flex',
          background: 'rgba(31, 41, 55, 0.6)',
          borderRadius: '12px',
          padding: '4px',
          marginBottom: '1.5rem',
        }}>
          <button
            type="button"
            onClick={() => { setIsLogin(true); setError(null); }}
            style={{
              flex: 1,
              padding: '0.6rem',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.875rem',
              transition: 'all 0.2s',
              background: isLogin ? 'var(--accent-gradient)' : 'transparent',
              color: isLogin ? '#ffffff' : '#9ca3af',
            }}
          >
            Đăng Nhập
          </button>
          <button
            type="button"
            onClick={() => { setIsLogin(false); setError(null); }}
            style={{
              flex: 1,
              padding: '0.6rem',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.875rem',
              transition: 'all 0.2s',
              background: !isLogin ? 'var(--accent-gradient)' : 'transparent',
              color: !isLogin ? '#ffffff' : '#9ca3af',
            }}
          >
            Đăng Ký
          </button>
        </div>

        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            color: '#fca5a5',
            padding: '0.75rem',
            borderRadius: '10px',
            fontSize: '0.85rem',
            marginBottom: '1.25rem',
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Tên đăng nhập */}
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#9ca3af', marginBottom: '0.4rem', textTransform: 'uppercase' }}>
              Tên tài khoản
            </label>
            <div style={{ position: 'relative' }}>
              <UserIcon size={18} color="#6b7280" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Ví dụ: may_a hoặc may_b"
                className="input-field"
                style={{
                  width: '100%',
                  padding: '0.75rem 0.75rem 0.75rem 2.4rem',
                  borderRadius: '10px',
                  fontSize: '0.9rem',
                }}
              />
            </div>
          </div>

          {!isLogin && (
            <>
              {/* Họ tên hiển thị */}
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#9ca3af', marginBottom: '0.4rem', textTransform: 'uppercase' }}>
                  Tên hiển thị
                </label>
                <div style={{ position: 'relative' }}>
                  <Sparkles size={18} color="#6b7280" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Ví dụ: Máy Tính Phòng Khách"
                    className="input-field"
                    style={{
                      width: '100%',
                      padding: '0.75rem 0.75rem 0.75rem 2.4rem',
                      borderRadius: '10px',
                      fontSize: '0.9rem',
                    }}
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#9ca3af', marginBottom: '0.4rem', textTransform: 'uppercase' }}>
                  Email
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail size={18} color="#6b7280" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@example.com"
                    className="input-field"
                    style={{
                      width: '100%',
                      padding: '0.75rem 0.75rem 0.75rem 2.4rem',
                      borderRadius: '10px',
                      fontSize: '0.9rem',
                    }}
                  />
                </div>
              </div>
            </>
          )}

          {/* Mật khẩu */}
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#9ca3af', marginBottom: '0.4rem', textTransform: 'uppercase' }}>
              Mật khẩu
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} color="#6b7280" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Tối thiểu 6 ký tự"
                className="input-field"
                style={{
                  width: '100%',
                  padding: '0.75rem 0.75rem 0.75rem 2.4rem',
                  borderRadius: '10px',
                  fontSize: '0.9rem',
                }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{
              padding: '0.85rem',
              borderRadius: '10px',
              fontSize: '1rem',
              fontWeight: 600,
              marginTop: '0.5rem',
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? 'Đang xử lý...' : isLogin ? 'Đăng Nhập Ngay' : 'Tạo Tài Khoản Mới'}
          </button>
        </form>

        {/* Nút gợi ý test tài khoản 2 máy */}
        <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid rgba(255,255,255,0.08)', textAlign: 'center' }}>
          <p style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.6rem' }}>
            💡 Mẹo kiểm tra 2 máy chat với nhau:
          </p>
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
            <button
              type="button"
              onClick={() => fillSampleAccount('may_1', '123456')}
              style={{
                background: 'rgba(55, 65, 81, 0.4)',
                border: '1px solid rgba(75, 85, 99, 0.4)',
                color: '#93c5fd',
                fontSize: '0.75rem',
                padding: '0.35rem 0.65rem',
                borderRadius: '6px',
                cursor: 'pointer',
              }}
            >
              Test: may_1
            </button>
            <button
              type="button"
              onClick={() => fillSampleAccount('may_2', '123456')}
              style={{
                background: 'rgba(55, 65, 81, 0.4)',
                border: '1px solid rgba(75, 85, 99, 0.4)',
                color: '#c4b5fd',
                fontSize: '0.75rem',
                padding: '0.35rem 0.65rem',
                borderRadius: '6px',
                cursor: 'pointer',
              }}
            >
              Test: may_2
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginTop: '1.2rem', color: '#4b5563', fontSize: '0.72rem' }}>
          <ShieldCheck size={14} color="#10b981" />
          <span>WampServer MySQL • Mô hình DDD • Mã nguồn sạch 99%</span>
        </div>
      </div>
    </div>
  );
};
