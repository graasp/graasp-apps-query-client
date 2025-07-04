import type { JSX, ReactNode } from 'react';

interface AutoResizerProps {
  useAutoResize: (itemId: string) => void;
  itemId: string;
  children?: ReactNode | ReactNode[];
}

export const AutoResizer = ({ useAutoResize, itemId, children }: AutoResizerProps): JSX.Element => {
  useAutoResize(itemId);
  // need the fragment because we could return an array of elements
  return <>{children}</>;
};
