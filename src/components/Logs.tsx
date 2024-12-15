import { useCallback } from 'react';

export interface Log {
  severity: 'info' | 'error';
  overview: string,
  detailed?: any;
}

interface Props {
  logs: Log[];
}

export function Logs({ logs }: Props) {
  const stringifyDetail = useCallback((detailed: any) => {
    switch (typeof detailed) {
      case 'string':
        return detailed;
      case 'object':
        return JSON.stringify(detailed, null, 2);
      default:
        return `${detailed}`;
    }
  }, []);

  return <div className="accordion accordion-flush" id={'accordionFlushExample'}>
    {logs.map((log, index) => <div key={index} className="accordion-item">
      <h2 className={(log.severity === 'error' ? '.bg-danger-subtle' : '') + 'accordion-header'}>
        <button className="accordion-button collapsed ps-2 pe-2" type="button" data-bs-toggle="collapse"
                data-bs-target={`#flush-collapse${index}`} aria-expanded="false"
                aria-controls={`flush-collapse${index}`}>
          {log.overview}
        </button>
      </h2>
      <div id={`flush-collapse${index}`} className="accordion-collapse collapse ps-2 pe-2"
           data-bs-parent="#accordionFlushExample">
        <div className="accordion-body ps-0 pe-0">
          <code>
            {stringifyDetail(log.detailed)}
          </code>
        </div>
      </div>
    </div>)}
  </div>;
}
