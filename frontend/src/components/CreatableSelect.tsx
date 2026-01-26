import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Loader2, Check } from 'lucide-react';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

interface CreatableSelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  endpoint: string; // e.g., 'categories', 'flavors'
  placeholder?: string;
}

export const CreatableSelect = ({ label, value, onChange, endpoint, placeholder }: CreatableSelectProps) => {
  const [open, setOpen] = useState(false); // Dialog state
  const [newItem, setNewItem] = useState('');
  const queryClient = useQueryClient();

  // 1. Fetch Options
  const { data: options, isLoading } = useQuery({
    queryKey: [endpoint],
    queryFn: async () => {
      const { data } = await api.get<{ _id: string; name: string }[]>(`/attributes/${endpoint}`);
      return data;
    },
  });

  // 2. Create Option Mutation
  const createMutation = useMutation({
    mutationFn: async (name: string) => {
      const { data } = await api.post(`/attributes/${endpoint}`, { name });
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [endpoint] }); // Refresh list
      onChange(data.name); // Auto-select the new item
      setNewItem('');
      setOpen(false); // Close dialog
      toast.success(`${label} added!`);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to add item');
    },
  });

  const handleCreate = () => {
    if (!newItem.trim()) return;
    createMutation.mutate(newItem);
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          {label}
        </label>
        {/* Quick link to open "Add New" dialog */}
        <button 
            type="button"
            onClick={() => setOpen(true)}
            className="text-xs text-primary hover:underline flex items-center gap-1"
        >
            <Plus className="h-3 w-3" /> Add New
        </button>
      </div>

      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder={isLoading ? "Loading..." : (placeholder || `Select ${label}`)} />
        </SelectTrigger>
        <SelectContent>
          {options?.map((item) => (
            <SelectItem key={item._id} value={item.name}>
              {item.name}
            </SelectItem>
          ))}
          {!isLoading && options?.length === 0 && (
             <div className="p-2 text-sm text-muted-foreground text-center">No items found. Add one!</div>
          )}
        </SelectContent>
      </Select>

      {/* --- ADD NEW ITEM DIALOG --- */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New {label}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input 
              placeholder={`Enter new ${label.toLowerCase()} name`} 
              value={newItem} 
              onChange={(e) => setNewItem(e.target.value)} 
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={createMutation.isPending}>
              {createMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4 mr-2"/>}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};