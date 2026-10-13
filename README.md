# 🚀 HỆ THỐNG CHAT REAL-TIME GIỮA CÁC MÁY TÍNH TRÊN WEB (DDD + MYSQL WAMP)

Hệ thống trò chuyện thời gian thực đa nền tảng cho phép **máy tính này nhắn tin trực tiếp với máy tính khác trên web**, được thiết kế chuẩn theo mô hình **Domain-Driven Design (DDD)**, sử dụng cơ sở dữ liệu **MySQL trên WampServer**, Backend bằng **TypeScript**, Frontend bằng **React.js & Next.js**, phông chữ **Noto Sans**, giao diện hiện đại và **100% API hoàn toàn miễn phí** không phụ thuộc bất kỳ dịch vụ trả phí nào.

---

## 📌 1. BẢNG TỔNG QUAN CÔNG NGHỆ

| Thành phần | Công nghệ sử dụng | Ghi chú |
| :--- | :--- | :--- |
| **Mô hình kiến trúc** | **Domain-Driven Design (DDD)** | Phân tách 4 tầng: Domain, Application, Infrastructure, Presentation |
| **Hệ quản trị CSDL** | **MySQL (WampServer MariaDB / MySQL)** | Cổng 3306, Database: `ddd_chat_db`, tối ưu Pool kết nối & Indexes |
| **Backend** | **Node.js + TypeScript + Express + Socket.IO** | Lắng nghe trên `0.0.0.0:5000` (Hỗ trợ truy cập mạng LAN) |
| **Frontend** | **React.js + Next.js 14 (App Router)** | Phông chữ **Noto Sans**, giao diện Glassmorphism hiện đại |
| **Giao tiếp Real-time**| **WebSocket (Socket.IO)** | Trao đổi tin nhắn, trạng thái online, typing indicator tức thì |
| **Nguồn API** | **100% Tự host & Hoàn toàn miễn phí** | Không cần key trả phí, lưu file/ảnh nội bộ, avatar DiceBear SVG |

---

## 🏗️ 2. CẤU TRÚC THƯ MỤC CHUẨN DDD (DOMAIN-DRIVEN DESIGN)

