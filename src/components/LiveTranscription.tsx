interface Props {
  transcription: { who: string, message: string }[];
}

export function LiveTranscription({ transcription }: Props) {
  return <div>
    <div className="pb-2">Transcription</div>
    <div className="vstack gap-3">
      {transcription.map((transcript, index) => (
        <div key={index} className="border-bottom pb-1 mb-1">
          <div className="fw-lighter pb-2">{transcript.who}</div>
          <div>{transcript.message}</div>
        </div>))}
    </div>
  </div>;
}
