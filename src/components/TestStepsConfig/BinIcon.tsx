import { createContext, useContext } from "react";
import type { DraggableSyntheticListeners } from "@dnd-kit/core";

interface Context {
  attributes: Record<string, any>;
  listeners: DraggableSyntheticListeners;
  ref(node: HTMLElement | null): void;
}

const BinIconContext = createContext<Context>({
  attributes: {},
  listeners: undefined,
  ref() {},
});

interface Props {
  onClick: () => void;
  dataBsToggle: string;
  dataBsTarget: string;
  disabled: boolean;
}

export function BinIcon({
  onClick,
  dataBsToggle,
  dataBsTarget,
  disabled,
}: Props) {
  const { attributes, listeners, ref } = useContext(BinIconContext);

  return (
    <button
      data-bs-toggle={dataBsToggle}
      data-bs-target={dataBsTarget}
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="DragHandle btn"
      role="button"
      {...attributes}
      {...listeners}
      ref={ref}
    >
      <i className="bi bi-trash3"></i>
    </button>
  );
}