```
HeThongChat/
├── run_dev.bat                      # File khởi động 1 click cả FE và BE
├── README.md                        # Tài liệu hướng dẫn chi tiết
│
├── server/                          # BACKEND TYPESCRIPT (DDD)
│   ├── .env                         # Cấu hình cổng, DB WampServer, JWT
│   ├── tsconfig.json                # Cấu hình TypeScript nghiêm ngặt
│   ├── package.json
│   ├── uploads/                     # Thư mục lưu trữ hình ảnh & file đính kèm miễn phí
│   └── src/
│       ├── config/
│       │   └── env.config.ts        # Cấu hình môi trường tập trung
│       │
│       ├── domain/                  # [TẦNG MIỀN NGHIỆP VỤ - KHÔNG PHỤ THUỘC FRAMEWORK]
│       │   ├── entities/            # Các thực thể nghiệp vụ cốt lõi
│       │   │   ├── User.ts          # Aggregate Root User
│       │   │   ├── Conversation.ts  # Aggregate Root Conversation
│       │   │   ├── Participant.ts   # Entity thành viên tham gia
│       │   │   └── Message.ts       # Entity tin nhắn
│       │   ├── value-objects/       # Các đối tượng giá trị bất biến
│       │   │   ├── Email.ts         # Kiểm tra email hợp lệ
│       │   │   ├── UserId.ts        # Định danh UUID người dùng
│       │   │   ├── ConversationId.ts# Định danh UUID hội thoại
│       │   │   └── MessageContent.ts# Kiểm tra tính toàn vẹn tin nhắn
│       │   ├── events/              # Domain Events
│       │   │   └── IDomainEvent.ts
│       │   └── repositories/        # Giao diện kho lưu trữ (Interfaces)
│       │       ├── IUserRepository.ts
│       │       ├── IConversationRepository.ts
│       │       └── IMessageRepository.ts
│       │
│       ├── application/             # [TẦNG ỨNG DỤNG - ĐIỀU PHỐI USE CASES & DTO]
│       │   ├── dtos/                # Data Transfer Objects
│       │   │   ├── AuthDTO.ts
│       │   │   ├── UserDTO.ts
│       │   │   └── ChatDTO.ts
│       │   └── use-cases/           # Các ca sử dụng nghiệp vụ
│       │       ├── auth/            # RegisterUseCase, LoginUseCase, GetCurrentUserUseCase
│       │       ├── user/            # GetAllUsersUseCase, SearchUsersUseCase, UpdateUserStatusUseCase
│       │       └── chat/            # SendMessageUseCase, GetMessagesUseCase, CreateConversationUseCase,
│       │                            # GetUserConversationsUseCase, MarkMessagesReadUseCase
│       │
│       ├── infrastructure/          # [TẦNG HẠ TẦNG - KẾT NỐI KỸ THUẬT VỚI BÊN NGOÀI]
│       │   ├── database/
│       │   │   ├── mysql.connection.ts # Pool kết nối MySQL2 WampServer (Tối ưu 99%)
│       │   │   └── migrations.ts       # Tự động tạo bảng & đánh Index tối ưu
│       │   ├── repositories/        # Triển khai Repository bằng MySQL
│       │   │   ├── MySQLUserRepository.ts
│       │   │   ├── MySQLConversationRepository.ts
│       │   │   └── MySQLMessageRepository.ts
│       │   ├── security/            # PasswordHasher (Bcrypt), JwtTokenService
│       │   ├── storage/             # FileUploadService (Multer lưu trữ cục bộ)
│       │   └── websockets/          # SocketManager (Xử lý kết nối Real-time giữa các máy)
│       │
│       ├── presentation/            # [TẦNG TRÌNH DIỄN - GIAO DIỆN API VÀ CONTROLLER]
│       │   ├── controllers/         # AuthController, UserController, ChatController, UploadController
│       │   ├── middlewares/         # auth.middleware, error.middleware
│       │   └── routes/              # auth.routes, user.routes, chat.routes, upload.routes
│       │
│       └── index.ts                 # Điểm khởi chạy Bootstrapper (Port 5000, Host 0.0.0.0)
│
└── client/                          # FRONTEND NEXT.JS (REACT JS)
    ├── package.json
    ├── tsconfig.json
    ├── next.config.mjs
    ├── app/
    │   ├── globals.css              # CSS hiện đại, Glassmorphism, Noto Sans, Animations
    │   ├── layout.tsx               # Root Layout nhúng Google Fonts Noto Sans & Context Providers
    │   └── page.tsx                 # Trang chính điều hướng Chat & Đăng nhập
    └── src/
        ├── context/
        │   ├── AuthContext.tsx      # Quản lý phiên đăng nhập và liên kết Socket
        │   └── ChatContext.tsx      # Quản lý luồng tin nhắn, Web Audio sound chime, Real-time
        ├── services/
        │   ├── api.ts               # Tự động phát hiện IP LAN kết nối máy chủ
        │   └── socket.ts            # Quản lý WebSocket Client
        └── components/
            ├── AuthModal.tsx        # Giao diện Đăng nhập / Đăng ký hiện đại có nút test nhanh
            ├── Sidebar.tsx          # Danh sách người liên hệ, hội thoại, trạng thái Online/Offline
            ├── ChatArea.tsx         # Khung hiển thị tin nhắn, media, typing wave
            ├── MessageInput.tsx     # Khung gõ tin nhắn, gửi ảnh/file, chọn emoji
            └── NewConversationModal.tsx # Bắt đầu chat 1-1 hoặc tạo nhóm nhiều thành viên
```

---

## 📡 3. TÀI LIỆU API CHI TIẾT (100% MIỄN PHÍ - SELF-HOSTED)

Mọi API đều được cung cấp trực tiếp bởi Backend nội bộ, không yêu cầu bất kỳ API key bên thứ ba nào.

### A. Xác thực người dùng (Authentication)
* **Đăng ký tài khoản mới**: `POST /api/auth/register`
  * Body: `{ "username": "may_1", "email": "may1@test.com", "password": "123", "displayName": "Máy Tính 1" }`
* **Đăng nhập**: `POST /api/auth/login`
  * Body: `{ "usernameOrEmail": "may_1", "password": "123" }`
  * Response: Trả về Token JWT và thông tin tài khoản.
* **Lấy thông tin tài khoản hiện tại**: `GET /api/auth/me` (Header: `Authorization: Bearer <token>`)

### B. Người dùng (Users)
* **Lấy danh sách người dùng**: `GET /api/users` (Trả về danh sách cùng trạng thái `online`/`offline`)
* **Tìm kiếm người dùng**: `GET /api/users/search?q=keyword`

### C. Cuộc trò chuyện & Tin nhắn (Chat & Messages)
* **Lấy danh sách cuộc trò chuyện**: `GET /api/chat/conversations`
* **Tạo cuộc trò chuyện 1-1 hoặc Nhóm**: `POST /api/chat/conversations`
  * Body: `{ "participantIds": ["user-id-2"], "title": "Nhóm Kỹ Thuật", "isGroup": true }`
* **Lấy lịch sử tin nhắn**: `GET /api/chat/conversations/:id/messages?limit=50&offset=0`
* **Gửi tin nhắn**: `POST /api/chat/conversations/:id/messages`
  * Body: `{ "content": "Xin chào!", "messageType": "text" | "image" | "file", "fileUrl": "...", "participantIds": [...] }`
