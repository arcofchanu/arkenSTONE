export type Severity = 'Critical' | 'High' | 'Medium' | 'Low' | 'Informational';
export type ModelStatus = 'Confirmed' | 'Partial' | 'Patched' | 'Untested';
export type BountyStatus = 'Not Submitted' | 'Pending' | 'Awarded' | 'Rejected';

export const CATEGORIES = [
  'Jailbreak', 'Prompt Leaking', 'Role Injection', 'Indirect Injection',
  'Context Manipulation', 'Token Smuggling', 'Multi-turn Attack',
  'Encoding Exploit', 'System Prompt Override', 'Tool Abuse',
  'Memory Poisoning', 'Chained Prompt', 'Other'
] as const;
export type Category = typeof CATEGORIES[number];

export const VECTORS = [
  'Instruction Override', 'Role Confusion', 'Authority Spoofing',
  'Context Window Exploit', 'Delimiter Injection', 'Encoding / Obfuscation',
  'Social Engineering', 'Chained Prompts', 'Output Redirection',
  'Refusal Bypass', 'Persona Hijack', 'Nested Instruction', 'Custom'
] as const;
export type AttackVector = typeof VECTORS[number];

export interface ModelEntry {
  id: string;
  name: string;
  status: ModelStatus;
  note?: string;
}

export interface GlobalModel {
  id: string;
  name: string;
}

export interface BountyInfo {
  status: BountyStatus;
  amount: number;
  program: string;
}

export interface Technique {
  id: string;
  name: string;
  category: Category;
  vector: AttackVector;
  description: string;
  technique: string;
  notes: string;
  severity: Severity;
  tags: string[];
  models: ModelEntry[];
  photos?: string[];
  bounty?: BountyInfo;
  createdAt: string;
  updatedAt: string;
}
