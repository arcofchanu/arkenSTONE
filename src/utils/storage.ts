import { Technique, GlobalModel } from '../types';

const STORAGE_KEY = 'rtv_techniques';
const META_KEY = 'rtv_meta';
const MODELS_KEY = 'rtv_models';

export const getTechniques = (): Technique[] => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveTechniques = (techniques: Technique[]): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(techniques));
  localStorage.setItem(META_KEY, JSON.stringify({ version: '1.0', lastUpdated: new Date().toISOString() }));
};

export const getGlobalModels = (): GlobalModel[] => {
  const data = localStorage.getItem(MODELS_KEY);
  if (data) return JSON.parse(data);
  return [
    { id: '1', name: 'GPT-4o' },
    { id: '2', name: 'Claude 3.5 Sonnet' },
    { id: '3', name: 'Gemini 1.5 Pro' },
    { id: '4', name: 'Llama 3' }
  ];
};

export const saveGlobalModels = (models: GlobalModel[]): void => {
  localStorage.setItem(MODELS_KEY, JSON.stringify(models));
};
