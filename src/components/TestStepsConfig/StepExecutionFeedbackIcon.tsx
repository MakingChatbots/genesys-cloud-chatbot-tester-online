export interface Props {
  feedbackStatus: "in-progress" | "success" | "failure" | "actioning-soon";
}

export function StepExecutionFeedbackIcon({ feedbackStatus }: Props) {
  const fixedSize = { minWidth: "16px", minHeight: "16px" };

  switch (feedbackStatus) {
    case "success": // https://icons.getbootstrap.com/icons/check-circle-fill/
      return <i className="bi bi-check-circle-fill text-success me-2"></i>;
    case "failure": // https://icons.getbootstrap.com/icons/x-circle-fill/
      return <i className="bi bi-x-circle-fill text-danger me-2"></i>;
    case "in-progress": // https://icons.getbootstrap.com/icons/circle/
      return (
        <span
          className="spinner-grow spinner-grow-sm me-2 text-secondary"
          aria-hidden="true"
          style={{ ...fixedSize }}
        ></span>
      );
    case "actioning-soon":
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          fill="currentColor"
          className="bi bi-dash-circle-dotted text-secondary me-2"
          viewBox="0 0 16 16"
          style={{ ...fixedSize }}
        >
          <path d="M 8 0 q -0.264 0 -0.523 0.017 l 0.064 0.998 a 7 7 0 0 1 0.918 0 l 0.064 -0.998 A 8 8 0 0 0 8 0 M 6.44 0.152 q -0.52 0.104 -1.012 0.27 l 0.321 0.948 q 0.43 -0.147 0.884 -0.237 L 6.44 0.153 z m 4.132 0.271 a 8 8 0 0 0 -1.011 -0.27 l -0.194 0.98 q 0.453 0.09 0.884 0.237 z m 1.873 0.925 a 8 8 0 0 0 -0.906 -0.524 l -0.443 0.896 q 0.413 0.205 0.793 0.459 z M 4.46 0.824 q -0.471 0.233 -0.905 0.524 l 0.556 0.83 a 7 7 0 0 1 0.793 -0.458 z M 2.725 1.985 q -0.394 0.346 -0.74 0.74 l 0.752 0.66 q 0.303 -0.345 0.648 -0.648 z m 11.29 0.74 a 8 8 0 0 0 -0.74 -0.74 l -0.66 0.752 q 0.346 0.303 0.648 0.648 z m 1.161 1.735 a 8 8 0 0 0 -0.524 -0.905 l -0.83 0.556 q 0.254 0.38 0.458 0.793 l 0.896 -0.443 z M 1.348 3.555 q -0.292 0.433 -0.524 0.906 l 0.896 0.443 q 0.205 -0.413 0.459 -0.793 z M 0.423 5.428 a 8 8 0 0 0 -0.27 1.011 l 0.98 0.194 q 0.09 -0.453 0.237 -0.884 z M 15.848 6.44 a 8 8 0 0 0 -0.27 -1.012 l -0.948 0.321 q 0.147 0.43 0.237 0.884 z M 0.017 7.477 a 8 8 0 0 0 0 1.046 l 0.998 -0.064 a 7 7 0 0 1 0 -0.918 z M 16 8 a 8 8 0 0 0 -0.017 -0.523 l -0.998 0.064 a 7 7 0 0 1 0 0.918 l 0.998 0.064 A 8 8 0 0 0 16 8 M 0.152 9.56 q 0.104 0.52 0.27 1.012 l 0.948 -0.321 a 7 7 0 0 1 -0.237 -0.884 l -0.98 0.194 z m 15.425 1.012 q 0.168 -0.493 0.27 -1.011 l -0.98 -0.194 q -0.09 0.453 -0.237 0.884 z M 0.824 11.54 a 8 8 0 0 0 0.524 0.905 l 0.83 -0.556 a 7 7 0 0 1 -0.458 -0.793 z m 13.828 0.905 q 0.292 -0.434 0.524 -0.906 l -0.896 -0.443 q -0.205 0.413 -0.459 0.793 z m -12.667 0.83 q 0.346 0.394 0.74 0.74 l 0.66 -0.752 a 7 7 0 0 1 -0.648 -0.648 z m 11.29 0.74 q 0.394 -0.346 0.74 -0.74 l -0.752 -0.66 q -0.302 0.346 -0.648 0.648 z m -1.735 1.161 q 0.471 -0.233 0.905 -0.524 l -0.556 -0.83 a 7 7 0 0 1 -0.793 0.458 z m -7.985 -0.524 q 0.434 0.292 0.906 0.524 l 0.443 -0.896 a 7 7 0 0 1 -0.793 -0.459 z m 1.873 0.925 q 0.493 0.168 1.011 0.27 l 0.194 -0.98 a 7 7 0 0 1 -0.884 -0.237 z m 4.132 0.271 a 8 8 0 0 0 1.012 -0.27 l -0.321 -0.948 a 7 7 0 0 1 -0.884 0.237 l 0.194 0.98 z m -2.083 0.135 a 8 8 0 0 0 1.046 0 l -0.064 -0.998 a 7 7 0 0 1 -0.918 0 z z" />
        </svg>
      );
    default:
      return <></>;
  }
}
