import type { MemberRole } from '@/types';
import { MemberRole as MemberRoleEnum } from '@/types';

export interface InvitationEmailData {
  inviterName: string;
  inviterEmail: string;
  projectTitle: string;
  projectDescription?: string;
  role: MemberRole;
  categories: string[];
  invitationUrl: string;
  expiresAt: Date;
  isNewUser: boolean;
}

// Cache logo to avoid reading file multiple times
let cachedLogoBase64: string | null = null;

function getLogoBase64(): string {
  if (cachedLogoBase64) return cachedLogoBase64;
  
  // SVG logo as base64
  const logoSvg = `<svg width="120" height="120" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#3b82f6;stop-opacity:1" />
        <stop offset="100%" style="stop-color:#1d4ed8;stop-opacity:1" />
      </linearGradient>
    </defs>
    <circle cx="100" cy="100" r="95" fill="url(#grad1)"/>
    <path d="M100 50 L130 90 L115 90 L115 150 L85 150 L85 90 L70 90 Z" fill="white"/>
    <circle cx="100" cy="140" r="8" fill="white"/>
  </svg>`;
  
  cachedLogoBase64 = `data:image/svg+xml;base64,${Buffer.from(logoSvg).toString('base64')}`;
  return cachedLogoBase64;
}

function getBaseTemplate(content: string): string {
  const logoBase64 = getLogoBase64();
  // Use production domain directly
  const baseUrl = process.env.NODE_ENV === 'production'
    ? 'https://y-beta-beryl.vercel.app'
    : (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000');
  
  return `
    <!DOCTYPE html>
    <html lang="tr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Proyön - Proje Davetiyesi</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6; line-height: 1.6;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 20px;">
        <tr>
          <td align="center">
            <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
              <!-- Header with gradient -->
              <tr>
                <td style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); padding: 40px 20px; text-align: center;">
                  <img src="${logoBase64}" alt="Proyön Logo" width="80" height="80" style="display: block; margin: 0 auto 20px; border-radius: 16px;">
                  <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">Proyön</h1>
                  <p style="margin: 8px 0 0; color: rgba(255, 255, 255, 0.9); font-size: 16px;">AI Destekli Proje Yönetimi</p>
                </td>
              </tr>
              <!-- Content -->
              ${content}
              <!-- Footer -->
              <tr>
                <td style="background-color: #f9fafb; padding: 30px 40px; text-align: center; border-top: 1px solid #e5e7eb;">
                  <p style="margin: 0 0 12px; color: #6b7280; font-size: 14px;">
                    <a href="${baseUrl}" style="color: #3b82f6; text-decoration: none; margin: 0 8px;">Ana Sayfa</a>
                    <span style="color: #d1d5db;">•</span>
                    <a href="${baseUrl}/dashboard" style="color: #3b82f6; text-decoration: none; margin: 0 8px;">Dashboard</a>
                    <span style="color: #d1d5db;">•</span>
                    <a href="${baseUrl}/docs" style="color: #3b82f6; text-decoration: none; margin: 0 8px;">Dokümantasyon</a>
                  </p>
                  <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                    © ${new Date().getFullYear()} Proyön. Tüm hakları saklıdır.
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
}

export function getInvitationEmailTemplate(data: InvitationEmailData) {
  const roleText = data.role === MemberRoleEnum.EDITOR ? 'Düzenleyici' : 'Görüntüleyici';
  const roleBadgeColor = data.role === MemberRoleEnum.EDITOR ? '#22c55e' : '#3b82f6';
  
  const categoryList = data.categories.length > 0
    ? `<ul style="margin: 0; padding-left: 20px; color: #4b5563;">${data.categories.map(cat => `<li style="margin: 4px 0;">${cat}</li>`).join('')}</ul>`
    : '<p style="margin: 0; color: #22c55e; font-weight: 500;">✅ Tüm kategorilere erişim</p>';

  const expiresText = new Date(data.expiresAt).toLocaleDateString('tr-TR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const content = `
    <tr>
      <td style="padding: 40px;">
        <h2 style="margin: 0 0 24px; color: #111827; font-size: 24px; font-weight: 700;">📬 Proje Davetiyesi</h2>
        
        <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 16px; margin-bottom: 24px; border-radius: 4px;">
          <p style="margin: 0; color: #1e40af; font-size: 15px;">
            <strong>${data.inviterName}</strong> sizi bir projeye davet etti!
          </p>
        </div>

        <div style="margin-bottom: 24px;">
          <h3 style="margin: 0 0 8px; color: #111827; font-size: 20px; font-weight: 600;">${data.projectTitle}</h3>
          ${data.projectDescription ? `<p style="margin: 0; color: #6b7280; font-size: 14px;">${data.projectDescription}</p>` : ''}
        </div>

        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
          <tr>
            <td style="padding: 16px; background-color: #f9fafb; border-radius: 8px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding-bottom: 12px;">
                    <p style="margin: 0; color: #6b7280; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Rolünüz</p>
                  </td>
                </tr>
                <tr>
                  <td>
                    <span style="display: inline-block; background-color: ${roleBadgeColor}; color: #ffffff; padding: 6px 12px; border-radius: 6px; font-size: 14px; font-weight: 600;">
                      ${roleText}
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>

        ${data.categories.length > 0 ? `
          <div style="margin-bottom: 24px;">
            <p style="margin: 0 0 8px; color: #6b7280; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Erişebildiğiniz Kategoriler</p>
            ${categoryList}
          </div>
        ` : `
          <div style="margin-bottom: 24px; padding: 12px; background-color: #f0fdf4; border-radius: 8px;">
            ${categoryList}
          </div>
        `}

        <table width="100%" cellpadding="0" cellspacing="0" style="margin: 32px 0;">
          <tr>
            <td align="center">
              <a href="${data.invitationUrl}" style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 6px rgba(59, 130, 246, 0.3);">
                ${data.isNewUser ? '✨ Kayıt Ol ve Daveti Kabul Et' : '✅ Daveti Kabul Et'}
              </a>
            </td>
          </tr>
        </table>

        <div style="background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 16px; margin-top: 24px;">
          <p style="margin: 0; color: #991b1b; font-size: 13px;">
            ⏰ <strong>Dikkat:</strong> Bu davet <strong>${expiresText}</strong> tarihine kadar geçerlidir.
          </p>
        </div>
      </td>
    </tr>
  `;

  return {
    subject: `${data.inviterName} sizi "${data.projectTitle}" projesine davet etti`,
    html: getBaseTemplate(content),
    text: `
${data.inviterName} sizi "${data.projectTitle}" projesine davet etti!

Rolünüz: ${roleText}
${data.categories.length > 0 ? `Kategoriler: ${data.categories.join(', ')}` : 'Tüm kategorilere erişim'}

Daveti kabul etmek için: ${data.invitationUrl}

Bu davet ${expiresText} tarihine kadar geçerlidir.
    `.trim(),
  };
}
