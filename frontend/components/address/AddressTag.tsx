'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  getTag,
  setTag,
  removeTag,
  getCategoryColor,
  CATEGORY_OPTIONS,
  type AddressTag as AddressTagType,
} from '@/lib/utils/address-tags';
import { Tag, Plus, Pencil, Trash2, Save } from 'lucide-react';

interface AddressTagProps {
  address: string;
}

export function AddressTag({ address }: AddressTagProps) {
  const [tag, setTagState] = useState<AddressTagType | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [label, setLabel] = useState('');
  const [category, setCategory] = useState<string>('custom');
  const [notes, setNotes] = useState('');

  // Load tag on mount
  useEffect(() => {
    const existingTag = getTag(address);
    setTagState(existingTag);
    if (existingTag) {
      setLabel(existingTag.label);
      setCategory(existingTag.category || 'custom');
      setNotes(existingTag.notes || '');
    }
  }, [address]);

  const handleSave = () => {
    if (!label.trim()) return;

    setTag({
      address,
      label: label.trim(),
      category: category as AddressTagType['category'],
      notes: notes.trim() || undefined,
    });

    const updatedTag = getTag(address);
    setTagState(updatedTag);
    setIsOpen(false);
  };

  const handleRemove = () => {
    removeTag(address);
    setTagState(null);
    setLabel('');
    setCategory('custom');
    setNotes('');
    setIsOpen(false);
  };

  const openDialog = () => {
    const existingTag = getTag(address);
    if (existingTag) {
      setLabel(existingTag.label);
      setCategory(existingTag.category || 'custom');
      setNotes(existingTag.notes || '');
    } else {
      setLabel('');
      setCategory('custom');
      setNotes('');
    }
    setIsOpen(true);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {tag ? (
        // Show existing tag
        <div className="flex items-center gap-2">
          <Badge className={getCategoryColor(tag.category)}>
            <Tag className="mr-1 h-3 w-3" />
            {tag.label}
          </Badge>
          <DialogTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={openDialog}
              className="h-6 w-6 p-0"
            >
              <Pencil className="h-3 w-3" />
            </Button>
          </DialogTrigger>
        </div>
      ) : (
        // Show add button
        <DialogTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            onClick={openDialog}
            className="h-7"
          >
            <Plus className="mr-1 h-3 w-3" />
            Add Label
          </Button>
        </DialogTrigger>
      )}

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{tag ? 'Edit Label' : 'Add Label'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Label Input */}
          <div className="space-y-2">
            <Label htmlFor="label">Label *</Label>
            <Input
              id="label"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g., My Wallet, Uniswap Router"
              maxLength={50}
            />
          </div>

          {/* Category Select */}
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORY_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes about this address..."
              rows={3}
              maxLength={200}
            />
          </div>
        </div>

        <div className="flex justify-between">
          {tag && (
            <Button variant="destructive" size="sm" onClick={handleRemove}>
              <Trash2 className="mr-2 h-4 w-4" />
              Remove
            </Button>
          )}
          <div className={`flex gap-2 ${!tag ? 'ml-auto' : ''}`}>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!label.trim()}>
              <Save className="mr-2 h-4 w-4" />
              Save
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
