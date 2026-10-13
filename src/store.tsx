import { createContext, useContext, useEffect, useReducer, type ReactNode } from "react";
import { loadState, reducer, saveState, type Action, type State } from "./logic";

const StoreContext = createContext<{ state: State; dispatch: (action: Action) => void } | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, loadState);

  useEffect(() => {
    saveState(state);
  }, [state]);

  return <StoreContext.Provider value={{ state, dispatch }}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const value = useContext(StoreContext);
  if (!value) throw new Error("useStore necesita StoreProvider");
  return value;
}
