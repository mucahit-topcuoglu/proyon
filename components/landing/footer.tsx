import Link from 'next/link';
import Image from 'next/image';
import { GradientText } from '@/components/proyon';
import { Github, Linkedin, Twitter, Mail } from 'lucide-react';

const footerLinks = {
  product: [
    { label: 'Özellikler', href: '/#features' },
    { label: 'Fiyatlandırma', href: '/pricing' },
    { label: 'Demo', href: '/demo' },
    { label: 'Referanslar', href: '/#testimonials' },
  ],
  company: [
    { label: 'Hakkımızda', href: '/about' },
    { label: 'Kariyer', href: '/careers' },
    { label: 'Blog', href: '/blog' },
    { label: 'İletişim', href: '/contact' },
  ],
  resources: [
    { label: 'Dokümantasyon', href: '/docs' },
    { label: 'API', href: '/api-docs' },
    { label: 'Destek', href: '/support' },
    { label: 'Durum', href: '/status' },
  ],
  legal: [
    { label: 'Gizlilik Politikası', href: '/privacy' },
    { label: 'Kullanım Koşulları', href: '/terms' },
    { label: 'KVKK', href: '/kvkk' },
    { label: 'Güvenlik', href: '/security' },
  ],
};

const socialLinks = [
  { icon: Twitter, href: 'https://twitter.com/proyon', label: 'Twitter' },
  { icon: Github, href: 'https://github.com/mucahit-topcuoglu/proyon', label: 'GitHub' },
  { icon: Linkedin, href: 'https://linkedin.com/company/proyon', label: 'LinkedIn' },
  { icon: Mail, href: 'mailto:hello@proyon.com', label: 'Email' },
];

export function Footer() {
  return (
    <footer className="border-t border-border/50 bg-muted/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-16 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
          {/* Brand Column */}
          <div className="col-span-2">
            <Link href="/" className="inline-block mb-4">
              <Image 
                src="/logo2.png" 
                alt="ProYön Logo" 
                width={180} 
                height={48} 
                className="h-12 w-auto"
              />
            </Link>
            <p className="text-sm text-muted-foreground mb-6 max-w-xs">
              Enterprise-grade proje yönetim platformu. Yapay zeka destekli, güvenli ve ölçeklenebilir.
            </p>
            <div className="flex items-center gap-4">
              {socialLinks.map((social) => (
                <Link
                  key={social.label}
                  href={social.href}
                  className="w-10 h-10 rounded-full bg-muted hover:bg-primary/10 flex items-center justify-center transition-all hover:scale-110"
                  aria-label={social.label}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <social.icon className="w-5 h-5 text-muted-foreground hover:text-primary transition-colors" />
                </Link>
              ))}
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="font-semibold mb-4 text-sm uppercase tracking-wide">Ürün</h3>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="font-semibold mb-4 text-sm uppercase tracking-wide">Şirket</h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources Links */}
          <div>
            <h3 className="font-semibold mb-4 text-sm uppercase tracking-wide">Kaynaklar</h3>
            <ul className="space-y-3">
              {footerLinks.resources.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="font-semibold mb-4 text-sm uppercase tracking-wide">Yasal</h3>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="py-8 border-t border-border/50">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground text-center md:text-left">
              © {new Date().getFullYear()} ProYön. Tüm hakları saklıdır.
            </p>
            <div className="flex items-center gap-6 text-xs text-muted-foreground">
              <span className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                Sistem Durumu: Çalışıyor
              </span>
              <span>Made with ❤️ in Turkey</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
