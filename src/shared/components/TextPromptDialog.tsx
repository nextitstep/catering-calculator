import { useEffect, useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogBody,
  DialogContent,
  DialogSurface,
  DialogTitle,
  Field,
  Input,
} from '@fluentui/react-components';

interface TextPromptDialogProps {
  open: boolean;
  title: string;
  label: string;
  initialValue?: string;
  confirmText?: string;
  onCancel: () => void;
  onConfirm: (value: string) => void;
}

export function TextPromptDialog({
  open,
  title,
  label,
  initialValue = '',
  confirmText = 'Save',
  onCancel,
  onConfirm,
}: TextPromptDialogProps) {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    if (open) setValue(initialValue);
  }, [open, initialValue]);

  return (
    <Dialog open={open} onOpenChange={(_, data) => !data.open && onCancel()}>
      <DialogSurface>
        <DialogBody>
          <DialogTitle>{title}</DialogTitle>
          <DialogContent>
            <Field label={label}>
              <Input
                value={value}
                onChange={(_, data) => setValue(data.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && value.trim()) onConfirm(value.trim());
                }}
                autoFocus
              />
            </Field>
          </DialogContent>
          <DialogActions>
            <Button appearance="secondary" onClick={onCancel}>
              Cancel
            </Button>
            <Button
              appearance="primary"
              disabled={!value.trim()}
              onClick={() => onConfirm(value.trim())}
            >
              {confirmText}
            </Button>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
}
