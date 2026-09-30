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
    const fileExt = file.name.split('.').pop() || 'png';
    const fileName = `${userId || 'guest'}_${Date.now()}.${fileExt}`;
    const filePath = `payment_proofs/${fileName}`;

    // 1. Try uploading to Supabase Storage bucket 'vouchers'
    const { data, error } = await supabase.storage
      .from('vouchers')
      .upload(filePath, file, {
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

    // 2. Fallback: Convert file to Base64 Data URL so the voucher is preserved
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
      reader.readAsDataURL(file);
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

