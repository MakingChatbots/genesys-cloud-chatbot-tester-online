import "./Navbar.css";

interface Props {
    logsButton: {
        dataBsToggle: string;
        dataBsTarget: string;
        ariaControls: string;
    };
    onShareTestClicked: () => void;
}

export function Navbar({logsButton, onShareTestClicked}: Props) {
    return (
        <nav className="navbar navbar-expand-lg navbar-light bg-light border-bottom">
            <div className="container-fluid">
                <h1 style={{lineHeight: 0.7}}>
                    <a className="navbar-brand" href="#">
                        <small className="text-body-secondary d-block">Genesys Cloud</small>
                        <span className="p-0">Chatbot Tester</span>
                    </a>
                </h1>
                <div id="navbarNav">
                    <button
                        type="button"
                        className="btn btn-outline-success me-3"
                        onClick={onShareTestClicked}
                    >
                        Share Test
                    </button>
                    <a className="btn btn-light" href="/about.html" role="button">About</a>
                    <button
                        type="button"
                        data-bs-toggle={logsButton.dataBsToggle}
                        data-bs-target={logsButton.dataBsTarget}
                        aria-controls={logsButton.ariaControls}
                        className="btn btn-light"
                    >
                        View logs
                    </button>
                </div>
            </div>
        </nav>
    );
}
