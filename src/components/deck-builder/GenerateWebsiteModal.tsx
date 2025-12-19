import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Check, Edit2, Copy, ExternalLink, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type DeckCard = Database['public']['Tables']['deck_cards']['Row'];

interface WebsiteSection {
  id: string;
  title: string;
  content: string;
  enabled: boolean;
}

interface RawCardData {
  product: Record<string, any>;
  problem: Record<string, any>;
  audience: Record<string, any>;
  value: Record<string, any>;
  vision: Record<string, any>;
}

interface WebsiteMetadata {
  product_name?: string;
  tagline?: string;
  primary_color_suggestion?: string;
}

interface GenerateWebsiteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cards: DeckCard[];
  deckId: string;
}

export const GenerateWebsiteModal = ({
  open,
  onOpenChange,
  cards,
  deckId,
}: GenerateWebsiteModalProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [sections, setSections] = useState<WebsiteSection[]>([]);
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [rawCardData, setRawCardData] = useState<RawCardData | null>(null);
  const [metadata, setMetadata] = useState<WebsiteMetadata>({});

  useEffect(() => {
    if (open && sections.length === 0) {
      generateBrief();
    }
  }, [open]);

  const generateBrief = async () => {
    setIsGenerating(true);
    try {
      // Extract vision card data
      const visionCards = cards.filter(c => c.card_slot >= 1 && c.card_slot <= 5);
      const cardData = visionCards.reduce((acc, card) => {
        acc[`slot_${card.card_slot}`] = card.card_data;
        return acc;
      }, {} as Record<string, any>);

      const { data, error } = await supabase.functions.invoke('generate-website-brief', {
        body: { cardData, deckId },
      });

      if (error) throw error;

      setSections(data.sections.map((s: any) => ({ ...s, enabled: true })));
      setRawCardData(data.rawCardData || null);
      setMetadata(data.metadata || {});
    } catch (error) {
      console.error('Error generating brief:', error);
      toast.error('Failed to generate website brief');
      // Set default sections on error
      setSections([
        { id: 'hero', title: 'Hero Section', content: 'Complete your Vision cards to generate content', enabled: true },
        { id: 'problem', title: 'Problem Statement', content: 'Awaiting card data...', enabled: true },
        { id: 'solution', title: 'Solution', content: 'Awaiting card data...', enabled: true },
        { id: 'benefits', title: 'Key Benefits', content: 'Awaiting card data...', enabled: true },
        { id: 'cta', title: 'Call to Action', content: 'Awaiting card data...', enabled: true },
      ]);
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleSection = (id: string) => {
    setSections(prev => 
      prev.map(s => s.id === id ? { ...s, enabled: !s.enabled } : s)
    );
  };

  const startEditing = (section: WebsiteSection) => {
    setEditingSection(section.id);
    setEditContent(section.content);
  };

  const saveEdit = () => {
    if (!editingSection) return;
    setSections(prev =>
      prev.map(s => s.id === editingSection ? { ...s, content: editContent } : s)
    );
    setEditingSection(null);
    setEditContent('');
  };

  const generatePrompt = () => {
    const enabledSections = sections.filter(s => s.enabled);
    const { product, problem, audience, value, vision } = rawCardData || {};
    
    let prompt = `# Create a Professional Landing Page

## Product Overview
**Name:** ${metadata.product_name || product?.product_name || 'Your Product'}
**Tagline:** ${metadata.tagline || product?.one_liner || 'The smart solution'}
${product?.analogy ? `**Think of it as:** ${product.analogy}` : ''}
${product?.target_audience ? `**For:** ${product.target_audience}` : ''}

## Problem We Solve
${problem?.who_suffers ? `**Who struggles:** ${problem.who_suffers}` : ''}
${problem?.pain_description ? `**Their pain:** ${problem.pain_description}` : ''}
${problem?.pain_cost ? `**Cost of not solving:** ${problem.pain_cost}` : ''}

## Target Audience
${audience?.demographics ? `**Demographics:** ${audience.demographics}` : ''}
${audience?.goals ? `**Their goals:** ${audience.goals}` : ''}
${audience?.pain_points ? `**Pain points:** ${audience.pain_points}` : ''}

## Value Proposition
${value?.current_alternative ? `**Current alternatives:** ${value.current_alternative}` : ''}
${value?.alternative_cost ? `**Cost of alternatives:** ${value.alternative_cost}` : ''}
${value?.your_solution ? `**Our solution:** ${value.your_solution}` : ''}
${value?.your_price ? `**Our price:** ${value.your_price}` : ''}

## Vision
${vision?.vision_statement ? `**Vision:** ${vision.vision_statement}` : ''}
${vision?.what_becomes_possible ? `**What becomes possible:** ${vision.what_becomes_possible}` : ''}

---

## Website Sections to Create:

${enabledSections.map(s => `### ${s.title}
${s.content}`).join('\n\n')}

---

## Design Requirements:
- Modern, clean design with ${metadata.primary_color_suggestion || 'professional'} color scheme
- Smooth animations and micro-interactions (use Framer Motion)
- Fully mobile-responsive layout
- Clear, prominent call-to-action buttons
- Trust indicators and social proof elements
- Fast loading with optimized images
- Accessible design (WCAG compliant)
- Use Tailwind CSS for styling
- React + TypeScript

## Technical Stack:
- React with TypeScript
- Tailwind CSS
- Framer Motion for animations
- Lucide React for icons
- Shadcn/ui components

Please create a complete, production-ready landing page with all sections above.`;

    return prompt;
  };

  const copyPrompt = () => {
    const prompt = generatePrompt();
    navigator.clipboard.writeText(prompt);
    toast.success('Prompt copied to clipboard!');
  };

  const openInLovable = () => {
    const prompt = encodeURIComponent(generatePrompt());
    window.open(`https://lovable.dev/projects/create?prompt=${prompt}`, '_blank');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <div className="p-2 rounded-lg bg-gradient-to-br from-primary/20 to-purple-500/20">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            Build with Lovable
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto py-4 space-y-4">
          <AnimatePresence mode="wait">
            {isGenerating ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-12 gap-4"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  <Loader2 className="w-10 h-10 text-primary" />
                </motion.div>
                <p className="text-muted-foreground">Generating your website brief...</p>
                <div className="flex gap-1">
                  {[0, 1, 2].map(i => (
                    <motion.div
                      key={i}
                      className="w-2 h-2 rounded-full bg-primary"
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 1, delay: i * 0.2, repeat: Infinity }}
                    />
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="content"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-3"
              >
                <p className="text-sm text-muted-foreground mb-4">
                  Select the sections to include in your website and customize the content:
                </p>

                {sections.map((section, index) => (
                  <motion.div
                    key={section.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`rounded-lg border p-4 transition-all ${
                      section.enabled 
                        ? 'border-primary/30 bg-primary/5' 
                        : 'border-muted bg-muted/20 opacity-60'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <Checkbox
                        checked={section.enabled}
                        onCheckedChange={() => toggleSection(section.id)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold">{section.title}</h4>
                          {section.enabled && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => startEditing(section)}
                              className="h-7 px-2"
                            >
                              <Edit2 className="w-3 h-3 mr-1" />
                              Edit
                            </Button>
                          )}
                        </div>
                        
                        {editingSection === section.id ? (
                          <div className="space-y-2">
                            <Textarea
                              value={editContent}
                              onChange={(e) => setEditContent(e.target.value)}
                              className="min-h-[100px] text-sm"
                            />
                            <div className="flex gap-2">
                              <Button size="sm" onClick={saveEdit}>
                                <Check className="w-3 h-3 mr-1" />
                                Save
                              </Button>
                              <Button 
                                size="sm" 
                                variant="ghost"
                                onClick={() => setEditingSection(null)}
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground line-clamp-3">
                            {section.content}
                          </p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer actions */}
        <div className="flex gap-3 pt-4 border-t">
          <Button variant="outline" onClick={copyPrompt} className="flex-1">
            <Copy className="w-4 h-4 mr-2" />
            Copy Prompt
          </Button>
          <Button onClick={openInLovable} className="flex-1 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90">
            <ExternalLink className="w-4 h-4 mr-2" />
            Open in Lovable
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
