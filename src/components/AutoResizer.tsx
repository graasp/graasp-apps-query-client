import React, { FC, ReactNode } from 'react';

interface AutoResizerProps {
  useAutoResize: () => void;
  children?: ReactNode;
}

export const AutoResizer: FC<AutoResizerProps> = ({ useAutoResize, children }) => {
  useAutoResize();
  return <React.Fragment>{children}</React.Fragment>;
};
