export interface User {
  id: string;
  email: string;
  name?: string;
  token: string;
}

export interface AuthResponse {
  message: string;
  user?: {
    id: string;
    email: string;
    name?: string;
  };
  token?: string;
}

export interface Department {
  _id: string;
  name: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Student {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  department: Department | string;
  enrollmentDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Teacher {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  department: Department | string;
  subject?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ApiError {
  message: string;
  error?: string;
}

export type CreateDepartmentInput = Omit<Department, '_id' | 'createdAt' | 'updatedAt'>;
export type UpdateDepartmentInput = Partial<CreateDepartmentInput>;

export type CreateStudentInput = {
  name: string;
  email: string;
  phone?: string;
  departmentId: string;
  enrollmentDate?: string;
};
export type UpdateStudentInput = Partial<CreateStudentInput>;

export type CreateTeacherInput = {
  name: string;
  email: string;
  phone?: string;
  departmentId: string;
  subject?: string;
};
export type UpdateTeacherInput = Partial<CreateTeacherInput>;
