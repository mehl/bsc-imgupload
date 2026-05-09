import { useState, useCallback, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { AccessCodeStep } from './components/AccessCodeStep';
import { UserStep } from './components/UserStep';
import { UploadStep } from './components/UploadStep';
import type { FileEntry } from './components/FileThumbnail';
import { uploadFile } from './uploadFile';

function getOrCreateUUID(): string {
    let uuid = localStorage.getItem('imgupload_uuid');
    if (!uuid) {
        uuid = uuidv4();
        localStorage.setItem('imgupload_uuid', uuid);
    }
    return uuid;
}

export interface Props {
    apiBase?: string;
    titleLabel?: string;
}

type Step = 'access' | 'user' | 'upload';

export function ImageUploader({ apiBase = '', titleLabel = 'Titel' }: Props) {
    const [step, setStep] = useState<Step>('access');
    const [entries, setEntries] = useState<FileEntry[]>([]);
    const queryAccessCode = new URLSearchParams(window.location.search).get('access_code') ?? '';
    const [accessCode, setAccessCode] = useState(() => queryAccessCode || localStorage.getItem('imgupload_access_code'));
    const [accessLoading, setAccessLoading] = useState(false);
    const [accessError, setAccessError] = useState<string | null>(null);
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [email, setEmail] = useState(() => localStorage.getItem('imgupload_email') ?? '');
    const [nickname, setNickname] = useState(() => localStorage.getItem('imgupload_nickname') ?? '');
    const [title, setTitle] = useState('');
    const [uploading, setUploading] = useState(false);
    const [done, setDone] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const previewUrls = useRef<Set<string>>(new Set());

    useEffect(() => {
        const urls = previewUrls.current;
        return () => urls.forEach(URL.revokeObjectURL);
    }, []);

    useEffect(() => {
        if (queryAccessCode) localStorage.setItem('imgupload_access_code', queryAccessCode);
    }, [queryAccessCode]);

    const handleAccessCodeChange = useCallback((val: string) => {
        setAccessCode(val);
        setAccessError(null);
        localStorage.setItem('imgupload_access_code', val);
    }, []);

    const handleAccessNext = useCallback(async () => {
        setAccessLoading(true);
        setAccessError(null);
        try {
            const params = new URLSearchParams({ password: accessCode?.trim() || "" });
            const res = await fetch(`${apiBase}/api/session?${params}`, { method: 'POST' });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error ?? '');
            setSessionId(data.sessionId);
            setStep('user');
        } catch (e) {
            setAccessError(e instanceof Error && e.message ? e.message : 'Zugangscode ungültig.');
        } finally {
            setAccessLoading(false);
        }
    }, [accessCode, apiBase]);

    const handleFilesAdded = useCallback((files: File[]) => {
        setErrorMessage(null);
        setEntries(prev => {
            const remaining = 100 - prev.length;
            if (remaining <= 0) return prev;
            const toAdd = files.slice(0, remaining);
            const newEntries: FileEntry[] = toAdd.map(file => {
                const preview = URL.createObjectURL(file);
                previewUrls.current.add(preview);
                return { id: uuidv4(), file, preview, status: 'pending', progress: 0 };
            });
            return [...prev, ...newEntries];
        });
    }, []);

    const handleRemove = useCallback((id: string) => {
        setEntries(prev => {
            const entry = prev.find(e => e.id === id);
            if (entry) {
                URL.revokeObjectURL(entry.preview);
                previewUrls.current.delete(entry.preview);
            }
            return prev.filter(e => e.id !== id);
        });
    }, []);

    const handleReset = useCallback(() => {
        setEntries(prev => {
            prev.forEach(e => {
                URL.revokeObjectURL(e.preview);
                previewUrls.current.delete(e.preview);
            });
            return [];
        });
        setTitle('');
        setDone(false);
        setErrorMessage(null);
        setStep('access');
    }, []);

    const handleNicknameChange = useCallback((val: string) => {
        setNickname(val);
        localStorage.setItem('imgupload_nickname', val);
    }, []);

    const handleEmailChange = useCallback((val: string) => {
        setEmail(val);
        localStorage.setItem('imgupload_email', val);
    }, []);

    const handleUpload = useCallback(async () => {
        const pending = entries.filter(e => e.status === 'pending');
        if (!pending.length || uploading || !sessionId) return;

        setUploading(true);
        setErrorMessage(null);

        const uuid = getOrCreateUUID();
        let successCount = 0;
        let errorCount = 0;

        for (const entry of pending) {
            setEntries(prev => prev.map(e => e.id === entry.id ? { ...e, status: 'uploading', progress: 0 } : e));
            try {
                await uploadFile({
                    file: entry.file,
                    apiBase,
                    sessionId,
                    uuid,
                    email,
                    nickname,
                    title,
                    onProgress: (progress) => {
                        setEntries(prev => prev.map(e => e.id === entry.id ? { ...e, progress } : e));
                    },
                });
                setEntries(prev => prev.map(e => e.id === entry.id ? { ...e, status: 'success', progress: 100 } : e));
                successCount++;
            } catch (err) {
                const msg = err instanceof Error ? err.message : 'Upload fehlgeschlagen.';
                setEntries(prev => prev.map(e => e.id === entry.id ? { ...e, status: 'error', error: msg } : e));
                errorCount++;
            }
        }

        setUploading(false);

        if (errorCount === 0) {
            setDone(true);
        } else if (successCount === 0) {
            setErrorMessage(`Alle ${errorCount} Uploads fehlgeschlagen.`);
        } else {
            setErrorMessage(`${successCount} erfolgreich, ${errorCount} fehlgeschlagen.`);
        }
    }, [entries, uploading, sessionId, email, nickname, title, apiBase]);

    return (
        <div>
            {step === 'access' && (
                <AccessCodeStep
                    code={accessCode!}
                    onCodeChange={handleAccessCodeChange}
                    onNext={handleAccessNext}
                    loading={accessLoading}
                    serverError={accessError}
                />
            )}
            {step === 'user' && (
                <UserStep
                    nickname={nickname}
                    email={email}
                    onNicknameChange={handleNicknameChange}
                    onEmailChange={handleEmailChange}
                    onNext={() => setStep('upload')}
                    onBack={() => setStep('access')}
                />
            )}
            {step === 'upload' && (
                <UploadStep
                    entries={entries}
                    uploading={uploading}
                    done={done}
                    errorMessage={errorMessage}
                    title={title}
                    titleLabel={titleLabel}
                    onFilesAdded={handleFilesAdded}
                    onRemove={handleRemove}
                    onTitleChange={setTitle}
                    onUpload={handleUpload}
                    onReset={handleReset}
                    onBack={() => setStep('user')}
                />
            )}
        </div>
    );
}