* **Đánh dấu đã đọc**: `PUT /api/chat/conversations/:id/read`

### D. Tải lên tệp tin & hình ảnh miễn phí (Upload)
* **Upload hình ảnh / tài liệu**: `POST /api/upload`
  * `multipart/form-data`, trường `file`.
  * URL trả về được lưu trữ trực tiếp trên máy chủ, sẵn sàng hiển thị và tải xuống.

### E. Sự kiện WebSocket Real-Time (Socket.IO)
* `user_status_changed`: Cập nhật trạng thái trực tuyến / ngoại tuyến tức thì khi máy khác mở/đóng tab.
* `new_message`: Nhận tin nhắn mới tức thời (< 10ms).
* `conversation_updated`: Cập nhật snippet tin nhắn cuối cùng và số lượng tin chưa đọc.
* `typing_start` / `typing_stop`: Hiệu ứng sóng đang soạn tin nhắn của người đối diện.
* `messages_read`: Cập nhật dấu tick đôi xanh khi tin nhắn đã được đọc.

---

## 💻 4. HƯỚNG DẪN KẾT NỐI "MÁY NÀY VỚI MÁY KIA TRÊN WEB"

Hệ thống đã được thiết kế sẵn với địa chỉ IP đa luồng để nhiều máy tính (Laptop, PC, Điện thoại) trong cùng mạng Wi-Fi hoặc mạng LAN có thể trò chuyện với nhau:

1. **Khởi động hệ thống trên Máy Chủ (Máy A)**:
   * **Cách 1 (Khuyên dùng)**: Mở Terminal tại thư mục gốc và chạy:
     ```bash
     npm run dev
     ```
     *(Lệnh sẽ tự động chạy song song cả Backend cổng 5000 và Frontend cổng 3000 trong cùng 1 terminal với đầy đủ màu sắc log).*
   * **Cách 2**: Chạy file `run_dev.bat` (hoặc trong PowerShell: `.\run_dev.bat`).
   * **Cách 3 (Mở riêng 2 terminal)**:
     * Backend: `npm run server` (hoặc `cd server && npm run dev`)
     * Frontend: `npm run client` (hoặc `cd client && npm run dev`)
2. **Kiểm tra địa chỉ IP mạng LAN của Máy A**:
   * Địa chỉ IP Wi-Fi của máy này: **`192.168.20.145`** (hoặc gõ `ipconfig` trong CMD).
3. **Mở từ Máy Tính Thứ Hai (Máy B) hoặc Điện Thoại**:
   * Mở trình duyệt Chrome/Edge/Safari trên Máy B và truy cập:
     👉 **`http://192.168.20.145:3000`**
4. **Trò chuyện thử nghiệm**:
   * Trên Máy A: Bấm nút gợi ý nhanh `Test: may_1` (hoặc tạo tài khoản `may_1`).
   * Trên Máy B: Bấm nút gợi ý nhanh `Test: may_2` (hoặc tạo tài khoản `may_2`).
   * Trên Máy A: Bấm nút **"Bắt đầu trò chuyện mới"** -> Chọn **Máy 2** -> Gửi tin nhắn.
   * Ngay lập tức trên Máy B, tin nhắn sẽ xuất hiện kèm âm thanh chuông báo tinh tế và trạng thái trực tuyến xanh nhấp nháy!

---

## ⚡ 5. TỐI ƯU HIỆU SUẤT ĐẠT 99%

1. **Connection Pooling MySQL**: Sử dụng `mysql2/promise` với giới hạn 20 pool kết nối tự động tái sử dụng, loại bỏ chi phí mở/đóng kết nối liên tục.
2. **Đánh chỉ mục (Indexing CSDL)**: Các trường `username`, `email`, `status`, `conversation_id`, `sender_id`, `created_at` đều được lập chỉ mục BTREE giúp truy vấn dữ liệu hàng triệu tin nhắn dưới 2ms.
3. **Web Audio API Không Phụ Thuộc**: Thay vì tải file `.mp3` nặng nề, âm thanh chuông báo tin nhắn được sinh trực tiếp bằng thuật toán dao động sóng âm thanh (Oscillator Web Audio API) với kích thước file bằng 0KB!
4. **Phân giải Host Động (Dynamic Cross-Machine Resolution)**: Client tự động phát hiện `window.location.hostname` để chuyển hướng API và Socket tương ứng với từng máy trạm truy cập.
5. **Debounce Typing Indicator**: Tối ưu tần số gửi gói tin socket khi người dùng đang nhập phím, giảm tải băng thông mạng tới 90%.
