'use client';

import type { ThreadCategory } from '@repo/contracts/thread';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useServices } from '@/providers/ServicesProvider';

type Props = {
  open: boolean;
  categories: ThreadCategory[];
  onClose: () => void;
  onCreated: () => Promise<void>;
};

export function NewThreadModal({ open, categories, onClose, onCreated }: Props) {
  const { t } = useTranslation();
  const { threadService } = useServices();

  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [body, setBody] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClose = () => {
    setTitle('');
    setCategoryId('');
    setBody('');
    setError(null);
    onClose();
  };

  const handleSubmit = async () => {
    if (!(title.trim() && categoryId && body.trim())) {
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      await threadService.create({ title: title.trim(), categoryId, body: body.trim() });
      setTitle('');
      setCategoryId('');
      setBody('');
      await onCreated();
    } catch {
      setError(t('common.error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t('threads.newThreadModal.title')}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="thread-title">{t('threads.newThreadModal.titleLabel')}</Label>
            <Input
              id="thread-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t('threads.newThreadModal.titlePlaceholder')}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="thread-category">{t('threads.newThreadModal.categoryLabel')}</Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger id="thread-category">
                <SelectValue placeholder={t('threads.newThreadModal.categoryPlaceholder')} />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.emoji} {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="thread-body">{t('threads.newThreadModal.messageLabel')}</Label>
            <Textarea
              id="thread-body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={4}
              className="resize-none"
            />
          </div>
          {error && <p className="text-destructive text-sm">{error}</p>}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
            {t('threads.newThreadModal.cancel')}
          </Button>
          <Button
            onClick={() => void handleSubmit()}
            disabled={isSubmitting || !title.trim() || !categoryId || !body.trim()}
          >
            {t('threads.newThreadModal.submit')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
