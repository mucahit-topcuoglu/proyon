/**
 * E-posta Gönderim Fonksiyonları
 * Proyon AI E-posta Yönetim Sistemi
 */

import { getEmailTransporter, EMAIL_FROM, EMAIL_CONFIG } from './transporter';
import {
  getVerificationEmailTemplate,
  getProjectReportEmailTemplate,
  getSystemAlertEmailTemplate,
  getWelcomeEmailTemplate,
  getPasswordResetEmailTemplate,
} from './templates';
import {
  EmailOptions,
  EmailResult,
  BulkEmailResult,
  VerificationEmailData,
  ProjectReportEmailData,
  SystemAlertEmailData,
  WelcomeEmailData,
  PasswordResetEmailData,
} from './types';

/**
 * Temel E-posta Gönderme Fonksiyonu
 */
export async function sendEmail(options: EmailOptions): Promise<EmailResult> {
  try {
    const transporter = getEmailTransporter();

    // Recipients validation
    const recipients = Array.isArray(options.to) ? options.to : [options.to];
    if (recipients.length > EMAIL_CONFIG.maxRecipientsPerEmail) {
      throw new Error(
        `Maksimum ${EMAIL_CONFIG.maxRecipientsPerEmail} alıcıya e-posta gönderilebilir`
      );
    }

    // Send email
    const info = await transporter.sendMail({
      from: `${EMAIL_FROM.name} <${EMAIL_FROM.address}>`,
      to: options.to,
      cc: options.cc,
      bcc: options.bcc,
      subject: options.subject,
      html: options.html,
      text: options.text,
      attachments: options.attachments,
    });

    console.log('✅ E-posta gönderildi:', info.messageId);

    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Bilinmeyen hata';
    console.error('❌ E-posta gönderilemedi:', errorMessage);

    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Toplu E-posta Gönderimi (allSettled pattern)
 */
export async function sendBulkEmails(
  emailList: EmailOptions[]
): Promise<BulkEmailResult> {
  const results = await Promise.allSettled(
    emailList.map((email) => sendEmail(email))
  );

  const emailResults: EmailResult[] = results.map((result) => {
    if (result.status === 'fulfilled') {
      return result.value;
    } else {
      return {
        success: false,
        error: result.reason?.message || 'Promise rejected',
      };
    }
  });

  const successful = emailResults.filter((r) => r.success).length;
  const failed = emailResults.filter((r) => !r.success).length;

  console.log(
    `📧 Toplu gönderim tamamlandı: ${successful} başarılı, ${failed} başarısız`
  );

  return {
    total: emailList.length,
    successful,
    failed,
    results: emailResults,
  };
}

/**
 * Doğrulama Kodu Gönder
 */
export async function sendVerificationCode(
  data: VerificationEmailData
): Promise<EmailResult> {
  try {
    const template = getVerificationEmailTemplate(data);

    return await sendEmail({
      to: data.to,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });
  } catch (error) {
    console.error('❌ Doğrulama kodu gönderilemedi:', error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Doğrulama kodu gönderilemedi',
    };
  }
}

/**
 * Proje Raporu Gönder
 */
export async function sendProjectReport(
  data: ProjectReportEmailData
): Promise<EmailResult> {
  try {
    const template = getProjectReportEmailTemplate(data);

    return await sendEmail({
      to: data.to,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });
  } catch (error) {
    console.error('❌ Proje raporu gönderilemedi:', error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Proje raporu gönderilemedi',
    };
  }
}

/**
 * Sistem Bildirimi Gönder
 */
export async function sendSystemAlert(
  data: SystemAlertEmailData
): Promise<EmailResult> {
  try {
    const template = getSystemAlertEmailTemplate(data);

    return await sendEmail({
      to: data.to,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });
  } catch (error) {
    console.error('❌ Sistem bildirimi gönderilemedi:', error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Sistem bildirimi gönderilemedi',
    };
  }
}

/**
 * Hoş Geldin E-postası Gönder
 */
export async function sendWelcomeEmail(
  data: WelcomeEmailData
): Promise<EmailResult> {
  try {
    const template = getWelcomeEmailTemplate(data);

    return await sendEmail({
      to: data.to,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });
  } catch (error) {
    console.error('❌ Hoş geldin e-postası gönderilemedi:', error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Hoş geldin e-postası gönderilemedi',
    };
  }
}

/**
 * Şifre Sıfırlama E-postası Gönder
 */
export async function sendPasswordResetEmail(
  data: PasswordResetEmailData
): Promise<EmailResult> {
  try {
    const template = getPasswordResetEmailTemplate(data);

    return await sendEmail({
      to: data.to,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });
  } catch (error) {
    console.error('❌ Şifre sıfırlama e-postası gönderilemedi:', error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Şifre sıfırlama e-postası gönderilemedi',
    };
  }
}

/**
 * Retry mekanizması ile e-posta gönderimi
 */
export async function sendEmailWithRetry(
  options: EmailOptions,
  maxRetries: number = EMAIL_CONFIG.retryAttempts
): Promise<EmailResult> {
  let lastError: Error | undefined;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`📧 E-posta gönderiliyor (Deneme ${attempt}/${maxRetries})...`);
      const result = await sendEmail(options);

      if (result.success) {
        return result;
      }

      lastError = new Error(result.error);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Bilinmeyen hata');
      console.error(`❌ Deneme ${attempt} başarısız:`, lastError.message);
    }

    // Son denemede beklemeden çık
    if (attempt < maxRetries) {
      await new Promise((resolve) =>
        setTimeout(resolve, EMAIL_CONFIG.retryDelay)
      );
    }
  }

  return {
    success: false,
    error: `${maxRetries} denemeden sonra e-posta gönderilemedi: ${lastError?.message}`,
  };
}
