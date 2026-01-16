// ============================================================================
// EMAIL SERVICE - NODEMAILER SMTP
// ============================================================================

import nodemailer from 'nodemailer';
import type { PlanType } from '@/lib/constants/pricing';
import { getPlanDisplayName } from '@/lib/constants/pricing';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const FROM_EMAIL = process.env.SMTP_FROM || 'noreply@proyon.app';
const SITE_NAME = 'Proyon';

// ============================================================================
// EMAIL TEMPLATES
// ============================================================================

interface PaymentSuccessData {
  plan: PlanType;
  amount: number;
  currency: 'TRY' | 'USD';
  expiryDate: Date;
  daysGranted?: number;
  isRecurring: boolean;
}

export async function sendPaymentSuccessEmail(
  to: string,
  data: PaymentSuccessData
): Promise<boolean> {
  const planName = getPlanDisplayName(data.plan);
  const formattedAmount = data.currency === 'TRY' 
    ? `${data.amount}₺` 
    : `$${data.amount}`;
  const formattedDate = data.expiryDate.toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Ödeme Başarılı</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px;">🎉 Ödeme Başarılı!</h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <p style="font-size: 16px; color: #374151; margin: 0 0 24px;">
                Merhaba,
              </p>
              <p style="font-size: 16px; color: #374151; margin: 0 0 24px;">
                <strong>${SITE_NAME} ${planName}</strong> planı için ödemeniz başarıyla alındı.
              </p>
              
              <!-- Order Details -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; border-radius: 8px; margin: 24px 0;">
                <tr>
                  <td style="padding: 24px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Plan</td>
                        <td style="padding: 8px 0; color: #111827; font-size: 14px; text-align: right; font-weight: 600;">${planName}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Tutar</td>
                        <td style="padding: 8px 0; color: #111827; font-size: 14px; text-align: right; font-weight: 600;">${formattedAmount}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">${data.isRecurring ? 'Sonraki Yenileme' : 'Geçerlilik Sonu'}</td>
                        <td style="padding: 8px 0; color: #111827; font-size: 14px; text-align: right; font-weight: 600;">${formattedDate}</td>
                      </tr>
                      ${data.daysGranted ? `
                      <tr>
                        <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Süre</td>
                        <td style="padding: 8px 0; color: #111827; font-size: 14px; text-align: right; font-weight: 600;">${data.daysGranted} Gün</td>
                      </tr>
                      ` : ''}
                    </table>
                  </td>
                </tr>
              </table>
              
              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 24px 0;">
                    <a href="${process.env.NEXT_PUBLIC_SITE_URL}/dashboard" 
                       style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                      Dashboard'a Git
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="font-size: 14px; color: #6b7280; margin: 24px 0 0; text-align: center;">
                Sorularınız için <a href="${process.env.NEXT_PUBLIC_SITE_URL}/support" style="color: #10b981;">destek</a> sayfamızı ziyaret edin.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 24px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="font-size: 12px; color: #9ca3af; margin: 0;">
                © ${new Date().getFullYear()} ${SITE_NAME}. Tüm hakları saklıdır.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  try {
    await transporter.sendMail({
      from: `"${SITE_NAME}" <${FROM_EMAIL}>`,
      to,
      subject: `✅ ${SITE_NAME} ${planName} - Ödeme Başarılı`,
      html,
    });
    return true;
  } catch (error) {
    console.error('[EMAIL] Failed to send payment success email:', error);
    return false;
  }
}

export async function sendSubscriptionExpiringEmail(
  to: string,
  data: { plan: PlanType; daysLeft: number; expiryDate: Date }
): Promise<boolean> {
  const planName = getPlanDisplayName(data.plan);
  const formattedDate = data.expiryDate.toLocaleDateString('tr-TR');

  try {
    await transporter.sendMail({
      from: `"${SITE_NAME}" <${FROM_EMAIL}>`,
      to,
      subject: `⚠️ ${SITE_NAME} ${planName} - ${data.daysLeft} Gün Kaldı`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Aboneliğiniz Yakında Sona Eriyor</h2>
          <p>${planName} planınızın süresi <strong>${formattedDate}</strong> tarihinde dolacak.</p>
          <p>Kesintisiz hizmet için yenilemeyi unutmayın.</p>
          <a href="${process.env.NEXT_PUBLIC_SITE_URL}/pricing" 
             style="display: inline-block; background: #10b981; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none;">
            Planı Yenile
          </a>
        </div>
      `,
    });
    return true;
  } catch (error) {
    console.error('[EMAIL] Failed to send expiring email:', error);
    return false;
  }
}

export async function sendWelcomeEmail(to: string, name?: string): Promise<boolean> {
  try {
    await transporter.sendMail({
      from: `"${SITE_NAME}" <${FROM_EMAIL}>`,
      to,
      subject: `🎉 ${SITE_NAME}'a Hoş Geldiniz!`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Hoş Geldiniz${name ? `, ${name}` : ''}!</h2>
          <p>${SITE_NAME} ailesine katıldığınız için teşekkürler.</p>
          <p>Hemen projelerinizi oluşturmaya başlayabilirsiniz.</p>
          <a href="${process.env.NEXT_PUBLIC_SITE_URL}/dashboard" 
             style="display: inline-block; background: #10b981; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none;">
            Başla
          </a>
        </div>
      `,
    });
    return true;
  } catch (error) {
    console.error('[EMAIL] Failed to send welcome email:', error);
    return false;
  }
}
