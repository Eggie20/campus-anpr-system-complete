// Theme Management System
(function() {
    'use strict';

    // Theme configuration
    const THEMES = {
        light: {
            name: 'Light',
            icon: '🌙',
            class: 'light'
        },
        dark: {
            name: 'Dark',
            icon: '☀️',
            class: 'dark'
        },
        'high-contrast': {
            name: 'High Contrast',
            icon: '🔆',
            class: 'high-contrast'
        }
    };

    const FONT_SIZES = {
        small: '14px',
        medium: '16px',
        large: '18px',
        'extra-large': '20px'
    };

    const FONT_FAMILIES = {
        poppins: "'Poppins', sans-serif",
        inter: "'Inter', sans-serif",
        roboto: "'Roboto', sans-serif",
        'system-ui': 'system-ui, -apple-system, sans-serif'
    };

    // Current settings
    let currentTheme = 'light';
    let currentFontSize = 'medium';
    let currentFontFamily = 'poppins';

    // DOM Elements
    let themeToggle;
    let settingsPanel;

    // Initialize theme system
    function init() {
        loadSettings();
        applyTheme();
        setupEventListeners();
        createSettingsPanel();
    }

    function setupEventListeners() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', setupToggleButton);
        } else {
            setupToggleButton();
        }

        // Listen for system theme changes
        if (window.matchMedia) {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            mediaQuery.addEventListener('change', handleSystemThemeChange);
        }

        // Keyboard shortcuts
        document.addEventListener('keydown', handleKeyboardShortcuts);
    }

    function setupToggleButton() {
        themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', cycleTheme);
            updateToggleButton();
        }
    }

    function handleSystemThemeChange(e) {
        // Only auto-switch if user hasn't manually set a preference
        const hasManualPreference = localStorage.getItem('anpr_theme_manual');
        if (!hasManualPreference && e.matches) {
            setTheme('dark');
        } else if (!hasManualPreference && !e.matches) {
            setTheme('light');
        }
    }

    function handleKeyboardShortcuts(e) {
        // Ctrl/Cmd + Shift + T for theme toggle
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'T') {
            e.preventDefault();
            cycleTheme();
        }

        // Ctrl/Cmd + Shift + S for settings panel
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'S') {
            e.preventDefault();
            toggleSettingsPanel();
        }
    }

    function loadSettings() {
        try {
            // Load theme
            const savedTheme = localStorage.getItem('anpr_theme');
            if (savedTheme && THEMES[savedTheme]) {
                currentTheme = savedTheme;
            } else {
                // Check legacy preference from dark-mode.js
                const legacyDarkMode = localStorage.getItem('anpr_dark_mode');
                if (legacyDarkMode !== null) {
                    currentTheme = legacyDarkMode === 'true' ? 'dark' : 'light';
                } else {
                    // Default to dark mode if no preference is saved
                    currentTheme = 'dark';
                }
            }

            // Load font settings
            const savedFontSize = localStorage.getItem('anpr_font_size');
            if (savedFontSize && FONT_SIZES[savedFontSize]) {
                currentFontSize = savedFontSize;
            }

            const savedFontFamily = localStorage.getItem('anpr_font_family');
            if (savedFontFamily && FONT_FAMILIES[savedFontFamily]) {
                currentFontFamily = savedFontFamily;
            }
        } catch (error) {
            console.warn('Could not load theme settings:', error);
        }
    }

    function saveSettings() {
        try {
            localStorage.setItem('anpr_theme', currentTheme);
            localStorage.setItem('anpr_font_size', currentFontSize);
            localStorage.setItem('anpr_font_family', currentFontFamily);
            localStorage.setItem('anpr_theme_manual', 'true');
        } catch (error) {
            console.warn('Could not save theme settings:', error);
        }
    }

    function applyTheme() {
        // Apply theme class
        document.documentElement.setAttribute('data-theme', currentTheme);
        document.body.className = document.body.className.replace(/theme-\w+/g, '');
        document.body.classList.add(`theme-${currentTheme}`);

        // Apply font settings
        document.documentElement.style.setProperty('--font-size-base', FONT_SIZES[currentFontSize]);
        document.documentElement.style.setProperty('--font-primary', FONT_FAMILIES[currentFontFamily]);

        // Update meta theme-color for mobile browsers
        updateMetaThemeColor();

        // Dispatch theme change event
        window.dispatchEvent(new CustomEvent('themeChanged', {
            detail: {
                theme: currentTheme,
                fontSize: currentFontSize,
                fontFamily: currentFontFamily
            }
        }));
    }

    function updateMetaThemeColor() {
        let themeColor = '#ffffff'; // Default light theme
        
        switch (currentTheme) {
            case 'dark':
                themeColor = '#1a1a1a';
                break;
            case 'high-contrast':
                themeColor = '#000000';
                break;
        }

        // Update or create meta theme-color tag
        let metaThemeColor = document.querySelector('meta[name="theme-color"]');
        if (!metaThemeColor) {
            metaThemeColor = document.createElement('meta');
            metaThemeColor.name = 'theme-color';
            document.head.appendChild(metaThemeColor);
        }
        metaThemeColor.content = themeColor;
    }

    function setTheme(theme) {
        if (THEMES[theme]) {
            currentTheme = theme;
            applyTheme();
            updateToggleButton();
            updateSettingsPanel();
            saveSettings();
        }
    }

    function cycleTheme() {
        const themeKeys = Object.keys(THEMES);
        const currentIndex = themeKeys.indexOf(currentTheme);
        const nextIndex = (currentIndex + 1) % themeKeys.length;
        setTheme(themeKeys[nextIndex]);
    }

    function updateToggleButton() {
        if (themeToggle) {
            const theme = THEMES[currentTheme];
            themeToggle.textContent = theme.icon;
            themeToggle.title = `Switch to ${theme.name} theme`;
            themeToggle.setAttribute('aria-label', `Current theme: ${theme.name}. Click to switch theme.`);
        }
    }

    function setFontSize(size) {
        if (FONT_SIZES[size]) {
            currentFontSize = size;
            applyTheme();
            updateSettingsPanel();
            saveSettings();
        }
    }

    function setFontFamily(family) {
        if (FONT_FAMILIES[family]) {
            currentFontFamily = family;
            applyTheme();
            updateSettingsPanel();
            saveSettings();
        }
    }

    function createSettingsPanel() {
        // Create settings panel HTML
        const settingsPanelHTML = `
            <div id="settingsPanel" class="settings-panel" style="display: none;">
                <div class="settings-header">
                    <h3>Display Settings</h3>
                    <button class="settings-close" id="settingsClose" aria-label="Close settings">&times;</button>
                </div>
                
                <div class="settings-content">
                    <div class="setting-group">
                        <label class="setting-label">Theme</label>
                        <div class="theme-options">
                            ${Object.entries(THEMES).map(([key, theme]) => `
                                <button class="theme-option ${key === currentTheme ? 'active' : ''}" 
                                        data-theme="${key}" 
                                        title="${theme.name}">
                                    ${theme.icon} ${theme.name}
                                </button>
                            `).join('')}
                        </div>
                    </div>
                    
                    <div class="setting-group">
                        <label class="setting-label">Font Size</label>
                        <div class="font-size-options">
                            ${Object.entries(FONT_SIZES).map(([key, size]) => `
                                <button class="font-size-option ${key === currentFontSize ? 'active' : ''}" 
                                        data-size="${key}">
                                    ${key.charAt(0).toUpperCase() + key.slice(1).replace('-', ' ')}
                                </button>
                            `).join('')}
                        </div>
                    </div>
                    
                    <div class="setting-group">
                        <label class="setting-label">Font Family</label>
                        <select class="font-family-select" id="fontFamilySelect">
                            ${Object.entries(FONT_FAMILIES).map(([key, family]) => `
                                <option value="${key}" ${key === currentFontFamily ? 'selected' : ''}>
                                    ${key.charAt(0).toUpperCase() + key.slice(1).replace('-', ' ')}
                                </option>
                            `).join('')}
                        </select>
                    </div>
                    
                    <div class="setting-group">
                        <button class="reset-settings-btn" id="resetSettings">
                            Reset to Defaults
                        </button>
                    </div>
                </div>
            </div>
        `;

        // Add settings panel to body
        document.body.insertAdjacentHTML('beforeend', settingsPanelHTML);
        
        // Add settings panel styles
        addSettingsPanelStyles();
        
        // Setup settings panel event listeners
        setupSettingsPanelEvents();
    }

    function addSettingsPanelStyles() {
        const styles = `
            <style id="settings-panel-styles">
                .settings-panel {
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    background: var(--card-bg);
                    border: 1px solid var(--border-color);
                    border-radius: var(--radius-lg);
                    box-shadow: var(--shadow-heavy);
                    z-index: 10000;
                    width: 90%;
                    max-width: 400px;
                    max-height: 80vh;
                    overflow-y: auto;
                }
                
                .settings-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: var(--spacing-md);
                    border-bottom: 1px solid var(--border-color);
                }
                
                .settings-header h3 {
                    margin: 0;
                    color: var(--text-primary);
                }
                
                .settings-close {
                    background: none;
                    border: none;
                    font-size: 24px;
                    cursor: pointer;
                    color: var(--text-primary);
                    padding: 0;
                    width: 30px;
                    height: 30px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 50%;
                    transition: background-color var(--transition-fast);
                }
                
                .settings-close:hover {
                    background-color: var(--border-color);
                }
                
                .settings-content {
                    padding: var(--spacing-md);
                }
                
                .setting-group {
                    margin-bottom: var(--spacing-lg);
                }
                
                .setting-label {
                    display: block;
                    margin-bottom: var(--spacing-sm);
                    font-weight: 500;
                    color: var(--text-primary);
                }
                
                .theme-options, .font-size-options {
                    display: flex;
                    flex-wrap: wrap;
                    gap: var(--spacing-xs);
                }
                
                .theme-option, .font-size-option {
                    padding: var(--spacing-xs) var(--spacing-sm);
                    border: 2px solid var(--border-color);
                    background: var(--bg-primary);
                    color: var(--text-primary);
                    border-radius: var(--radius-md);
                    cursor: pointer;
                    transition: all var(--transition-fast);
                    font-size: var(--font-size-small);
                }
                
                .theme-option:hover, .font-size-option:hover {
                    border-color: var(--accent-emerald);
                }
                
                .theme-option.active, .font-size-option.active {
                    background: var(--accent-emerald);
                    color: white;
                    border-color: var(--accent-emerald);
                }
                
                .font-family-select {
                    width: 100%;
                    padding: var(--spacing-sm);
                    border: 2px solid var(--border-color);
                    border-radius: var(--radius-md);
                    background: var(--bg-primary);
                    color: var(--text-primary);
                    font-family: inherit;
                }
                
                .reset-settings-btn {
                    width: 100%;
                    padding: var(--spacing-sm);
                    background: #e74c3c;
                    color: white;
                    border: none;
                    border-radius: var(--radius-md);
                    cursor: pointer;
                    font-family: inherit;
                    transition: background-color var(--transition-fast);
                }
                
                .reset-settings-btn:hover {
                    background: #c0392b;
                }
                
                .settings-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.5);
                    z-index: 9999;
                }
            </style>
        `;
        
        document.head.insertAdjacentHTML('beforeend', styles);
    }

    function setupSettingsPanelEvents() {
        settingsPanel = document.getElementById('settingsPanel');
        
        // Close button
        document.getElementById('settingsClose').addEventListener('click', hideSettingsPanel);
        
        // Theme options
        document.querySelectorAll('.theme-option').forEach(button => {
            button.addEventListener('click', (e) => {
                setTheme(e.target.dataset.theme);
            });
        });
        
        // Font size options
        document.querySelectorAll('.font-size-option').forEach(button => {
            button.addEventListener('click', (e) => {
                setFontSize(e.target.dataset.size);
            });
        });
        
        // Font family select
        document.getElementById('fontFamilySelect').addEventListener('change', (e) => {
            setFontFamily(e.target.value);
        });
        
        // Reset settings
        document.getElementById('resetSettings').addEventListener('click', resetSettings);
        
        // Close on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && settingsPanel.style.display !== 'none') {
                hideSettingsPanel();
            }
        });
    }

    function showSettingsPanel() {
        if (settingsPanel) {
            // Create overlay
            const overlay = document.createElement('div');
            overlay.className = 'settings-overlay';
            overlay.addEventListener('click', hideSettingsPanel);
            document.body.appendChild(overlay);
            
            settingsPanel.style.display = 'block';
            updateSettingsPanel();
        }
    }

    function hideSettingsPanel() {
        if (settingsPanel) {
            settingsPanel.style.display = 'none';
            
            // Remove overlay
            const overlay = document.querySelector('.settings-overlay');
            if (overlay) {
                overlay.remove();
            }
        }
    }

    function toggleSettingsPanel() {
        if (settingsPanel) {
            if (settingsPanel.style.display === 'none') {
                showSettingsPanel();
            } else {
                hideSettingsPanel();
            }
        }
    }

    function updateSettingsPanel() {
        // Update active theme option
        document.querySelectorAll('.theme-option').forEach(button => {
            button.classList.toggle('active', button.dataset.theme === currentTheme);
        });
        
        // Update active font size option
        document.querySelectorAll('.font-size-option').forEach(button => {
            button.classList.toggle('active', button.dataset.size === currentFontSize);
        });
        
        // Update font family select
        const fontFamilySelect = document.getElementById('fontFamilySelect');
        if (fontFamilySelect) {
            fontFamilySelect.value = currentFontFamily;
        }
    }

    function resetSettings() {
        currentTheme = 'light';
        currentFontSize = 'medium';
        currentFontFamily = 'poppins';
        
        applyTheme();
        updateToggleButton();
        updateSettingsPanel();
        saveSettings();
    }

    // Public API
    window.ThemeManager = {
        setTheme,
        setFontSize,
        setFontFamily,
        showSettings: showSettingsPanel,
        hideSettings: hideSettingsPanel,
        getCurrentTheme: () => currentTheme,
        getCurrentFontSize: () => currentFontSize,
        getCurrentFontFamily: () => currentFontFamily
    };

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();