'use client';

// This is an example showcase component demonstrating the Proyon design system
// You can use this as a reference for building your own components

import { GlassCard, GradientText } from '@/components/proyon';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { 
  Rocket, 
  Zap, 
  Shield, 
  Star, 
  Heart,
  Sparkles,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';

export function DesignShowcase() {
  return (
    <div className="space-y-12 p-8">
      {/* Header */}
      <section>
        <GradientText as="h1" className="text-5xl font-bold mb-4">
          Proyon Design System
        </GradientText>
        <p className="text-muted-foreground text-lg">
          A collection of components showcasing the cyber-professional design aesthetic
        </p>
      </section>

      {/* Buttons Section */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Buttons</h2>
        <div className="flex flex-wrap gap-4">
          <Button className="neon-glow">
            <Rocket className="w-4 h-4 mr-2" />
            Primary Glow
          </Button>
          <Button variant="outline" className="border-primary/30">
            <Star className="w-4 h-4 mr-2" />
            Outline
          </Button>
          <Button variant="secondary">
            <Zap className="w-4 h-4 mr-2" />
            Secondary
          </Button>
          <Button variant="ghost">
            Ghost Button
          </Button>
          <Button className="bg-gradient-to-r from-primary to-[#d946ef]">
            <Sparkles className="w-4 h-4 mr-2" />
            Gradient
          </Button>
        </div>
      </section>

      {/* Badges Section */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Badges</h2>
        <div className="flex flex-wrap gap-2">
          <Badge className="neon-glow">Neon Glow</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="outline">Outline</Badge>
          <Badge className="bg-gradient-to-r from-primary to-[#d946ef]">Gradient</Badge>
          <Badge className="bg-accent text-accent-foreground">Accent</Badge>
          <Badge variant="destructive">Destructive</Badge>
        </div>
      </section>

      {/* Glass Cards Section */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Glass Cards</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <GlassCard hover>
            <div className="space-y-3">
              <Shield className="w-10 h-10 text-primary" />
              <h3 className="text-xl font-semibold">Hover Effect</h3>
              <p className="text-muted-foreground">
                This card scales and glows on hover
              </p>
            </div>
          </GlassCard>

          <GlassCard neonBorder>
            <div className="space-y-3">
              <Zap className="w-10 h-10 text-secondary" />
              <h3 className="text-xl font-semibold">Neon Border</h3>
              <p className="text-muted-foreground">
                This card has a neon border effect
              </p>
            </div>
          </GlassCard>

          <GlassCard hover neonBorder>
            <div className="space-y-3">
              <Star className="w-10 h-10 text-accent" />
              <h3 className="text-xl font-semibold">Combined</h3>
              <p className="text-muted-foreground">
                Both hover and neon border
              </p>
            </div>
          </GlassCard>
        </div>
      </section>

      {/* Standard Cards */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Standard Cards</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="glass">
            <CardHeader>
              <CardTitle className="gradient-text">Glass Card</CardTitle>
              <CardDescription>With glass morphism effect</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                This card uses the glass utility class for a translucent appearance
                with backdrop blur.
              </p>
            </CardContent>
            <CardFooter>
              <Button variant="ghost" className="w-full">
                Learn More
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardFooter>
          </Card>

          <Card className="border-primary/30">
            <CardHeader>
              <CardTitle>
                <div className="flex items-center gap-2">
                  <Heart className="w-5 h-5 text-primary" />
                  Featured Card
                </div>
              </CardTitle>
              <CardDescription>With accent border</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span>Feature one</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span>Feature two</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span>Feature three</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Input Fields */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Input Fields</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Default Input</label>
            <Input placeholder="Enter text..." />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Input with Focus Ring</label>
            <Input 
              placeholder="Focus me..." 
              className="focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>
      </section>

      {/* Gradient Text Examples */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Typography</h2>
        <div className="space-y-4">
          <GradientText as="h1" className="text-5xl font-bold">
            H1 Gradient Heading
          </GradientText>
          <GradientText as="h2" className="text-4xl font-bold">
            H2 Gradient Heading
          </GradientText>
          <GradientText as="h3" className="text-3xl font-semibold">
            H3 Gradient Heading
          </GradientText>
          <p className="gradient-text text-xl">
            You can also use the gradient-text utility class directly
          </p>
        </div>
      </section>

      {/* Color Palette */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Color Palette</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <div className="h-20 rounded-lg bg-[#020617] border border-white/10"></div>
            <p className="text-sm font-medium">Background</p>
            <code className="text-xs text-muted-foreground">#020617</code>
          </div>
          <div className="space-y-2">
            <div className="h-20 rounded-lg bg-[#7c3aed] neon-glow"></div>
            <p className="text-sm font-medium">Primary</p>
            <code className="text-xs text-muted-foreground">#7c3aed</code>
          </div>
          <div className="space-y-2">
            <div className="h-20 rounded-lg bg-[#22d3ee]"></div>
            <p className="text-sm font-medium">Accent</p>
            <code className="text-xs text-muted-foreground">#22d3ee</code>
          </div>
          <div className="space-y-2">
            <div className="h-20 rounded-lg bg-[#d946ef]"></div>
            <p className="text-sm font-medium">Fuchsia</p>
            <code className="text-xs text-muted-foreground">#d946ef</code>
          </div>
        </div>
      </section>
    </div>
  );
}
