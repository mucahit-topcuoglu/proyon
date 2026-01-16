/**
 * Nodemailer Transporter Yapılandırması
 * Proyon E-posta Yönetim Sistemi
 */

import nodemailer, { Transporter } from 'nodemailer';

const SMTP_CONFIG = {
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
};

let transporter: Transporter | null = null;

export function getEmailTransporter(): Transporter {
  if (transporter) {
    return transporter;
  }

  if (!SMTP_CONFIG.auth.user || !SMTP_CONFIG.auth.pass) {
    throw new Error(
      'SMTP yapılandırması eksik. SMTP_USER ve SMTP_PASS environment variables tanımlanmalı.'
    );
  }

  try {
    transporter = nodemailer.createTransport({
      host: SMTP_CONFIG.host,
      port: SMTP_CONFIG.port,
      secure: SMTP_CONFIG.secure,
      auth: SMTP_CONFIG.auth,
      pool: true,
      maxConnections: 5,
      maxMessages: 100,
      rateDelta: 1000,
      rateLimit: 5,
      connectionTimeout: 10000,
      greetingTimeout: 5000,
      socketTimeout: 30000,
    });

    if (process.env.NODE_ENV === 'development') {
      transporter.verify((error, success) => {
        if (error) {
          console.error('❌ SMTP bağlantı testi başarısız:', error.message);
        } else {
          console.log('✅ SMTP sunucusu hazır');
        }
      });
    }

    return transporter;
  } catch (error) {
    console.error('❌ Nodemailer transporter oluşturulamadı:', error);
    throw new Error('E-posta servisi başlatılamadı');
  }
}

export function closeEmailTransporter(): void {
  if (transporter) {
    transporter.close();
    transporter = null;
  }
}

export function validateSMTPConfig(): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!SMTP_CONFIG.auth.user) errors.push('SMTP_USER tanımlı değil');
  if (!SMTP_CONFIG.auth.pass) errors.push('SMTP_PASS tanımlı değil');
  if (!SMTP_CONFIG.host) errors.push('SMTP_HOST tanımlı değil');

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export const EMAIL_FROM = {
  name: process.env.EMAIL_FROM_NAME || 'Proyon AI',
  address: process.env.SMTP_USER || 'noreply@proyon.ai',
};

export const EMAIL_CONFIG = {
  maxRecipientsPerEmail: 50,
  maxAttachmentSize: 25 * 1024 * 1024,
  defaultTimeout: 30000,
  retryAttempts: 3,
  retryDelay: 5000,
};
