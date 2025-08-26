import { ButtonHTMLAttributes } from 'react';
import clsx from 'clsx';

export function Button({ className, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={clsx(
        'inline-flex items-center justify-center rounded bg-black text-white px-3 py-2 text-sm hover:opacity-90 disabled:opacity-50',
        className,
      )}
    />
  );
}





