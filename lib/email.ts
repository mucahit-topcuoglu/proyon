import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

interface SendInvitationEmailParams {
  to: string;
  projectName: string;
  inviterName: string;
  invitationUrl: string;
  role: string;
}

export async function sendInvitationEmail({
  to,
  projectName,
  inviterName,
  invitationUrl,
  role,
}: SendInvitationEmailParams) {
  try {
    // In development mode, Resend free plan only allows sending to your own email
    // You can change this to the actual recipient email once you verify a domain
    const isDevelopment = process.env.NODE_ENV === 'development';
    const recipientEmail = isDevelopment ? 'mmucahittopcuoglu@gmail.com' : to;
    
    const { data, error } = await resend.emails.send({
      from: 'Proyon <onboarding@resend.dev>', // Using resend.dev for development
      to: [recipientEmail],
      subject: `${inviterName} sizi ${projectName} projesine davet etti${isDevelopment ? ` (Gerçek alıcı: ${to})` : ''}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
              }
              .container {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                border-radius: 10px;
                padding: 40px;
                color: white;
              }
              .button {
                display: inline-block;
                padding: 14px 28px;
                background: white;
                color: #667eea;
                text-decoration: none;
                border-radius: 8px;
                font-weight: 600;
                margin: 20px 0;
              }
              .footer {
                margin-top: 40px;
                padding-top: 20px;
                border-top: 1px solid rgba(255,255,255,0.2);
                font-size: 14px;
                opacity: 0.8;
              }
              .badge {
                display: inline-block;
                background: rgba(255,255,255,0.2);
                padding: 4px 12px;
                border-radius: 20px;
                font-size: 12px;
                margin-top: 10px;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>🎯 Proje Daveti</h1>
              ${isDevelopment ? `<p style="background: rgba(255,255,255,0.2); padding: 10px; border-radius: 5px; font-size: 14px;"><strong>⚠️ TEST MODU:</strong> Bu email gerçekte <strong>${to}</strong> adresine gönderilecekti.</p>` : ''}
              <p style="font-size: 18px;">
                Merhaba!
              </p>
              <p>
                <strong>${inviterName}</strong> sizi <strong>${projectName}</strong> projesine davet etti.
              </p>
              <div class="badge">
                Rol: ${role === 'editor' ? 'Editor (Düzenleyebilir)' : 'Viewer (Görüntüleyebilir)'}
              </div>
              
              <p style="margin-top: 30px;">
                Daveti kabul etmek için aşağıdaki butona tıklayın:
              </p>
              
              <a href="${invitationUrl}" class="button">
                Daveti Kabul Et
              </a>
              
              <p style="font-size: 14px; margin-top: 20px;">
                Veya bu linki kopyalayıp tarayıcınıza yapıştırın:<br>
                <span style="background: rgba(255,255,255,0.1); padding: 8px; border-radius: 4px; font-family: monospace; font-size: 12px; word-break: break-all;">
                  ${invitationUrl}
                </span>
              </p>
              
              <div class="footer">
                <p>
                  ⚠️ <strong>Önemli:</strong> Bu davet sadece <strong>${to}</strong> e-posta adresine gönderilmiştir. 
                  Daveti kabul etmek için bu e-posta adresiyle giriş yapmanız gerekmektedir.
                </p>
                <p style="margin-top: 10px;">
                  Bu davet 7 gün içinde geçerlidir.
                </p>
                <p style="margin-top: 20px; font-size: 12px;">
                  Eğer bu daveti siz talep etmediyseniz, bu e-postayı güvenle yok sayabilirsiniz.
                </p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    if (error) {
      console.error('❌ Email gönderme hatası:', error);
      return { success: false, error: error.message };
    }

    console.log('✅ Davet emaili gönderildi:', to);
    return { success: true, data };
  } catch (error: any) {
    console.error('❌ Email gönderme hatası:', error);
    return { success: false, error: error.message };
  }
}
