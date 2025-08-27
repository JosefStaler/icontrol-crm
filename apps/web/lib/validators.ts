import { z } from 'zod';

export function buildZodFromConfig(columns: Array<{ key: string; type: string; zod?: string; editable?: boolean }>) {
  const shape: Record<string, z.ZodTypeAny> = {};
  for (const c of columns) {
    let schema: z.ZodTypeAny;
    switch (c.type) {
      case 'number':
        schema = z.number();
        break;
      case 'boolean':
        schema = z.boolean();
        break;
      default:
        schema = z.string();
    }
    if (c.zod) {
      if (c.zod.includes('.email()')) schema = z.string().email();
      const minMatch = c.zod.match(/\.min\((\d+)\)/);
      if (minMatch) schema = z.string().min(Number(minMatch[1]));
    }
    shape[c.key] = schema.optional();
  }
  return z.object(shape);
}






