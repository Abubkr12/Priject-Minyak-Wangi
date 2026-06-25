'use client';

import { useState } from 'react';
import { Camera, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export function AvatarUpload({ 
  currentAvatarUrl, 
  userId,
  onUploadSuccess 
}: { 
  currentAvatarUrl: string | null;
  userId: string;
  onUploadSuccess: (url: string) => void;
}) {
  const [isUploading, setIsUploading] = useState(false);
  const supabase = createClient();

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!e.target.files || e.target.files.length === 0) {
        return;
      }
      const file = e.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${fileName}`;

      setIsUploading(true);

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      onUploadSuccess(data.publicUrl);
    } catch (error) {
      console.error('Error uploading avatar:', error);
      alert('Gagal mengupload foto profil. Pastikan ukuran file tidak terlalu besar.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
      <div 
        style={{ 
          position: 'relative',
          width: '100px', 
          height: '100px', 
          borderRadius: '50%', 
          background: 'var(--c-surface-1)',
          border: '2px dashed var(--c-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          backgroundImage: currentAvatarUrl ? `url(${currentAvatarUrl})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        {!currentAvatarUrl && !isUploading && <Camera size={24} style={{ color: 'var(--c-ink-dim)' }} />}
        {isUploading && <Loader2 className="animate-spin" size={24} style={{ color: 'var(--c-gold)' }} />}
        
        <label 
          style={{ 
            position: 'absolute', 
            inset: 0, 
            cursor: 'pointer', 
            opacity: 0,
            zIndex: 10
          }}
        >
          <input 
            type="file" 
            accept="image/*" 
            style={{ display: 'none' }} 
            onChange={handleUpload}
            disabled={isUploading}
          />
        </label>
      </div>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '0.85rem', color: 'var(--c-ink-dim)' }}>Klik foto untuk mengubah avatar</div>
      </div>
    </div>
  );
}
