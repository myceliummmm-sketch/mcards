import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CardImageGeneratorProps {
  cardType: string;
  cardContent: any;
  phase: string;
  onImageGenerated: (imageUrl: string) => void;
  currentImageUrl?: string;
}

export const CardImageGenerator = ({ 
  cardType, 
  cardContent, 
  phase, 
  onImageGenerated,
  currentImageUrl 
}: CardImageGeneratorProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const generateImage = async () => {
    setIsGenerating(true);
    try {
      // Summarize card content for image prompt
      const contentSummary = Object.values(cardContent)
        .filter(v => v && typeof v === 'string')
        .slice(0, 3)
        .join('. ')
        .substring(0, 200);

      const { data, error } = await supabase.functions.invoke('generate-card-image', {
        body: { 
          cardType, 
          cardContent: contentSummary,
          phase 
        }
      });

      if (error) throw error;

      if (data?.imageUrl) {
        onImageGenerated(data.imageUrl);
        toast({
          title: '✨ Card image crafted',
          description: 'Your card now has a unique visual identity.',
        });
      }
    } catch (error) {
      console.error('Error generating image:', error);
      toast({
        title: 'Failed to generate image',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="mb-6">
      {currentImageUrl && (
        <div className="mb-4 relative overflow-hidden rounded-lg border border-primary/20">
          <img 
            src={currentImageUrl} 
            alt="Card artwork"
            className="w-full h-48 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
        </div>
      )}
      
      <Button
        onClick={generateImage}
        disabled={isGenerating}
        variant="outline"
        className="w-full gap-2 bg-primary/5 border-primary/20 hover:bg-primary/10"
      >
        {isGenerating ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Crafting visual identity...
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4" />
            {currentImageUrl ? 'Regenerate Card Image' : 'Generate Card Image'}
          </>
        )}
      </Button>
    </div>
  );
};
