import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ExternalBlob, Category } from '../../backend';
import { useCreateExperience } from '../../hooks/useExperiences';
import { toast } from 'sonner';
import { Loader2, Upload, X } from 'lucide-react';

interface PublishExperienceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function PublishExperienceDialog({ open, onOpenChange }: PublishExperienceDialogProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<Category>(Category.adventure);
  const [gameplayControls, setGameplayControls] = useState('');
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const createMutation = useCreateExperience();

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setThumbnailFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveThumbnail = () => {
    setThumbnailFile(null);
    setThumbnailPreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !description.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      let thumbnailBlob: ExternalBlob | null = null;

      if (thumbnailFile) {
        const arrayBuffer = await thumbnailFile.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        thumbnailBlob = ExternalBlob.fromBytes(uint8Array).withUploadProgress((percentage) => {
          setUploadProgress(percentage);
        });
      }

      const controlsText = gameplayControls.trim() || 'Use WASD to move, Space to jump, Mouse to control camera.';

      await createMutation.mutateAsync({
        title: title.trim(),
        description: description.trim(),
        thumbnail: thumbnailBlob,
        category,
        gameplayControls: controlsText,
      });

      toast.success('Experience published successfully!');
      setTitle('');
      setDescription('');
      setCategory(Category.adventure);
      setGameplayControls('');
      setThumbnailFile(null);
      setThumbnailPreview(null);
      setUploadProgress(0);
      onOpenChange(false);
    } catch (error) {
      console.error('Publish error:', error);
      toast.error('Failed to publish experience. Please try again.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Publish New Experience</DialogTitle>
          <DialogDescription>
            Share your creation with the Dini.Verse community
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              placeholder="Enter experience title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              placeholder="Describe your experience..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <Select value={category} onValueChange={(value) => setCategory(value as Category)}>
              <SelectTrigger id="category">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={Category.adventure}>Adventure</SelectItem>
                <SelectItem value={Category.roleplay}>Roleplay</SelectItem>
                <SelectItem value={Category.simulator}>Simulator</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="controls">Gameplay Controls (Optional)</Label>
            <Textarea
              id="controls"
              placeholder="Describe the controls for your experience (e.g., WASD to move, Space to jump)..."
              value={gameplayControls}
              onChange={(e) => setGameplayControls(e.target.value)}
              rows={3}
            />
            <p className="text-xs text-muted-foreground">
              Leave blank to use default controls
            </p>
          </div>

          <div className="space-y-2">
            <Label>Thumbnail (Optional)</Label>
            {thumbnailPreview ? (
              <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
                <img
                  src={thumbnailPreview}
                  alt="Thumbnail preview"
                  className="w-full h-full object-cover"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2"
                  onClick={handleRemoveThumbnail}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <label
                htmlFor="thumbnail-upload"
                className="flex flex-col items-center justify-center aspect-video border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary transition-colors"
              >
                <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                <span className="text-sm text-muted-foreground">Click to upload thumbnail</span>
                <input
                  id="thumbnail-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleThumbnailChange}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {uploadProgress > 0 && uploadProgress < 100 && (
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">
                Uploading: {uploadProgress}%
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={createMutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Publish
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
