'use client';

/**
 * Create Project Wizard - Multi-Roadmap Support
 * 5 adımlı proje oluşturma sihirbazı
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  ChevronLeft,
  ChevronRight,
  Check,
  Sparkles,
  Pencil,
  Folder,
  Users,
  Rocket,
  X,
} from 'lucide-react';
import { RoadmapCreationMode, CategoryInputMode, DomainType } from '@/types';
import { generateMultiRoadmap } from '@/actions/generateRoadmapMulti';
import { useRouter } from 'next/navigation';

// Simple Label component
function Label({ htmlFor, children }: { htmlFor?: string; children: React.ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
      {children}
    </label>
  );
}

interface WizardStep {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
}

const WIZARD_STEPS: WizardStep[] = [
  {
    id: 1,
    title: 'Proje Bilgileri',
    description: 'Projenizin temel bilgilerini girin',
    icon: <Folder className="w-5 h-5" />,
  },
  {
    id: 2,
    title: 'Roadmap Modu',
    description: 'Nasıl oluşturmak istersiniz?',
    icon: <Sparkles className="w-5 h-5" />,
  },
  {
    id: 3,
    title: 'Kategori Ayarları',
    description: 'Roadmap kategorilerini belirleyin',
    icon: <Users className="w-5 h-5" />,
  },
  {
    id: 4,
    title: 'Önizleme',
    description: 'Ayarları gözden geçirin',
    icon: <Check className="w-5 h-5" />,
  },
  {
    id: 5,
    title: 'Oluştur!',
    description: 'Projeniz hazırlanıyor',
    icon: <Rocket className="w-5 h-5" />,
  },
];

export function CreateProjectWizard({ userId }: { userId: string }) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form state
  const [projectTitle, setProjectTitle] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [roadmapMode, setRoadmapMode] = useState<RoadmapCreationMode>(
    RoadmapCreationMode.AI_AUTO
  );
  const [categoryMode, setCategoryMode] = useState<CategoryInputMode>(
    CategoryInputMode.AI_AUTO
  );
  const [categoryNames, setCategoryNames] = useState<string[]>([]);
  const [categoryCount, setCategoryCount] = useState(3);
  const [newCategoryName, setNewCategoryName] = useState('');

  const canProceed = () => {
    if (currentStep === 1) {
      return projectTitle.trim().length > 0 && (projectDescription.trim().length > 0 || uploadedFile !== null);
    }
    if (currentStep === 2) {
      return roadmapMode !== null;
    }
    if (currentStep === 3) {
      if (categoryMode === CategoryInputMode.MANUAL_NAMES) {
        return categoryNames.length > 0;
      }
      if (categoryMode === CategoryInputMode.AI_WITH_COUNT) {
        return categoryCount >= 2 && categoryCount <= 6;
      }
      return true; // AI_AUTO veya NONE
    }
    return true;
  };

  const handleNext = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    } else {
      handleCreateProject();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const addCategory = () => {
    if (newCategoryName.trim()) {
      setCategoryNames([...categoryNames, newCategoryName.trim()]);
      setNewCategoryName('');
    }
  };

  const removeCategory = (index: number) => {
    setCategoryNames(categoryNames.filter((_, i) => i !== index));
  };

  const handleCreateProject = async () => {
    setLoading(true);
    try {
      // PDF varsa parse et VE yükle
      let finalProjectText = `${projectTitle}\n\n${projectDescription}`;
      let uploadedFileUrl: string | null = null;
      let uploadedFileName: string | null = null;
      
      if (uploadedFile) {
        console.log('📄 Dosya yükleniyor:', uploadedFile.name);
        
        // Dosyayı sunucuya yükle
        const formData = new FormData();
        formData.append('file', uploadedFile);
        
        try {
          const parseResponse = await fetch('/api/parse-document', {
            method: 'POST',
            body: formData,
          });
          
          if (parseResponse.ok) {
            const { text, url } = await parseResponse.json();
            finalProjectText = `${projectTitle}\n\n${text}`;
            uploadedFileUrl = url;
            uploadedFileName = uploadedFile.name;
            console.log('✅ Dosya parse ve yükleme başarılı');
          } else {
            const errorData = await parseResponse.json().catch(() => ({ error: 'Unknown error' }));
            console.error('❌ Dosya işleme hatası:', parseResponse.status, errorData);
            throw new Error(`Dosya yüklenemedi: ${errorData.error || parseResponse.statusText}`);
          }
        } catch (error) {
          console.error('❌ Dosya işleme exception:', error);
          alert('Dosya yükleme hatası: ' + (error as Error).message);
          setLoading(false);
          return;
        }
      }
      
      const result = await generateMultiRoadmap({
        userId,
        projectText: finalProjectText,
        uploadedFileUrl,
        uploadedFileName,
        mode: roadmapMode,
        categoryInput:
          roadmapMode === RoadmapCreationMode.MANUAL
            ? categoryMode === CategoryInputMode.MANUAL_NAMES
              ? { mode: CategoryInputMode.MANUAL_NAMES, names: categoryNames }
              : { mode: CategoryInputMode.NONE }
            : categoryMode === CategoryInputMode.MANUAL_NAMES
            ? { mode: CategoryInputMode.MANUAL_NAMES, names: categoryNames }
            : categoryMode === CategoryInputMode.AI_WITH_COUNT
            ? { mode: CategoryInputMode.AI_WITH_COUNT, count: categoryCount }
            : { mode: CategoryInputMode.AI_AUTO },
      });

      if (result.success && result.projectId) {
        router.push(`/dashboard/projects/${result.projectId}`);
      } else {
        alert('Hata: ' + result.error);
        setCurrentStep(4); // Önizleme adımına geri dön
      }
    } catch (error) {
      console.error('Proje oluşturma hatası:', error);
      alert('Bir hata oluştu');
      setCurrentStep(4);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Progress Steps */}
      <div className="flex items-center justify-between mb-8">
        {WIZARD_STEPS.map((step, index) => (
          <div key={step.id} className="flex items-center flex-1">
            <div
              className={`
                flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all
                ${
                  currentStep >= step.id
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-background border-muted-foreground/30'
                }
              `}
            >
              {currentStep > step.id ? (
                <Check className="w-6 h-6" />
              ) : (
                step.icon
              )}
            </div>
            {index < WIZARD_STEPS.length - 1 && (
              <div
                className={`flex-1 h-1 mx-2 transition-all ${
                  currentStep > step.id ? 'bg-primary' : 'bg-muted'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <div className="bg-card border rounded-lg p-8 min-h-[400px]">
        <h2 className="text-2xl font-bold mb-2">
          {WIZARD_STEPS[currentStep - 1].title}
        </h2>
        <p className="text-muted-foreground mb-6">
          {WIZARD_STEPS[currentStep - 1].description}
        </p>

        {/* STEP 1: Proje Bilgileri */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div>
              <Label htmlFor="title">Proje Başlığı *</Label>
              <Input
                id="title"
                value={projectTitle}
                onChange={(e) => setProjectTitle(e.target.value)}
                placeholder="Örn: E-Ticaret Web Sitesi"
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="description">Proje Açıklaması (Opsiyonel)</Label>
              <Textarea
                id="description"
                value={projectDescription}
                onChange={(e) => setProjectDescription(e.target.value)}
                placeholder="Projenizi detaylı olarak açıklayın... Ne yapacak? Hangi teknolojileri kullanacak?"
                className="mt-2 min-h-[200px]"
                disabled={uploadedFile !== null}
              />
              <p className="text-xs text-muted-foreground mt-2">
                İpucu: Detaylı açıklama veya döküman yükleyerek AI'ın daha iyi roadmap oluşturmasını sağlayın
              </p>
            </div>

            <div className="relative">
              <div className="flex items-center gap-2 mb-2">
                <Label htmlFor="file-upload">Veya Döküman Yükle</Label>
                <Badge variant="secondary" className="text-xs">PDF, DOCX, TXT</Badge>
              </div>
              <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                <input
                  id="file-upload"
                  type="file"
                  accept=".pdf,.docx,.doc,.txt"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setUploadedFile(file);
                      setProjectDescription('');
                    }
                  }}
                  className="hidden"
                />
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer flex flex-col items-center gap-2"
                >
                  <Folder className="w-10 h-10 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    {uploadedFile ? (
                      <span className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-500" />
                        {uploadedFile.name}
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.preventDefault();
                            setUploadedFile(null);
                          }}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </span>
                    ) : (
                      'Tıklayarak proje dökümanı yükleyin'
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Maksimum 10MB
                  </p>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Roadmap Modu */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <ModeCard
              icon={<Pencil className="w-6 h-6" />}
              title="Manuel Oluştur"
              description="Roadmap adımlarını kendiniz ekleyin"
              selected={roadmapMode === RoadmapCreationMode.MANUAL}
              onClick={() => setRoadmapMode(RoadmapCreationMode.MANUAL)}
            />

            <ModeCard
              icon={<Sparkles className="w-6 h-6" />}
              title="AI Yardımıyla"
              description="Kategorileri siz belirleyin, AI adımları oluştursun"
              selected={roadmapMode === RoadmapCreationMode.AI_ASSISTED}
              onClick={() => setRoadmapMode(RoadmapCreationMode.AI_ASSISTED)}
              badge="Önerilen"
            />

            <ModeCard
              icon={<Rocket className="w-6 h-6" />}
              title="Tam Otomatik AI"
              description="AI kategorileri ve tüm adımları oluştursun"
              selected={roadmapMode === RoadmapCreationMode.AI_AUTO}
              onClick={() => setRoadmapMode(RoadmapCreationMode.AI_AUTO)}
              badge="En Hızlı"
            />
          </div>
        )}

        {/* STEP 3: Kategori Ayarları */}
        {currentStep === 3 && (
          <div className="space-y-6">
            {roadmapMode === RoadmapCreationMode.MANUAL && (
              <CategoryManualSettings
                categoryMode={categoryMode}
                setCategoryMode={setCategoryMode}
                categoryNames={categoryNames}
                newCategoryName={newCategoryName}
                setNewCategoryName={setNewCategoryName}
                addCategory={addCategory}
                removeCategory={removeCategory}
              />
            )}

            {roadmapMode === RoadmapCreationMode.AI_ASSISTED && (
              <CategoryAIAssistedSettings
                categoryMode={categoryMode}
                setCategoryMode={setCategoryMode}
                categoryNames={categoryNames}
                newCategoryName={newCategoryName}
                setNewCategoryName={setNewCategoryName}
                addCategory={addCategory}
                removeCategory={removeCategory}
                categoryCount={categoryCount}
                setCategoryCount={setCategoryCount}
              />
            )}

            {roadmapMode === RoadmapCreationMode.AI_AUTO && (
              <div className="text-center p-8 bg-muted/50 rounded-lg">
                <Sparkles className="w-12 h-12 mx-auto mb-4 text-primary" />
                <h3 className="font-semibold mb-2">AI Tam Otomatik Mod</h3>
                <p className="text-muted-foreground">
                  AI projenizi analiz edecek ve en uygun kategori sayısını + isimlerini belirleyecek.
                  <br />
                  Hiçbir ayar yapmanıza gerek yok!
                </p>
              </div>
            )}
          </div>
        )}

        {/* STEP 4: Önizleme */}
        {currentStep === 4 && (
          <ProjectPreview
            title={projectTitle}
            description={projectDescription}
            mode={roadmapMode}
            categoryMode={categoryMode}
            categoryNames={categoryNames}
            categoryCount={categoryCount}
          />
        )}

        {/* STEP 5: Oluşturuluyor */}
        {currentStep === 5 && (
          <div className="text-center py-12">
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Projeniz oluşturuluyor...</h3>
                <p className="text-muted-foreground">
                  {roadmapMode === RoadmapCreationMode.AI_AUTO ||
                  roadmapMode === RoadmapCreationMode.AI_ASSISTED
                    ? 'AI roadmap oluşturuyor, bu 10-30 saniye sürebilir...'
                    : 'Kategoriler hazırlanıyor...'}
                </p>
              </>
            ) : (
              <>
                <Check className="w-16 h-16 mx-auto mb-4 text-green-500" />
                <h3 className="text-xl font-semibold mb-2">Proje Oluşturuldu!</h3>
                <p className="text-muted-foreground">Yönlendiriliyorsunuz...</p>
              </>
            )}
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between mt-6">
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={currentStep === 1 || loading}
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Geri
        </Button>

        <Button
          onClick={handleNext}
          disabled={!canProceed() || loading}
          className={currentStep === 4 ? 'bg-green-600 hover:bg-green-700' : ''}
        >
          {currentStep === 4 ? (
            <>
              <Rocket className="w-4 h-4 mr-2" />
              Projeyi Oluştur
            </>
          ) : (
            <>
              {currentStep === 5 ? 'Dashboard\'a Git' : 'Devam Et'}
              <ChevronRight className="w-4 h-4 ml-2" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

interface ModeCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  selected: boolean;
  onClick: () => void;
  badge?: string;
}

function ModeCard({ icon, title, description, selected, onClick, badge }: ModeCardProps) {
  return (
    <button
      onClick={onClick}
      className={`
        w-full p-6 border-2 rounded-lg text-left transition-all
        ${selected ? 'border-primary bg-primary/5' : 'border-muted hover:border-primary/50'}
      `}
    >
      <div className="flex items-start gap-4">
        <div className={`p-3 rounded-lg ${selected ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
          {icon}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold">{title}</h3>
            {badge && (
              <Badge variant="secondary" className="text-xs">{badge}</Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        </div>
        {selected && <Check className="w-6 h-6 text-primary" />}
      </div>
    </button>
  );
}

// ============================================================================
// CATEGORY SETTINGS COMPONENTS
// ============================================================================

interface CategoryManualSettingsProps {
  categoryMode: CategoryInputMode;
  setCategoryMode: (mode: CategoryInputMode) => void;
  categoryNames: string[];
  newCategoryName: string;
  setNewCategoryName: (name: string) => void;
  addCategory: () => void;
  removeCategory: (index: number) => void;
}

function CategoryManualSettings({
  categoryMode,
  setCategoryMode,
  categoryNames,
  newCategoryName,
  setNewCategoryName,
  addCategory,
  removeCategory,
}: CategoryManualSettingsProps) {
  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <button
          onClick={() => setCategoryMode(CategoryInputMode.NONE)}
          className={`flex-1 p-4 border rounded-lg ${
            categoryMode === CategoryInputMode.NONE ? 'border-primary bg-primary/5' : ''
          }`}
        >
          <h4 className="font-medium">Kategorisiz</h4>
          <p className="text-sm text-muted-foreground">Sadece "General" kategorisi</p>
        </button>

        <button
          onClick={() => setCategoryMode(CategoryInputMode.MANUAL_NAMES)}
          className={`flex-1 p-4 border rounded-lg ${
            categoryMode === CategoryInputMode.MANUAL_NAMES ? 'border-primary bg-primary/5' : ''
          }`}
        >
          <h4 className="font-medium">Kategorileri Belirt</h4>
          <p className="text-sm text-muted-foreground">Backend, Frontend, vb.</p>
        </button>
      </div>

      {categoryMode === CategoryInputMode.MANUAL_NAMES && (
        <div className="space-y-4 p-4 border rounded-lg">
          <div className="flex gap-2">
            <Input
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="Kategori adı (örn: Backend)"
              onKeyPress={(e) => e.key === 'Enter' && addCategory()}
            />
            <Button onClick={addCategory}>Ekle</Button>
          </div>

          {categoryNames.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {categoryNames.map((name, index) => (
                <Badge key={index} variant="secondary" className="gap-2 px-3 py-1">
                  {name}
                  <X
                    className="w-3 h-3 cursor-pointer"
                    onClick={() => removeCategory(index)}
                  />
                </Badge>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function CategoryAIAssistedSettings({
  categoryMode,
  setCategoryMode,
  categoryNames,
  newCategoryName,
  setNewCategoryName,
  addCategory,
  removeCategory,
  categoryCount,
  setCategoryCount,
}: CategoryManualSettingsProps & {
  categoryCount: number;
  setCategoryCount: (count: number) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => setCategoryMode(CategoryInputMode.MANUAL_NAMES)}
          className={`p-4 border rounded-lg ${
            categoryMode === CategoryInputMode.MANUAL_NAMES ? 'border-primary bg-primary/5' : ''
          }`}
        >
          <h4 className="font-medium">Kategori İsimlerini Belirt</h4>
          <p className="text-sm text-muted-foreground">AI adımları oluştursun</p>
        </button>

        <button
          onClick={() => setCategoryMode(CategoryInputMode.AI_WITH_COUNT)}
          className={`p-4 border rounded-lg ${
            categoryMode === CategoryInputMode.AI_WITH_COUNT ? 'border-primary bg-primary/5' : ''
          }`}
        >
          <h4 className="font-medium">Sadece Sayı Belirt</h4>
          <p className="text-sm text-muted-foreground">AI isim + adımları oluştursun</p>
        </button>
      </div>

      {categoryMode === CategoryInputMode.MANUAL_NAMES && (
        <CategoryManualSettings
          categoryMode={categoryMode}
          setCategoryMode={setCategoryMode}
          categoryNames={categoryNames}
          newCategoryName={newCategoryName}
          setNewCategoryName={setNewCategoryName}
          addCategory={addCategory}
          removeCategory={removeCategory}
        />
      )}

      {categoryMode === CategoryInputMode.AI_WITH_COUNT && (
        <div className="p-4 border rounded-lg">
          <Label htmlFor="count">Kaç kategoriye bölünsün?</Label>
          <div className="flex items-center gap-4 mt-2">
            <Input
              id="count"
              type="number"
              min={2}
              max={6}
              value={categoryCount}
              onChange={(e) => setCategoryCount(parseInt(e.target.value) || 3)}
              className="w-24"
            />
            <span className="text-sm text-muted-foreground">
              (2-6 arası önerilir)
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

function ProjectPreview({
  title,
  description,
  mode,
  categoryMode,
  categoryNames,
  categoryCount,
}: {
  title: string;
  description: string;
  mode: RoadmapCreationMode;
  categoryMode: CategoryInputMode;
  categoryNames: string[];
  categoryCount: number;
}) {
  const getModeLabel = () => {
    if (mode === RoadmapCreationMode.MANUAL) return 'Manuel';
    if (mode === RoadmapCreationMode.AI_ASSISTED) return 'AI Yardımıyla';
    return 'Tam Otomatik AI';
  };

  const getCategoryInfo = () => {
    if (mode === RoadmapCreationMode.MANUAL) {
      if (categoryMode === CategoryInputMode.NONE) {
        return '1 kategori (General)';
      }
      return `${categoryNames.length} kategori: ${categoryNames.join(', ')}`;
    }
    
    if (mode === RoadmapCreationMode.AI_ASSISTED) {
      if (categoryMode === CategoryInputMode.MANUAL_NAMES) {
        return `${categoryNames.length} kategori: ${categoryNames.join(', ')} (AI adımları oluşturacak)`;
      }
      if (categoryMode === CategoryInputMode.AI_WITH_COUNT) {
        return `${categoryCount} kategori (AI isimlendirip adımları oluşturacak)`;
      }
    }
    
    return 'AI otomatik belirleyecek (2-6 kategori)';
  };

  return (
    <div className="space-y-6">
      <div className="p-6 border rounded-lg bg-muted/50">
        <h3 className="font-semibold mb-4">Proje Özeti</h3>
        
        <div className="space-y-3">
          <div>
            <Label>Başlık:</Label>
            <p className="mt-1 font-medium">{title}</p>
          </div>

          <div>
            <Label>Açıklama:</Label>
            <p className="mt-1 text-sm text-muted-foreground line-clamp-3">
              {description}
            </p>
          </div>

          <div>
            <Label>Roadmap Modu:</Label>
            <p className="mt-1">
              <Badge>{getModeLabel()}</Badge>
            </p>
          </div>

          <div>
            <Label>Kategoriler:</Label>
            <p className="mt-1 text-sm">{getCategoryInfo()}</p>
          </div>
        </div>
      </div>

      <div className="p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg">
        <p className="text-sm text-blue-900 dark:text-blue-100">
          <strong>💡 İpucu:</strong>{' '}
          {mode === RoadmapCreationMode.AI_AUTO || mode === RoadmapCreationMode.AI_ASSISTED
            ? 'AI roadmap oluşturma 10-30 saniye sürebilir. Sabırlı olun!'
            : 'Projeniz oluşturulduktan sonra manuel olarak adım ekleyebilirsiniz.'}
        </p>
      </div>
    </div>
  );
}

// Diğer sub-component'ler devam edecek...
// (CategoryManualSettings, CategoryAIAssistedSettings, ProjectPreview)
// Dosya boyutu sınırı nedeniyle ayrı dosyalara taşınabilir
