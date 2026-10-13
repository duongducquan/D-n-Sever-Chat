export interface RegisterDTO {
  username: string;
  email: string;
  password: string;
  displayName?: string;
  avatar?: string;
}

export interface LoginDTO {
  usernameOrEmail: string;
  password: string;
}

export interface AuthResponseDTO {
  user: {
    id: string;
    username: string;
    email: string;
    displayName: string;
    avatar: string;
    status: 'online' | 'offline';
    lastSeen: string;
  };
  token: string;
}
