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
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Filter, Pencil, Trash } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/services/api';
import type { Teacher, Department, CreateTeacherInput } from '@/types';

export default function Teachers() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [filterDepartment, setFilterDepartment] = useState<string>('all');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<CreateTeacherInput>({
    name: '',
    email: '',
    phone: '',
    departmentId: '',
    subject: '',
  });

  const { toast } = useToast();

  const fetchData = async () => {
    try {
      const deptQuery = filterDepartment === 'all' ? undefined : filterDepartment;

      const [teachersData, departmentsData] = await Promise.all([
        api.getTeachers(deptQuery),
        api.getDepartments()
      ]);

      setTeachers(teachersData);
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
    setSelectedTeacher(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      departmentId: '',
      subject: '',
    });
    setIsFormOpen(true);
  };

  const handleEdit = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setFormData({
      name: teacher.name,
      email: teacher.email,
      phone: teacher.phone || '',
      departmentId: teacher.departmentId,
      subject: teacher.subject || '',
    });
    setIsFormOpen(true);
  };

  const handleDeleteClick = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setIsDeleteOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (selectedTeacher) {
        await api.updateTeacher(selectedTeacher.id, formData);
        toast({ title: 'Success', description: 'Teacher updated successfully' });
      } else {
        await api.createTeacher(formData);
        toast({ title: 'Success', description: 'Teacher added successfully' });
      }
      setIsFormOpen(false);
      fetchData();
    } catch (error) {
      toast({ 
        title: 'Error', 
        description: error instanceof Error ? error.message : 'Operation failed', 
        variant: 'destructive' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedTeacher) return;
    setIsSubmitting(true);

    try {
      console.log('Deleting teacher with ID:', selectedTeacher.id);
      await api.deleteTeacher(selectedTeacher.id);
      toast({ title: 'Success', description: 'Teacher removed successfully' });
      setIsDeleteOpen(false);
      setSelectedTeacher(null);
      fetchData();
    } catch (error) {
      console.error('Delete error:', error);
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
    {
      key: 'subject',
      header: 'Subject',
      render: (t: Teacher) => t.subject || '-',
    },
    {
      key: 'department',
      header: 'Department',
      render: (t: Teacher) =>
        departments.find((d) => d.id === t.departmentId)?.name || '-',
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (row: Teacher) => (
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => handleEdit(row)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="destructive" size="sm" onClick={() => handleDeleteClick(row)}>
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <DashboardLayout
      title="Teachers"
      description="Manage faculty members"
      actions={
        <div className="flex items-center gap-2">
          <Select value={filterDepartment} onValueChange={setFilterDepartment}>
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
            Add Teacher
          </Button>
        </div>
      }
    >
      <DataTable
        data={teachers}
        columns={columns}
        isLoading={isLoading}
        emptyMessage="No teachers found. Add your first teacher."
      />

      {/* Add/Edit Form */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedTeacher ? 'Edit Teacher' : 'Add Teacher'}</DialogTitle>
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
              />
            </div>

            <div>
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
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
              <Button variant="outline" type="button" onClick={() => setIsFormOpen(false)}>
                Cancel
              </Button>
              <Button disabled={isSubmitting} type="submit">
                {isSubmitting ? 'Saving...' : 'Save'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        title="Delete Teacher"
        description={`Are you sure you want to delete "${selectedTeacher?.name}"?`}
        onConfirm={handleDelete}
        isLoading={isSubmitting}
      />
    </DashboardLayout>
  );
}