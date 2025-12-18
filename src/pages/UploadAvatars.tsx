import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';

const AVATAR_FILES = [
  'ever.png',
  'phoenix.png',
  'prisma.png',
  'techpriest.png',
  'toxic.png',
  'virgilia.png',
  'zen.png'
];

export default function UploadAvatars() {
  const [status, setStatus] = useState<string>('');
  const [results, setResults] = useState<{ file: string; status: string }[]>([]);
  const [uploading, setUploading] = useState(false);

  const uploadAvatars = async () => {
    setUploading(true);
    setStatus('Starting upload...');
    const uploadResults: { file: string; status: string }[] = [];

    for (const fileName of AVATAR_FILES) {
      try {
        setStatus(`Fetching ${fileName}...`);
        
        // Fetch from public folder
        const response = await fetch(`/avatars/${fileName}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch: ${response.status}`);
        }

        const blob = await response.blob();
        
        setStatus(`Uploading ${fileName}...`);

        const { error } = await supabase.storage
          .from('avatars')
          .upload(fileName, blob, {
            contentType: 'image/png',
            upsert: true
          });

        if (error) throw error;

        uploadResults.push({ file: fileName, status: '✓ Success' });
      } catch (error) {
        uploadResults.push({ 
          file: fileName, 
          status: `✗ Error: ${error instanceof Error ? error.message : 'Unknown'}` 
        });
      }
      setResults([...uploadResults]);
    }

    const successful = uploadResults.filter(r => r.status.includes('Success')).length;
    setStatus(`Done! ${successful}/${AVATAR_FILES.length} avatars uploaded.`);
    setUploading(false);
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Upload Avatars to Storage</h1>
        
        <p className="text-muted-foreground mb-6">
          Click the button below to upload all 7 avatar images to Supabase Storage.
          This will make them permanently accessible for emails.
        </p>

        <Button 
          onClick={uploadAvatars} 
          disabled={uploading}
          size="lg"
        >
          {uploading ? 'Uploading...' : 'Upload All Avatars'}
        </Button>

        {status && (
          <p className="mt-4 text-lg font-medium">{status}</p>
        )}

        {results.length > 0 && (
          <div className="mt-6 space-y-2">
            {results.map((r) => (
              <div key={r.file} className="flex justify-between p-3 bg-muted rounded">
                <span>{r.file}</span>
                <span className={r.status.includes('Success') ? 'text-green-500' : 'text-red-500'}>
                  {r.status}
                </span>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 p-4 bg-muted rounded">
          <h2 className="font-semibold mb-2">Storage URL format:</h2>
          <code className="text-sm break-all">
            https://nanzsuokgzzdeibyopkw.supabase.co/storage/v1/object/public/avatars/[filename].png
          </code>
        </div>
      </div>
    </div>
  );
}
