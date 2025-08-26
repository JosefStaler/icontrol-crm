import { entities } from '@icontrol/config/src/entities.example';

export type EntityName = keyof typeof entities;
export const getEntityConfig = (name: string) => (entities as any)[name];





