import { useEffect } from "react";

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = "lg",
  isError = false,
}) {
  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizes = {
    sm: "sm:max-w-md",
    lg: "sm:max-w-5xl",
    xl: "sm:max-w-7xl",
  };

  const sizeClass = sizes[size] || sizes.lg;

  return (
    <div
      className="fixed inset-0 z-100 flex items-center justify-center bg-black/60 backdrop-blur-lg p-4 sm:p-6"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`
          bg-white w-full flex flex-col overflow-hidden
          max-h-[95vh] rounded-3xl shadow-2xl
          animate-in fade-in zoom-in-95 duration-200
          ${sizeClass} mx-auto
        `}
      >
        {/* Header */}
        <div className={`flex justify-between items-center px-4 sm:px-6 md:px-8 py-4 sm:py-6 border-b shrink-0 ${isError ? "bg-red-50 border-red-100" : "border-gray-300"}`}>
          <h2 className={`text-base sm:text-lg md:text-xl tracking-normal font-black ${isError ? "text-red-600" : "text-gray-800"}`}>
            {title}
          </h2>
          <button
            onClick={onClose}
            className={`w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-full transition-all font-bold text-sm sm:text-base ${isError ? "bg-red-100 text-red-600 hover:bg-red-400" : "bg-gray-50 text-gray-400 hover:text-red-600 hover:bg-red-100"}`}
          >
            ✕
          </button>
        </div>

        {/* Content — fills remaining height, scrolls inside */}
        <div className="flex-1 overflow-y-auto min-h-0 scrollbar-hide p-4 sm:p-6 w-full">
          {children}
        </div>
      </div>

      {/* Keyframe injected inline so no Tailwind config needed */}
      <style>{`
        @keyframes modalIn {
          from { transform: scale(0.95); opacity: 0; }
          to   { transform: scale(1);    opacity: 1; }
        }
      `}</style>
    </div>
  );
}
