import { motion, AnimatePresence } from 'framer-motion';

interface NotificationToastProps {
  message: string;
}

export default function NotificationToast({ message }: NotificationToastProps) {
  return (
    <AnimatePresence mode="wait">
      {message && (
        <motion.div
          key={`notification-${message}`}
          initial={{ opacity: 0, y: -20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.9 }}
          style={{
            position: 'fixed',
            top: '2rem',
            left: '50%',
            transform: 'translateX(-50%)',
            padding: '0.75rem 1.5rem',
            borderRadius: '9999px',
            fontSize: '0.875rem',
            fontWeight: '300',
            zIndex: 50,
            pointerEvents: 'none',
            backgroundColor: 'rgba(28, 25, 23, 0.9)',
            backdropFilter: 'blur(12px)',
            color: '#fbbf24',
          }}
        >
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
