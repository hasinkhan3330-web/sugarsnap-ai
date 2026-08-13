import { useState, useRef, type ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Upload, Loader2, ArrowLeft } from 'lucide-react';

export function ScanPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPreview(URL.createObjectURL(file));
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      navigate('/analysis?demo=masala-chai-sugar');
    }, 2000);
  };

  return (
    <div className="page-container space-y-5">
      <div className="flex items-center gap-2">
        <button onClick={() => navigate(-1)} aria-label="Go back" className="p-1 -ml-1">
          <ArrowLeft className="h-5 w-5 text-muted-foreground" />
        </button>
        <h1 className="text-xl font-bold text-foreground">Scan food</h1>
      </div>

      {/* Camera / Upload area */}
      <div className="rounded-2xl border-2 border-dashed border-border bg-card p-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center gap-4 py-12">
            <div className="relative">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-brand-light">
                <Loader2 className="h-10 w-10 animate-spin text-brand" />
              </div>
              <Camera className="absolute -bottom-1 -right-1 h-6 w-6 text-brand bg-card rounded-full p-0.5" />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-foreground">Analyzing your food...</p>
              <p className="text-xs text-muted-foreground mt-1">Detecting dish, portion, and sugar content</p>
            </div>
          </div>
        ) : preview ? (
          <div className="flex flex-col items-center gap-3">
            <img src={preview} alt="Selected food" className="max-h-48 rounded-xl object-cover" />
            <p className="text-sm text-muted-foreground">Processing image...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 py-8">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
              <Camera className="h-10 w-10 text-muted-foreground" />
            </div>
            <div className="text-center">
              <h2 className="text-sm font-semibold text-foreground">Snap a photo of your food</h2>
              <p className="text-xs text-muted-foreground mt-1">
                Take a picture or upload from your gallery
              </p>
            </div>
          </div>
        )}
      </div>

      {!loading && !preview && (
        <>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-brand px-6 py-4 text-base font-semibold text-white shadow-lg shadow-brand/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Camera className="h-5 w-5" strokeWidth={2.5} />
            Take photo
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-border bg-card px-6 py-3.5 text-sm font-semibold text-foreground transition-all hover:border-brand/30"
          >
            <Upload className="h-4 w-4" />
            Upload from gallery
          </button>

          {/* Demo foods */}
          <div className="pt-2">
            <h3 className="text-sm font-semibold text-foreground mb-3">Try a demo food</h3>
            <p className="text-xs text-muted-foreground mb-3">
              No real AI yet — pick a demo dish to see how the analysis will look.
            </p>
            <div className="grid grid-cols-2 gap-2">
              {DEMO_SCAN_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => navigate(`/analysis?demo=${opt.id}`)}
                  className="flex items-center gap-2 rounded-xl border border-border bg-card p-3 text-left transition-all hover:border-brand/30"
                >
                  <span className="text-xl">{opt.emoji}</span>
                  <span className="text-xs font-medium text-foreground">{opt.name}</span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
}

const DEMO_SCAN_OPTIONS = [
  { id: 'masala-chai-sugar', name: 'Masala Chai', emoji: '☕' },
  { id: 'sweet-coffee', name: 'Sweet Coffee', emoji: '☕' },
  { id: 'marie-biscuits', name: 'Marie Biscuits', emoji: '🍪' },
  { id: 'poha', name: 'Poha', emoji: '🍚' },
  { id: 'dal-chawal', name: 'Dal Chawal', emoji: '🍛' },
  { id: 'paneer', name: 'Paneer', emoji: '🧀' },
  { id: 'mango-lassi', name: 'Mango Lassi', emoji: '🥭' },
  { id: 'gulab-jamun', name: 'Gulab Jamun', emoji: '🍮' },
];


