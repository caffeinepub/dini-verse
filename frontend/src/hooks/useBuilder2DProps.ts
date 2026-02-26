import { useState, useCallback, useEffect } from 'react';
import { BuilderElement } from './useBuilder2D';

export interface SavedProp {
  id: string;
  name: string;
  elements: BuilderElement[];
  createdAt: number;
}

const STORAGE_KEY = 'diniverse-builder-props';

export function useBuilder2DProps() {
  const [props, setProps] = useState<SavedProp[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setProps(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to load props:', e);
      }
    }
  }, []);

  const saveProps = useCallback((newProps: SavedProp[]) => {
    setProps(newProps);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newProps));
  }, []);

  const saveProp = useCallback((name: string, elements: BuilderElement[]) => {
    const newProp: SavedProp = {
      id: `prop-${Date.now()}`,
      name,
      elements: JSON.parse(JSON.stringify(elements)),
      createdAt: Date.now(),
    };
    saveProps([...props, newProp]);
    return newProp;
  }, [props, saveProps]);

  const deleteProp = useCallback((id: string) => {
    saveProps(props.filter((p) => p.id !== id));
  }, [props, saveProps]);

  const exportProp = useCallback((prop: SavedProp): string => {
    return JSON.stringify(prop, null, 2);
  }, []);

  const importProp = useCallback((jsonString: string): SavedProp | null => {
    try {
      const prop = JSON.parse(jsonString) as SavedProp;
      if (!prop.id || !prop.name || !Array.isArray(prop.elements)) {
        throw new Error('Invalid prop format');
      }
      const imported = { ...prop, id: `prop-${Date.now()}` };
      saveProps([...props, imported]);
      return imported;
    } catch (e) {
      console.error('Failed to import prop:', e);
      return null;
    }
  }, [props, saveProps]);

  return {
    props,
    saveProp,
    deleteProp,
    exportProp,
    importProp,
  };
}
