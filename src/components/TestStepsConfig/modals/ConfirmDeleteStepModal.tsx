export interface ConfirmDeleteStepModelWindowProps {
  modalId: string;
  onDeleteConfirmed: (stepIdToDelete: number) => void;
  /**
   * ID of the step to delete. This can be null as the Model window's HTML has to be defined at the
   * point the button to show it is clicked.
   */
  stepId: number | null;
}

export function ConfirmDeleteStepModal({ modalId, onDeleteConfirmed, stepId }: ConfirmDeleteStepModelWindowProps) {
  return <div className="modal fade" id={modalId} tabIndex={-1} aria-labelledby={`${modalId}Label`}
              aria-hidden="true">
    <div className="modal-dialog">
      <div className="modal-content">
        <div className="modal-header">
          <h1 className="modal-title fs-5" id={`${modalId}Label`}>
            Confirm deleting step
          </h1>
          <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div className="modal-body">
          Delete step?
        </div>
        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">No</button>
          <button type="button" className="btn btn-danger" data-bs-dismiss="modal"
                  onClick={stepId !== null ? () => onDeleteConfirmed(stepId) : () => {
                  }}>Yes
          </button>
        </div>
      </div>
    </div>
  </div>;
}
