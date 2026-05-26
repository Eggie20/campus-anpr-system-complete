import { useNotification } from '../../../contexts/NotificationContext';
import './GlobalToast.css';

const ICONS = {
  success: '✓',
  error: '✕',
  warning: '⚠',
  info: 'ℹ',
};

export default function GlobalToast() {
  const { notifications, removeNotification } = useNotification();

  if (!notifications.length) return null;

  return (
    <div className="global-toast-container">
      {notifications.map((n) => (
        <div
          key={n.id}
          className={`global-toast global-toast--${n.type}`}
          onClick={() => removeNotification(n.id)}
        >
          <span className="global-toast__icon">{ICONS[n.type] || ICONS.info}</span>
          <span className="global-toast__msg">{n.message}</span>
          <button
            className="global-toast__close"
            onClick={(e) => {
              e.stopPropagation();
              removeNotification(n.id);
            }}
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
