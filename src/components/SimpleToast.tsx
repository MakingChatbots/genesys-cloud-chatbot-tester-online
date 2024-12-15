export function SimpleToast({
  toastId,
  message,
}: {
  toastId: string;
  message: string;
}) {
  return (
    <div className="toast-container position-fixed top-50 start-50 translate-middle p-3">
      <div
        className="toast align-items-center"
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
        id={toastId}
      >
        <div className="d-flex">
          <div className="toast-body">{message}</div>
          <button
            type="button"
            className="btn-close me-2 m-auto"
            data-bs-dismiss="toast"
            aria-label="Close"
          ></button>
        </div>
      </div>
    </div>
  );
}
