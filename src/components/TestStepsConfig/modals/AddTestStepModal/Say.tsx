interface Props {
  sayText: string;
  setSayText: (text: string) => void;
}

export function Say({ sayText, setSayText }: Props) {
  return (
    <input
      placeholder="Say..."
      aria-label="What to say"
      type="text"
      className="form-control"
      id="add-say-input"
      value={sayText}
      onChange={(e) => setSayText(e.target.value)}
    />
  );
}
