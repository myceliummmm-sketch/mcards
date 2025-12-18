import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const AVATAR_FILES = [
  'ever.png',
  'phoenix.png', 
  'prisma.png',
  'techpriest.png',
  'toxic.png',
  'virgilia.png',
  'zen.png'
];

// Base64 encoded PNG files - these are the actual avatar images
const AVATAR_DATA: Record<string, string> = {
  // We'll fetch from the deployed app's public folder
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const results: { file: string; status: string; error?: string }[] = [];

    // Get the source URL from request body or use defaults
    const body = await req.json().catch(() => ({}));
    const customSourceUrl = body.sourceUrl;
    
    // Try multiple source URLs
    const sourceUrls = customSourceUrl ? [customSourceUrl] : [
      'https://id-preview--5e4907ad-da7c-49d6-9e4d-9a1a33b19676.lovable.app/avatars',
      'https://5e4907ad-da7c-49d6-9e4d-9a1a33b19676.lovableproject.com/avatars',
    ];

    for (const fileName of AVATAR_FILES) {
      let uploaded = false;
      
      for (const sourceBaseUrl of sourceUrls) {
        if (uploaded) break;
        
        try {
          console.log(`Trying ${sourceBaseUrl}/${fileName}...`);
          
          const response = await fetch(`${sourceBaseUrl}/${fileName}`);
          
          if (!response.ok) {
            console.log(`Not found at ${sourceBaseUrl}: ${response.status}`);
            continue;
          }

          const imageBlob = await response.blob();
          const arrayBuffer = await imageBlob.arrayBuffer();
          const uint8Array = new Uint8Array(arrayBuffer);

          console.log(`Uploading ${fileName} (${uint8Array.length} bytes)...`);

          const { data, error } = await supabase.storage
            .from('avatars')
            .upload(fileName, uint8Array, {
              contentType: 'image/png',
              upsert: true
            });

          if (error) {
            throw error;
          }

          results.push({ file: fileName, status: 'success' });
          console.log(`✓ Uploaded ${fileName}`);
          uploaded = true;

        } catch (error) {
          console.error(`Failed from ${sourceBaseUrl}:`, error);
        }
      }
      
      if (!uploaded) {
        results.push({ 
          file: fileName, 
          status: 'error', 
          error: 'Could not fetch from any source URL' 
        });
      }
    }

    const successful = results.filter(r => r.status === 'success').length;
    const failed = results.filter(r => r.status === 'error').length;

    return new Response(
      JSON.stringify({
        message: `Uploaded ${successful}/${AVATAR_FILES.length} avatars`,
        successful,
        failed,
        results
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Upload error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
