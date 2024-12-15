import { WaitForReplyContainingStep } from '../../../../stepDefinitions.ts';

interface Props {
  details: WaitForReplyContainingStep;
  setDetails: (details: WaitForReplyContainingStep) => void;
}

export function WaitForReplyContaining({ details, setDetails }: Props) {
  return (
    <div className="mb-3">
      <label htmlFor="waitForReplyContainingInput" className="form-label">Wait for a reply containing</label>
      <input type="text" className="form-control" id="waitForReplyContainingInput"
             value={details.details.expectedReplyText}
             onChange={(e) => {
               setDetails({
               id: details.id,
               testStepType: 'waitForReplyContaining',
               details: { expectedReplyText: e.target.value }
             })}} />
    </div>
  );
}
