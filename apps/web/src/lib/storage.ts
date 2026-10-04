import { supabase } from './supabase';

/**
 * Uploads a payment voucher image to Supabase Storage.
 * If the bucket 'vouchers' does not exist or has RLS issues,
 * falls back to a high-fidelity compressed data URL so the proof is never lost.
 */
export async function uploadPaymentVoucher(
  file: File,
  userId: string
): Promise<{ url: string | null; error: string | null }> {
  try {
    // 0. Auto-compress heavy camera photos to WebP (~120KB) in client
    const processedBlob = await compressImageIfApplicable(file, 1200, 1200, 0.82);
    const uploadFile =
      processedBlob instanceof File
        ? processedBlob
        : new File([processedBlob], file.name.replace(/\.[^/.]+$/, '.webp'), { type: processedBlob.type });

    const fileExt = uploadFile.name.split('.').pop() || 'webp';
    const fileName = `${userId || 'guest'}_${Date.now()}.${fileExt}`;
    const filePath = `payment_proofs/${fileName}`;

    // 1. Try uploading to Supabase Storage bucket 'vouchers'
    const { data, error } = await supabase.storage
      .from('vouchers')
      .upload(filePath, uploadFile, {
        cacheControl: '3600',
        upsert: true,
      });

    if (!error && data) {
      const { data: urlData } = supabase.storage
        .from('vouchers')
        .getPublicUrl(filePath);

      if (urlData?.publicUrl) {
        return { url: urlData.publicUrl, error: null };
      }
    }

    // 2. Fallback: Convert compressed file to Base64 Data URL so the voucher is preserved
    console.warn(
      'Supabase Storage bucket "vouchers" no disponible, guardando como comprobante DataURL embebido:',
      error?.message
    );

    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve({ url: reader.result as string, error: null });
      };
      reader.onerror = () => {
        resolve({ url: null, error: 'Error al leer el archivo de imagen seleccionado.' });
      };
      reader.readAsDataURL(uploadFile);
    });
  } catch (err: any) {
    return { url: null, error: err?.message || 'Error inesperado al procesar la imagen.' };
  }
}

/**
 * Uploads a community post/comment image to Supabase Storage bucket 'community'.
 * If the bucket is unavailable or network fails, falls back seamlessly to Data URL.
 */
export async function uploadCommunityMedia(
  file: File,
  userId?: string
): Promise<{ url: string | null; error: string | null }> {
  try {
    if (!file.type.startsWith('image/')) {
      return { url: null, error: 'Solo se permiten imágenes (PNG, JPG, GIF, WebP).' };
    }

    if (file.size > 10 * 1024 * 1024) {
      return { url: null, error: 'La imagen supera el límite de 10MB.' };
    }

    const fileExt = file.name.split('.').pop() || 'png';
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    const fileName = `${userId || 'student'}_${Date.now()}_${randomSuffix}.${fileExt}`;
    const filePath = `community_uploads/${fileName}`;

    // 1. Upload to Supabase Storage bucket 'community'
    const { data, error } = await supabase.storage
      .from('community')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
      });

    if (!error && data) {
      const { data: urlData } = supabase.storage
        .from('community')
        .getPublicUrl(filePath);

      if (urlData?.publicUrl) {
        return { url: urlData.publicUrl, error: null };
      }
    }

    // 2. Fallback to Base64 Data URL
    console.warn(
      'Supabase Storage bucket "community" con incidencia, usando DataURL de respaldo:',
      error?.message
    );

    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve({ url: reader.result as string, error: null });
      };
      reader.onerror = () => {
        resolve({ url: null, error: 'Error al procesar la imagen seleccionada.' });
      };
      reader.readAsDataURL(file);
    });
  } catch (err: any) {
    return { url: null, error: err?.message || 'Error al subir la imagen local.' };
  }
}

/**
 * Compresses an image in the browser using HTML5 Canvas.
 * Skips animated GIFs or SVGs to preserve animation and vector crispness.
 * Converts heavy JPG/PNG into optimized WebP (~80-150KB).
 */
export async function compressImageIfApplicable(
  file: File,
  maxWidth = 1200,
  maxHeight = 1200,
  quality = 0.82
): Promise<File | Blob> {
  if (typeof window === 'undefined') return file;

  // If animated GIF or SVG, do not compress via canvas (it would flatten animation)
  if (file.type === 'image/gif' || file.type === 'image/svg+xml') {
    return file;
  }

  // If already small (< 150KB), return as-is
  if (file.size <= 150 * 1024) {
    return file;
  }

  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);

      let { width, height } = img;
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(file);
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (blob && blob.size < file.size) {
            const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, '.webp'), {
              type: 'image/webp',
            });
            resolve(compressedFile);
          } else {
            resolve(file);
          }
        },
        'image/webp',
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(file);
    };

    img.src = url;
  });
}

/**
 * Uploads a signature wall sticker, GIF, or image to Supabase Storage bucket 'signatures'.
 * Automatically optimizes images via Canvas WebP compression (preserving GIFs).
 * Falls back safely to high-compression DataURL if bucket is offline/not created.
 */
export async function uploadSignatureMedia(
  file: File,
  userId?: string
): Promise<{ url: string | null; error: string | null }> {
  try {
    if (!file.type.startsWith('image/')) {
      return { url: null, error: 'Solo se permiten imágenes (PNG, JPG, GIF, WebP).' };
    }

    if (file.size > 10 * 1024 * 1024) {
      return { url: null, error: 'El archivo supera el límite de 10MB.' };
    }

    // 1. Client-side compression for JPG/PNG (leaves GIF intact)
    const processedBlob = await compressImageIfApplicable(file, 960, 960, 0.80);
    const uploadFile =
      processedBlob instanceof File
        ? processedBlob
        : new File([processedBlob], file.name, { type: processedBlob.type });

    const fileExt = uploadFile.name.split('.').pop() || 'webp';
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    const fileName = `${userId || 'signature'}_${Date.now()}_${randomSuffix}.${fileExt}`;
    const filePath = `wall/${fileName}`;

    // 2. Try Supabase Storage bucket 'signatures'
    const { data, error } = await supabase.storage
      .from('signatures')
      .upload(filePath, uploadFile, {
        cacheControl: '86400',
        upsert: true,
      });

    if (!error && data) {
      const { data: urlData } = supabase.storage
        .from('signatures')
        .getPublicUrl(filePath);

      if (urlData?.publicUrl) {
        return { url: urlData.publicUrl, error: null };
      }
    }

    // 3. Fallback: Compact Data URL (already compressed if PNG/JPG, original if GIF)
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve({ url: reader.result as string, error: null });
      };
      reader.onerror = () => {
        resolve({ url: null, error: 'Error al procesar el archivo seleccionado.' });
      };
      reader.readAsDataURL(uploadFile);
    });
  } catch (err: any) {
    return { url: null, error: err?.message || 'Error al procesar el archivo.' };
  }
}


