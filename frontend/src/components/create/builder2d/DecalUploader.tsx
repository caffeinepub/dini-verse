import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';
import { useRef } from 'react';

interface DecalUploaderProps {
  builder: ReturnType<typeof import('../../../hooks/useBuilder2D').useBuilder2D>;
}

export default function DecalUploader({ builder }: DecalUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const imageData = event.target?.result as string;
      builder.addDecal(imageData);
    };
    reader.readAsDataURL(file);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
      <Button
        variant="outline"
        className="w-full justify-start gap-2"
        onClick={() => fileInputRef.current?.click()}
      >
        <Upload className="h-4 w-4" />
        Upload Image
      </Button>
    </div>
  );
}
