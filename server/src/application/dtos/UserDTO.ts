export interface UserResponseDTO {
  id: string;
  username: string;
  email: string;
  displayName: string;
  avatar: string;
  status: 'online' | 'offline';
  lastSeen: string;
  createdAt: string;
}

export interface UpdateProfileDTO {
  displayName?: string;
  avatar?: string;
}
