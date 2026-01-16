'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Eye, Calendar, Users, Search, Globe, ArrowRight, TrendingUp, Filter, Sparkles, Heart } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Footer } from '@/components/landing';

interface PublicProject {
  id: string;
  share_token: string;
  description: string;
  team_members: string;
  view_count: number;
  likes_count: number;
  created_at: string;
  projects: {
    id: string;
    title: string;
    description: string;
    tags: string[];
    created_at: string;
    status: string;
  };
}

const categories = [
  { id: 'all', name: 'Tümü', icon: '📋' },
  { id: 'web-development', name: 'Web Geliştirme', icon: '🌐' },
  { id: 'mobile-app', name: 'Mobil Uygulama', icon: '📱' },
  { id: 'ai-ml', name: 'AI & Machine Learning', icon: '🤖' },
  { id: 'design', name: 'Tasarım', icon: '🎨' },
  { id: 'marketing', name: 'Pazarlama', icon: '📢' },
  { id: 'business', name: 'İş & Finans', icon: '💼' },
  { id: 'education', name: 'Eğitim', icon: '📚' },
  { id: 'other', name: 'Diğer', icon: '🔧' },
];

interface PublicProjectsClientProps {
  initialProjects: PublicProject[];
}

export function PublicProjectsClient({ initialProjects }: PublicProjectsClientProps) {
  const [filteredProjects, setFilteredProjects] = useState<PublicProject[]>(initialProjects);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('recent');

  // Filter and sort projects
  useEffect(() => {
    let filtered = [...initialProjects];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(share => {
        const project = share.projects;
        const searchLower = searchQuery.toLowerCase();
        return (
          project.title.toLowerCase().includes(searchLower) ||
          project.description?.toLowerCase().includes(searchLower) ||
          share.description?.toLowerCase().includes(searchLower) ||
          project.tags?.some(tag => tag.toLowerCase().includes(searchLower))
        );
      });
    }

    // Category filter - disabled until category column is added to projects table
    // if (selectedCategory !== 'all') {
    //   filtered = filtered.filter(share => 
    //     share.projects.category === selectedCategory
    //   );
    // }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'popular':
          return (b.view_count || 0) - (a.view_count || 0);
        case 'most-liked':
          return (b.likes_count || 0) - (a.likes_count || 0);
        case 'recent':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        default:
          return 0;
      }
    });

    setFilteredProjects(filtered);
  }, [searchQuery, selectedCategory, sortBy, initialProjects]);

  return (
    <>
      {/* Filters Section */}
      <section className="relative py-8 border-y border-border/50 bg-muted/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Projelerde ara..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Category Filter */}
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full lg:w-[200px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Kategori" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(cat => (
                  <SelectItem key={cat.id} value={cat.id}>
                    <span className="flex items-center gap-2">
                      <span>{cat.icon}</span>
                      <span>{cat.name}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Sort */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full lg:w-[180px]">
                <TrendingUp className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Sırala" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">En Yeni</SelectItem>
                <SelectItem value="popular">En Popüler</SelectItem>
                <SelectItem value="most-liked">En Çok Beğenilen</SelectItem>
                <SelectItem value="oldest">En Eski</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Active Filters */}
          {(searchQuery || selectedCategory !== 'all') && (
            <div className="flex items-center gap-2 mt-4">
              <span className="text-sm text-muted-foreground">Aktif Filtreler:</span>
              {searchQuery && (
                <Badge variant="secondary" className="gap-1">
                  Arama: {searchQuery}
                  <button onClick={() => setSearchQuery('')} className="ml-1 hover:text-destructive">
                    ×
                  </button>
                </Badge>
              )}
              {selectedCategory !== 'all' && (
                <Badge variant="secondary" className="gap-1">
                  {categories.find(c => c.id === selectedCategory)?.name}
                  <button onClick={() => setSelectedCategory('all')} className="ml-1 hover:text-destructive">
                    ×
                  </button>
                </Badge>
              )}
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                }}
              >
                Temizle
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Results Info */}
      <section className="relative py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">{filteredProjects.length}</span> proje bulundu
              {filteredProjects.length !== initialProjects.length && (
                <span> (toplam {initialProjects.length} projeden)</span>
              )}
            </p>
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section className="relative pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {filteredProjects.length === 0 ? (
            <Card className="p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <Globe className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                {searchQuery || selectedCategory !== 'all' 
                  ? 'Proje Bulunamadı' 
                  : 'Henüz Public Proje Yok'}
              </h3>
              <p className="text-muted-foreground mb-6">
                {searchQuery || selectedCategory !== 'all'
                  ? 'Arama kriterlerinize uygun proje bulunamadı. Farklı filtreler deneyin.'
                  : 'İlk public projeyi paylaşan siz olun!'}
              </p>
              {searchQuery || selectedCategory !== 'all' ? (
                <Button 
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                  }}
                >
                  Filtreleri Temizle
                </Button>
              ) : (
                <Link href="/dashboard/projects">
                  <Button>
                    Projelerime Git
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              )}
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map((share) => {
                const project = share.projects;
                if (!project) return null;

                return (
                  <Link 
                    key={share.id} 
                    href={`/share/${share.share_token}`}
                  >
                    <Card className="group hover:shadow-xl transition-all duration-300 h-full overflow-hidden hover:border-primary/50">
                      <CardHeader className="bg-gradient-to-br from-primary/5 to-purple-500/5 pb-4">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <CardTitle className="text-xl group-hover:text-primary transition-colors line-clamp-2">
                            {project.title}
                          </CardTitle>
                          {project.status && (
                            <Badge variant="secondary" className="shrink-0">
                              {project.status}
                            </Badge>
                          )}
                        </div>
                        
                        {share.description && (
                          <CardDescription className="line-clamp-3 mt-2">
                            {share.description}
                          </CardDescription>
                        )}
                      </CardHeader>

                      <CardContent className="space-y-4">
                        {/* Team Members */}
                        {share.team_members && (
                          <div className="flex items-start gap-3">
                            <Users className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                            <div className="flex-1 min-w-0">
                              <div className="text-xs text-muted-foreground font-medium mb-1">Ekip Üyeleri</div>
                              <div className="text-sm truncate">{share.team_members}</div>
                            </div>
                          </div>
                        )}

                        {/* Tags */}
                        {project.tags && project.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {project.tags.slice(0, 3).map((tag: string, idx: number) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                            {project.tags.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{project.tags.length - 3}
                              </Badge>
                            )}
                          </div>
                        )}

                        {/* Stats */}
                        <div className="flex items-center gap-4 pt-4 border-t text-sm text-muted-foreground">
                          <div className="flex items-center gap-1.5">
                            <Eye className="w-4 h-4" />
                            <span>{(share.view_count || 0).toLocaleString('tr-TR')}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Heart className="w-4 h-4 text-red-400" />
                            <span>{(share.likes_count || 0).toLocaleString('tr-TR')}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-4 h-4" />
                            <span>{new Date(share.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}</span>
                          </div>
                        </div>

                        <Button variant="ghost" className="w-full group-hover:bg-primary/10 group-hover:text-primary">
                          Detayları Gör
                          <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-gradient-to-br from-primary/10 via-background to-purple-500/10 rounded-3xl p-12 border border-primary/20">
            <Sparkles className="w-12 h-12 text-primary mx-auto mb-6" />
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Projenizi Paylaşın
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Kendi projenizi de topluluğa açabilir ve diğer kullanıcılarla paylaşabilirsiniz.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup">
                <Button size="lg" className="group">
                  Ücretsiz Başlayın
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/features">
                <Button size="lg" variant="outline">
                  Özellikleri Keşfet
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
