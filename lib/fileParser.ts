/**
 * Dosya İçerik Çıkarıcı (Server-Side)
 * PDF, Word (.docx), ve metin dosyalarından içerik çıkarır
 */

/**
 * Ana parse fonksiyonu - server-side için
 */
export async function parseDocument(file: File): Promise<string> {
  const fileName = file.name.toLowerCase();
  
  if (fileName.endsWith('.txt')) {
    return await file.text();
  }
  
  if (fileName.endsWith('.pdf')) {
    // PDF için basit text extraction (pdf-parse server-side sorun çıkarıyor)
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // PDF text'ini çıkar (basit yaklaşım)
    const text = buffer.toString('utf-8');
    const cleanText = text
      .replace(/[^\x20-\x7E\n\r\t\u00C0-\u017F]/g, ' ') // ASCII + Turkish chars
      .replace(/\s+/g, ' ') // Multiple spaces to single
      .trim();
    
    return cleanText || 'PDF içeriği okunamadı. Lütfen metin formatında bir dosya yükleyin.';
  }
  
  if (fileName.endsWith('.docx') || fileName.endsWith('.doc')) {
    // DOCX için mammoth kullan
    const mammoth = require('mammoth');
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ buffer: Buffer.from(arrayBuffer) });
    return result.value;
  }
  
  throw new Error('Desteklenmeyen dosya formatı');
}

/**
 * Dosya boyutu kontrolü (max 10MB)
 */
export function validateFileSize(file: File, maxSizeMB: number = 10): boolean {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return file.size <= maxSizeBytes;
}

/**
 * Desteklenen dosya formatları
 */
export const SUPPORTED_FILE_TYPES = {
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
  'text/plain': '.txt',
  'application/pdf': '.pdf',
};

export const SUPPORTED_EXTENSIONS = ['.docx', '.txt', '.pdf', '.doc'];
