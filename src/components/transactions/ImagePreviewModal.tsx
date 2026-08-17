interface ImagePreviewModalProps {
  open: boolean;
  onClose: () => void;
  src: string;
}

export function ImagePreviewModal({ open, onClose, src }: ImagePreviewModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        aria-label="Cerrar"
        className="absolute inset-0 bg-slate-900/80"
        onClick={onClose}
      />
      <img
        src={src}
        alt="Comprobante"
        className="relative z-10 max-h-[85vh] max-w-full rounded-lg object-contain shadow-2xl"
      />
    </div>
  );
}
