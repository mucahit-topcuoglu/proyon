/**
 * E-posta Sistem Tip Tanımlamaları
 * Proyon E-posta Yönetim Sistemi
 */

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  cc?: string | string[];
  bcc?: string | string[];
  attachments?: EmailAttachment[];
}

export interface EmailAttachment {
  filename: string;
  content?: string | Buffer;
  path?: string;
  contentType?: string;
  encoding?: string;
}

export interface EmailTemplate {
  subject: string;
  html: string;
  text?: string;
}

export interface VerificationEmailData {
  to: string;
  code: string;
  userName?: string;
  expiresIn?: string;
}

export interface ProjectReportEmailData {
  to: string;
  projectName: string;
  reportSummary: string;
  reportUrl?: string;
  generatedAt?: Date;
}

export interface SystemAlertEmailData {
  to: string | string[];
  alertTitle: string;
  alertMessage: string;
  severity?: 'info' | 'warning' | 'critical';
  actionUrl?: string;
  actionLabel?: string;
}

export interface WelcomeEmailData {
  to: string;
  userName: string;
  loginUrl?: string;
}

export interface PasswordResetEmailData {
  to: string;
  userName: string;
  resetToken: string;
  resetUrl: string;
  expiresIn?: string;
}

export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export interface BulkEmailResult {
  total: number;
  successful: number;
  failed: number;
  results: EmailResult[];
}
