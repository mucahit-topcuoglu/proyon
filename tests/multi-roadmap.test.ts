/**
 * MULTI-ROADMAP SYSTEM - TEST SCRIPT
 * Yeni roadmap sistemini test et
 */

import { generateMultiRoadmap } from '@/actions/generateRoadmapMulti';
import { RoadmapCreationMode, CategoryInputMode } from '@/types';

// ============================================================================
// TEST 1: Manuel Mod - Kategorisiz
// ============================================================================

async function testManualNoCategory() {
  console.log('\n🧪 TEST 1: Manuel - Kategorisiz');
  
  const result = await generateMultiRoadmap({
    userId: 'test-user-id',
    projectText: 'Basit bir blog sitesi',
    mode: RoadmapCreationMode.MANUAL,
    categoryInput: {
      mode: CategoryInputMode.NONE,
    },
  });

  console.log('Sonuç:', result);
  // Beklenen: 1 "General" kategorisi, 0 node
}

// ============================================================================
// TEST 2: Manuel Mod - Kategorili
// ============================================================================

async function testManualWithCategories() {
  console.log('\n🧪 TEST 2: Manuel - Kategorili');
  
  const result = await generateMultiRoadmap({
    userId: 'test-user-id',
    projectText: 'E-ticaret sitesi',
    mode: RoadmapCreationMode.MANUAL,
    categoryInput: {
      mode: CategoryInputMode.MANUAL_NAMES,
      names: ['Backend', 'Frontend', 'Database'],
    },
  });

  console.log('Sonuç:', result);
  // Beklenen: 3 kategori (Backend, Frontend, Database), 0 node
}

// ============================================================================
// TEST 3: AI Mod - Kategoriler Verildi
// ============================================================================

async function testAIWithCategories() {
  console.log('\n🧪 TEST 3: AI - Kategoriler Verildi');
  
  const result = await generateMultiRoadmap({
    userId: 'test-user-id',
    projectText: 'Next.js ve Express ile sosyal medya platformu',
    mode: RoadmapCreationMode.AI_ASSISTED,
    categoryInput: {
      mode: CategoryInputMode.MANUAL_NAMES,
      names: ['Backend API', 'Frontend UI', 'Database Design', 'DevOps'],
    },
  });

  console.log('Sonuç:', result);
  // Beklenen: 4 kategori, her birinde 5-8 node
}

// ============================================================================
// TEST 4: AI Mod - Kategori Sayısı Verildi
// ============================================================================

async function testAIWithCategoryCount() {
  console.log('\n🧪 TEST 4: AI - Kategori Sayısı Verildi');
  
  const result = await generateMultiRoadmap({
    userId: 'test-user-id',
    projectText: 'React Native ile fitness tracking uygulaması',
    mode: RoadmapCreationMode.AI_AUTO,
    categoryInput: {
      mode: CategoryInputMode.AI_WITH_COUNT,
      count: 3,
    },
  });

  console.log('Sonuç:', result);
  // Beklenen: Tam 3 kategori (AI belirledi), her birinde node'lar
}

// ============================================================================
// TEST 5: Tam Otomatik AI
// ============================================================================

async function testFullAutoAI() {
  console.log('\n🧪 TEST 5: Tam Otomatik AI');
  
  const result = await generateMultiRoadmap({
    userId: 'test-user-id',
    projectText: `
      ESP32 ile akıllı ev otomasyonu sistemi.
      Özellikler:
      - DHT22 ile sıcaklık ve nem takibi
      - Relay modül ile aydınlatma kontrolü  
      - Web dashboard (React)
      - MQTT protokolü
      - Mobile app (opsiyonel)
    `,
    mode: RoadmapCreationMode.AI_AUTO,
    categoryInput: {
      mode: CategoryInputMode.AI_AUTO,
    },
  });

  console.log('Sonuç:', result);
  // Beklenen: 4-6 kategori (AI belirledi sayı + isimleri), çok sayıda node
}

// ============================================================================
// ÇALIŞTIR
// ============================================================================

async function runAllTests() {
  console.log('🚀 Multi-Roadmap Test Başlıyor...\n');
  
  // Manuel testler (hızlı)
  await testManualNoCategory();
  await testManualWithCategories();
  
  // AI testler (yavaş - API çağrısı var)
  // await testAIWithCategories();
  // await testAIWithCategoryCount();
  // await testFullAutoAI();
  
  console.log('\n✅ Testler tamamlandı!');
}

// Export for Next.js API route veya test runner
export { runAllTests };

// Doğrudan çalıştırmak için (node ile):
// runAllTests().catch(console.error);
