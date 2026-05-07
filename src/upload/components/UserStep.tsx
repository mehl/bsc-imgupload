import { useState } from 'react';
import { ActionBar } from './ActionBar';

export interface UserStepProps {
    nickname: string;
    email: string;
    onNicknameChange: (val: string) => void;
    onEmailChange: (val: string) => void;
    onNext: () => void;
    onBack: () => void;
}

export function UserStep({ nickname, email, onNicknameChange, onEmailChange, onNext, onBack }: UserStepProps) {
    const [touched, setTouched] = useState({ nickname: false, email: false });

    const nicknameEmpty = nickname.trim() === '';
    const emailEmpty = email.trim() === '';
    const emailInvalid = !emailEmpty && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

    function handleNext() {
        setTouched({ nickname: true, email: true });
        if (nicknameEmpty || emailEmpty || emailInvalid) return;
        onNext();
    }

    return (
        <fieldset className="py-3">
            <legend>Ein paar Angaben zu dir</legend>

            <div className="mb-3">
                <label className="form-label" htmlFor="imgupload-nickname">
                    Dein Name / Nickname
                </label>
                <input
                    id="imgupload-nickname"
                    type="text"
                    className={`form-control w-100${touched.nickname && nicknameEmpty ? ' is-invalid' : ''}`}
                    value={nickname}
                    onChange={e => onNicknameChange(e.target.value)}
                    placeholder="Nickname"
                />
                {touched.nickname && nicknameEmpty && (
                    <div className="invalid-feedback">Bitte gib deinen Namen ein.</div>
                )}
            </div>

            <div className="mb-4">
                <label className="form-label" htmlFor="imgupload-email">
                    Deine E-Mail-Adresse
                </label>
                <input
                    id="imgupload-email"
                    type="email"
                    className={`form-control${touched.email && (emailEmpty || emailInvalid) ? ' is-invalid' : ''}`}
                    value={email}
                    onChange={e => onEmailChange(e.target.value)}
                    placeholder="E-Mail"
                />
                {touched.email && emailEmpty && (
                    <div className="invalid-feedback">Bitte gib deine E-Mail-Adresse ein.</div>
                )}
                {touched.email && emailInvalid && (
                    <div className="invalid-feedback">Bitte gib eine gültige E-Mail-Adresse ein.</div>
                )}
                <small className="text-muted">Deine Mailadresse wird nicht veröffentlicht.</small>
            </div>

            <ActionBar>
                <button type="button" className="btn btn-secondary" onClick={onBack}>
                    Zurück
                </button>
                <button type="button" className="btn btn-primary" onClick={handleNext}>
                    Weiter
                </button>
            </ActionBar>
        </fieldset>
    );
}
