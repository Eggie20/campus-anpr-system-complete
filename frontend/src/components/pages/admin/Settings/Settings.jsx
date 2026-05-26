import { useState, useEffect } from 'react';
import { DashboardWidget } from '../../../../components';
import api from '../../../../services/api';
import './Settings.css';

const ToggleSwitch = ({ label, subtext, checked, onChange }) => {
    return (
        <div className="premium-toggle-row">
            <div className="premium-toggle-label">
                <div className="font-bold">{label}</div>
                <div className="setting-helper">{subtext}</div>
            </div>
            <div className="flex items-center gap-2">
                <span className={`toggle-status-text ${checked ? 'on' : 'off'}`}>
                    {checked ? 'Enabled' : 'Disabled'}
                </span>
                <label className="toggle-switch">
                    <input 
                        type="checkbox" 
                        checked={checked} 
                        onChange={(e) => onChange(e.target.checked)} 
                    />
                    <span className="toggle-slider"></span>
                </label>
            </div>
        </div>
    );
};

export default function Settings() {
    const [settings, setSettings] = useState(null);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await api.get('/settings');
                // Ensure default values are merged in if backend is empty
                setSettings({
                    system_name: 'CampusSecure ANPR',
                    institution: 'Caraga State University',
                    timezone: 'Asia/Manila',
                    alert_intrusion: true,
                    alert_offline: true,
                    alert_report: false,
                    auto_logout: '30',
                    keep_logs_days: '90',
                    ocr_engine: 'tesseract',
                    plate_accuracy: 'medium',
                    save_snapshots: true,
                    ...res.data
                });
            } catch (err) {
                console.error("Failed to load settings", err);
            }
        };
        fetchSettings();
    }, []);

    const handleSave = async () => {
        if (!settings) return;
        setSaving(true);
        try {
            await api.post('/settings', { settings });
            alert("Settings saved successfully!");
        } catch (err) {
            console.error("Save failed", err);
            alert("Failed to save settings.");
        } finally {
            setSaving(false);
        }
    };

    const updateSetting = (key, value) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    if (!settings) {
        return <div className="premium-dashboard-container" style={{ padding: '40px', color: '#fff' }}>Loading settings...</div>;
    }

    const SectionSave = () => (
        <div className="widget-footer">
            <button className="premium-page-btn mini-save-btn" onClick={handleSave} disabled={saving}>
                <span className="material-symbols-rounded">save</span>
                {saving ? 'Saving...' : 'Save Section'}
            </button>
        </div>
    );

    return (
        <div className="premium-dashboard-container">
            {/* Page Header */}
            <div className="premium-page-header">
                <div>
                    <h1>System <span>Settings</span> ⚙️</h1>
                    <p>Configure global parameters, security protocols, and system-wide behavior.</p>
                </div>
                <div className="premium-header-meta">
                    <button className="premium-page-btn active">
                        <span className="material-symbols-rounded">settings_backup_restore</span>
                        Reset to Defaults
                    </button>
                </div>
            </div>

            <div className="dashboard-grid dashboard-grid--2col">
                {/* System Information */}
                <DashboardWidget title="System Information" icon={<span className="material-symbols-rounded">info</span>}>
                    <div className="settings-widget-content">
                        <div className="form-group">
                            <label className="form-label">System Name</label>
                            <input 
                                type="text" 
                                className="form-input premium-editable" 
                                value={settings.system_name} 
                                onChange={(e) => updateSetting('system_name', e.target.value)} 
                            />
                            <span className="setting-helper">The name shown across the admin dashboard.</span>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Institution / University</label>
                            <input 
                                type="text" 
                                className="form-input premium-editable" 
                                value={settings.institution} 
                                onChange={(e) => updateSetting('institution', e.target.value)} 
                            />
                            <span className="setting-helper">The organization that operates this system instance.</span>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Timezone</label>
                            <select 
                                className="form-select premium-editable" 
                                value={settings.timezone}
                                onChange={(e) => updateSetting('timezone', e.target.value)}
                            >
                                <option value="Asia/Manila">Asia/Manila (UTC+8)</option>
                                <option value="UTC">Universal Coordinated (UTC)</option>
                            </select>
                            <span className="setting-helper">All timestamps across the system follow this timezone.</span>
                        </div>
                    </div>
                    <SectionSave />
                </DashboardWidget>

                {/* Alert Protocols */}
                <DashboardWidget title="Alert Protocols" icon={<span className="material-symbols-rounded">notifications_active</span>}>
                    <div className="settings-widget-content">
                        <ToggleSwitch 
                            label="Intrusion detection alerts" 
                            subtext="Push notifications for unregistered vehicles at any gate." 
                            checked={settings.alert_intrusion} 
                            onChange={(val) => updateSetting('alert_intrusion', val)}
                        />
                        <ToggleSwitch 
                            label="Camera offline alerts" 
                            subtext="Notify admin when a camera node disconnects." 
                            checked={settings.alert_offline} 
                            onChange={(val) => updateSetting('alert_offline', val)}
                        />
                        <ToggleSwitch 
                            label="Nightly analytics report" 
                            subtext="Send a daily traffic summary to administrators." 
                            checked={settings.alert_report} 
                            onChange={(val) => updateSetting('alert_report', val)}
                        />
                    </div>
                    <SectionSave />
                </DashboardWidget>

                {/* Security Settings */}
                <DashboardWidget title="Security Settings" icon={<span className="material-symbols-rounded">security</span>}>
                    <div className="settings-widget-content">
                        <div className="form-group">
                            <label className="form-label">Auto Logout (minutes)</label>
                            <select 
                                className="form-select premium-editable" 
                                value={settings.auto_logout}
                                onChange={(e) => updateSetting('auto_logout', e.target.value)}
                            >
                                <option value="15">15 minutes</option>
                                <option value="30">30 minutes</option>
                                <option value="60">60 minutes</option>
                            </select>
                            <span className="setting-helper">Users are logged out after this many minutes of inactivity.</span>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Keep Logs For (days)</label>
                            <select 
                                className="form-select premium-editable" 
                                value={settings.keep_logs_days}
                                onChange={(e) => updateSetting('keep_logs_days', e.target.value)}
                            >
                                <option value="30">30 days</option>
                                <option value="90">90 days</option>
                                <option value="365">365 days</option>
                            </select>
                            <span className="setting-helper">Entry and exit logs are stored for this many days before deletion.</span>
                        </div>
                    </div>
                    <SectionSave />
                </DashboardWidget>

                {/* Camera & ANPR Settings */}
                <DashboardWidget title="Camera & ANPR Settings" icon={<span className="material-symbols-rounded">visibility</span>}>
                    <div className="settings-widget-content">
                        <div className="form-group">
                            <label className="form-label">Registration OCR Engine</label>
                            <select 
                                className="form-select premium-editable" 
                                value={settings.ocr_engine}
                                onChange={(e) => updateSetting('ocr_engine', e.target.value)}
                            >
                                <option value="tesseract">Tesseract (Legacy / Default)</option>
                                <option value="paddle">PaddleOCR (High Speed / Recommended)</option>
                            </select>
                            <span className="setting-helper">Engine used to scan Driver's Licenses during user registration.</span>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Plate Read Accuracy</label>
                            <select 
                                className="form-select premium-editable" 
                                value={settings.plate_accuracy}
                                onChange={(e) => updateSetting('plate_accuracy', e.target.value)}
                            >
                                <option value="low">Low Precision</option>
                                <option value="medium">Standard Precision</option>
                                <option value="high">High Precision (Experimental)</option>
                            </select>
                            <span className="setting-helper">Higher accuracy may slow down detection on older hardware.</span>
                        </div>
                        <ToggleSwitch 
                            label="Save plate snapshots" 
                            subtext="Archive a photo of each detected plate for review." 
                            checked={settings.save_snapshots} 
                            onChange={(val) => updateSetting('save_snapshots', val)}
                        />
                    </div>
                    <SectionSave />
                </DashboardWidget>
            </div>

            {/* Global Footer Actions */}
            <div className="flex justify-end gap-3 mt-12 pb-8">
                <button className="premium-page-btn active" style={{ padding: '12px 24px' }} onClick={handleSave} disabled={saving}>
                    <span className="material-symbols-rounded">terminal</span>
                    {saving ? 'Applying...' : 'Apply All Configuration'}
                </button>
            </div>
        </div>
    );
}
