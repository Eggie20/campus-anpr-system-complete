import { useMemo } from 'react';

/**
 * ConfirmChangesModal — Displays a summary of profile changes and asks for confirmation.
 * Props:
 *   isOpen        — boolean
 *   original      — object (snapshot before edits)
 *   updated       — object (current form data)
 *   fieldLabels   — { fieldKey: "Display Label", ... }
 *   onConfirm     — fn()
 *   onCancel      — fn()
 *   cooldownDays  — number (default 30)
 */
export default function ConfirmChangesModal({
    isOpen,
    original,
    updated,
    fieldLabels = {},
    onConfirm,
    onCancel,
    cooldownDays = 30
}) {
    const changes = useMemo(() => {
        if (!original || !updated) return [];
        const diff = [];
        for (const key of Object.keys(updated)) {
            const oldVal = (original[key] ?? '').toString().trim();
            const newVal = (updated[key] ?? '').toString().trim();
            if (oldVal !== newVal && fieldLabels[key]) {
                diff.push({
                    field: fieldLabels[key],
                    from: oldVal || '(empty)',
                    to: newVal || '(empty)'
                });
            }
        }
        return diff;
    }, [original, updated, fieldLabels]);

    if (!isOpen) return null;

    return (
        <div className="modal-backdrop active" onClick={onCancel}>
            <div
                className="modal premium-glass-card"
                onClick={e => e.stopPropagation()}
                style={{ border: 'none', maxWidth: '520px', width: '95vw' }}
            >
                <header className="modal-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div className="premium-noti-icon-box premium-pill warning" style={{ width: '40px', height: '40px' }}>
                            <span className="material-symbols-rounded">edit_note</span>
                        </div>
                        <div>
                            <h2 className="modal-title" style={{ margin: 0 }}>Confirm Credential Changes</h2>
                            <p style={{ fontSize: '0.75rem', color: 'var(--t-3)', margin: '4px 0 0' }}>
                                Review the modifications below before applying.
                            </p>
                        </div>
                    </div>
                    <button className="modal-close" onClick={onCancel}>
                        <span className="material-symbols-rounded">close</span>
                    </button>
                </header>

                <div className="modal-body" style={{ padding: '1.25rem 0' }}>
                    {changes.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                            <span className="material-symbols-rounded" style={{ fontSize: '2.5rem', color: 'var(--t-3)', display: 'block', marginBottom: '0.75rem' }}>
                                check_circle
                            </span>
                            <p style={{ color: 'var(--t-3)', fontSize: '0.9rem' }}>No changes detected.</p>
                        </div>
                    ) : (
                        <>
                            {/* Changes Table */}
                            <div style={{
                                borderRadius: '8px',
                                border: '1px solid var(--border-color, rgba(255,255,255,0.08))',
                                overflow: 'hidden',
                                marginBottom: '1.25rem'
                            }}>
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: '1fr 1fr 1fr',
                                    gap: 0,
                                    fontSize: '0.7rem',
                                    fontWeight: 700,
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.5px',
                                    color: 'var(--t-3)',
                                    padding: '0.6rem 1rem',
                                    background: 'var(--bg-tertiary, rgba(255,255,255,0.03))',
                                    borderBottom: '1px solid var(--border-color, rgba(255,255,255,0.08))'
                                }}>
                                    <span>Field</span>
                                    <span>Previous</span>
                                    <span>Updated</span>
                                </div>
                                {changes.map((c, i) => (
                                    <div
                                        key={i}
                                        style={{
                                            display: 'grid',
                                            gridTemplateColumns: '1fr 1fr 1fr',
                                            gap: 0,
                                            fontSize: '0.8rem',
                                            padding: '0.65rem 1rem',
                                            borderBottom: i < changes.length - 1 ? '1px solid var(--border-color, rgba(255,255,255,0.05))' : 'none',
                                            transition: 'background 0.2s'
                                        }}
                                    >
                                        <span style={{ fontWeight: 600, color: 'var(--t-1)' }}>{c.field}</span>
                                        <span style={{ color: 'var(--color-error, #ef4444)', textDecoration: 'line-through', opacity: 0.7, wordBreak: 'break-word' }}>
                                            {c.from}
                                        </span>
                                        <span style={{ color: 'var(--color-success, #10b981)', fontWeight: 600, wordBreak: 'break-word' }}>
                                            {c.to}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            {/* Cooldown Warning */}
                            <div style={{
                                background: 'rgba(245, 158, 11, 0.08)',
                                border: '1px solid rgba(245, 158, 11, 0.2)',
                                borderRadius: '8px',
                                padding: '0.85rem 1rem',
                                display: 'flex',
                                gap: '10px',
                                alignItems: 'flex-start'
                            }}>
                                <span className="material-symbols-rounded" style={{ fontSize: '1.2rem', color: '#f59e0b', flexShrink: 0, marginTop: '1px' }}>
                                    schedule
                                </span>
                                <div>
                                    <p style={{ fontSize: '0.8rem', fontWeight: 700, color: '#f59e0b', margin: '0 0 4px' }}>
                                        Credential Change Policy
                                    </p>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--t-3)', margin: 0, lineHeight: 1.5 }}>
                                        After applying these changes, your profile credentials will be <strong>locked for {cooldownDays} days</strong>.
                                        You will not be able to modify them again until the cooldown period expires.
                                        Please ensure all information is accurate.
                                    </p>
                                </div>
                            </div>

                            {/* Confirmation Question */}
                            <p style={{
                                textAlign: 'center',
                                fontSize: '0.9rem',
                                fontWeight: 600,
                                color: 'var(--t-1)',
                                marginTop: '1.25rem',
                                marginBottom: 0
                            }}>
                                Are you sure these changes are correct?
                            </p>
                        </>
                    )}
                </div>

                <footer className="modal-footer" style={{ borderTop: 'none', padding: '0.75rem 0 0' }}>
                    <button className="premium-page-btn" onClick={onCancel} style={{ flex: 1 }}>
                        <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>arrow_back</span>
                        Go Back
                    </button>
                    {changes.length > 0 && (
                        <button className="premium-page-btn active" onClick={onConfirm} style={{ flex: 1 }}>
                            <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>check</span>
                            Confirm & Apply
                        </button>
                    )}
                </footer>
            </div>
        </div>
    );
}
