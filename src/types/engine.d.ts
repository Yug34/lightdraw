declare module 'engine' {
  export function add(a: number, b: number): number;
  export function hello(): string;
  export default function init(module_or_path?: any): Promise<any>;
}
