import { useState } from 'react';
import { ActionBar } from './ActionBar';

export interface AccessCodeStepProps {
    code: string;
    onCodeChange: (val: string) => void;
    onNext: () => void;
    loading: boolean;
    serverError: string | null;
}

export function AccessCodeStep({ code, onCodeChange, onNext, loading, serverError }: AccessCodeStepProps) {
    const [touched, setTouched] = useState(false);
    const codeEmpty = code.trim() === '';

    function handleNext() {
        setTouched(true);
        if (codeEmpty || loading) return;
        onNext();
    }

    function handleKeyDown(e: React.KeyboardEvent) {
        if (e.key === 'Enter') handleNext();
    }

    return (
        <fieldset className="py-3">
            <legend>Zugangscode</legend>

            <div className="mb-4">
                <label className="form-label" htmlFor="imgupload-access-code">
                    Zugangscode
                </label>
                <input
                    id="imgupload-access-code"
                    type="text"
                    className={`form-control${(touched && codeEmpty) || serverError ? ' is-invalid' : ''}`}
                    value={code}
                    onChange={e => onCodeChange(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Zugangscode eingeben"
                    disabled={loading}
                    autoFocus
                />
                {touched && codeEmpty && (
                    <div className="invalid-feedback">Bitte gib den Zugangscode ein.</div>
                )}
                {serverError && (
                    <div className="invalid-feedback">{serverError}</div>
                )}
            </div>

            <ActionBar>
                <span />
                <button type="button" className="btn btn-primary" onClick={handleNext} disabled={loading}>
                    {loading ? 'Prüfe…' : 'Weiter'}
                </button>
            </ActionBar>
        </fieldset>
    );
}
