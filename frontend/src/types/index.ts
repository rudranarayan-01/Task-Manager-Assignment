export interface Task {
    id: string;
    title: string;
    description?: string;
    status: 'TODO' | 'IN_PROGRESS' | 'DONE';
    createdAt: string;
}

export interface AuthResponse {
    accessToken: string;
    refreshToken: string;
}