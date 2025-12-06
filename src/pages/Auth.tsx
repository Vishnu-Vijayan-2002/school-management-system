import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { GraduationCap, Mail, Lock, User, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/services/api';
const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});
const registerSchema = loginSchema.extend({
  name: z.string().min(2, 'Name must be at least 2 characters')
});
type LoginFormData = z.infer<typeof loginSchema>;
type RegisterFormData = z.infer<typeof registerSchema>;
export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const {
    toast
  } = useToast();
  const {
    login,
    isAuthenticated
  } = useAuth();
  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema)
  });
  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema)
  });
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);
  const handleLogin = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      const response = await api.login(data.email, data.password);
      if (response.token && response.user) {
        login({
          id: response.user.id,
          email: response.user.email,
          name: response.user.name,
          token: response.token
        });
        toast({
          title: 'Welcome back!',
          description: 'You have successfully logged in.'
        });
        navigate('/dashboard');
      }
    } catch (error) {
      toast({
        title: 'Login failed',
        description: error instanceof Error ? error.message : 'Invalid credentials',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };
  const handleRegister = async (data: RegisterFormData) => {
    setIsLoading(true);
    try {
      const response = await api.register(data.email, data.password, data.name);
      toast({
        title: 'Account created!',
        description: 'Please log in with your credentials.'
      });
      setIsLogin(true);
      registerForm.reset();
    } catch (error) {
      toast({
        title: 'Registration failed',
        description: error instanceof Error ? error.message : 'Could not create account',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };
  return <div className="min-h-screen flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-sidebar p-12 flex-col justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sidebar-primary">
            <GraduationCap className="h-6 w-6 text-sidebar-primary-foreground" />
          </div>
          <span className="font-display text-2xl font-bold text-destructive-foreground">EduManage</span>
        </div>
        
        <div className="space-y-6">
          <h1 className="font-display text-4xl font-bold leading-tight text-destructive-foreground">
            Streamline Your<br />School Management
          </h1>
          <p className="text-lg text-sidebar-muted max-w-md">
            Manage departments, students, and teachers all in one place. Built for modern educational institutions.
          </p>
          <div className="flex gap-8 pt-4">
            <div>
              <p className="text-3xl font-bold text-sidebar-primary">500+</p>
              <p className="text-sm text-sidebar-muted">Schools</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-sidebar-primary">50K+</p>
              <p className="text-sm text-sidebar-muted">Students</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-sidebar-primary">5K+</p>
              <p className="text-sm text-sidebar-muted">Teachers</p>
            </div>
          </div>
        </div>

        <p className="text-sm text-sidebar-muted">
          © 2024 EduManage. All rights reserved.
        </p>
      </div>

      {/* Right Panel - Auth Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md space-y-8 animate-slide-up">
          <div className="text-center lg:text-left">
            <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                <GraduationCap className="h-6 w-6 text-primary-foreground" />
              </div>
              <span className="font-display text-2xl font-bold">EduManage</span>
            </div>
            <h2 className="font-display text-2xl font-bold text-foreground">
              {isLogin ? 'Welcome back' : 'Create an account'}
            </h2>
            <p className="mt-2 text-muted-foreground">
              {isLogin ? 'Enter your credentials to access your account' : 'Fill in your details to get started'}
            </p>
          </div>

          {isLogin ? <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input id="email" type="email" placeholder="you@example.com" className="pl-10" {...loginForm.register('email')} />
                </div>
                {loginForm.formState.errors.email && <p className="text-sm text-destructive">{loginForm.formState.errors.email.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input id="password" type="password" placeholder="••••••••" className="pl-10" {...loginForm.register('password')} />
                </div>
                {loginForm.formState.errors.password && <p className="text-sm text-destructive">{loginForm.formState.errors.password.message}</p>}
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Signing in...' : 'Sign in'}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </form> : <form onSubmit={registerForm.handleSubmit(handleRegister)} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input id="name" type="text" placeholder="John Doe" className="pl-10" {...registerForm.register('name')} />
                </div>
                {registerForm.formState.errors.name && <p className="text-sm text-destructive">{registerForm.formState.errors.name.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="reg-email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input id="reg-email" type="email" placeholder="you@example.com" className="pl-10" {...registerForm.register('email')} />
                </div>
                {registerForm.formState.errors.email && <p className="text-sm text-destructive">{registerForm.formState.errors.email.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="reg-password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input id="reg-password" type="password" placeholder="••••••••" className="pl-10" {...registerForm.register('password')} />
                </div>
                {registerForm.formState.errors.password && <p className="text-sm text-destructive">{registerForm.formState.errors.password.message}</p>}
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Creating account...' : 'Create account'}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </form>}

          <div className="text-center">
            <button type="button" onClick={() => setIsLogin(!isLogin)} className="text-sm text-muted-foreground hover:text-primary transition-colors">
              {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
            </button>
          </div>
        </div>
      </div>
    </div>;
}