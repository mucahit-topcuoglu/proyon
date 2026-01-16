/**
 * Test Email Helper - Ethereal Email ile Test
 * Geliştirme aşamasında kullanın
 */

import nodemailer from 'nodemailer';

export async function createTestEmailAccount() {
  // Ethereal Email ile test hesabı oluştur
  const testAccount = await nodemailer.createTestAccount();
  
  console.log('📧 Test Email Hesabı Oluşturuldu:');
  console.log('Email:', testAccount.user);
  console.log('Şifre:', testAccount.pass);
  console.log('SMTP:', testAccount.smtp.host);
  
  return {
    user: testAccount.user,
    pass: testAccount.pass,
    host: testAccount.smtp.host,
    port: testAccount.smtp.port,
  };
}

// Test için kullanım
if (require.main === module) {
  createTestEmailAccount().then(account => {
    console.log('\n.env.local için:');
    console.log(`SMTP_HOST=${account.host}`);
    console.log(`SMTP_PORT=${account.port}`);
    console.log(`SMTP_USER=${account.user}`);
    console.log(`SMTP_PASS=${account.pass}`);
  });
}
