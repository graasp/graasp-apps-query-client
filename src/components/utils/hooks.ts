import { useCallback, useState } from 'react';

export type UpdateArgument<T extends object> = T | ((previousArg: T) => Partial<T>);

export function useObjectState<T extends object>(
  initialValue: T,
): [T, (arg: UpdateArgument<T>) => void] {
  const [state, setState] = useState(initialValue);

  const handleUpdate = useCallback((arg: UpdateArgument<T>) => {
    if (typeof arg === 'function') {
      setState((s) => {
        const newState = arg(s);

        return {
          ...s,
          ...newState,
        };
      });
    }

    if (typeof arg === 'object') {
      setState((s) => ({
        ...s,
        ...arg,
      }));
    }
  }, []);

  return [state, handleUpdate];
}
