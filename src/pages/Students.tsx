import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { DataTable } from '@/components/shared/DataTable';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Filter } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/services/api';
import type { Student, Department, CreateStudentInput } from '@/types';

export default function Students() {
  const [students, setStudents] = useState<Student[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [filterDepartment, setFilterDepartment] = useState<string>('all');
  const [formData, setFormData] = useState<CreateStudentInput>({
    name: '',
    email: '',
    phone: '',
    departmentId: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const fetchData = async () => {
    try {
      const deptFilter = filterDepartment === 'all' ? undefined : filterDepartment;

      const [studentsData, departmentsData] = await Promise.all([
        api.getStudents(deptFilter),
        api.getDepartments(),
      ]);

      setStudents(studentsData);
      setDepartments(departmentsData);
    } catch (error) {
      toast({ 
        title: 'Error', 
        description: error instanceof Error ? error.message : 'Failed to fetch data', 
        variant: 'destructive' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterDepartment]);

  const handleCreate = () => {
    setSelectedStudent(null);
    setFormData({ name: '', email: '', phone: '', departmentId: '' });
    setIsFormOpen(true);
  };

  const handleEdit = (student: Student) => {
    setSelectedStudent(student);
    setFormData({
      name: student.name,
      email: student.email,
      phone: student.phone || '',
      departmentId: student.departmentId,
    });
    setIsFormOpen(true);
  };

  const handleDeleteClick = (student: Student) => {
    setSelectedStudent(student);
    setIsDeleteOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (selectedStudent) {
        await api.updateStudent(selectedStudent.id, formData);
        toast({ title: 'Success', description: 'Student updated successfully' });
      } else {
        await api.createStudent(formData);
        toast({ title: 'Success', description: 'Student created successfully' });
      }
      setIsFormOpen(false);
      fetchData();
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Operation failed',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedStudent) return;
    setIsSubmitting(true);

    try {
      await api.deleteStudent(selectedStudent.id);
      toast({ title: 'Success', description: 'Student deleted successfully' });
      setIsDeleteOpen(false);
      setSelectedStudent(null);
      fetchData();
    } catch (error) {
      toast({ 
        title: 'Error', 
        description: error instanceof Error ? error.message : 'Delete failed', 
        variant: 'destructive' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns = [
    { key: 'name', header: 'Name' },
    { key: 'email', header: 'Email' },
    // { 
    //   key: 'phone', 
    //   header: 'Phone', 
    //   render: (s: Student) => s.phone || '-' 
    // },
    {
      key: 'department',
      header: 'Department',
      render: (s: Student) =>
        departments.find(d => d.id === s.departmentId)?.name || '-'
    },
  ];

  return (
    <DashboardLayout
      title="Students"
      description="Manage student records"
      actions={
        <div className="flex items-center gap-2">
          <Select
            value={filterDepartment}
            onValueChange={setFilterDepartment}
          >
            <SelectTrigger className="w-48 bg-card">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="All Departments" />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border">
              <SelectItem value="all">All Departments</SelectItem>
              {departments.map((dept) => (
                <SelectItem key={dept.id} value={dept.id}>
                  {dept.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Add Student
          </Button>
        </div>
      }
    >
      <DataTable
        data={students}
        columns={columns}
        onEdit={handleEdit}
        onDelete={handleDeleteClick}
        isLoading={isLoading}
        emptyMessage="No students found. Add your first student."
      />

      {/* CREATE / EDIT FORM */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedStudent ? 'Edit Student' : 'Add Student'}</DialogTitle>
            <DialogDescription>
              {selectedStudent ? 'Update student information' : 'Register a new student'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="Optional"
              />
            </div>

            <div>
              <Label htmlFor="department">Department</Label>
              <Select
                value={formData.departmentId}
                onValueChange={(value) => setFormData({ ...formData, departmentId: value })}
              >
                <SelectTrigger id="department">
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Save'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* DELETE CONFIRM */}
      <ConfirmDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        title="Delete Student"
        description={`Are you sure you want to delete "${selectedStudent?.name}"? This action cannot be undone.`}
        onConfirm={handleDelete}
        isLoading={isSubmitting}
        confirmText="Delete"
      />
    </DashboardLayout>
  );
}