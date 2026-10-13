import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '../src/context/AuthContext';
import { ChatProvider } from '../src/context/ChatContext';

export const metadata: Metadata = {
  title: 'Hệ Thống Chat Web Đa Nền Tảng (DDD + MySQL WampServer)',
  description: 'Hệ thống trò chuyện thời gian thực giữa máy tính với nhau qua web xây dựng theo mô hình Domain-Driven Design (DDD), TypeScript và MySQL.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Noto+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400;1,500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <AuthProvider>
          <ChatProvider>
            {children}
          </ChatProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
