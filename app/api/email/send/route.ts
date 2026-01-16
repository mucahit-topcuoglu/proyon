/**
 * E-posta API Endpoint
 * Proyon AI - Güvenli E-posta Gönderim Servisi
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  sendEmail,
  sendVerificationCode,
  sendProjectReport,
  sendSystemAlert,
  sendWelcomeEmail,
  sendPasswordResetEmail,
} from '@/lib/email/actions';
import { validateSMTPConfig } from '@/lib/email/transporter';

/**
 * E-posta Gönderim API Endpoint
 * POST /api/email/send
 */
export async function POST(request: NextRequest) {
  try {
    // SMTP yapılandırmasını kontrol et
    const smtpValidation = validateSMTPConfig();
    if (!smtpValidation.isValid) {
      return NextResponse.json(
        {
          success: false,
          error: 'SMTP yapılandırması eksik',
          details: smtpValidation.errors,
        },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { type, data } = body;

    // Tip kontrolü
    if (!type || !data) {
      return NextResponse.json(
        {
          success: false,
          error: 'Geçersiz istek formatı. type ve data gerekli.',
        },
        { status: 400 }
      );
    }

    // E-posta gönderim tipine göre işlem yap
    let result;

    switch (type) {
      case 'custom':
        // Özel e-posta gönderimi
        if (!data.to || !data.subject || !data.html) {
          return NextResponse.json(
            {
              success: false,
              error: 'to, subject ve html alanları gerekli',
            },
            { status: 400 }
          );
        }
        result = await sendEmail(data);
        break;

      case 'verification':
        // Doğrulama kodu e-postası
        if (!data.to || !data.code) {
          return NextResponse.json(
            {
              success: false,
              error: 'to ve code alanları gerekli',
            },
            { status: 400 }
          );
        }
        result = await sendVerificationCode(data);
        break;

      case 'project-report':
        // Proje raporu e-postası
        if (!data.to || !data.projectName || !data.reportSummary) {
          return NextResponse.json(
            {
              success: false,
              error: 'to, projectName ve reportSummary alanları gerekli',
            },
            { status: 400 }
          );
        }
        result = await sendProjectReport(data);
        break;

      case 'system-alert':
        // Sistem bildirimi e-postası
        if (!data.to || !data.alertTitle || !data.alertMessage) {
          return NextResponse.json(
            {
              success: false,
              error: 'to, alertTitle ve alertMessage alanları gerekli',
            },
            { status: 400 }
          );
        }
        result = await sendSystemAlert(data);
        break;

      case 'welcome':
        // Hoş geldin e-postası
        if (!data.to || !data.userName) {
          return NextResponse.json(
            {
              success: false,
              error: 'to ve userName alanları gerekli',
            },
            { status: 400 }
          );
        }
        result = await sendWelcomeEmail(data);
        break;

      case 'password-reset':
        // Şifre sıfırlama e-postası
        if (!data.to || !data.userName || !data.resetToken || !data.resetUrl) {
          return NextResponse.json(
            {
              success: false,
              error: 'to, userName, resetToken ve resetUrl alanları gerekli',
            },
            { status: 400 }
          );
        }
        result = await sendPasswordResetEmail(data);
        break;

      default:
        return NextResponse.json(
          {
            success: false,
            error: `Geçersiz e-posta tipi: ${type}`,
            availableTypes: [
              'custom',
              'verification',
              'project-report',
              'system-alert',
              'welcome',
              'password-reset',
            ],
          },
          { status: 400 }
        );
    }

    // Sonucu döndür
    if (result.success) {
      return NextResponse.json(
        {
          success: true,
          messageId: result.messageId,
          message: 'E-posta başarıyla gönderildi',
        },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        {
          success: false,
          error: result.error,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('❌ API Hatası:', error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'E-posta gönderilirken bir hata oluştu',
      },
      { status: 500 }
    );
  }
}

/**
 * Health Check Endpoint
 * GET /api/email/send
 */
export async function GET() {
  const smtpValidation = validateSMTPConfig();

  return NextResponse.json({
    status: smtpValidation.isValid ? 'healthy' : 'misconfigured',
    smtp: {
      configured: smtpValidation.isValid,
      errors: smtpValidation.errors,
    },
    availableTypes: [
      'custom',
      'verification',
      'project-report',
      'system-alert',
      'welcome',
      'password-reset',
    ],
    usage: {
      endpoint: '/api/email/send',
      method: 'POST',
      bodyFormat: {
        type: 'string (e-posta tipi)',
        data: 'object (e-posta verisi)',
      },
    },
  });
}
