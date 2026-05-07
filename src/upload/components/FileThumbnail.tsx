export type FileStatus = 'pending' | 'uploading' | 'success' | 'error';

export interface FileEntry {
  id: string;
  file: File;
  preview: string;
  status: FileStatus;
  progress: number;
  error?: string;
}

interface Props {
  entry: FileEntry;
  onRemove?: (id: string) => void;
}

function TrashIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" viewBox="0 0 16 16">
      <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z" />
      <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="white" viewBox="0 0 16 16">
      <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z" />
    </svg>
  );
}

function ErrorIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="white" viewBox="0 0 16 16">
      <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z" />
    </svg>
  );
}

export function FileThumbnail({ entry, onRemove }: Props) {
  const { id, file, preview, status, progress, error } = entry;
  const canRemove = status === 'pending' && !!onRemove;

  return (
    <div style={{ width: 96 }}>
      <div className="position-relative rounded overflow-hidden" style={{ width: 96, height: 96, background: '#f0f0f0' }}>
        <img
          src={preview}
          alt={file.name}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />

        {canRemove && (
          <button
            type="button"
            className="btn btn-danger position-absolute top-0 end-0 p-0 d-flex align-items-center justify-content-center"
            style={{ width: 22, height: 22, minWidth: 0, borderRadius: '0 0 0 4px' }}
            title="Entfernen"
            onClick={() => onRemove(id)}
          >
            <TrashIcon />
          </button>
        )}

        {status === 'uploading' && (
          <>
            <div
              className="position-absolute start-0 end-0 bottom-0"
              style={{ height: 5, background: 'rgba(0,0,0,0.3)' }}
            >
              <div
                className="h-100 bg-primary"
                style={{ width: `${progress}%`, transition: 'width 0.2s' }}
              />
            </div>
            <div
              className="position-absolute top-0 start-0 end-0 bottom-0 d-flex align-items-center justify-content-center"
              style={{ background: 'rgba(0,0,0,0.25)' }}
            >
              <span style={{ fontSize: '1rem', color: "white", fontWeight: "bolder" }}>{progress}%</span>
            </div>
          </>
        )}

        {status === 'success' && (
          <div
            className="position-absolute top-0 start-0 end-0 bottom-0 d-flex align-items-center justify-content-center"
            style={{ background: 'rgba(25,135,84,0.6)' }}
          >
            <CheckIcon />
          </div>
        )}

        {status === 'error' && (
          <div
            className="position-absolute top-0 start-0 end-0 bottom-0 d-flex align-items-center justify-content-center"
            style={{ background: 'rgba(220,53,69,0.6)' }}
            title={error}
          >
            <ErrorIcon />
          </div>
        )}
      </div>
      {/* <div
        className="text-truncate mt-1"
        style={{ fontSize: '0.65rem', color: '#555', maxWidth: 96 }}
        title={file.name}
      >
        {file.name}
      </div> */}
    </div>
  );
}
