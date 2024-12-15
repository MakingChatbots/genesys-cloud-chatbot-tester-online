import { SayStep } from '../../../../stepDefinitions.ts';

interface Props {
  details: SayStep;
  setDetails: (details: SayStep) => void;
}

export function Say({ details, setDetails }: Props) {
  return (
    <div className="mb-3">
      <label htmlFor="sayInput" className="form-label">Say</label>
      <input type="text" className="form-control" id="sayInput"
             value={details.details.sayText}
             onChange={(e) => setDetails({
               id: details.id,
               testStepType: details.testStepType,
               details: {
                 sayText: e.target.value
               }
             })} />
    </div>
  );
}
