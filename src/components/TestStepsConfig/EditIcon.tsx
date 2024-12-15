import { createContext, useContext } from "react";
import type { DraggableSyntheticListeners } from "@dnd-kit/core";

interface Context {
  attributes: Record<string, any>;
  listeners: DraggableSyntheticListeners;
  ref(node: HTMLElement | null): void;
}

const EditIconContext = createContext<Context>({
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

export function EditIcon({
  onClick,
  dataBsToggle,
  dataBsTarget,
  disabled,
}: Props) {
  const { attributes, listeners, ref } = useContext(EditIconContext);

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
      <i className="bi bi-pencil-square"></i>
    </button>
  );
}
