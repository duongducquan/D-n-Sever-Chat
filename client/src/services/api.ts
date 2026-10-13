/**
 * DỊCH VỤ GỌI API (API CLIENT SERVICE)
 * Tự động phát hiện địa chỉ IP máy chủ (Tự động thích ứng khi máy này truy cập máy kia qua mạng LAN).
 * Nguồn API hoàn toàn MIỄN PHÍ, chạy trực tiếp từ backend DDD MySQL WampServer.
 */

export function getBaseApiUrl(): string {
  const configuredApiUrl = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (configuredApiUrl) {
    return configuredApiUrl.replace(/\/+$/, '');
  }

  if (typeof window !== 'undefined') {
    // Lấy hostname của máy đang mở trình duyệt (VD: 192.168.20.145 hoặc localhost)
    const hostname = window.location.hostname;
    return `http://${hostname}:5000`;
  }
  return 'http://localhost:5000';
}

let activeAuthToken: string | null = null;

export function setActiveAuthToken(token: string | null): void {
  activeAuthToken = token;
}

export function getStoredToken(): string | null {
  if (activeAuthToken) return activeAuthToken;
  if (typeof window === 'undefined') return null;
  return sessionStorage.getItem('token') || localStorage.getItem('token');
}

export function saveStoredToken(token: string, persistToLocal = false): void {
  activeAuthToken = token;
  if (typeof window === 'undefined') return;
  sessionStorage.setItem('token', token);
  if (persistToLocal) {
    localStorage.setItem('token', token);
  }
}

export function removeStoredToken(): void {
  activeAuthToken = null;
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem('token');
  localStorage.removeItem('token');
}

/**
 * Hàm gửi request HTTP fetch có tích hợp tự động gắn Token JWT và xử lý lỗi
 */
export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ success: boolean; data?: T; message?: string }> {
  const baseUrl = getBaseApiUrl();
  const url = `${baseUrl}${endpoint}`;

  const token = getStoredToken();

  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const res = await fetch(url, {
      ...options,
      headers,
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || `Lỗi HTTP ${res.status}`);
    }

    return data;
  } catch (error: any) {
    console.error(`[API Error] ${endpoint}:`, error.message);
    throw error;
  }
}
