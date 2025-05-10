import React from 'react';
import { cn } from '@/lib/utils';

interface CodeProps extends React.HTMLAttributes<HTMLElement> {}

export function Code({ className, ...props }: CodeProps) {
  return (
    <code
      className={cn(
        "relative rounded bg-gray-100 px-[0.3rem] py-[0.2rem] font-mono text-sm",
        className
      )}
      {...props}
    />
  );
}
