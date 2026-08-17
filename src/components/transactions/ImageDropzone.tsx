import { useCallback, useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { ImagePlus, X } from 'lucide-react';

interface ImageDropzoneProps {
  file: File | null;
  onChange: (file: File | null) => void;
}

export function ImageDropzone({ file, onChange }: ImageDropzoneProps) {
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const onDrop = useCallback(
    (accepted: File[]) => {
      if (accepted[0]) onChange(accepted[0]);
    },
    [onChange],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.webp', '.heic'] },
    maxFiles: 1,
    multiple: false,
  });

  if (preview) {
    return (
      <div className="relative overflow-hidden rounded-xl border border-slate-200">
        <img src={preview} alt="Comprobante" className="max-h-56 w-full object-contain bg-slate-50" />
        <button
          type="button"
          onClick={() => onChange(null)}
          className="absolute right-2 top-2 rounded-full bg-slate-900/70 p-1.5 text-white hover:bg-slate-900"
          aria-label="Quitar imagen"
        >
          <X size={16} />
        </button>
      </div>
    );
  }

  return (
    <div
      {...getRootProps()}
      className={`flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed px-4 py-6 text-center transition-colors ${
        isDragActive ? 'border-emerald-500 bg-emerald-50' : 'border-slate-300 bg-slate-50 hover:bg-slate-100'
      }`}
    >
      <input {...getInputProps()} />
      <ImagePlus className="text-slate-400" size={24} />
      <p className="text-sm font-medium text-slate-600">
        {isDragActive ? 'Suelta la imagen aquí' : 'Arrastra una foto o toca para elegir'}
      </p>
      <p className="text-xs text-slate-400">Comprobante o factura (opcional)</p>
    </div>
  );
}
