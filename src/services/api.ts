import type {
  AuthResponse,
  Department,
  Student,
  Teacher,
  CreateDepartmentInput,
  UpdateDepartmentInput,
  CreateStudentInput,
  UpdateStudentInput,
  CreateTeacherInput,
  UpdateTeacherInput,
} from '@/types';

const API_BASE_URL = 'https://test-backend-tp0o.onrender.com/api';

// In-memory storage for authentication (replaces localStorage)
let authToken: string | null = null;
let userData: any = null;

class ApiService {
  // Store authentication data in memory
  setAuthData(token: string, user: any) {
    authToken = token;
    userData = user;
  }

  // Clear authentication data
  clearAuthData() {
    authToken = null;
    userData = null;
  }

  // Get stored user data
  getUserData() {
    return userData;
  }

  private getToken(): string | null {
    return authToken;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = this.getToken();
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }

    const url = `${API_BASE_URL}${endpoint}`;
    console.log(`Making ${options.method || 'GET'} request to:`, url);

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'An error occurred' }));
      console.error('API Error:', error);
      throw new Error(error.message || 'An error occurred');
    }

    // Handle empty responses (like DELETE operations)
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return response.json();
    }
    
    return {} as T;
  }

  // Auth
  async register(email: string, password: string, name?: string): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });
    
    // Store auth data in memory after successful registration
    if (response.token) {
      this.setAuthData(response.token, response.user);
    }
    
    return response;
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    // Store auth data in memory after successful login
    if (response.token) {
      this.setAuthData(response.token, response.user);
    }
    
    return response;
  }

  // Logout
  logout() {
    this.clearAuthData();
  }

  // Departments
  async getDepartments(): Promise<Department[]> {
    return this.request<Department[]>('/departments');
  }

  async getDepartmentById(id: string): Promise<Department> {
    return this.request<Department>(`/departments/${id}`);
  }

  async createDepartment(data: CreateDepartmentInput): Promise<Department> {
    return this.request<Department>('/departments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateDepartment(id: string, data: UpdateDepartmentInput): Promise<Department> {
    return this.request<Department>(`/departments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteDepartment(id: string): Promise<void> {
    return this.request<void>(`/departments/${id}`, {
      method: 'DELETE',
    });
  }

  // Students
  async getStudents(departmentId?: string): Promise<Student[]> {
    const query = departmentId ? `?departmentId=${departmentId}` : '';
    return this.request<Student[]>(`/students${query}`);
  }

  async getStudentById(id: string): Promise<Student> {
    return this.request<Student>(`/students/${id}`);
  }

  async createStudent(data: CreateStudentInput): Promise<Student> {
    return this.request<Student>('/students', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateStudent(id: string, data: UpdateStudentInput): Promise<Student> {
    return this.request<Student>(`/students/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteStudent(id: string): Promise<void> {
    return this.request<void>(`/students/${id}`, {
      method: 'DELETE',
    });
  }

  // Teachers
  async getTeachers(departmentId?: string): Promise<Teacher[]> {
    const query = departmentId ? `?departmentId=${departmentId}` : '';
    return this.request<Teacher[]>(`/teachers${query}`);
  }

  async getTeacherById(id: string): Promise<Teacher> {
    return this.request<Teacher>(`/teachers/${id}`);
  }

  async createTeacher(data: CreateTeacherInput): Promise<Teacher> {
    return this.request<Teacher>('/teachers', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateTeacher(id: string, data: UpdateTeacherInput): Promise<Teacher> {
    return this.request<Teacher>(`/teachers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteTeacher(id: string): Promise<void> {
    return this.request<void>(`/teachers/${id}`, {
      method: 'DELETE',
    });
  }
}

export const api = new ApiService();