/**
 * E-posta HTML Şablonları
 * Proyön - Profesyonel E-posta Tasarımları
 */

import fs from 'fs';
import path from 'path';
import {
  EmailTemplate,
  VerificationEmailData,
  ProjectReportEmailData,
  SystemAlertEmailData,
  WelcomeEmailData,
  PasswordResetEmailData,
} from './types';

// Logo base64 inline embed - 50KB optimize
let LOGO_BASE64_CACHE: string | null = null;

function getLogoBase64(): string {
  if (LOGO_BASE64_CACHE) return LOGO_BASE64_CACHE;
  
  try {
    const logoPath = path.join(process.cwd(), 'public', 'logo.png');
    const logoBuffer = fs.readFileSync(logoPath);
    LOGO_BASE64_CACHE = `data:image/png;base64,${logoBuffer.toString('base64')}`;
    console.log('✅ Logo inline yüklendi:', Math.round(logoBuffer.length / 1024), 'KB');
    return LOGO_BASE64_CACHE;
  } catch (error) {
    console.error('❌ Logo yüklenemedi:', error);
    return '';
  }
}

/**
 * Temel Email Layout (Logo inline base64)
 */
function getBaseTemplate(content: string): string {
  const logo = getLogoBase64();
  const logoHTML = logo 
    ? `<img src="${logo}" alt="Proyön" style="max-width:200px;height:auto;display:block;margin:0 auto"/>` 
    : `<div style="font-size:32px;font-weight:bold;color:#fff;text-align:center">Proyön</div>`;
    
  return `<!DOCTYPE html><html lang="tr"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>Proyön</title></head><body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;background:#f4f7fa"><div style="max-width:600px;margin:0 auto;background:#fff"><div style="background:linear-gradient(135deg,#3b82f6 0%,#1d4ed8 100%);padding:30px 20px;text-align:center">${logoHTML}</div><div style="padding:40px 30px">${content}</div><div style="background:#f8fafc;padding:30px;text-align:center;border-top:1px solid #e2e8f0;color:#64748b;font-size:14px"><p style="margin:0 0 10px"><strong>Proyön</strong> - Proje Yönetim Platformu</p><p style="margin:10px 0"><a href="https://proyon.com.tr" style="color:#3b82f6;text-decoration:none">Web</a> | <a href="https://proyon.com.tr/docs" style="color:#3b82f6;text-decoration:none">Docs</a> | <a href="https://proyon.com.tr/support" style="color:#3b82f6;text-decoration:none">Destek</a></p><p style="margin:20px 0 0;font-size:12px;color:#94a3b8">© ${new Date().getFullYear()} Proyön</p></div></div></body></html>`;
}

/**
 * Doğrulama Kodu E-postası (Optimize)
 */
export function getVerificationEmailTemplate(
  data: VerificationEmailData
): EmailTemplate {
  const { code, userName, expiresIn = '10 dakika' } = data;

  const content = `
    <h1 style="color:#1e293b;font-size:24px;margin:0 0 16px">👋 Merhaba${userName ? ` ${userName}` : ''}!</h1>
    <p style="font-size:16px;color:#475569;margin:0 0 16px">Proyön platformuna hoş geldiniz! Hesabınızı doğrulamak için aşağıdaki kodu kullanın:</p>
    <div style="background:#f1f5f9;border:2px dashed #3b82f6;border-radius:8px;padding:20px;text-align:center;margin:25px 0">
      <p style="margin:0 0 10px;color:#64748b;font-size:14px">Doğrulama Kodunuz</p>
      <div style="font-size:32px;font-weight:bold;color:#3b82f6;letter-spacing:8px;font-family:monospace">${code}</div>
      <p style="margin:15px 0 0;color:#64748b;font-size:13px">⏱️ Bu kod <strong>${expiresIn}</strong> geçerlidir</p>
    </div>
    <p style="font-size:14px;color:#64748b;margin:25px 0 0">💡 <strong>Not:</strong> Bu kodu kimseyle paylaşmayın.</p>
    <div style="height:1px;background:#e2e8f0;margin:30px 0"></div>
    <p style="font-size:14px;color:#94a3b8;margin:0">Bu e-postayı siz talep etmediyseniz, güvenle görmezden gelebilirsiniz.</p>
  `;

  return {
    subject: 'Proyön - Email Doğrulama',
    html: getBaseTemplate(content),
    text: `Proyön - Doğrulama Kodu\n\nMerhaba${userName ? ` ${userName}` : ''}!\n\nProyön platformuna hoş geldiniz!\n\nDoğrulama kodunuz: ${code}\n\nBu kod ${expiresIn} geçerlidir.\n\nBu kodu kimseyle paylaşmayın.\n\nProyön`,
  };
}

