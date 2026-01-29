import { createContext, useContext, useState, useCallback } from "react";
import { createPortal } from "react-dom";

const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((message, type = "info") => {
        const id = Date.now();
        setToasts((prev) => [...prev, { id, message, type }]);

        // Auto remove after 3 seconds
        setTimeout(() => {
            removeToast(id);
        }, 4000);
    }, []);

    const removeToast = useCallback((id) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, []);

    const success = (msg) => addToast(msg, "success");
    const error = (msg) => addToast(msg, "error");
    const info = (msg) => addToast(msg, "info");
    const warning = (msg) => addToast(msg, "warning");

    return (
        <ToastContext.Provider value={{ success, error, info, warning }}>
            {children}
            {createPortal(
                <ToastContainer toasts={toasts} removeToast={removeToast} />,
                document.body
            )}
        </ToastContext.Provider>
    );
};

const ToastContainer = ({ toasts, removeToast }) => {
    return (
        <div className="toast toast-top toast-end z-50 flex flex-col gap-2 p-4 fixed top-4 right-4 items-end pointer-events-none">
            {toasts.map((toast) => (
                <div
                    key={toast.id}
                    className={`
              pointer-events-auto
              alert shadow-lg rounded-2xl border border-white/10
              animate-fade-in-up
              min-w-[300px]
              backdrop-blur-md
              ${toast.type === "success" ? "bg-success/20 text-success-content border-success/20" : ""}
              ${toast.type === "error" ? "bg-error/20 text-error-content border-error/20" : ""}
              ${toast.type === "warning" ? "bg-warning/20 text-warning-content border-warning/20" : ""}
              ${toast.type === "info" ? "bg-info/20 text-info-content border-info/20" : ""}
              ${!["success", "error", "warning", "info"].includes(toast.type) ? "glass" : ""}
            `}
                >
                    <div className="flex items-center gap-3">
                        {/* ICONS */}
                        {toast.type === 'success' && <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                        {toast.type === 'error' && <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                        {toast.type === 'warning' && <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>}
                        {toast.type === 'info' && <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>}

                        <div>
                            <span className="font-semibold text-sm">{toast.message}</span>
                        </div>
                    </div>
                    <button onClick={() => removeToast(toast.id)} className="btn btn-xs btn-circle btn-ghost">✕</button>
                </div>
            ))}
        </div>
    );
};
