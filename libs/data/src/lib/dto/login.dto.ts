export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  password: string;
  role: 'Owner' | 'Admin' | 'Viewer';
}

export interface LoginResponseDto {
  access_token: string;
  user: UserDto;
  permissions: string[];
}

export interface UserDto {
  id: string;
  email: string;
  role: string;
  organizationId: string;
}
