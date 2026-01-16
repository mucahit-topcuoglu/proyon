'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GradientText } from '@/components/proyon';
import { Navbar, Footer } from '@/components/landing';
import {
  Code,
  Key,
  Database,
  AlertTriangle,
  Copy,
  Check,
  Terminal,
  Lock,
  Zap,
  ArrowRight,
  FileCode,
  Globe,
  Settings,
} from 'lucide-react';

export default function ApiDocsPage() {
  const [activeTab, setActiveTab] = useState('authentication');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyToClipboard = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-24 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.02]" />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-purple-500/5" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex mb-6">
            <Badge className="bg-primary/10 text-primary border-primary/20 px-4 py-2 text-sm font-medium">
              <Code className="w-3.5 h-3.5 mr-2" />
              API Dokümantasyonu
            </Badge>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            ProYön API ile{' '}
            <GradientText className="block mt-2">
              Entegrasyon Yapın
            </GradientText>
          </h1>

          <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto mb-12">
            RESTful API ile ProYön'ü kendi uygulamalarınıza entegre edin.
            Güçlü, güvenli ve kolay kullanımlı.
          </p>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
            {[
              { label: 'Endpoints', value: '25+' },
              { label: 'Uptime', value: '99.9%' },
              { label: 'Response', value: '<100ms' },
              { label: 'Rate Limit', value: '1000/h' },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-primary mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* API Documentation */}
      <section className="relative py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 mb-12 h-auto p-1 bg-muted/50">
              <TabsTrigger
                value="authentication"
                className="flex flex-col items-center gap-2 py-3 px-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <Key className="w-5 h-5" />
                <span className="text-xs font-medium">Kimlik Doğrulama</span>
              </TabsTrigger>
              <TabsTrigger
                value="endpoints"
                className="flex flex-col items-center gap-2 py-3 px-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <Database className="w-5 h-5" />
                <span className="text-xs font-medium">Endpoints</span>
              </TabsTrigger>
              <TabsTrigger
                value="errors"
                className="flex flex-col items-center gap-2 py-3 px-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <AlertTriangle className="w-5 h-5" />
                <span className="text-xs font-medium">Hata Kodları</span>
              </TabsTrigger>
              <TabsTrigger
                value="examples"
                className="flex flex-col items-center gap-2 py-3 px-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <FileCode className="w-5 h-5" />
                <span className="text-xs font-medium">Kod Örnekleri</span>
              </TabsTrigger>
            </TabsList>

            {/* Authentication Tab */}
            <TabsContent value="authentication" className="mt-0">
              <div className="max-w-4xl mx-auto">
                <div className="mb-12 text-center">
                  <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                    Kimlik Doğrulama
                  </h2>
                  <p className="text-lg text-muted-foreground">
                    API anahtarınızı alın ve güvenli şekilde kullanın
                  </p>
                </div>

                {/* Getting API Key */}
                <Card className="mb-6">
                  <CardHeader>
                    <Key className="w-10 h-10 text-primary mb-4" />
                    <CardTitle className="text-2xl">API Anahtarı Alma</CardTitle>
                    <CardDescription>
                      Dashboard'dan API anahtarınızı 3 adımda oluşturun
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ol className="space-y-4">
                      <li className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-bold text-primary">1</span>
                        </div>
                        <div>
                          <p className="font-semibold mb-1">Dashboard'a Giriş Yapın</p>
                          <p className="text-sm text-muted-foreground">
                            ProYön hesabınıza giriş yapın ve Settings → API Keys bölümüne gidin
                          </p>
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-bold text-primary">2</span>
                        </div>
                        <div>
                          <p className="font-semibold mb-1">Yeni API Key Oluşturun</p>
                          <p className="text-sm text-muted-foreground">
                            "Generate New API Key" butonuna tıklayın ve anahtarınıza bir isim verin
                          </p>
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-bold text-primary">3</span>
                        </div>
                        <div>
                          <p className="font-semibold mb-1">Anahtarınızı Saklayın</p>
                          <p className="text-sm text-muted-foreground">
                            API anahtarınız sadece bir kez gösterilir. Güvenli bir yerde saklayın
                          </p>
                        </div>
                      </li>
                    </ol>
                  </CardContent>
                </Card>

                {/* Using API Key */}
                <Card className="mb-6">
                  <CardHeader>
                    <Lock className="w-10 h-10 text-green-500 mb-4" />
                    <CardTitle className="text-2xl">API Anahtarını Kullanma</CardTitle>
                    <CardDescription>
                      Her API isteğinde Authorization header'ı kullanın
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-muted/50 rounded-lg p-4 relative">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-muted-foreground">cURL</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(
                            'curl -X GET https://api.proyon.com/v1/projects \\\n  -H "Authorization: Bearer YOUR_API_KEY" \\\n  -H "Content-Type: application/json"',
                            'curl-auth'
                          )}
                        >
                          {copiedCode === 'curl-auth' ? (
                            <Check className="w-4 h-4" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                      <pre className="text-sm overflow-x-auto">
                        <code>{`curl -X GET https://api.proyon.com/v1/projects \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json"`}</code>
                      </pre>
                    </div>

                    <div className="mt-6 p-4 bg-yellow-500/5 border border-yellow-500/20 rounded-lg">
                      <div className="flex gap-3">
                        <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-yellow-500 mb-1">Güvenlik Uyarısı</p>
                          <p className="text-sm text-muted-foreground">
                            API anahtarınızı asla public repository'lerde veya client-side kodda paylaşmayın.
                            Environment variables kullanarak güvenli şekilde saklayın.
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Rate Limiting */}
                <Card className="border-blue-500/20">
                  <CardHeader>
                    <Zap className="w-10 h-10 text-blue-500 mb-4" />
                    <CardTitle className="text-2xl">Rate Limiting</CardTitle>
                    <CardDescription>
                      API kullanım limitleri ve plan bazlı kısıtlamalar
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="p-4 bg-muted/50 rounded-lg">
                        <Badge variant="outline" className="mb-2">Free</Badge>
                        <p className="text-2xl font-bold text-primary">100</p>
                        <p className="text-sm text-muted-foreground">istek/saat</p>
                      </div>
                      <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                        <Badge className="mb-2 bg-primary">Pro</Badge>
                        <p className="text-2xl font-bold text-primary">1,000</p>
                        <p className="text-sm text-muted-foreground">istek/saat</p>
                      </div>
                      <div className="p-4 bg-muted/50 rounded-lg">
                        <Badge variant="secondary" className="mb-2">Enterprise</Badge>
                        <p className="text-2xl font-bold text-primary">Özel</p>
                        <p className="text-sm text-muted-foreground">Limitsiz</p>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-4">
                      Rate limit aşıldığında HTTP 429 hatası alırsınız. Response header'larında kalan limit bilgisi bulunur.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Endpoints Tab */}
            <TabsContent value="endpoints" className="mt-0">
              <div className="max-w-4xl mx-auto">
                <div className="mb-12 text-center">
                  <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                    API Endpoints
                  </h2>
                  <p className="text-lg text-muted-foreground">
                    Base URL: <code className="px-2 py-1 bg-muted rounded">https://api.proyon.com/v1</code>
                  </p>
                </div>

                <div className="space-y-6">
                  {/* Projects Endpoints */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-2xl">Projects</CardTitle>
                      <CardDescription>Proje yönetimi endpoint'leri</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {[
                        {
                          method: 'GET',
                          endpoint: '/projects',
                          description: 'Tüm projeleri listele',
                          color: 'text-green-500',
                          bg: 'bg-green-500/10'
                        },
                        {
                          method: 'GET',
                          endpoint: '/projects/{id}',
                          description: 'Belirli bir projeyi getir',
                          color: 'text-green-500',
                          bg: 'bg-green-500/10'
                        },
                        {
                          method: 'POST',
                          endpoint: '/projects',
                          description: 'Yeni proje oluştur',
                          color: 'text-blue-500',
                          bg: 'bg-blue-500/10'
                        },
                        {
                          method: 'PUT',
                          endpoint: '/projects/{id}',
                          description: 'Projeyi güncelle',
                          color: 'text-yellow-500',
                          bg: 'bg-yellow-500/10'
                        },
                        {
                          method: 'DELETE',
                          endpoint: '/projects/{id}',
                          description: 'Projeyi sil',
                          color: 'text-red-500',
                          bg: 'bg-red-500/10'
                        },
                      ].map((item, i) => (
                        <div key={i} className="flex items-start gap-4 p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
                          <Badge className={`${item.bg} ${item.color} border-0 font-mono`}>
                            {item.method}
                          </Badge>
                          <div className="flex-1">
                            <code className="text-sm font-semibold">{item.endpoint}</code>
                            <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  {/* Roadmaps Endpoints */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-2xl">Roadmaps</CardTitle>
                      <CardDescription>Yol haritası yönetimi endpoint'leri</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {[
                        {
                          method: 'GET',
                          endpoint: '/projects/{id}/roadmap',
                          description: 'Proje yol haritasını getir',
                          color: 'text-green-500',
                          bg: 'bg-green-500/10'
                        },
                        {
                          method: 'POST',
                          endpoint: '/projects/{id}/roadmap/generate',
                          description: 'AI ile yol haritası oluştur',
                          color: 'text-blue-500',
                          bg: 'bg-blue-500/10'
                        },
                        {
                          method: 'PUT',
                          endpoint: '/roadmap/{id}',
                          description: 'Yol haritasını güncelle',
                          color: 'text-yellow-500',
                          bg: 'bg-yellow-500/10'
                        },
                      ].map((item, i) => (
                        <div key={i} className="flex items-start gap-4 p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
                          <Badge className={`${item.bg} ${item.color} border-0 font-mono`}>
                            {item.method}
                          </Badge>
                          <div className="flex-1">
                            <code className="text-sm font-semibold">{item.endpoint}</code>
                            <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  {/* Tasks Endpoints */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-2xl">Tasks</CardTitle>
                      <CardDescription>Görev yönetimi endpoint'leri</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {[
                        {
                          method: 'GET',
                          endpoint: '/projects/{id}/tasks',
                          description: 'Proje görevlerini listele',
                          color: 'text-green-500',
                          bg: 'bg-green-500/10'
                        },
                        {
                          method: 'POST',
                          endpoint: '/projects/{id}/tasks',
                          description: 'Yeni görev oluştur',
                          color: 'text-blue-500',
                          bg: 'bg-blue-500/10'
                        },
                        {
                          method: 'PUT',
                          endpoint: '/tasks/{id}',
                          description: 'Görevi güncelle',
                          color: 'text-yellow-500',
                          bg: 'bg-yellow-500/10'
                        },
                        {
                          method: 'DELETE',
                          endpoint: '/tasks/{id}',
                          description: 'Görevi sil',
                          color: 'text-red-500',
                          bg: 'bg-red-500/10'
                        },
                      ].map((item, i) => (
                        <div key={i} className="flex items-start gap-4 p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
                          <Badge className={`${item.bg} ${item.color} border-0 font-mono`}>
                            {item.method}
                          </Badge>
                          <div className="flex-1">
                            <code className="text-sm font-semibold">{item.endpoint}</code>
                            <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  {/* AI Endpoints */}
                  <Card className="border-purple-500/20">
                    <CardHeader>
                      <CardTitle className="text-2xl">AI & Analytics</CardTitle>
                      <CardDescription>Yapay zeka ve analitik endpoint'leri</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {[
                        {
                          method: 'POST',
                          endpoint: '/ai/analyze',
                          description: 'Proje analizi yap',
                          color: 'text-blue-500',
                          bg: 'bg-blue-500/10'
                        },
                        {
                          method: 'POST',
                          endpoint: '/ai/chat',
                          description: 'Proyon AI ile sohbet',
                          color: 'text-blue-500',
                          bg: 'bg-blue-500/10'
                        },
                        {
                          method: 'GET',
                          endpoint: '/analytics/{project_id}',
                          description: 'Proje analitiği getir',
                          color: 'text-green-500',
                          bg: 'bg-green-500/10'
                        },
                      ].map((item, i) => (
                        <div key={i} className="flex items-start gap-4 p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
                          <Badge className={`${item.bg} ${item.color} border-0 font-mono`}>
                            {item.method}
                          </Badge>
                          <div className="flex-1">
                            <code className="text-sm font-semibold">{item.endpoint}</code>
                            <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* Errors Tab */}
            <TabsContent value="errors" className="mt-0">
              <div className="max-w-4xl mx-auto">
                <div className="mb-12 text-center">
                  <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                    Hata Kodları
                  </h2>
                  <p className="text-lg text-muted-foreground">
                    API'den dönen hata kodları ve anlamları
                  </p>
                </div>

                <div className="space-y-4">
                  {[
                    {
                      code: '200',
                      name: 'OK',
                      description: 'İstek başarıyla tamamlandı',
                      color: 'text-green-500',
                      bg: 'bg-green-500/10'
                    },
                    {
                      code: '201',
                      name: 'Created',
                      description: 'Kaynak başarıyla oluşturuldu',
                      color: 'text-green-500',
                      bg: 'bg-green-500/10'
                    },
                    {
                      code: '400',
                      name: 'Bad Request',
                      description: 'İstek geçersiz veya hatalı formatlanmış',
                      color: 'text-yellow-500',
                      bg: 'bg-yellow-500/10'
                    },
                    {
                      code: '401',
                      name: 'Unauthorized',
                      description: 'API anahtarı geçersiz veya eksik',
                      color: 'text-yellow-500',
                      bg: 'bg-yellow-500/10'
                    },
                    {
                      code: '403',
                      name: 'Forbidden',
                      description: 'Bu kaynağa erişim izniniz yok',
                      color: 'text-orange-500',
                      bg: 'bg-orange-500/10'
                    },
                    {
                      code: '404',
                      name: 'Not Found',
                      description: 'İstenen kaynak bulunamadı',
                      color: 'text-orange-500',
                      bg: 'bg-orange-500/10'
                    },
                    {
                      code: '429',
                      name: 'Too Many Requests',
                      description: 'Rate limit aşıldı, lütfen bekleyin',
                      color: 'text-red-500',
                      bg: 'bg-red-500/10'
                    },
                    {
                      code: '500',
                      name: 'Internal Server Error',
                      description: 'Sunucu tarafında bir hata oluştu',
                      color: 'text-red-500',
                      bg: 'bg-red-500/10'
                    },
                    {
                      code: '503',
                      name: 'Service Unavailable',
                      description: 'Servis geçici olarak kullanılamıyor',
                      color: 'text-red-500',
                      bg: 'bg-red-500/10'
                    },
                  ].map((error, i) => (
                    <Card key={i} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <Badge className={`${error.bg} ${error.color} border-0 font-mono text-base px-3 py-1`}>
                            {error.code}
                          </Badge>
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg mb-1">{error.name}</h3>
                            <p className="text-muted-foreground">{error.description}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <Card className="mt-8 border-blue-500/20">
                  <CardHeader>
                    <CardTitle className="text-2xl">Error Response Formatı</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-muted/50 rounded-lg p-4">
                      <pre className="text-sm overflow-x-auto">
                        <code>{`{
  "error": {
    "code": "INVALID_API_KEY",
    "message": "The API key provided is invalid",
    "status": 401,
    "timestamp": "2025-12-28T10:30:00Z"
  }
}`}</code>
                      </pre>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Examples Tab */}
            <TabsContent value="examples" className="mt-0">
              <div className="max-w-4xl mx-auto">
                <div className="mb-12 text-center">
                  <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                    Kod Örnekleri
                  </h2>
                  <p className="text-lg text-muted-foreground">
                    Popüler dillerde API kullanım örnekleri
                  </p>
                </div>

                <div className="space-y-6">
                  {/* JavaScript Example */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-2xl flex items-center gap-2">
                        <FileCode className="w-6 h-6" />
                        JavaScript / Node.js
                      </CardTitle>
                      <CardDescription>Fetch API ile proje listesi alma</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-muted/50 rounded-lg p-4 relative">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-semibold text-muted-foreground">JavaScript</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(
                              `const apiKey = process.env.PROYON_API_KEY;

const response = await fetch('https://api.proyon.com/v1/projects', {
  method: 'GET',
  headers: {
    'Authorization': \`Bearer \${apiKey}\`,
    'Content-Type': 'application/json'
  }
});

const data = await response.json();
console.log(data);`,
                              'js-example'
                            )}
                          >
                            {copiedCode === 'js-example' ? (
                              <Check className="w-4 h-4" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                        <pre className="text-sm overflow-x-auto">
                          <code>{`const apiKey = process.env.PROYON_API_KEY;

const response = await fetch('https://api.proyon.com/v1/projects', {
  method: 'GET',
  headers: {
    'Authorization': \`Bearer \${apiKey}\`,
    'Content-Type': 'application/json'
  }
});

const data = await response.json();
console.log(data);`}</code>
                        </pre>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Python Example */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-2xl flex items-center gap-2">
                        <FileCode className="w-6 h-6" />
                        Python
                      </CardTitle>
                      <CardDescription>Requests kütüphanesi ile yeni proje oluşturma</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-muted/50 rounded-lg p-4 relative">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-semibold text-muted-foreground">Python</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(
                              `import os
import requests

api_key = os.getenv('PROYON_API_KEY')
url = 'https://api.proyon.com/v1/projects'

headers = {
    'Authorization': f'Bearer {api_key}',
    'Content-Type': 'application/json'
}

data = {
    'name': 'Yeni Proje',
    'description': 'AI ile oluşturulmuş proje',
    'category': 'web-development'
}

response = requests.post(url, headers=headers, json=data)
print(response.json())`,
                              'py-example'
                            )}
                          >
                            {copiedCode === 'py-example' ? (
                              <Check className="w-4 h-4" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                        <pre className="text-sm overflow-x-auto">
                          <code>{`import os
import requests

api_key = os.getenv('PROYON_API_KEY')
url = 'https://api.proyon.com/v1/projects'

headers = {
    'Authorization': f'Bearer {api_key}',
    'Content-Type': 'application/json'
}

data = {
    'name': 'Yeni Proje',
    'description': 'AI ile oluşturulmuş proje',
    'category': 'web-development'
}

response = requests.post(url, headers=headers, json=data)
print(response.json())`}</code>
                        </pre>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Next.js Example */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-2xl flex items-center gap-2">
                        <FileCode className="w-6 h-6" />
                        Next.js API Route
                      </CardTitle>
                      <CardDescription>Server-side API entegrasyonu</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-muted/50 rounded-lg p-4 relative">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-semibold text-muted-foreground">TypeScript</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(
                              `import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const apiKey = process.env.PROYON_API_KEY;
  
  const response = await fetch('https://api.proyon.com/v1/projects', {
    headers: {
      'Authorization': \`Bearer \${apiKey}\`,
      'Content-Type': 'application/json'
    }
  });
  
  const data = await response.json();
  return NextResponse.json(data);
}`,
                              'next-example'
                            )}
                          >
                            {copiedCode === 'next-example' ? (
                              <Check className="w-4 h-4" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                        <pre className="text-sm overflow-x-auto">
                          <code>{`import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const apiKey = process.env.PROYON_API_KEY;
  
  const response = await fetch('https://api.proyon.com/v1/projects', {
    headers: {
      'Authorization': \`Bearer \${apiKey}\`,
      'Content-Type': 'application/json'
    }
  });
  
  const data = await response.json();
  return NextResponse.json(data);
}`}</code>
                        </pre>
                      </div>
                    </CardContent>
                  </Card>

                  {/* cURL Example */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-2xl flex items-center gap-2">
                        <Terminal className="w-6 h-6" />
                        cURL
                      </CardTitle>
                      <CardDescription>Terminal'den direkt API testi</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-muted/50 rounded-lg p-4 relative">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-semibold text-muted-foreground">Bash</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(
                              `curl -X POST https://api.proyon.com/v1/projects \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "Test Project",
    "description": "API test projesi",
    "category": "testing"
  }'`,
                              'curl-example'
                            )}
                          >
                            {copiedCode === 'curl-example' ? (
                              <Check className="w-4 h-4" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                        <pre className="text-sm overflow-x-auto">
                          <code>{`curl -X POST https://api.proyon.com/v1/projects \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "Test Project",
    "description": "API test projesi",
    "category": "testing"
  }'`}</code>
                        </pre>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-gradient-to-br from-primary/10 via-background to-purple-500/10 rounded-3xl p-12 border border-primary/20">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              API Kullanmaya Başlayın
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Ücretsiz hesap oluşturarak API anahtarınızı alın ve entegrasyona başlayın.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup">
                <Button size="lg" className="group">
                  API Anahtarı Al
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/docs">
                <Button size="lg" variant="outline">
                  Dokümantasyon
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
