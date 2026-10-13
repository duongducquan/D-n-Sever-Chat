'use client';

import React, { useState, useEffect } from 'react';
import { apiRequest } from '../services/api';
import { useChat } from '../context/ChatContext';
import { useAuth, User } from '../context/AuthContext';
import { X, Search, Users, UserPlus, Check, MessageCircle } from 'lucide-react';

interface NewConversationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * MODAL TẠO CUỘC TRÒ CHUYỆN MỚI HOẶC TẠO NHÓM CHAT
 */
export const NewConversationModal: React.FC<NewConversationModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { user } = useAuth();
  const { createConversation } = useChat();

  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isGroupMode, setIsGroupMode] = useState(false);
  const [groupTitle, setGroupTitle] = useState('');
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const fetchUsers = async () => {
      setLoading(true);
      try {
        const res = await apiRequest<User[]>('/api/users');
        if (res.data) {
          // Lọc bỏ tài khoản của chính mình
          setUsers(res.data.filter((u) => u.id !== user?.id));
        }
      } catch (err) {
        console.error('Lỗi khi tải danh sách người dùng:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [isOpen, user]);

  if (!isOpen) return null;

  const filteredUsers = users.filter((u) =>
    (u.displayName || u.username).toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleSelectUser = (userId: string) => {
    if (selectedUserIds.includes(userId)) {
      setSelectedUserIds(selectedUserIds.filter((id) => id !== userId));
    } else {
      setSelectedUserIds([...selectedUserIds, userId]);
    }
  };

  const handleStartDirectChat = async (targetUserId: string) => {
    setCreating(true);
    try {
      await createConversation([targetUserId], undefined, false);
      onClose();
    } catch (err: any) {
      alert(err.message || 'Lỗi khi tạo cuộc trò chuyện');
    } finally {
      setCreating(false);
    }
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedUserIds.length === 0) {
      alert('Vui lòng chọn ít nhất 1 thành viên');
      return;
    }
    if (!groupTitle.trim()) {
      alert('Vui lòng nhập tên nhóm chat');
      return;
    }

    setCreating(true);
    try {
      await createConversation(selectedUserIds, groupTitle.trim(), true);
      onClose();
    } catch (err: any) {
      alert(err.message || 'Lỗi khi tạo nhóm chat');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(6px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1100,
      padding: '1rem',
    }}>
      <div className="glass-panel" style={{
        width: '100%',
        maxWidth: '480px',
        maxHeight: '85vh',
        borderRadius: '20px',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}>
        {/* Header Modal */}
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'var(--accent-gradient)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              {isGroupMode ? <Users size={20} color="#fff" /> : <UserPlus size={20} color="#fff" />}
            </div>
            <div>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 600 }}>
                {isGroupMode ? 'Tạo Nhóm Trò Chuyện Mới' : 'Bắt Đầu Trò Chuyện'}
              </h2>
              <p style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                {isGroupMode ? 'Chọn các thành viên để tạo nhóm' : 'Chọn người dùng bạn muốn nhắn tin'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#9ca3af',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '8px',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Nút chuyển chế độ Trò chuyện 1-1 / Tạo nhóm */}
        <div style={{ padding: '0.75rem 1.5rem 0 1.5rem' }}>
          <div style={{
            display: 'flex',
            background: 'rgba(31, 41, 55, 0.5)',
            borderRadius: '10px',
            padding: '3px',
          }}>
            <button
              type="button"
              onClick={() => { setIsGroupMode(false); setSelectedUserIds([]); }}
              style={{
                flex: 1,
                padding: '0.5rem',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.8rem',
                background: !isGroupMode ? 'var(--accent-primary)' : 'transparent',
                color: '#fff',
              }}
            >
              Trò Chuyện 1 - 1
            </button>
            <button
              type="button"
              onClick={() => setIsGroupMode(true)}
              style={{
                flex: 1,
                padding: '0.5rem',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.8rem',
                background: isGroupMode ? 'var(--accent-primary)' : 'transparent',
                color: '#fff',
              }}
            >
              Tạo Nhóm Chat
            </button>
          </div>
        </div>

        {/* Form nhập thông tin nhóm (nếu ở chế độ nhóm) */}
        {isGroupMode && (
          <div style={{ padding: '1rem 1.5rem 0.25rem 1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#9ca3af', marginBottom: '0.35rem' }}>
              Tên Nhóm Trò Chuyện
            </label>
            <input
              type="text"
              value={groupTitle}
              onChange={(e) => setGroupTitle(e.target.value)}
              placeholder="Ví dụ: Team Phòng Kỹ Thuật"
              className="input-field"
              style={{
                width: '100%',
                padding: '0.65rem 0.85rem',
                borderRadius: '10px',
                fontSize: '0.875rem',
              }}
            />
          </div>
        )}

        {/* Tìm kiếm người dùng */}
        <div style={{ padding: '0.75rem 1.5rem' }}>
          <div style={{ position: 'relative' }}>
            <Search size={16} color="#6b7280" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm kiếm theo tên người dùng..."
              className="input-field"
              style={{
                width: '100%',
                padding: '0.6rem 0.75rem 0.6rem 2.2rem',
                borderRadius: '10px',
                fontSize: '0.85rem',
              }}
            />
          </div>
        </div>

        {/* Danh sách người dùng */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '0 1.5rem 1rem 1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.4rem',
        }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#9ca3af', fontSize: '0.85rem' }}>
              Đang tải danh sách liên hệ...
            </div>
          ) : filteredUsers.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280', fontSize: '0.85rem' }}>
              Không tìm thấy người dùng nào khác. Hãy mở trình duyệt ở máy thứ 2 và tạo tài khoản!
            </div>
          ) : (
            filteredUsers.map((u) => {
              const isSelected = selectedUserIds.includes(u.id);
              return (
                <div
                  key={u.id}
                  onClick={() => {
                    if (isGroupMode) {
                      toggleSelectUser(u.id);
                    } else {
                      handleStartDirectChat(u.id);
                    }
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '12px',
                    background: isSelected ? 'rgba(59, 130, 246, 0.15)' : 'rgba(31, 41, 55, 0.4)',
                    border: isSelected ? '1px solid #3b82f6' : '1px solid transparent',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ position: 'relative' }}>
                      <img
                        src={u.avatar}
                        alt={u.username}
                        style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
                      />
                      <span
                        className={`status-indicator ${u.status === 'online' ? 'status-online' : 'status-offline'}`}
                        style={{ position: 'absolute', bottom: '0', right: '0', border: '2px solid #111827' }}
                      />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#f3f4f6' }}>
                        {u.displayName || u.username}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                        @{u.username} • {u.status === 'online' ? '🟢 Đang hoạt động' : '⚪ Ngoại tuyến'}
                      </div>
                    </div>
                  </div>

                  {isGroupMode ? (
                    <div style={{
                      width: '22px',
                      height: '22px',
                      borderRadius: '6px',
                      border: isSelected ? 'none' : '2px solid #6b7280',
                      background: isSelected ? '#3b82f6' : 'transparent',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      {isSelected && <Check size={14} color="#fff" />}
                    </div>
                  ) : (
                    <button
                      type="button"
                      disabled={creating}
                      style={{
                        background: 'rgba(59, 130, 246, 0.2)',
                        border: '1px solid rgba(59, 130, 246, 0.4)',
                        color: '#93c5fd',
                        borderRadius: '8px',
                        padding: '0.4rem 0.75rem',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <MessageCircle size={14} />
                      Nhắn tin
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer nếu ở chế độ tạo nhóm */}
        {isGroupMode && (
          <div style={{
            padding: '1rem 1.5rem',
            borderTop: '1px solid var(--border-color)',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '0.75rem',
          }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                background: 'transparent',
                border: '1px solid var(--border-color)',
                color: '#9ca3af',
                padding: '0.6rem 1rem',
                borderRadius: '8px',
                fontSize: '0.85rem',
                cursor: 'pointer',
              }}
            >
              Hủy bỏ
            </button>
            <button
              type="button"
              onClick={handleCreateGroup}
              disabled={creating || selectedUserIds.length === 0}
              className="btn-primary"
              style={{
                padding: '0.6rem 1.25rem',
                borderRadius: '8px',
                fontSize: '0.85rem',
                opacity: creating || selectedUserIds.length === 0 ? 0.6 : 1,
              }}
            >
              {creating ? 'Đang tạo nhóm...' : `Tạo Nhóm (${selectedUserIds.length})`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
