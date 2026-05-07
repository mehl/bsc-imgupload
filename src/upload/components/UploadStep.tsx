import { AddFilesButton } from './AddFilesButton';
import { ThumbnailGrid } from './ThumbnailGrid';
import type { FileEntry } from './FileThumbnail';
import { ActionBar } from './ActionBar';
import { useEffect, useRef } from 'react';

export interface UploadStepProps {
    entries: FileEntry[];
    uploading: boolean;
    done: boolean;
    errorMessage: string | null;
    title: string;
    titleLabel: string;
    onFilesAdded: (files: File[]) => void;
    onRemove: (id: string) => void;
    onTitleChange: (val: string) => void;
    onUpload: () => void;
    onReset: () => void;
    onBack: () => void;
}

export function UploadStep({
    entries,
    uploading,
    done,
    errorMessage,
    title,
    titleLabel,
    onFilesAdded,
    onRemove,
    onTitleChange,
    onUpload,
    onReset,
    onBack,
}: UploadStepProps) {
    const pendingCount = entries.filter(e => e.status === 'pending').length;
    const inputRef = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
        // Focus input field on step load
        inputRef.current?.focus();
    }, [inputRef]);

    return (
        <fieldset className="py-3">
            <legend>Upload</legend>

            <div className="mb-3">
                <label className="form-label" htmlFor="imgupload-title">{titleLabel}</label>
                <input
                    id="imgupload-title"
                    type="text"
                    className="form-control"
                    value={title}
                    onChange={e => onTitleChange(e.target.value)}
                    disabled={uploading || done}
                    ref={inputRef}
                />
            </div>

            <ThumbnailGrid entries={entries} onRemove={onRemove} uploading={uploading || done} />

            {!entries.length && (
                <div className="pt-1 pb-3">Bitte wähle ein oder mehrere Bilder zum Upload aus.</div>
            )}
            {errorMessage && (
                <div className="alert alert-danger mb-3" role="alert">{errorMessage}</div>
            )}

            {!done && (
                <div className="mb-3">
                    <AddFilesButton onFilesAdded={onFilesAdded} disabled={uploading || entries.length >= 100} />
                    {entries.length >= 100 && (
                        <span className="ms-2 text-muted small">Du hast das Maximum von 100 Bildern erreicht.</span>
                    )}
                </div>
            )}

            {done && (
                <div className="alert alert-success d-flex align-items-center justify-content-between mb-0" role="alert">
                    <span>Upload komplett.</span>
                    <button type="button" className="btn btn-success btn-sm ms-3" onClick={onReset}>
                        OK
                    </button>
                </div>
            )}

            <ActionBar>
                {!uploading && !done && (
                    ""
                    // <button type="button" className="btn btn-outline-secondary" onClick={onBack}>
                    //     Zurück
                    // </button>
                )}
                {!done && entries.length > 0 && (
                    <button
                        type="button"
                        className="btn btn-primary"
                        onClick={onUpload}
                        disabled={pendingCount === 0 || uploading}
                    >
                        {uploading ? (
                            <>
                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
                                Wird hochgeladen…
                            </>
                        ) : (
                            `Upload starten ${pendingCount > 0 ? ` (${pendingCount} Bild${pendingCount !== 1 ? 'er' : ''})` : ''}`
                        )}
                    </button>
                )}
            </ActionBar>
        </fieldset>
    );
}
