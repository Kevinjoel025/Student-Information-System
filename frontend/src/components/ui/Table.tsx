import React from 'react';
import { cn } from '../../lib/utils';

export const Table = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <div className="w-full overflow-x-auto bg-card/50 rounded-xl border border-white/10 backdrop-blur-xl">
    <table className={cn("w-full text-sm text-left text-gray-300", className)}>
      {children}
    </table>
  </div>
);

export const Thead = ({ children }: { children: React.ReactNode }) => (
  <thead className="text-xs uppercase bg-black/20 text-gray-400">
    {children}
  </thead>
);

export const Tbody = ({ children }: { children: React.ReactNode }) => (
  <tbody className="divide-y divide-white/5">
    {children}
  </tbody>
);

export const Tr = ({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLTableRowElement>) => (
  <tr className={cn('hover:bg-white/5 transition-colors', className)} {...props}>
    {children}
  </tr>
);

export const Th = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <th className={cn("px-6 py-4 font-medium", className)}>
    {children}
  </th>
);

export const Td = ({
  children,
  className,
  title,
  colSpan,
}: {
  children: React.ReactNode;
  className?: string;
  title?: string;
  colSpan?: number;
}) => (
  <td className={cn('px-6 py-4', className)} title={title} colSpan={colSpan}>
    {children}
  </td>
);