/**
 * Email Doğrulama Link E-postası (Alternatif)
 */
export function getVerificationLinkEmailTemplate(data: {
  userName: string;
  verificationUrl: string;
}): EmailTemplate {
  const { userName, verificationUrl } = data;

  const content = `
    <h1>👋 Merhaba ${userName}!</h1>
    <p style="font-size: 16px;">Proyon AI platformuna hoş geldiniz! Hesabınızı aktifleştirmek için aşağıdaki butona tıklayın:</p>
    
    <div style="text-align: center; margin: 35px 0;">
      <a href="${verificationUrl}" class="button">
        ✅ Email Adresimi Doğrula
      </a>
    </div>
    
    <p style="font-size: 14px; color: #64748b; margin-top: 25px;">
      Buton çalışmıyorsa, aşağıdaki linki tarayıcınıza kopyalayın:
    </p>
    <div style="background-color: #f1f5f9; padding: 15px; border-radius: 6px; margin: 15px 0; word-break: break-all;">
      <a href="${verificationUrl}" style="color: #3b82f6; font-size: 13px;">${verificationUrl}</a>
    </div>
    
    <p style="font-size: 14px; color: #64748b; margin-top: 25px;">
      ⏱️ Bu link <strong>24 saat</strong> geçerlidir.
    </p>
    
    <div class="divider"></div>
    
    <p style="font-size: 14px; color: #94a3b8;">
      Bu e-postayı siz talep etmediyseniz, güvenle görmezden gelebilirsiniz.
    </p>
  `;

  return {
    subject: `Proyon AI - Email Adresinizi Doğrulayın`,
    html: getBaseTemplate(content),
    text: `Proyon AI - Email Doğrulama\n\nMerhaba ${userName}!\n\nProyon AI platformuna hoş geldiniz!\n\nEmail adresinizi doğrulamak için aşağıdaki linke tıklayın:\n${verificationUrl}\n\nBu link 24 saat geçerlidir.\n\nProyon AI`,
  };
}

/**
 * Proje Raporu E-postası
 */
export function getProjectReportEmailTemplate(
  data: ProjectReportEmailData
): EmailTemplate {
  const { projectName, reportSummary, reportUrl, generatedAt } = data;
  const date = generatedAt ? new Date(generatedAt).toLocaleDateString('tr-TR') : new Date().toLocaleDateString('tr-TR');

  const content = `
    <h1>📊 Proje Raporu Hazır</h1>
    <p>Merhaba!</p>
    <p><strong>${projectName}</strong> projeniz için AI destekli analiz raporu oluşturuldu.</p>
    
    <div class="alert alert-info">
      <h2>Rapor Özeti</h2>
      <p>${reportSummary}</p>
    </div>
    
    <p><strong>Oluşturulma Tarihi:</strong> ${date}</p>
    
    ${reportUrl ? `
      <div style="text-align: center;">
        <a href="${reportUrl}" class="button">Raporu Görüntüle</a>
      </div>
    ` : ''}
    
    <div class="divider"></div>
    
    <p style="font-size: 14px; color: #64748b;">
      Proyon AI, projenizi sürekli analiz ederek size en iyi önerileri sunar.
    </p>
  `;

  return {
    subject: `${projectName} - Proje Raporu Hazır`,
    html: getBaseTemplate(content),
    text: `Proje Raporu Hazır\n\n${projectName} projeniz için rapor oluşturuldu.\n\nÖzet: ${reportSummary}\n\n${reportUrl ? `Rapor: ${reportUrl}` : ''}`,
  };
}

/**
 * Sistem Bildirimi E-postası
 */
