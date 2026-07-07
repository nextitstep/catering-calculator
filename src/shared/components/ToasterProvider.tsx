import { createContext, useContext, useMemo, type ReactNode } from 'react';
import {
  Toast,
  Toaster,
  ToastBody,
  ToastTitle,
  useId,
  useToastController,
  Button,
} from '@fluentui/react-components';

interface ToastOptions {
  title: string;
  body?: string;
  actionText?: string;
  onAction?: () => void;
  intent?: 'success' | 'error' | 'info' | 'warning';
}

interface ToasterContextValue {
  notify: (options: ToastOptions) => void;
}

const ToasterContext = createContext<ToasterContextValue | null>(null);

export function AppToasterProvider({ children }: { children: ReactNode }) {
  const toasterId = useId('app-toaster');
  const { dispatchToast } = useToastController(toasterId);

  const value = useMemo<ToasterContextValue>(
    () => ({
      notify: ({ title, body, actionText, onAction, intent = 'info' }) => {
        dispatchToast(
          <Toast>
            <ToastTitle
              action={
                actionText && onAction ? (
                  <Button appearance="transparent" onClick={onAction} size="small">
                    {actionText}
                  </Button>
                ) : undefined
              }
            >
              {title}
            </ToastTitle>
            {body ? <ToastBody>{body}</ToastBody> : null}
          </Toast>,
          { intent, timeout: 6000 }
        );
      },
    }),
    [dispatchToast]
  );

  return (
    <ToasterContext.Provider value={value}>
      {children}
      <Toaster toasterId={toasterId} position="bottom" />
    </ToasterContext.Provider>
  );
}

export function useAppToaster(): ToasterContextValue {
  const ctx = useContext(ToasterContext);
  if (!ctx) throw new Error('useAppToaster must be used within AppToasterProvider');
  return ctx;
}
