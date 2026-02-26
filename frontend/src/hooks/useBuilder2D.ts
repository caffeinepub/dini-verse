import { useState, useCallback } from 'react';

export type ShapeType = 'rectangle' | 'circle' | 'triangle';

export interface BuilderElement {
  id: string;
  type: 'shape' | 'decal';
  shapeType?: ShapeType;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  opacity: number;
  color?: string;
  imageData?: string;
  zIndex: number;
}

export interface Builder2DState {
  elements: BuilderElement[];
  selectedId: string | null;
  nextId: number;
}

export function useBuilder2D() {
  const [state, setState] = useState<Builder2DState>({
    elements: [],
    selectedId: null,
    nextId: 1,
  });

  const addShape = useCallback((shapeType: ShapeType) => {
    setState((prev) => {
      const newElement: BuilderElement = {
        id: `element-${prev.nextId}`,
        type: 'shape',
        shapeType,
        x: 100,
        y: 100,
        width: 100,
        height: 100,
        rotation: 0,
        opacity: 1,
        color: '#cde5aa',
        zIndex: prev.elements.length,
      };
      return {
        elements: [...prev.elements, newElement],
        selectedId: newElement.id,
        nextId: prev.nextId + 1,
      };
    });
  }, []);

  const addDecal = useCallback((imageData: string) => {
    setState((prev) => {
      const newElement: BuilderElement = {
        id: `element-${prev.nextId}`,
        type: 'decal',
        x: 100,
        y: 100,
        width: 150,
        height: 150,
        rotation: 0,
        opacity: 1,
        imageData,
        zIndex: prev.elements.length,
      };
      return {
        elements: [...prev.elements, newElement],
        selectedId: newElement.id,
        nextId: prev.nextId + 1,
      };
    });
  }, []);

  const selectElement = useCallback((id: string | null) => {
    setState((prev) => ({ ...prev, selectedId: id }));
  }, []);

  const updateElement = useCallback((id: string, updates: Partial<BuilderElement>) => {
    setState((prev) => ({
      ...prev,
      elements: prev.elements.map((el) =>
        el.id === id ? { ...el, ...updates } : el
      ),
    }));
  }, []);

  const deleteElement = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      elements: prev.elements.filter((el) => el.id !== id),
      selectedId: prev.selectedId === id ? null : prev.selectedId,
    }));
  }, []);

  const moveElementForward = useCallback((id: string) => {
    setState((prev) => {
      const elements = [...prev.elements];
      const index = elements.findIndex((el) => el.id === id);
      if (index < elements.length - 1) {
        const temp = elements[index].zIndex;
        elements[index].zIndex = elements[index + 1].zIndex;
        elements[index + 1].zIndex = temp;
        elements.sort((a, b) => a.zIndex - b.zIndex);
      }
      return { ...prev, elements };
    });
  }, []);

  const moveElementBackward = useCallback((id: string) => {
    setState((prev) => {
      const elements = [...prev.elements];
      const index = elements.findIndex((el) => el.id === id);
      if (index > 0) {
        const temp = elements[index].zIndex;
        elements[index].zIndex = elements[index - 1].zIndex;
        elements[index - 1].zIndex = temp;
        elements.sort((a, b) => a.zIndex - b.zIndex);
      }
      return { ...prev, elements };
    });
  }, []);

  const clearCanvas = useCallback(() => {
    setState({
      elements: [],
      selectedId: null,
      nextId: 1,
    });
  }, []);

  const loadElements = useCallback((elements: BuilderElement[]) => {
    setState((prev) => ({
      elements,
      selectedId: null,
      nextId: prev.nextId,
    }));
  }, []);

  const selectedElement = state.elements.find((el) => el.id === state.selectedId);

  return {
    elements: state.elements,
    selectedId: state.selectedId,
    selectedElement,
    addShape,
    addDecal,
    selectElement,
    updateElement,
    deleteElement,
    moveElementForward,
    moveElementBackward,
    clearCanvas,
    loadElements,
  };
}
