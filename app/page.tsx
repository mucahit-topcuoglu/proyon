import { 
  HeroSection, 
  FeaturesSection, 
  TestimonialsSection, 
  CTASection,
  Navbar,
  Footer
} from '@/components/landing';

// Force dynamic rendering - no caching
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function Home() {
  return (
    <div className="min-h-screen">
      {/* Professional Navbar */}
      <Navbar />

      {/* Modern Landing Page Sections */}
      <HeroSection />
      <FeaturesSection />
      <TestimonialsSection />
      <CTASection />

      {/* Professional Footer */}
      <Footer />
    </div>
  );
}
