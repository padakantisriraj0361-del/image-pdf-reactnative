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
  private baseURL = 'https://react-file-upload-4nlo.onrender.com/api'; // Replace with your actual API URL

  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await this.makeRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    // You can adjust this to match your actual API response structure
    return response;
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
async uploadPDFFile(file: File): Promise<{ success: boolean; url?: string }> {
  const { token } = useAuthStore.getState();

  if (!token) {
    throw new Error('No authentication token available');
  }

  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${this.baseURL}/files/upload`, {
    method: 'POST',
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
      // Do not set Content-Type, browser will handle it
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }

  return response.json();
}
  async uploadPDF(pdfUri: string): Promise<{ success: boolean; url?: string }> {
    const { token } = useAuthStore.getState();
    
    if (!token) {
      throw new Error('No authentication token available');
    }
    const response = await this.makeRequest('/files/upload', {
      method: 'POST',
      body: JSON.stringify({ pdfUri }),
    });

    // You can adjust this to match your actual API response structure
    return response;

    // // Simulate file upload
    // await this.delay(2000);
    
    // // Mock successful upload
    // return {
    //   success: true,
    //   url: `https://api.example.com/files/document_${Date.now()}.pdf`,
    // };
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