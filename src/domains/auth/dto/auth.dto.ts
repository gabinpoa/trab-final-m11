export interface RegisterDto {
  email: string;
  password: string;
  name: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface AuthResponseDto {
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
  token: string;
}
