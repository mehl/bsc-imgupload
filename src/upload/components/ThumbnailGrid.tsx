import { FileThumbnail, type FileEntry } from './FileThumbnail';

interface Props {
  entries: FileEntry[];
  onRemove: (id: string) => void;
  uploading: boolean;
}

export function ThumbnailGrid({ entries, onRemove, uploading }: Props) {
  if (!entries.length) return null;

  return (
    <div className="mb-3">
      <div className="d-flex flex-wrap gap-2">
        {entries.map((entry) => (
          <FileThumbnail
            key={entry.id}
            entry={entry}
            onRemove={uploading ? undefined : onRemove}
          />
        ))}
      </div>
    </div>
  );
}
