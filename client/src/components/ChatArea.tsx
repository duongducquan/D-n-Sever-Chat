'use client';

import React, { useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useChat, Conversation, Message } from '../context/ChatContext';
import { MessageInput } from './MessageInput';
import {
  Users,
  CheckCheck,
  FileText,
  Download,
  Shield,
  Monitor,
  Laptop,
  Bot
} from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

interface ChatAreaProps {
  onOpenNewChat: () => void;
}

/**
 * KHU VỰC HIỂN THỊ TIN NHẮN CHÍNH (CHAT AREA)
 * Hiển thị luồng tin nhắn đa phương tiện thời gian thực giữa các máy trạm.
 */
export const ChatArea: React.FC<ChatAreaProps> = ({ onOpenNewChat }) => {
  const { user } = useAuth();
  const {
    activeConversation,
    messages,
    isLoadingMessages,
    typingUsers,
    onlineUserIds,
  } = useChat();

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isAtBottomRef = useRef<boolean>(true);

  // Hàm cuộn khung chat xuống đáy chính xác
  const scrollToBottom = (smooth = false) => {
    const el = scrollContainerRef.current;
    if (!el) return;
    if (smooth) {
      el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
    } else {
      el.scrollTop = el.scrollHeight;
    }
  };

  // Theo dõi vị trí cuộn của người dùng để tránh cuộn giật khi người dùng đang đọc tin cũ
  const handleScroll = () => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const threshold = 150;
    isAtBottomRef.current = el.scrollHeight - el.scrollTop - el.clientHeight <= threshold;
  };

  // Khi chuyển cuộc trò chuyện: Cuộn tức thì xuống tin nhắn mới nhất ở đáy
  useEffect(() => {
    isAtBottomRef.current = true;
    scrollToBottom(false);
    const timer = setTimeout(() => scrollToBottom(false), 50);
    return () => clearTimeout(timer);
  }, [activeConversation?.id]);

  // Tự động cuộn xuống khi có tin nhắn mới hoặc gõ phím
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    const isLastMessageFromMe =
      lastMessage &&
      (Boolean(user?.id && String(lastMessage.senderId) === String(user.id)) ||
        Boolean(
          user?.username &&
            lastMessage.sender?.username &&
            lastMessage.sender.username.toLowerCase() === user.username.toLowerCase()
        ));

    // Nếu người dùng đang ở cuối khung chat HOẶC tin nhắn vừa gửi là của chính họ -> Luôn cuộn xuống đáy
    if (isAtBottomRef.current || isLastMessageFromMe) {
      scrollToBottom(false);
      const raf = requestAnimationFrame(() => scrollToBottom(false));
      const timer = setTimeout(() => scrollToBottom(false), 80);
      return () => {
        cancelAnimationFrame(raf);
        clearTimeout(timer);
      };
    }
  }, [messages, typingUsers, user]);

  // Kiểm tra trạng thái trực tuyến của người đối diện
  const isPeerOnline = (conv: Conversation): boolean => {
    if (conv.isGroup) return false;
    const peer = conv.participants.find((p) => p.id !== user?.id);
    if (!peer) return false;
    return onlineUserIds.has(peer.id) || peer.status === 'online';
  };

  const getConversationAvatar = (conv: Conversation): string => {
    if (conv.isGroup) {
      return `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(conv.id)}`;
    }
    const peer = conv.participants.find((p) => p.id !== user?.id);
    return peer?.avatar || 'https://api.dicebear.com/7.x/bottts/svg?seed=guest';
  };

  // Màn hình chờ khi chưa chọn cuộc trò chuyện nào
  if (!activeConversation) {
    return (
      <main style={{
        flex: 1,
        height: '100%',
        background: 'radial-gradient(circle at 60% 40%, #171f33 0%, #0b0f19 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        textAlign: 'center',
      }}>
        <div style={{
          width: '90px',
          height: '90px',
          borderRadius: '30px',
          background: 'linear-gradient(135deg, rgba(59,130,246,0.2) 0%, rgba(139,92,246,0.2) 100%)',
          border: '1px solid rgba(255,255,255,0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '1.5rem',
          boxShadow: '0 12px 30px rgba(0,0,0,0.3)',
        }}>
          <Monitor size={44} color="#60a5fa" />
        </div>

        <h2 style={{ fontSize: '1.6rem', fontWeight: 700, marginBottom: '0.6rem', color: '#f3f4f6' }}>
          Hệ Thống Trò Chuyện Trực Tuyến Đa Nền Tảng
        </h2>
        <p style={{ maxWidth: '520px', color: '#9ca3af', fontSize: '0.92rem', lineHeight: '1.6', marginBottom: '2rem' }}>
          Hệ thống sẵn sàng truyền dữ liệu thời gian thực giữa các máy tính với nhau qua mạng LAN / Wi-Fi.
          Kiến trúc thiết kế chuẩn <b style={{ color: '#93c5fd' }}>Domain-Driven Design (DDD)</b>, CSDL MySQL WampServer.
        </p>

        <div style={{
          display: 'flex',
          gap: '1rem',
          flexWrap: 'wrap',
          justifyContent: 'center',
        }}>
          <button
            onClick={onOpenNewChat}
            className="btn-primary"
            style={{
              padding: '0.75rem 1.4rem',
              borderRadius: '12px',
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <Laptop size={18} />
            <span>Kết nối nhắn tin với máy khác</span>
          </button>
        </div>

        {/* Hướng dẫn kết nối giữa 2 máy */}
        <div style={{
          marginTop: '3rem',
          padding: '1.25rem 1.75rem',
          borderRadius: '16px',
          background: 'rgba(31, 41, 55, 0.4)',
          border: '1px solid rgba(75, 85, 99, 0.3)',
          maxWidth: '560px',
          textAlign: 'left',
          fontSize: '0.82rem',
          color: '#cbd5e1',
          lineHeight: '1.6',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, color: '#38bdf8', marginBottom: '6px' }}>
            <Shield size={16} />
            <span>Cách mở 2 máy tính chat với nhau trong cùng mạng Wi-Fi:</span>
          </div>
          <ol style={{ paddingLeft: '1.2rem', margin: 0 }}>
            <li>Trên máy này (Máy chủ), hệ thống đang chạy trên cổng <b>3000</b> (Client) và <b>5000</b> (Backend).</li>
            <li>Trên máy tính thứ hai (hoặc điện thoại): Mở trình duyệt và nhập địa chỉ IP mạng LAN của máy này (Ví dụ: <code>http://192.168.20.145:3000</code>).</li>
            <li>Đăng ký/Đăng nhập 2 tài khoản khác nhau trên 2 máy (VD: <b>may_1</b> và <b>may_2</b>).</li>
            <li>Gửi tin nhắn, hình ảnh hoặc tài liệu để thấy độ trễ siêu tốc dưới 10ms!</li>
          </ol>
        </div>
      </main>
    );
  }

  const isOnline = isPeerOnline(activeConversation);
  const convAvatar = getConversationAvatar(activeConversation);

  return (
    <main style={{
      flex: 1,
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--bg-primary)',
      overflow: 'hidden',
    }}>
      {/* Thanh tiêu đề cuộc hội thoại (Top Bar) */}
      <header style={{
        padding: '0.9rem 1.5rem',
        background: 'rgba(17, 24, 39, 0.95)',
        borderBottom: '1px solid var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        zIndex: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{ position: 'relative' }}>
            <img
              src={convAvatar}
              alt={activeConversation.title}
              style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover' }}
            />
            {!activeConversation.isGroup && (
              <span
                className={`status-indicator ${isOnline ? 'status-online' : 'status-offline'}`}
                style={{ position: 'absolute', bottom: '0', right: '0', border: '2px solid #111827' }}
              />
            )}
          </div>

          <div>
            <div style={{ fontSize: '1rem', fontWeight: 600, color: '#f3f4f6' }}>
              {activeConversation.title}
            </div>
            <div style={{ fontSize: '0.78rem', color: isOnline ? '#10b981' : '#9ca3af' }}>
              {activeConversation.isGroup
                ? `Nhóm • ${activeConversation.participants.length} thành viên`
                : isOnline
                ? '🟢 Đang trực tuyến'
                : '⚪ Ngoại tuyến'}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{
            fontSize: '0.75rem',
            padding: '0.35rem 0.75rem',
            borderRadius: '999px',
            background: 'rgba(59, 130, 246, 0.15)',
            color: '#93c5fd',
            border: '1px solid rgba(59, 130, 246, 0.3)',
          }}>
            ⚡ WebSocket Real-time
          </span>
        </div>
      </header>

      {/* Luồng tin nhắn (Messages Container) */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '1.25rem 1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
        }}
      >
        {isLoadingMessages ? (
          <div style={{ textAlign: 'center', margin: 'auto', color: '#9ca3af', fontSize: '0.875rem' }}>
            Đang tải dữ liệu tin nhắn...
          </div>
        ) : messages.length === 0 ? (
          <div style={{
            textAlign: 'center',
            margin: 'auto',
            color: '#6b7280',
            fontSize: '0.85rem',
            maxWidth: '320px',
          }}>
            <Users size={32} style={{ margin: '0 auto 0.5rem auto', opacity: 0.5 }} />
            <p>Chưa có tin nhắn nào trong cuộc trò chuyện này.</p>
            <p style={{ fontSize: '0.75rem', marginTop: '4px' }}>Hãy gửi lời chào đầu tiên!</p>
          </div>
        ) : (
          messages.map((msg, index) => {
            const isMe =
              Boolean(user?.id && String(msg.senderId) === String(user.id)) ||
              Boolean(
                user?.username &&
                  msg.sender?.username &&
                  msg.sender.username.toLowerCase() === user.username.toLowerCase()
              );

            const senderName = msg.sender?.displayName || msg.sender?.username || 'Thành viên';
            const timeStr = format(new Date(msg.createdAt), 'HH:mm', { locale: vi });

            return (
              <div
                key={msg.id || index}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: isMe ? 'flex-end' : 'flex-start',
                  alignSelf: isMe ? 'flex-end' : 'flex-start',
                  width: '100%',
                  marginBottom: '0.35rem',
                }}
              >
                {/* Tên người gửi nếu là nhóm chat và tin nhắn của người khác */}
                {!isMe && activeConversation.isGroup && (
                  <span style={{
                    fontSize: '0.72rem',
                    color: '#9ca3af',
                    marginLeft: '44px',
                    marginBottom: '2px',
                    fontWeight: 500,
                  }}>
                    {senderName}
                  </span>
                )}

                <div style={{
                  display: 'flex',
                  alignItems: 'flex-end',
                  justifyContent: isMe ? 'flex-end' : 'flex-start',
                  gap: '0.5rem',
                  maxWidth: '75%',
                }}>
                  {/* Avatar của người gửi đối với tin nhắn nhận */}
                  {!isMe && (
                    <img
                      src={msg.sender?.avatar || 'https://api.dicebear.com/7.x/bottts/svg?seed=user'}
                      alt={senderName}
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        objectFit: 'cover',
                        flexShrink: 0,
                      }}
                    />
                  )}

                  {/* Bong bóng tin nhắn */}
                  <div
                    className={isMe ? 'message-bubble-outgoing' : 'message-bubble-incoming'}
                    style={{
                      padding: '0.65rem 0.95rem',
                      wordBreak: 'break-word',
                      fontSize: '0.92rem',
                      lineHeight: '1.45',
                    }}
                  >
                    {/* Render hình ảnh đính kèm */}
                    {msg.messageType === 'image' && msg.fileUrl && (
                      <div style={{ marginBottom: msg.content !== '[Hình ảnh]' ? '0.5rem' : 0 }}>
                        <a href={msg.fileUrl} target="_blank" rel="noopener noreferrer">
                          <img
                            src={msg.fileUrl}
                            alt="Attachment"
                            onLoad={() => {
                              if (isAtBottomRef.current) scrollToBottom(false);
                            }}
                            style={{
                              maxWidth: '100%',
                              maxHeight: '280px',
                              borderRadius: '10px',
                              objectFit: 'cover',
                              display: 'block',
                            }}
                          />
                        </a>
                      </div>
                    )}

                    {/* Render tệp tin đính kèm */}
                    {msg.messageType === 'file' && msg.fileUrl && (
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.6rem',
                        padding: '0.5rem 0.75rem',
                        background: 'rgba(0,0,0,0.2)',
                        borderRadius: '8px',
                        marginBottom: msg.content !== '[Tập tin đính kèm]' ? '0.4rem' : 0,
                      }}>
                        <FileText size={24} color="#60a5fa" />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: '0.82rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {msg.fileName || 'Tài liệu'}
                          </div>
                          {msg.fileSize && (
                            <div style={{ fontSize: '0.7rem', color: '#cbd5e1' }}>
                              {(msg.fileSize / 1024).toFixed(1)} KB
                            </div>
                          )}
                        </div>
                        <a
                          href={msg.fileUrl}
                          download={msg.fileName || 'file'}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: '#fff', padding: '4px' }}
                        >
                          <Download size={18} />
                        </a>
                      </div>
                    )}

                    {/* Nội dung văn bản */}
                    {msg.content && msg.content !== '[Hình ảnh]' && msg.content !== '[Tập tin đính kèm]' && (
                      <div>{msg.content}</div>
                    )}

                    {/* Thời gian và icon đã đọc */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'flex-end',
                      gap: '4px',
                      fontSize: '0.68rem',
                      marginTop: '4px',
                      color: isMe ? 'rgba(255,255,255,0.7)' : '#9ca3af',
                    }}>
                      <span>{timeStr}</span>
                      {isMe && <CheckCheck size={14} color="#93c5fd" />}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}

        {/* Bong bóng hiển thị đang nhập phím (Typing Indicator) */}
        {typingUsers.length > 0 && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.4rem 0.8rem',
            background: 'rgba(31, 41, 55, 0.6)',
            borderRadius: '16px',
            alignSelf: 'flex-start',
            fontSize: '0.75rem',
            color: '#9ca3af',
          }}>
            <div style={{ display: 'flex', gap: '3px' }}>
              <span className="typing-dot" style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#60a5fa' }} />
              <span className="typing-dot" style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#60a5fa' }} />
              <span className="typing-dot" style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#60a5fa' }} />
            </div>
            <span>{typingUsers.join(', ')} đang nhập tin nhắn...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Khung nhập tin nhắn */}
      <MessageInput />
    </main>
  );
};
