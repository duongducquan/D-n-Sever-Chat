'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '../context/ChatContext';
import { apiRequest } from '../services/api';
import {
  Send,
  Smile,
  Paperclip,
  Image as ImageIcon,
  X,
  FileText,
  Loader2
} from 'lucide-react';

const POPULAR_EMOJIS = ['😊', '😂', '❤️', '🔥', '👍', '🎉', '👏', '😍', '🚀', '✨', '👋', '🙏', '💯', '😎', '💬', '💡'];

/**
 * KHUNG NHẬP TIN NHẮN (MESSAGE INPUT)
 * Tích hợp gửi văn bản, tải ảnh/file đính kèm miễn phí, chọn emoji và phát tín hiệu đang gõ phím.
 */
export const MessageInput: React.FC = () => {
  const { sendMessage, sendTyping } = useChat();
  const [content, setContent] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [attachment, setAttachment] = useState<{
    fileUrl: string;
    fileName: string;
    fileSize: number;
    mimetype: string;
  } | null>(null);
  const [uploading, setUploading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isComposingRef = useRef<boolean>(false);

  // Xử lý gửi tin nhắn
  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const text = content.trim();
    if (!text && !attachment) return;

    // Ngắt tín hiệu đang gõ
    sendTyping(false);

    let type: 'text' | 'image' | 'file' = 'text';
    if (attachment) {
      type = attachment.mimetype.startsWith('image/') ? 'image' : 'file';
    }

    try {
      await sendMessage(
        text || (type === 'image' ? '[Hình ảnh]' : '[Tập tin đính kèm]'),
        type,
        attachment || undefined
      );

      setContent('');
      setAttachment(null);
      setShowEmojiPicker(false);
    } catch (err: any) {
      alert(err.message || 'Lỗi gửi tin nhắn');
    }
  };

  // Phát hiện gõ phím và phát socket typing debounce
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);

    sendTyping(true);
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    typingTimeoutRef.current = setTimeout(() => {
      sendTyping(false);
    }, 1500);
  };

  // Nhấn Enter để gửi (Shift + Enter xuống dòng, tương thích bộ gõ tiếng Việt Unikey/EVKey)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      if (isComposingRef.current || e.nativeEvent.isComposing) {
        return;
      }
      e.preventDefault();
      handleSend();
    }
  };

  // Upload tệp tin / ảnh qua API cục bộ miễn phí
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await apiRequest<{
        fileUrl: string;
        fileName: string;
        fileSize: number;
        mimetype: string;
      }>('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (res.data) {
        setAttachment(res.data);
      }
    } catch (err: any) {
      alert('Lỗi tải tệp lên: ' + err.message);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const addEmoji = (emoji: string) => {
    setContent((prev) => prev + emoji);
  };

  return (
    <div style={{
      position: 'relative',
      padding: '0.85rem 1.25rem',
      background: 'rgba(17, 24, 39, 0.95)',
      borderTop: '1px solid var(--border-color)',
    }}>
      {/* Khung hiển thị xem trước tệp/ảnh đính kèm trước khi gửi */}
      {attachment && (
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.6rem',
          padding: '0.4rem 0.75rem',
          background: 'rgba(31, 41, 55, 0.8)',
          borderRadius: '10px',
          border: '1px solid var(--border-color)',
          marginBottom: '0.6rem',
        }}>
          {attachment.mimetype.startsWith('image/') ? (
            <img
              src={attachment.fileUrl}
              alt="attachment"
              style={{ width: '36px', height: '36px', borderRadius: '6px', objectFit: 'cover' }}
            />
          ) : (
            <FileText size={22} color="#60a5fa" />
          )}
          <div style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.8rem' }}>
            {attachment.fileName}
          </div>
          <button
            type="button"
            onClick={() => setAttachment(null)}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#ef4444',
              cursor: 'pointer',
              display: 'flex',
              padding: '2px',
            }}
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Popover Emoji Picker */}
      {showEmojiPicker && (
        <div style={{
          position: 'absolute',
          bottom: '80px',
          left: '20px',
          background: '#1f2937',
          border: '1px solid var(--border-color)',
          borderRadius: '16px',
          padding: '0.75rem',
          boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
          display: 'grid',
          gridTemplateColumns: 'repeat(8, 1fr)',
          gap: '6px',
          zIndex: 100,
        }}>
          {POPULAR_EMOJIS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => addEmoji(emoji)}
              style={{
                background: 'transparent',
                border: 'none',
                fontSize: '1.4rem',
                cursor: 'pointer',
                padding: '4px',
                borderRadius: '6px',
                transition: 'transform 0.1s',
              }}
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      {/* Input Form Bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
        {/* Nút Emoji */}
        <button
          type="button"
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          title="Thêm biểu tượng cảm xúc"
          style={{
            background: 'transparent',
            border: 'none',
            color: showEmojiPicker ? '#60a5fa' : '#9ca3af',
            cursor: 'pointer',
            padding: '8px',
            borderRadius: '50%',
            display: 'flex',
          }}
        >
          <Smile size={22} />
        </button>

        {/* Nút Đính kèm tệp tin / hình ảnh */}
        <input
          ref={fileInputRef}
          type="file"
          style={{ display: 'none' }}
          onChange={handleFileUpload}
        />
        <button
          type="button"
          disabled={uploading}
          onClick={() => fileInputRef.current?.click()}
          title="Đính kèm tệp hoặc ảnh"
          style={{
            background: 'transparent',
            border: 'none',
            color: uploading ? '#60a5fa' : '#9ca3af',
            cursor: 'pointer',
            padding: '8px',
            borderRadius: '50%',
            display: 'flex',
          }}
        >
          {uploading ? <Loader2 size={22} className="animate-spin" /> : <Paperclip size={22} />}
        </button>

        {/* Khung soạn thảo văn bản */}
        <textarea
          rows={1}
          value={content}
          onChange={handleContentChange}
          onKeyDown={handleKeyDown}
          onCompositionStart={() => { isComposingRef.current = true; }}
          onCompositionEnd={() => { isComposingRef.current = false; }}
          placeholder="Nhập tin nhắn... (Nhấn Enter để gửi, Shift+Enter xuống dòng)"
          className="input-field"
          style={{
            flex: 1,
            padding: '0.75rem 1rem',
            borderRadius: '14px',
            fontSize: '0.9rem',
            resize: 'none',
            maxHeight: '120px',
            lineHeight: '1.4',
          }}
        />

        {/* Nút gửi tin nhắn */}
        <button
          type="button"
          onClick={() => handleSend()}
          disabled={!content.trim() && !attachment}
          className="btn-primary"
          title="Gửi tin nhắn"
          style={{
            width: '42px',
            height: '42px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            opacity: (!content.trim() && !attachment) ? 0.5 : 1,
            cursor: (!content.trim() && !attachment) ? 'not-allowed' : 'pointer',
          }}
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
};
