'use client';

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useChat, Conversation } from '../context/ChatContext';
import {
  MessageSquarePlus,
  LogOut,
  Search,
  Users,
  Wifi,
  Clock,
  CheckCheck,
  RefreshCw
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

interface SidebarProps {
  onOpenNewChat: () => void;
}

/**
 * THANH ĐIỀU HƯỚNG VÀ DANH SÁCH HỘI THOẠI (SIDEBAR)
 * Hiển thị trạng thái Online/Offline theo thời gian thực và thông báo chưa đọc.
 */
export const Sidebar: React.FC<SidebarProps> = ({ onOpenNewChat }) => {
  const { user, logout, quickSwitch } = useAuth();
  const {
    conversations,
    activeConversation,
    setActiveConversation,
    onlineUserIds,
  } = useChat();

  const [searchTerm, setSearchTerm] = useState('');

  const filteredConversations = conversations.filter((c) =>
    c.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Định dạng thời gian tương đối bằng tiếng Việt
  const formatTime = (dateStr?: string) => {
    if (!dateStr) return '';
    try {
      return formatDistanceToNow(new Date(dateStr), { addSuffix: true, locale: vi });
    } catch {
      return '';
    }
  };

  // Xác định xem người đối diện có đang online không (đối với chat 1-1)
  const isPeerOnline = (conv: Conversation): boolean => {
    if (conv.isGroup) return false;
    const peer = conv.participants.find((p) => p.id !== user?.id);
    if (!peer) return false;
    return onlineUserIds.has(peer.id) || peer.status === 'online';
  };

  // Lấy avatar hiển thị cho hội thoại
  const getConversationAvatar = (conv: Conversation): string => {
    if (conv.isGroup) {
      return `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(conv.id)}`;
    }
    const peer = conv.participants.find((p) => p.id !== user?.id);
    return peer?.avatar || 'https://api.dicebear.com/7.x/bottts/svg?seed=guest';
  };

  return (
    <aside style={{
      width: '360px',
      height: '100%',
      background: 'var(--bg-secondary)',
      borderRight: '1px solid var(--border-color)',
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0,
      userSelect: 'none',
    }}>
      {/* Thông tin hồ sơ cá nhân của người dùng hiện tại */}
      <div style={{
        padding: '1.25rem 1rem',
        borderBottom: '1px solid var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'rgba(17, 24, 39, 0.95)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ position: 'relative' }}>
            <img
              src={user?.avatar}
              alt={user?.displayName}
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                objectFit: 'cover',
                border: '2px solid rgba(59, 130, 246, 0.5)',
              }}
            />
            <span
              className="status-indicator status-online"
              style={{
                position: 'absolute',
                bottom: '1px',
                right: '1px',
                border: '2px solid #111827',
              }}
            />
          </div>
          <div>
            <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#f3f4f6' }}>
              {user?.displayName || user?.username}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: '#10b981' }}>
              <Wifi size={12} />
              <span>Đang kết nối</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <button
            onClick={() => {
              const current = user?.username || '';
              const target = current === 'quan' ? 'dai01' : 'quan';
              quickSwitch(target);
            }}
            title="Chuyển đổi giữa 2 tài khoản quan và dai01"
            style={{
              background: 'rgba(59, 130, 246, 0.2)',
              border: '1px solid rgba(59, 130, 246, 0.4)',
              color: '#93c5fd',
              padding: '0.45rem 0.65rem',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '0.75rem',
              fontWeight: 600,
              transition: 'all 0.15s ease',
            }}
          >
            <RefreshCw size={13} />
            <span>{user?.username === 'quan' ? 'Đổi sang dai01' : 'Đổi sang quan01'}</span>
          </button>

          <button
            onClick={logout}
            title="Đăng xuất khỏi hệ thống"
            style={{
              background: 'rgba(55, 65, 81, 0.3)',
              border: '1px solid rgba(75, 85, 99, 0.3)',
              color: '#9ca3af',
              padding: '0.45rem',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.15s ease',
            }}
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>

      {/* Nút Tạo hội thoại mới & Tìm kiếm */}
      <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <button
          onClick={onOpenNewChat}
          className="btn-primary"
          style={{
            width: '100%',
            padding: '0.7rem 1rem',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            fontSize: '0.875rem',
          }}
        >
          <MessageSquarePlus size={18} />
          <span>Bắt đầu trò chuyện mới</span>
        </button>

        <div style={{ position: 'relative' }}>
          <Search
            size={16}
            color="#6b7280"
            style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }}
          />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm cuộc hội thoại..."
            className="input-field"
            style={{
              width: '100%',
              padding: '0.55rem 0.75rem 0.55rem 2.2rem',
              borderRadius: '8px',
              fontSize: '0.85rem',
            }}
          />
        </div>
      </div>

      {/* Danh sách các cuộc hội thoại */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        padding: '0 0.5rem 1rem 0.5rem',
        gap: '2px',
      }}>
        {filteredConversations.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '3rem 1.5rem',
            color: '#6b7280',
            fontSize: '0.85rem',
          }}>
            <Users size={36} style={{ margin: '0 auto 0.75rem auto', opacity: 0.5 }} />
            <p>Chưa có cuộc trò chuyện nào.</p>
            <p style={{ fontSize: '0.75rem', marginTop: '4px' }}>
              Bấm nút &quot;Bắt đầu trò chuyện mới&quot; ở trên để kết nối với máy khác!
            </p>
          </div>
        ) : (
          filteredConversations.map((conv) => {
            const isActive = activeConversation?.id === conv.id;
            const peerOnline = isPeerOnline(conv);
            const avatarUrl = getConversationAvatar(conv);

            return (
              <div
                key={conv.id}
                onClick={() => setActiveConversation(conv)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem 0.85rem',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  background: isActive ? 'rgba(59, 130, 246, 0.16)' : 'transparent',
                  borderLeft: isActive ? '3px solid #3b82f6' : '3px solid transparent',
                  transition: 'background 0.15s ease',
                }}
              >
                {/* Avatar */}
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  <img
                    src={avatarUrl}
                    alt={conv.title}
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      background: 'rgba(255,255,255,0.05)',
                    }}
                  />
                  {/* Trạng thái Online nếu là chat 1-1 */}
                  {!conv.isGroup && (
                    <span
                      className={`status-indicator ${peerOnline ? 'status-online' : 'status-offline'}`}
                      style={{
                        position: 'absolute',
                        bottom: '0',
                        right: '0',
                        border: '2px solid #111827',
                      }}
                    />
                  )}
                  {conv.isGroup && (
                    <div style={{
                      position: 'absolute',
                      bottom: '-2px',
                      right: '-2px',
                      background: '#4b5563',
                      borderRadius: '50%',
                      padding: '2px',
                      border: '2px solid #111827',
                      display: 'flex',
                    }}>
                      <Users size={10} color="#fff" />
                    </div>
                  )}
                </div>

                {/* Tiêu đề & Tin nhắn mới nhất */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'baseline',
                    marginBottom: '2px',
                  }}>
                    <span style={{
                      fontSize: '0.9rem',
                      fontWeight: isActive ? 600 : 500,
                      color: isActive ? '#93c5fd' : '#f3f4f6',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}>
                      {conv.title}
                    </span>
                    <span style={{ fontSize: '0.7rem', color: '#6b7280', flexShrink: 0, marginLeft: '6px' }}>
                      {formatTime(conv.updatedAt)}
                    </span>
                  </div>

                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}>
                    <span style={{
                      fontSize: '0.78rem',
                      color: (conv.unreadCount || 0) > 0 ? '#e5e7eb' : '#9ca3af',
                      fontWeight: (conv.unreadCount || 0) > 0 ? 600 : 400,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}>
                      {conv.lastMessage ? conv.lastMessage.content : 'Bắt đầu cuộc trò chuyện'}
                    </span>

                    {/* Số tin nhắn chưa đọc (Unread badge) */}
                    {(conv.unreadCount || 0) > 0 && (
                      <span style={{
                        background: '#ef4444',
                        color: '#fff',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        padding: '2px 6px',
                        borderRadius: '999px',
                        marginLeft: '6px',
                        boxShadow: '0 0 8px rgba(239, 68, 68, 0.5)',
                      }}>
                        {conv.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
};
