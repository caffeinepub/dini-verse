import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Save, Download, Upload, Trash2 } from 'lucide-react';
import { useBuilder2DProps } from '../../../hooks/useBuilder2DProps';
import { toast } from 'sonner';

interface PropsPanelProps {
  builder: ReturnType<typeof import('../../../hooks/useBuilder2D').useBuilder2D>;
}

export default function PropsPanel({ builder }: PropsPanelProps) {
  const { props, saveProp, deleteProp, exportProp, importProp } = useBuilder2DProps();
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [propName, setPropName] = useState('');
  const [exportData, setExportData] = useState('');
  const [importData, setImportData] = useState('');

  const handleSave = () => {
    if (!propName.trim()) {
      toast.error('Please enter a name for your prop');
      return;
    }
    if (builder.elements.length === 0) {
      toast.error('Canvas is empty. Add some elements first.');
      return;
    }
    saveProp(propName, builder.elements);
    toast.success(`Prop "${propName}" saved!`);
    setPropName('');
    setSaveDialogOpen(false);
  };

  const handleLoad = (propId: string) => {
    const prop = props.find((p) => p.id === propId);
    if (prop) {
      builder.loadElements(prop.elements);
      toast.success(`Loaded "${prop.name}"`);
    }
  };

  const handleExport = (propId: string) => {
    const prop = props.find((p) => p.id === propId);
    if (prop) {
      setExportData(exportProp(prop));
      setExportDialogOpen(true);
    }
  };

  const handleImport = () => {
    const imported = importProp(importData);
    if (imported) {
      toast.success(`Imported "${imported.name}"`);
      setImportData('');
      setImportDialogOpen(false);
    } else {
      toast.error('Failed to import prop. Check the format.');
    }
  };

  const handleDelete = (propId: string) => {
    const prop = props.find((p) => p.id === propId);
    if (prop && confirm(`Delete "${prop.name}"?`)) {
      deleteProp(propId);
      toast.success('Prop deleted');
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(exportData);
    toast.success('Copied to clipboard!');
  };

  return (
    <>
      <Card className="m-4 border-0 shadow-none">
        <CardHeader>
          <CardTitle className="text-sm">Saved Props</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start gap-2"
              onClick={() => setSaveDialogOpen(true)}
            >
              <Save className="h-4 w-4" />
              Save Current Canvas
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start gap-2"
              onClick={() => setImportDialogOpen(true)}
            >
              <Upload className="h-4 w-4" />
              Import Prop
            </Button>
          </div>

          <div className="border-t pt-4">
            {props.length === 0 ? (
              <div className="text-sm text-muted-foreground text-center py-4">
                No saved props yet
              </div>
            ) : (
              <div className="space-y-2">
                {props.map((prop) => (
                  <div key={prop.id} className="border rounded-lg p-3 space-y-2">
                    <div className="font-medium text-sm">{prop.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {prop.elements.length} element{prop.elements.length !== 1 ? 's' : ''}
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 text-xs"
                        onClick={() => handleLoad(prop.id)}
                      >
                        Load
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleExport(prop.id)}
                      >
                        <Download className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(prop.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Prop</DialogTitle>
            <DialogDescription>
              Give your prop a name to save it for later use.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="prop-name">Prop Name</Label>
              <Input
                id="prop-name"
                value={propName}
                onChange={(e) => setPropName(e.target.value)}
                placeholder="My Awesome Prop"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSaveDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={exportDialogOpen} onOpenChange={setExportDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Export Prop</DialogTitle>
            <DialogDescription>
              Copy this JSON to share your prop with others.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Textarea
              value={exportData}
              readOnly
              className="font-mono text-xs h-64"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setExportDialogOpen(false)}>
              Close
            </Button>
            <Button onClick={copyToClipboard}>Copy to Clipboard</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Import Prop</DialogTitle>
            <DialogDescription>
              Paste the JSON data of a prop to import it.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Textarea
              value={importData}
              onChange={(e) => setImportData(e.target.value)}
              placeholder="Paste JSON here..."
              className="font-mono text-xs h-64"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setImportDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleImport}>Import</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
