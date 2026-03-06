import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Plus, Upload, X } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Category, ExternalBlob } from "../../backend";
import { useCreateExperience } from "../../hooks/useExperiences";

interface ThumbnailEntry {
  id: string;
  file: File;
  preview: string;
}

interface PublishExperienceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function PublishExperienceDialog({
  open,
  onOpenChange,
}: PublishExperienceDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<Category>(Category.adventure);
  const [gameplayControls, setGameplayControls] = useState("");
  const [thumbnails, setThumbnails] = useState<ThumbnailEntry[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const addInputRef = useRef<HTMLInputElement>(null);

  const createMutation = useCreateExperience();

  const addThumbnails = (files: FileList | null) => {
    if (!files) return;
    const newEntries: ThumbnailEntry[] = [];
    const promises = Array.from(files).map(
      (file) =>
        new Promise<void>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            // Use name + size + lastModified as a stable-enough key
            const id = `${file.name}-${file.size}-${file.lastModified}`;
            newEntries.push({ id, file, preview: reader.result as string });
            resolve();
          };
          reader.readAsDataURL(file);
        }),
    );
    Promise.all(promises).then(() => {
      setThumbnails((prev) => [...prev, ...newEntries]);
    });
  };

  const handleAddThumbnails = (e: React.ChangeEvent<HTMLInputElement>) => {
    addThumbnails(e.target.files);
    // Reset so the same file can be re-added if removed
    e.target.value = "";
  };

  const handleRemoveThumbnail = (id: string) => {
    setThumbnails((prev) => prev.filter((t) => t.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !description.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      let thumbnailBlob: ExternalBlob | null = null;

      // Only the first (primary) thumbnail is sent to the backend
      const primaryFile = thumbnails[0]?.file ?? null;
      if (primaryFile) {
        const arrayBuffer = await primaryFile.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        thumbnailBlob = ExternalBlob.fromBytes(uint8Array).withUploadProgress(
          (percentage) => {
            setUploadProgress(percentage);
          },
        );
      }

      const controlsText =
        gameplayControls.trim() ||
        "Use WASD to move, Space to jump, Mouse to control camera.";

      await createMutation.mutateAsync({
        title: title.trim(),
        description: description.trim(),
        thumbnail: thumbnailBlob,
        category,
        gameplayControls: controlsText,
      });

      toast.success("Experience published successfully!");
      setTitle("");
      setDescription("");
      setCategory(Category.adventure);
      setGameplayControls("");
      setThumbnails([]);
      setUploadProgress(0);
      onOpenChange(false);
    } catch (error) {
      console.error("Publish error:", error);
      toast.error("Failed to publish experience. Please try again.");
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
              data-ocid="publish.title.input"
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
              data-ocid="publish.description.textarea"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <Select
              value={category}
              onValueChange={(value) => setCategory(value as Category)}
            >
              <SelectTrigger id="category" data-ocid="publish.category.select">
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
              data-ocid="publish.controls.textarea"
            />
            <p className="text-xs text-muted-foreground">
              Leave blank to use default controls
            </p>
          </div>

          {/* ── Multi-thumbnail section ── */}
          <div className="space-y-3">
            <Label>Thumbnails (Optional)</Label>
            <p className="text-xs text-muted-foreground -mt-1">
              The{" "}
              <span className="font-semibold text-foreground">
                first thumbnail
              </span>{" "}
              is the primary one shown on the Discover page. Add more for extra
              previews.
            </p>

            <div className="space-y-3">
              {thumbnails.map((entry, index) => (
                <div key={entry.id} className="relative">
                  {/* Primary badge */}
                  {index === 0 && (
                    <span className="absolute top-2 left-2 z-10 bg-primary text-primary-foreground text-[10px] font-semibold px-2 py-0.5 rounded-full">
                      Primary (shown on Discover page)
                    </span>
                  )}
                  <div className="relative aspect-video bg-muted rounded-lg overflow-hidden border border-border">
                    <img
                      src={entry.preview}
                      alt={`Thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 h-7 w-7"
                      onClick={() => handleRemoveThumbnail(entry.id)}
                      data-ocid={`publish.thumbnail.delete_button.${index + 1}`}
                      aria-label={`Remove thumbnail ${index + 1}`}
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}

              {/* Add thumbnail zone — always visible */}
              <label
                htmlFor="thumbnail-add-input"
                className="flex flex-col items-center justify-center gap-1.5 py-5 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors"
                data-ocid="publish.thumbnail.upload_button"
              >
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Plus className="h-4 w-4" />
                  <Upload className="h-4 w-4" />
                </div>
                <span className="text-sm text-muted-foreground">
                  {thumbnails.length === 0
                    ? "Click to upload thumbnail(s)"
                    : "Add more thumbnails"}
                </span>
                <input
                  ref={addInputRef}
                  id="thumbnail-add-input"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleAddThumbnails}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {uploadProgress > 0 && uploadProgress < 100 && (
            <div className="space-y-2" data-ocid="publish.upload.loading_state">
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
              data-ocid="publish.cancel_button"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createMutation.isPending}
              data-ocid="publish.submit_button"
            >
              {createMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Publish
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
