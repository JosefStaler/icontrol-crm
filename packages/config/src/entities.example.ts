export const entities = {
  Customers: {
    endpoint: '/entities/Customers',
    idKey: 'CustomerID',
    columns: [
      { key: 'CustomerID', label: 'ID', type: 'number', editable: false },
      { key: 'Name', label: 'Nome', type: 'string', editable: true, zod: 'z.string().min(3)' },
      { key: 'Email', label: 'Email', type: 'string', editable: true, zod: 'z.string().email()' },
      { key: 'Active', label: 'Ativo', type: 'boolean', editable: true },
    ],
    permissions: { read: ['user', 'manager', 'admin'], update: ['manager', 'admin'] },
  },
} as const;

export type EntitiesConfig = typeof entities;





