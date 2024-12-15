interface Props {
  whatTextToWaitFor: string;
  setWhatTextToWaitFor: (text: string) => void;
}

export function WaitForReplyContaining({
  setWhatTextToWaitFor,
  whatTextToWaitFor,
}: Props) {
  return (
    <input
      placeholder="Wait for..."
      aria-label="What to wait for in the reply"
      type="text"
      className="form-control"
      id="whatToWaitForInput"
      value={whatTextToWaitFor}
      onChange={(e) => setWhatTextToWaitFor(e.target.value)}
    />
  );
}