export function getSystemAlertEmailTemplate(
  data: SystemAlertEmailData
): EmailTemplate {
  const { alertTitle, alertMessage, severity = 'info', actionUrl, actionLabel = 'İncele' } = data;

  const alertClass = `alert-${severity}`;
  const icons = {
    info: 'ℹ️',
    warning: '⚠️',
    critical: '🚨',
  };

  const content = `
    <h1>${icons[severity]} ${alertTitle}</h1>
    
    <div class="alert ${alertClass}">
      <p>${alertMessage}</p>
    </div>
    
    ${actionUrl ? `
      <div style="text-align: center;">
        <a href="${actionUrl}" class="button">${actionLabel}</a>
      </div>
    ` : ''}
    
    <div class="divider"></div>
    
    <p style="font-size: 14px; color: #64748b;">
      Bu otomatik bir bildirimdir. Proyon AI size her zaman en güncel bilgileri sunar.
    </p>
  `;

  return {
    subject: `${icons[severity]} ${alertTitle}`,
    html: getBaseTemplate(content),
    text: `${alertTitle}\n\n${alertMessage}\n\n${actionUrl ? `Link: ${actionUrl}` : ''}`,
  };
}

/**
 * Hoş Geldin E-postası
 */
export function getWelcomeEmailTemplate(
  data: WelcomeEmailData
): EmailTemplate {
  const { userName, loginUrl } = data;

  const content = `
    <h1>🎉 Hoş Geldin ${userName}!</h1>
    <p>Proyon AI ailesine katıldığın için çok mutluyuz!</p>
    
    <p>Proyon AI ile:</p>
    <ul style="padding-left: 20px; margin-bottom: 20px;">
      <li style="margin-bottom: 8px;">✨ AI destekli proje roadmap'leri oluşturabilirsin</li>
      <li style="margin-bottom: 8px;">🤖 Akıllı mentor ile 7/24 destek alabilirsin</li>
      <li style="margin-bottom: 8px;">📊 Projelerin gerçek zamanlı analizini görebilirsin</li>
      <li style="margin-bottom: 8px;">👥 Ekip üyeleriyle işbirliği yapabilirsin</li>
    </ul>
    
    ${loginUrl ? `
      <div style="text-align: center;">
        <a href="${loginUrl}" class="button">Hemen Başla</a>
      </div>
    ` : ''}
    
    <div class="divider"></div>
    
    <p><strong>İpucu:</strong> İlk projenizi oluşturarak Proyon AI'ın gücünü keşfedin!</p>
  `;

  return {
    subject: '🎉 Proyon AI\'a Hoş Geldin!',
    html: getBaseTemplate(content),
    text: `Hoş Geldin ${userName}!\n\nProyon AI ailesine katıldığın için teşekkürler.\n\n${loginUrl ? `Giriş yap: ${loginUrl}` : ''}`,
  };
}

/**
 * Şifre Sıfırlama E-postası
 */
export function getPasswordResetEmailTemplate(
  data: PasswordResetEmailData
): EmailTemplate {
  const { userName, resetUrl, expiresIn = '1 saat' } = data;

  const content = `
    <h1>🔐 Şifre Sıfırlama Talebi</h1>
    <p>Merhaba ${userName},</p>
    <p>Hesabınız için şifre sıfırlama talebinde bulundunuz.</p>
    
    <div style="text-align: center;">
      <a href="${resetUrl}" class="button">Şifremi Sıfırla</a>
    </div>
    
    <p><strong>Önemli:</strong> Bu link ${expiresIn} içinde geçerliliğini yitirecektir.</p>
    
    <div class="divider"></div>
    
    <div class="alert alert-warning">
      <p><strong>⚠️ Güvenlik Uyarısı</strong></p>
      <p>Bu talebi siz yapmadıysanız, lütfen bu e-postayı dikkate almayın ve hesabınızın güvenliğini kontrol edin.</p>
    </div>
  `;

  return {
    subject: '🔐 Şifre Sıfırlama Talebi - Proyon AI',
    html: getBaseTemplate(content),
    text: `Şifre Sıfırlama\n\nMerhaba ${userName},\n\nŞifrenizi sıfırlamak için: ${resetUrl}\n\nBu link ${expiresIn} içinde geçerliliğini yitirecektir.`,
  };
}
