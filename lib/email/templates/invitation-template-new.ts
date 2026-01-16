/**
 * Project Invitation Email Template
 * Uses same design as verification email
 */

import fs from 'fs';
import path from 'path';
import type { MemberRole } from '@/types';

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

// Logo base64 inline embed
let LOGO_BASE64_CACHE: string | null = null;

function getLogoBase64(): string {
  if (LOGO_BASE64_CACHE) return LOGO_BASE64_CACHE;
  
  try {
    const logoPath = path.join(process.cwd(), 'public', 'logo.png');
    const logoBuffer = fs.readFileSync(logoPath);
    LOGO_BASE64_CACHE = `data:image/png;base64,${logoBuffer.toString('base64')}`;
    return LOGO_BASE64_CACHE;
  } catch (error) {
    console.error('❌ Logo yüklenemedi:', error);
    return '';
  }
}

/**
 * Base email template (same as verification email)
 */
function getBaseTemplate(content: string): string {
  const logo = getLogoBase64();
  const logoHTML = logo 
    ? `<img src="${logo}" alt="Proyön" style="max-width:200px;height:auto;display:block;margin:0 auto"/>` 
    : `<div style="font-size:32px;font-weight:bold;color:#fff;text-align:center">Proyön</div>`;
    
  return `<!DOCTYPE html><html lang="tr"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>Proyön</title></head><body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;background:#f4f7fa"><div style="max-width:600px;margin:0 auto;background:#fff"><div style="background:linear-gradient(135deg,#3b82f6 0%,#1d4ed8 100%);padding:30px 20px;text-align:center">${logoHTML}</div><div style="padding:40px 30px">${content}</div><div style="background:#f8fafc;padding:30px;text-align:center;border-top:1px solid #e2e8f0;color:#64748b;font-size:14px"><p style="margin:0 0 10px"><strong>Proyön</strong> - Proje Yönetim Platformu</p><p style="margin:10px 0"><a href="https://proyon.com.tr" style="color:#3b82f6;text-decoration:none">Web</a> | <a href="https://proyon.com.tr/docs" style="color:#3b82f6;text-decoration:none">Docs</a> | <a href="https://proyon.com.tr/support" style="color:#3b82f6;text-decoration:none">Destek</a></p><p style="margin:20px 0 0;font-size:12px;color:#94a3b8">© ${new Date().getFullYear()} Proyön</p></div></div></body></html>`;
}

export function getInvitationEmailTemplate(data: InvitationEmailData) {
  const {
    inviterName,
    projectTitle,
    projectDescription,
    role,
    categories,
    invitationUrl,
    expiresAt,
    isNewUser,
  } = data;

  const roleText = role === 'editor' ? 'Düzenleyici' : 'Görüntüleyici';
  const expiryText = expiresAt.toLocaleDateString('tr-TR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  // Category list
  let categoryHTML = '';
  if (categories.length > 0) {
    categoryHTML = `
      <p style="font-size:14px;color:#475569;margin:15px 0 5px"><strong>Erişebileceğiniz kategoriler:</strong></p>
      <ul style="margin:5px 0;padding-left:20px;color:#64748b;font-size:14px">
        ${categories.map(cat => `<li style="margin:5px 0">${cat}</li>`).join('')}
      </ul>
    `;
  } else {
    categoryHTML = `<p style="font-size:14px;color:#22c55e;margin:15px 0">✅ Tüm kategorilere erişim</p>`;
  }

  const content = `
    <h1 style="color:#1e293b;font-size:24px;margin:0 0 16px">🎯 Proje Davetiyesi</h1>
    <p style="font-size:16px;color:#475569;margin:0 0 16px"><strong>${inviterName}</strong> sizi <strong>${projectTitle}</strong> projesine davet etti!</p>
    ${projectDescription ? `<p style="font-size:14px;color:#64748b;margin:0 0 20px;font-style:italic">"${projectDescription}"</p>` : ''}
    
    <div style="background:#f1f5f9;border-left:4px solid #3b82f6;border-radius:8px;padding:20px;margin:25px 0">
      <p style="margin:0 0 10px;color:#64748b;font-size:14px"><strong>Rolünüz:</strong></p>
      <div style="display:inline-block;background:${role === 'editor' ? '#22c55e' : '#3b82f6'};color:#fff;padding:6px 16px;border-radius:6px;font-weight:600;font-size:14px">${roleText}</div>
      ${categoryHTML}
    </div>

    <div style="text-align:center;margin:30px 0">
      <a href="${invitationUrl}" style="display:inline-block;background:#3b82f6;color:#fff;text-decoration:none;padding:14px 32px;border-radius:8px;font-weight:600;font-size:16px;box-shadow:0 4px 12px rgba(59,130,246,0.3)">
        ${isNewUser ? '✨ Kayıt Ol ve Daveti Kabul Et' : '✅ Daveti Kabul Et'}
      </a>
    </div>

    <p style="font-size:13px;color:#94a3b8;text-align:center;margin:20px 0">Veya bu linki tarayıcınıza kopyalayın:</p>
    <div style="background:#f1f5f9;padding:12px;border-radius:6px;word-break:break-all;text-align:center">
      <a href="${invitationUrl}" style="color:#3b82f6;font-size:12px;text-decoration:none">${invitationUrl}</a>
    </div>

    <div style="background:#fef2f2;border-left:4px solid #ef4444;padding:15px;border-radius:6px;margin:25px 0">
      <p style="margin:0;color:#7f1d1d;font-size:14px">
        <strong>⏱️ Önemli:</strong> Bu davet <strong>${expiryText}</strong> tarihine kadar geçerlidir.
      </p>
    </div>

    <div style="height:1px;background:#e2e8f0;margin:30px 0"></div>
    
    <p style="font-size:14px;color:#94a3b8;margin:0">Bu davetiyeyi siz talep etmediyseniz, güvenle görmezden gelebilirsiniz.</p>
  `;

  // Plain text version
  const textContent = `
Proyön - Proje Davetiyesi

${inviterName} sizi "${projectTitle}" projesine davet etti!

${projectDescription ? `"${projectDescription}"\n\n` : ''}

Rolünüz: ${roleText}

${categories.length > 0 ? `Erişebileceğiniz kategoriler:\n${categories.map(cat => `- ${cat}`).join('\n')}` : '✅ Tüm kategorilere erişim'}

Daveti kabul etmek için aşağıdaki linke tıklayın:
${invitationUrl}

⏱️ Bu davet ${expiryText} tarihine kadar geçerlidir.

Bu davetiyeyi siz talep etmediyseniz, güvenle görmezden gelebilirsiniz.

---
Proyön - Proje Yönetim Platformu
© ${new Date().getFullYear()}
  `.trim();

  return {
    subject: `🎯 ${inviterName} sizi "${projectTitle}" projesine davet etti`,
    html: getBaseTemplate(content),
    text: textContent,
  };
}
