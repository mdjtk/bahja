'use client';

import { useState, useEffect, useCallback } from 'react';

interface ToastState {
  message: string;
  visible: boolean;
}

let showToastFn: ((msg: string) => void) | null = null;

export function toast(msg: string) {
  if (showToastFn) showToastFn(msg);
}

export default function ToastProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<ToastState>({ message: '', visible: false });

  const show = useCallback((msg: string) => {
    setState({ message: msg, visible: true });
    setTimeout(() => {
      setState((prev) => ({ ...prev, visible: false }));
    }, 2000);
  }, []);

  useEffect(() => {
    showToastFn = show;
    return () => { showToastFn = null; };
  }, [show]);

  return (
    <>
      {children}
      {state.visible && (
        <div
          style={{
            position: 'fixed',
            bottom: '90px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: '#3A241A',
            color: '#f9eec0',
            padding: '12px 24px',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: 500,
            zIndex: 10000,
            boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
            animation: 'toastIn 0.3s ease',
            opacity: state.visible ? 1 : 0,
            transition: 'opacity 0.3s',
          }}
        >
          {state.message}
        </div>
      )}
    </>
  );
}
