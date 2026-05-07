export function ActionBar({ children }: { children: React.ReactNode; }) {
    return (
        <div className="d-flex justify-content-between align-items-center pt-3">
            {children}
        </div>
    );
}
