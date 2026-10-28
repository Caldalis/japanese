export const RUBY: RegExp;
export function esc(s: string): string;
export function renderJa(line: string): string;
export function speechText(line: string): string;
export function isJaChip(s: string): boolean;
export function parseJaBlock(value: string): { ja: string; ro?: string; zh?: string }[];
