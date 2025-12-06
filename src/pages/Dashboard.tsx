import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatsCard } from '@/components/shared/StatsCard';
import { Building2, GraduationCap, Users, TrendingUp } from 'lucide-react';
import { api } from '@/services/api';
import type { Department, Student, Teacher } from '@/types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const chartData = [
  { name: 'Jan', students: 120, teachers: 45 },
  { name: 'Feb', students: 145, teachers: 48 },
  { name: 'Mar', students: 162, teachers: 52 },
  { name: 'Apr', students: 178, teachers: 55 },
  { name: 'May', students: 195, teachers: 58 },
  { name: 'Jun', students: 210, teachers: 62 },
];

export default function Dashboard() {
  const [stats, setStats] = useState({
    departments: 0,
    students: 0,
    teachers: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [departments, students, teachers] = await Promise.all([
          api.getDepartments(),
          api.getStudents(),
          api.getTeachers(),
        ]);
        setStats({
          departments: departments.length,
          students: students.length,
          teachers: teachers.length,
        });
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <DashboardLayout title="Dashboard" description="Welcome to your school management overview">
      <div className="space-y-6">
        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Total Departments"
            value={isLoading ? '...' : stats.departments}
            icon={Building2}
            trend={{ value: 12, isPositive: true }}
          />
          <StatsCard
            title="Total Students"
            value={isLoading ? '...' : stats.students}
            icon={GraduationCap}
            trend={{ value: 8, isPositive: true }}
          />
          <StatsCard
            title="Total Teachers"
            value={isLoading ? '...' : stats.teachers}
            icon={Users}
            trend={{ value: 5, isPositive: true }}
          />
          <StatsCard
            title="Growth Rate"
            value="15.3%"
            icon={TrendingUp}
            trend={{ value: 3, isPositive: true }}
          />
        </div>

        {/* Chart */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="mb-6">
            <h3 className="font-display text-lg font-semibold text-foreground">Growth Overview</h3>
            <p className="text-sm text-muted-foreground">Student and teacher enrollment trends</p>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorStudents" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorTeachers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="students"
                  stroke="hsl(var(--primary))"
                  fillOpacity={1}
                  fill="url(#colorStudents)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="teachers"
                  stroke="hsl(var(--chart-2))"
                  fillOpacity={1}
                  fill="url(#colorTeachers)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm hover:shadow-md transition-shadow">
            <Building2 className="h-8 w-8 text-primary mb-3" />
            <h4 className="font-semibold text-foreground">Manage Departments</h4>
            <p className="text-sm text-muted-foreground mt-1">Create and organize academic departments</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm hover:shadow-md transition-shadow">
            <GraduationCap className="h-8 w-8 text-primary mb-3" />
            <h4 className="font-semibold text-foreground">Student Records</h4>
            <p className="text-sm text-muted-foreground mt-1">Track and manage student information</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm hover:shadow-md transition-shadow">
            <Users className="h-8 w-8 text-primary mb-3" />
            <h4 className="font-semibold text-foreground">Faculty Management</h4>
            <p className="text-sm text-muted-foreground mt-1">Organize teacher assignments and details</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
