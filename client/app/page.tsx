'use client';

import React, { useState } from 'react';
import { useAuth } from '../src/context/AuthContext';
import { Sidebar } from '../src/components/Sidebar';
import { ChatArea } from '../src/components/ChatArea';
import { AuthModal } from '../src/components/AuthModal';
import { NewConversationModal } from '../src/components/NewConversationModal';
import { Loader2 } from 'lucide-react';

export default function HomePage() {
  const { user, isLoading } = useAuth();
  const [isNewChatOpen, setIsNewChatOpen] = useState(false);

  // Hiển thị màn hình chờ khi đang kiểm tra phiên đăng nhập
  if (isLoading) {
    return (
      <div style={{
        height: '100vh',
        width: '100vw',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-primary)',
        color: '#9ca3af',
        gap: '1rem',
      }}>
        <Loader2 size={36} className="animate-spin" color="#3b82f6" />
        <p style={{ fontSize: '0.9rem' }}>Đang khởi tạo hệ thống chat...</p>
      </div>
    );
  }

  // Chưa đăng nhập -> Hiện form AuthModal
  if (!user) {
    return <AuthModal />;
  }

  // Đã đăng nhập -> Hiển thị toàn bộ giao diện chat hiện đại
  return (
    <div style={{
      height: '100vh',
      width: '100vw',
      display: 'flex',
      overflow: 'hidden',
      background: 'var(--bg-primary)',
    }}>
      {/* Cột trái: Danh sách hội thoại và danh bạ */}
      <Sidebar onOpenNewChat={() => setIsNewChatOpen(true)} />

      {/* Cột phải: Khu vực trò chuyện chính */}
      <ChatArea onOpenNewChat={() => setIsNewChatOpen(true)} />

      {/* Modal tạo cuộc trò chuyện / nhóm chat mới */}
      <NewConversationModal
        isOpen={isNewChatOpen}
        onClose={() => setIsNewChatOpen(false)}
      />
    </div>
  );
}
