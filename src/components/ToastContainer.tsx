import { motion, AnimatePresence } from "motion/react";
import { X, CheckCircle, AlertTriangle, Info } from "lucide-react";
import { useStore } from "../context/StoreContext";

export default function ToastContainer() {
  const { toasts, removeToast } = useStore();

  return (
    <div className="fixed top-24 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => {
          const isSuccess = toast.type === "success";
          const isError = toast.type === "error";

          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 50, y: -10 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              exit={{ opacity: 0, x: 30 }}
              className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-lg backdrop-blur-md ${
                isSuccess
                  ? "bg-emerald-50/95 border-emerald-200 text-emerald-800"
                  : isError
                  ? "bg-rose-50/95 border-rose-200 text-rose-800"
                  : "bg-blue-50/95 border-blue-200 text-blue-800"
              }`}
              id={`toast-${toast.id}`}
            >
              <div className="mt-0.5 shrink-0">
                {isSuccess ? (
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                ) : isError ? (
                  <AlertTriangle className="w-5 h-5 text-rose-600" />
                ) : (
                  <Info className="w-5 h-5 text-blue-600" />
                )}
              </div>
              
              <div className="flex-1 text-sm font-medium leading-normal">
                {toast.text}
              </div>

              <button
                onClick={() => removeToast(toast.id)}
                className="shrink-0 text-gray-400 hover:text-gray-600 transition-colors rounded-lg p-0.5 hover:bg-gray-100"
                id={`toast-close-${toast.id}`}
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
