import { entities } from '@icontrol/config';

export type EntityName = keyof typeof entities;
export const getEntityConfig = (name: string) => (entities as any)[name];






