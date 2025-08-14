import { useAuthStore } from '@/stores/authStore';

interface LoginResponse {
  user: {
    id: string;
    email: string;
  };
  token: string;
}

interface RegisterResponse {
  user: {
    id: string;
    email: string;
  };
  token: string;
}

class APIService {
  private baseURL = 'https://api.example.com'; // Replace with your actual API URL

  async login(email: string, password: string): Promise<LoginResponse> {
    // Simulate API call
    await this.delay(1000);
    
    // Mock successful login
    return {
      user: {
        id: '1',
        email: email,
      },
      token: 'mock_token_' + Date.now(),
    };
  }

  async register(email: string, password: string): Promise<RegisterResponse> {
    // Simulate API call
    await this.delay(1000);
    
    // Mock successful registration
    return {
      user: {
        id: '1',
        email: email,
      },
      token: 'mock_token_' + Date.now(),
    };
  }

  async uploadPDF(pdfUri: string): Promise<{ success: boolean; url?: string }> {
    const { token } = useAuthStore.getState();
    
    if (!token) {
      throw new Error('No authentication token available');
    }

    // Simulate file upload
    await this.delay(2000);
    
    // Mock successful upload
    return {
      success: true,
      url: `https://api.example.com/files/document_${Date.now()}.pdf`,
    };
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
    const { token } = useAuthStore.getState();
    
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    return response.json();
  }
}

export const apiService = new APIService();