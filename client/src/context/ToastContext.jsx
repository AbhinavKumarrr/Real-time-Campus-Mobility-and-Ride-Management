import { createContext, useCallback, useContext, useState } from 'react';

const ToastContext = createContext(null);

let idCounter = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const remove = (id) => setToasts((t) => t.filter((x) => x.id !== id));

  const push = (title, body = '', type = 'info', ttl = 4000) => {
    const id = ++idCounter;
    setToasts((t) => [...t, { id, title, body, type }]);
    if (ttl) setTimeout(() => remove(id), ttl);
  };

  const toast = {
    info: (title, body) => push(title, body, 'info'),
    success: (title, body) => push(title, body, 'success'),
    error: (title, body) => push(title, body, 'error', 6000),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="toast-stack">
        {toasts.map((t) => (
          <div key={t.id} className={`toast ${t.type}`} onClick={() => remove(t.id)}>
            <div className="t-title">{t.title}</div>
            {t.body ? <div className="t-body">{t.body}</div> : null}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
