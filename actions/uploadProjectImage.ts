'use server';

import { createClient, createServiceClient } from '@/lib/supabase/server';

/**
 * Upload project image to Supabase Storage
 * @param projectId - Project ID for folder organization
 * @param file - File data as base64 or ArrayBuffer
 * @param fileName - Original file name
 * @returns Public URL of uploaded image
 */
export async function uploadProjectImage(
  projectId: string,
  file: string | ArrayBuffer,
  fileName: string
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    // Use regular client to get user info
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    // Use service client for upload (bypass RLS)
    const serviceSupabase = createServiceClient();

    // Sanitize filename
    const timestamp = Date.now();
    const extension = fileName.split('.').pop()?.toLowerCase() || 'jpg';
    const sanitizedName = fileName
      .replace(/[^a-zA-Z0-9.-]/g, '_')
      .substring(0, 50);
    // Use user.id if available, otherwise 'public'
    const userId = user?.id || 'public';
    const storagePath = `${userId}/${projectId}/${timestamp}_${sanitizedName}`;

    // Convert base64 to buffer if needed
    let fileBuffer: ArrayBuffer;
    if (typeof file === 'string') {
      // Base64 string
      const base64Data = file.replace(/^data:image\/\w+;base64,/, '');
      const binaryString = atob(base64Data);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      fileBuffer = bytes.buffer;
    } else {
      fileBuffer = file;
    }

    // Upload to storage with SERVICE ROLE (bypasses RLS)
    const { data, error: uploadError } = await serviceSupabase.storage
      .from('project-images')
      .upload(storagePath, fileBuffer, {
        contentType: `image/${extension}`,
        upsert: false,
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return { success: false, error: uploadError.message };
    }

    // Get public URL
    const { data: { publicUrl } } = serviceSupabase.storage
      .from('project-images')
      .getPublicUrl(storagePath);

    return { success: true, url: publicUrl };
  } catch (error) {
    console.error('Upload error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Yükleme hatası' 
    };
  }
}

/**
 * Delete project image from Supabase Storage
 * @param imageUrl - Full public URL of the image
 */
export async function deleteProjectImage(
  imageUrl: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Use service client for delete (bypass RLS)
    const serviceSupabase = createServiceClient();

    // Extract storage path from URL
    const urlParts = imageUrl.split('/project-images/');
    if (urlParts.length < 2) {
      return { success: false, error: 'Geçersiz URL' };
    }
    const storagePath = urlParts[1];

    // Delete from storage with SERVICE ROLE
    const { error: deleteError } = await serviceSupabase.storage
      .from('project-images')
      .remove([storagePath]);

    if (deleteError) {
      console.error('Delete error:', deleteError);
      return { success: false, error: deleteError.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Delete error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Silme hatası' 
    };
  }
}

/**
 * Get all images for a project
 * @param projectId - Project ID
 */
export async function getProjectImages(
  projectId: string
): Promise<{ success: boolean; images?: string[]; error?: string }> {
  try {
    // Use regular client to get user info
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    // Use service client for list (bypass RLS)
    const serviceSupabase = createServiceClient();
    
    // Use user.id if available, otherwise 'public'
    const userId = user?.id || 'public';

    // List files in project folder
    const { data, error } = await serviceSupabase.storage
      .from('project-images')
      .list(`${userId}/${projectId}`, {
        sortBy: { column: 'created_at', order: 'desc' },
      });

    if (error) {
      console.error('List error:', error);
      return { success: false, error: error.message };
    }

    // Get public URLs
    const images = data?.map(file => {
      const { data: { publicUrl } } = serviceSupabase.storage
        .from('project-images')
        .getPublicUrl(`${userId}/${projectId}/${file.name}`);
      return publicUrl;
    }) || [];

    return { success: true, images };
  } catch (error) {
    console.error('Get images error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Liste alma hatası' 
    };
  }
}
