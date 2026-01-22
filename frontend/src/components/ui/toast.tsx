import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Button } from "./button";

export interface Toast {
  id: string;
  title: string;
  description?: string;
  type?: "info" | "success" | "warning" | "error";
  duration?: number;
}

let toastListeners: ((toasts: Toast[]) => void)[] = [];
let toasts: Toast[] = [];

function notify() {
  toastListeners.forEach(listener => listener([...toasts]));
}

export function toast(newToast: Omit<Toast, "id">) {
  const id = Math.random().toString(36).substring(2, 9);
  const toastWithId: Toast = {
    id,
    duration: 5000,
    ...newToast,
  };
  
  toasts = [...toasts, toastWithId];
  notify();
  
  if (toastWithId.duration && toastWithId.duration > 0) {
    setTimeout(() => {
      dismissToast(id);
    }, toastWithId.duration);
  }
  
  return id;
}

export function dismissToast(id: string) {
  toasts = toasts.filter(t => t.id !== id);
  notify();
}

export function useToast() {
  const [currentToasts, setCurrentToasts] = useState<Toast[]>(toasts);
  
  useEffect(() => {
    const listener = (newToasts: Toast[]) => {
      setCurrentToasts(newToasts);
    };
    toastListeners.push(listener);
    return () => {
      toastListeners = toastListeners.filter(l => l !== listener);
    };
  }, []);
  
  return { toasts: currentToasts, toast, dismissToast };
}

export function Toaster() {
  const { toasts, dismissToast } = useToast();
  
  if (toasts.length === 0) return null;
  
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-md">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={() => dismissToast(toast.id)} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  const bgColor = {
    info: "bg-blue-500 border-blue-600",
    success: "bg-green-500 border-green-600",
    warning: "bg-yellow-500 border-yellow-600",
    error: "bg-red-500 border-red-600",
  }[toast.type || "info"];
  
  return (
    <div className={`${bgColor} border text-white rounded-xl shadow-lg p-4 flex items-start gap-3 min-w-[300px] max-w-md animate-in slide-in-from-right`}>
      <div className="flex-1">
        <p className="font-semibold text-sm">{toast.title}</p>
        {toast.description && (
          <p className="text-xs mt-1 opacity-90">{toast.description}</p>
        )}
      </div>
      <button
        className="h-6 w-6 text-white hover:bg-white/20 rounded flex items-center justify-center transition-colors"
        onClick={onDismiss}
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
