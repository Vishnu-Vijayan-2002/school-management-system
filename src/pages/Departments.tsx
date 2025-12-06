import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { DataTable } from '@/components/shared/DataTable';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/services/api';
import type { Department, CreateDepartmentInput } from '@/types';

export default function Departments() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [formData, setFormData] = useState<CreateDepartmentInput>({ name: '', description: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const fetchDepartments = async () => {
    try {
      const data = await api.getDepartments();
      setDepartments(data);
    } catch (error) {
      toast({ 
        title: 'Error', 
        description: error instanceof Error ? error.message : 'Failed to fetch departments', 
        variant: 'destructive' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { 
    fetchDepartments(); 
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreate = () => {
    setSelectedDepartment(null);
    setFormData({ name: '', description: '' });
    setIsFormOpen(true);
  };

  const handleEdit = (department: Department) => {
    setSelectedDepartment(department);
    setFormData({ name: department.name, description: department.description || '' });
    setIsFormOpen(true);
  };

  const handleDeleteClick = (department: Department) => {
    setSelectedDepartment(department);
    setIsDeleteOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (selectedDepartment) {
        await api.updateDepartment(selectedDepartment.id, formData);
        toast({ title: 'Success', description: 'Department updated successfully' });
      } else {
        await api.createDepartment(formData);
        toast({ title: 'Success', description: 'Department created successfully' });
      }
      setIsFormOpen(false);
      fetchDepartments();
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
    if (!selectedDepartment) return;
    setIsSubmitting(true);
    try {
      await api.deleteDepartment(selectedDepartment.id);
      toast({ title: 'Success', description: 'Department deleted successfully' });
      setIsDeleteOpen(false);
      setSelectedDepartment(null);
      fetchDepartments();
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

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    } catch {
      return '-';
    }
  };

  const columns = [
    { key: 'name', header: 'Name' },
    {
      key: 'description',
      header: 'Description',
      render: (d: Department) => d.description || '-'
    },
    {
      key: 'createdAt',
      header: 'Created',
      render: (d: Department) => formatDate(d.createdAt)
    },
  ];

  return (
    <DashboardLayout
      title="Departments"
      description="Manage academic departments"
      actions={
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" /> Add Department
        </Button>
      }
    >
      <DataTable
        data={departments}
        columns={columns}
        onEdit={handleEdit}
        onDelete={handleDeleteClick}
        isLoading={isLoading}
        emptyMessage="No departments found. Create your first department."
      />

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedDepartment ? 'Edit' : 'Create'} Department</DialogTitle>
            <DialogDescription>Manage department information</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Department Name</Label>
              <Input 
                id="name" 
                value={formData.name} 
                required
                onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea 
                id="description" 
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })} 
              />
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

      <ConfirmDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        title="Delete Department"
        description={`Delete "${selectedDepartment?.name}"? This action cannot be undone.`}
        onConfirm={handleDelete}
        isLoading={isSubmitting}
        confirmText="Delete"
      />
    </DashboardLayout>
  );
}