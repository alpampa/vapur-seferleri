"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNotificationStore, Notification } from "@/store/useNotificationStore";
import { Bell, Info, CheckCircle2, AlertTriangle, XCircle, X } from "lucide-react";

const getIcon = (type: Notification['type']) => {
  switch (type) {
    case 'success': return <CheckCircle2 className="text-emerald-500" size={24} />;
    case 'warning': return <AlertTriangle className="text-yellow-500" size={24} />;
    case 'error': return <XCircle className="text-red-500" size={24} />;
    default: return <Info className="text-blue-500" size={24} />;
  }
};

const Toast = ({ notification }: { notification: Notification }) => {
  const { removeNotification } = useNotificationStore();

  useEffect(() => {
    const timer = setTimeout(() => {
      removeNotification(notification.id);
    }, notification.duration || 5000);
    return () => clearTimeout(timer);
  }, [notification, removeNotification]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
      layout
      className="bg-white/90 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl p-4 flex gap-4 items-start relative pointer-events-auto"
    >
      <div className="shrink-0 pt-1">
        {getIcon(notification.type)}
      </div>
      <div className="flex-1 pr-6">
        <h4 className="font-bold text-gray-900">{notification.title}</h4>
        <p className="text-sm text-gray-600 mt-1 leading-snug">{notification.message}</p>
      </div>
      <button 
        onClick={() => removeNotification(notification.id)}
        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
      >
        <X size={16} />
      </button>
    </motion.div>
  );
};

export function NotificationContainer() {
  const { notifications } = useNotificationStore();

  return (
    <div className="fixed top-0 left-0 right-0 z-50 p-4 flex flex-col gap-3 pointer-events-none" style={{ paddingTop: 'max(16px, env(safe-area-inset-top))' }}>
      <AnimatePresence>
        {notifications.map((notif) => (
          <Toast key={notif.id} notification={notif} />
        ))}
      </AnimatePresence>
    </div>
  );
}
