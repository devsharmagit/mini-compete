const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface ApiResponse<T = any> {
  data?: T;
  message?: string;
  error?: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'PARTICIPANT' | 'ORGANIZER';
}

export interface Competition {
  id: number;
  title: string;
  description: string;
  tags: string[];
  capacity: number;
  regDeadline: string;
  startDate?: string;
  organizerId: number;
  createdAt: string;
  updatedAt: string;
  organizer?: {
    name: string;
    email: string;
  };
  _count?: {
    registrations: number;
  };
}

export interface Registration {
  id: number;
  competitionId: number;
  userId: number;
  createdAt: string;
  competition?: Competition;
}

export interface MailBox {
  id: number;
  userId: number;
  to: string;
  subject: string;
  body: string;
  sentAt: string;
}

class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('token');
    }
  }

  setToken(token: string) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token);
    }
  }

  clearToken() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Request failed');
      }

      return { data };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  // Auth endpoints
  async signup(data: {
    name: string;
    email: string;
    password: string;
    role: 'PARTICIPANT' | 'ORGANIZER';
  }) {
    return this.request<{ token: string; user: User }>('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async login(data: { email: string; password: string }) {
    return this.request<{ token: string; user: User }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getMe() {
    return this.request<{ user: User }>('/api/auth/me');
  }

  // Competition endpoints
  async getCompetitions(params?: {
    page?: number;
    limit?: number;
    tags?: string[];
  }) {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.tags?.length) searchParams.set('tags', params.tags.join(','));

    const query = searchParams.toString();
    return this.request<{
      data: Competition[];
      total: number;
      page: number;
      limit: number;
    }>(`/api/competitions${query ? `?${query}` : ''}`);
  }

  async getCompetition(id: number) {
    return this.request<Competition>(`/api/competitions/${id}`);
  }

  async createCompetition(data: {
    title: string;
    description: string;
    tags?: string[];
    capacity: number;
    regDeadline: string;
  }) {
    return this.request<Competition>('/api/competitions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async registerForCompetition(
    competitionId: number,
    idempotencyKey?: string
  ) {
    const headers: HeadersInit = {};
    if (idempotencyKey) {
      headers['Idempotency-Key'] = idempotencyKey;
    }

    return this.request<Registration>(
      `/api/competitions/${competitionId}/register`,
      {
        method: 'POST',
        headers,
      }
    );
  }

  async getCompetitionRegistrations(competitionId: number) {
    return this.request<Registration[]>(
      `/api/competitions/${competitionId}/registrations`
    );
  }

  // User endpoints
  async getUserRegistrations() {
    return this.request<{
      userId: number;
      totalRegistrations: number;
      registrations: Registration[];
    }>('/api/users/me/registrations');
  }

  async getMailbox() {
    return this.request<{
      userId: number;
      totalEmails: number;
      emails: MailBox[];
    }>('/api/users/me/mailbox');
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
