"use client";

import { useState, useRef, useCallback } from "react";
import { Camera, X, Check } from "lucide-react";
import Cropper from "react-easy-crop";
import getCroppedImg from "@/lib/cropImage";
import { toast } from "sonner";

export default function AvatarUploadClient({ defaultAvatar, userName }: { defaultAvatar?: string, userName: string }) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(defaultAvatar || null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Cropper states
  const [isCropping, setIsCropping] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast.error("File harus berupa gambar!");
        return;
      }
      const url = URL.createObjectURL(file);
      setImageSrc(url);
      setIsCropping(true);
    }
  };

  const onCropComplete = useCallback((croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const showCroppedImage = async () => {
    try {
      if (!imageSrc || !croppedAreaPixels) return;
      
      // Get cropped and compressed image file (max 800px width/height, 0.8 quality = 100-200kb)
      const croppedFile = await getCroppedImg(
        imageSrc,
        croppedAreaPixels,
        0,
        { horizontal: false, vertical: false },
        0.8,
        800
      );
      
      if (croppedFile) {
        // Update preview URL
        const croppedUrl = URL.createObjectURL(croppedFile);
        setPreviewUrl(croppedUrl);
        
        // Inject into hidden file input for form submission
        if (fileInputRef.current) {
          const dataTransfer = new DataTransfer();
          dataTransfer.items.add(croppedFile);
          fileInputRef.current.files = dataTransfer.files;
        }
      }
    } catch (e) {
      console.error(e);
      toast.error("Gagal memotong gambar");
    } finally {
      setIsCropping(false);
    }
  };

  return (
    <>
      <div style={{ display: "flex", alignItems: "center", gap: 24, marginBottom: 24 }}>
        <div 
          style={{ 
            width: 80, 
            height: 80, 
            borderRadius: "50%", 
            background: "var(--c-surface-2)", 
            border: "2px dashed var(--c-border)",
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center",
            overflow: "hidden",
            position: "relative",
            flexShrink: 0
          }}
        >
          {previewUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={previewUrl} alt={userName} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            <span style={{ fontSize: "2rem", fontWeight: 600, color: "var(--c-ink-dim)" }}>
              {userName ? userName.charAt(0).toUpperCase() : "?"}
            </span>
          )}
        </div>

        <div>
          <h3 style={{ fontSize: "1rem", fontWeight: 600, color: "var(--c-ink)", marginBottom: 8 }}>Foto Profil</h3>
          <p style={{ fontSize: "0.85rem", color: "var(--c-ink-dim)", marginBottom: 12 }}>
            Foto ini akan ditampilkan di ruang admin dan saat Anda melayani chat virtual dengan pelanggan.
          </p>
          {/* Actual file input the form reads */}
          <input 
            type="file" 
            name="avatar" 
            accept="image/*" 
            ref={fileInputRef} 
            onChange={handleFileChange}
            style={{ display: "none" }} 
          />
          <button 
            type="button" 
            onClick={() => fileInputRef.current?.click()}
            style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 16px", background: "transparent", color: "var(--c-ink)", border: "1px solid var(--c-border)", borderRadius: "var(--r-sm)", fontSize: "0.85rem", fontWeight: 500, cursor: "pointer" }}
          >
            <Camera size={16} /> Ubah Foto
          </button>
        </div>
      </div>

      {/* Cropper Modal */}
      {isCropping && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, background: "rgba(0,0,0,0.8)", display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "20px", display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--c-surface-1)", borderBottom: "1px solid var(--c-border)" }}>
            <h3 style={{ margin: 0, color: "var(--c-ink)", fontSize: "1.1rem" }}>Sesuaikan & Kompres Foto</h3>
            <button onClick={() => setIsCropping(false)} style={{ background: "transparent", border: "none", color: "var(--c-ink)", cursor: "pointer", display: "flex" }}>
              <X size={24} />
            </button>
          </div>
          
          <div style={{ position: "relative", flex: 1, background: "#111" }}>
            {imageSrc && (
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="round"
                showGrid={false}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
              />
            )}
          </div>
          
          <div style={{ padding: "24px", background: "var(--c-surface-1)", borderTop: "1px solid var(--c-border)", display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label style={{ color: "var(--c-ink-dim)", fontSize: "0.85rem", marginBottom: 8, display: "block" }}>Zoom (Perbesar)</label>
              <input 
                type="range" 
                value={zoom} 
                min={1} 
                max={3} 
                step={0.1} 
                aria-labelledby="Zoom" 
                onChange={(e) => setZoom(Number(e.target.value))} 
                style={{ width: "100%" }}
              />
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
              <button 
                onClick={() => setIsCropping(false)}
                style={{ padding: "10px 20px", borderRadius: "8px", border: "1px solid var(--c-border)", background: "transparent", color: "var(--c-ink)", cursor: "pointer", fontWeight: 500 }}
              >
                Batal
              </button>
              <button 
                onClick={showCroppedImage}
                style={{ padding: "10px 20px", borderRadius: "8px", border: "none", background: "var(--c-gold)", color: "#000", cursor: "pointer", fontWeight: 600, display: "flex", alignItems: "center", gap: 8 }}
              >
                <Check size={18} /> Terapkan & Kompres
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
