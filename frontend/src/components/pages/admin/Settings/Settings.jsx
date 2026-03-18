import { useState } from 'react';
import { DashboardWidget } from '../../../../components';
import './Settings.css';

const ToggleSwitch = ({ label, subtext, defaultChecked }) => {
    const [checked, setChecked] = useState(defaultChecked);
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
                        onChange={() => setChecked(!checked)} 
                    />
                    <span className="toggle-slider"></span>
                </label>
            </div>
        </div>
    );
};

const SectionSave = () => (
    <div className="widget-footer">
        <button className="premium-page-btn mini-save-btn">
            <span className="material-symbols-rounded">save</span>
            Save Section
        </button>
    </div>
);

export default function Settings() {
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
                            <input type="text" className="form-input premium-editable" defaultValue="CampusSecure ANPR" />
                            <span className="setting-helper">The name shown across the admin dashboard.</span>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Institution / University</label>
                            <input type="text" className="form-input premium-editable" defaultValue="Caraga State University" />
                            <span className="setting-helper">The organization that operates this system instance.</span>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Timezone</label>
                            <select className="form-select premium-editable" defaultValue="Asia/Manila">
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
                            defaultChecked={true} 
                        />
                        <ToggleSwitch 
                            label="Camera offline alerts" 
                            subtext="Notify admin when a camera node disconnects." 
                            defaultChecked={true} 
                        />
                        <ToggleSwitch 
                            label="Nightly analytics report" 
                            subtext="Send a daily traffic summary to administrators." 
                            defaultChecked={false} 
                        />
                    </div>
                    <SectionSave />
                </DashboardWidget>

                {/* Security Settings */}
                <DashboardWidget title="Security Settings" icon={<span className="material-symbols-rounded">security</span>}>
                    <div className="settings-widget-content">
                        <div className="form-group">
                            <label className="form-label">Auto Logout (minutes)</label>
                            <select className="form-select premium-editable" defaultValue="30">
                                <option value="15">15 minutes</option>
                                <option value="30">30 minutes</option>
                                <option value="60">60 minutes</option>
                            </select>
                            <span className="setting-helper">Users are logged out after this many minutes of inactivity.</span>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Keep Logs For (days)</label>
                            <select className="form-select premium-editable" defaultValue="90">
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
                            <label className="form-label">Plate Read Accuracy</label>
                            <select className="form-select premium-editable" defaultValue="medium">
                                <option value="low">Low Precision</option>
                                <option value="medium">Standard Precision</option>
                                <option value="high">High Precision (Experimental)</option>
                            </select>
                            <span className="setting-helper">Higher accuracy may slow down detection on older hardware.</span>
                        </div>
                        <ToggleSwitch 
                            label="Save plate snapshots" 
                            subtext="Archive a photo of each detected plate for review." 
                            defaultChecked={true} 
                        />
                    </div>
                    <SectionSave />
                </DashboardWidget>
            </div>

            {/* Global Footer Actions */}
            <div className="flex justify-end gap-3 mt-12 pb-8">
                <button className="premium-page-btn active" style={{ padding: '12px 24px' }}>
                    <span className="material-symbols-rounded">terminal</span>
                    Apply All Configuration
                </button>
            </div>
        </div>
    );
}
