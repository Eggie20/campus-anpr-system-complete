// Complete Step-by-Step Multi-Page Registration Form
document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const registrationForm = document.getElementById('registrationForm');
    const formSteps = document.querySelectorAll('.form-step');
    const progressSteps = document.querySelectorAll('.progress-step');
    const backBtn = document.getElementById('backBtn');
    const nextBtn = document.getElementById('nextBtn');
    const submitBtn = document.getElementById('submitBtn');
    const successMessage = document.getElementById('successMessage');
    const reviewContent = document.getElementById('reviewContent');

    // Vehicle type selection
    const vehicleTypeOptions = document.querySelectorAll('.vehicle-type-option');
    const vehicleTypeInput = document.getElementById('vehicleType');

    // File upload elements
    const fileInputs = document.querySelectorAll('.file-upload-input');

    // Terms and Conditions Modal
    const termsModal = document.getElementById('termsModal');
    const readTermsBtn = document.getElementById('readTermsBtn');
    const closeTermsModal = document.getElementById('closeTermsModal');
    const acceptTermsBtn = document.getElementById('acceptTermsBtn');
    const termsStatus = document.getElementById('termsStatus');
    const termsContent = document.getElementById('termsContent');
    const scrollIndicator = document.getElementById('scrollIndicator');
    const scrollProgressBar = document.getElementById('scrollProgressBar');
    const captchaSection = document.getElementById('captchaSection');

    // CAPTCHA elements
    const captchaCanvas = document.getElementById('captchaCanvas');
    const captchaInput = document.getElementById('captchaInput');
    const captchaRefresh = document.getElementById('captchaRefresh');
    let currentCaptcha = '';
    let termsAccepted = false;

    // Enhanced tracking variables
    let currentStep = 1;
    const totalSteps = 3;
    let formData = {};
    let completedSteps = new Set();
    let audioContext = null;

    // Enhanced validation rules
    const validationRules = {
        firstName: {
            required: true,
            minLength: 2,
            pattern: /^[a-zA-Z\s\-']+$/,
            message: 'First name must contain only letters, spaces, hyphens, and apostrophes',
            suggestions: ['Use only letters and common punctuation', 'Minimum 2 characters required']
        },
        lastName: {
            required: true,
            minLength: 2,
            pattern: /^[a-zA-Z\s\-']+$/,
            message: 'Last name must contain only letters, spaces, hyphens, and apostrophes',
            suggestions: ['Use only letters and common punctuation', 'Minimum 2 characters required']
        },
        email: {
            required: true,
            pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            message: 'Please enter a valid email address',
            suggestions: ['Format: example@domain.com', 'Check for typos in domain name']
        },
        phone: {
            required: true,
            custom: validatePhoneNumber,
            message: 'Please enter a valid phone number',
            suggestions: ['Format: (123) 456-7890 or +1-123-456-7890', 'Include area code', 'Use digits, spaces, dashes, or parentheses']
        },
        idNumber: {
            required: true,
            minLength: 5,
            message: 'ID number must be at least 5 characters',
            suggestions: ['Use your driver\'s license or government ID number', 'Include hyphens if part of your ID format']
        },
        address: {
            required: true,
            minLength: 10,
            message: 'Please provide a complete address',
            suggestions: ['Include street number, street name, city, and state/province', 'Minimum 10 characters required']
        },
        relationship: {
            required: true,
            message: 'Please select your relationship to CSUCC',
            suggestions: ['Choose the option that best describes your connection to CSUCC']
        },
        vehicleType: {
            required: true,
            message: 'Please select a vehicle type',
            suggestions: ['Click on one of the vehicle type icons above']
        },
        plateNumber: {
            required: true,
            pattern: /^[A-Z0-9\-\s]{3,10}$/,
            message: 'Please enter a valid license plate number',
            suggestions: ['Use letters and numbers only', '3-10 characters typical', 'Spaces and hyphens allowed']
        },
        make: {
            required: true,
            minLength: 2,
            message: 'Vehicle make must be at least 2 characters',
            suggestions: ['Examples: Toyota, Honda, Ford, BMW', 'Use the manufacturer name']
        },
        model: {
            required: true,
            minLength: 2,
            message: 'Vehicle model must be at least 2 characters',
            suggestions: ['Examples: Camry, Civic, F-150, X5', 'Use the specific model name']
        },
        year: {
            required: true,
            min: 1900,
            max: new Date().getFullYear() + 1,
            message: `Please enter a valid year between 1900 and ${new Date().getFullYear() + 1}`,
            suggestions: ['Enter the manufacturing year of your vehicle', 'Future model years are acceptable']
        },
        color: {
            required: true,
            minLength: 3,
            message: 'Vehicle color must be at least 3 characters',
            suggestions: ['Examples: Red, Blue, Silver, Dark Blue', 'Use common color names']
        },
        driverLicense: {
            required: true,
            fileTypes: ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'],
            maxSize: 5 * 1024 * 1024, // 5MB
            message: 'Please upload a valid driver\'s license',
            suggestions: ['Accepted formats: PDF, JPG, PNG', 'Maximum file size: 5MB', 'Ensure document is clear and readable']
        },
    };

    // Initialize system
    init();

    function init() {
        setupEventListeners();
        setupEnhancedFileUploads();
        setupVehicleTypeSelection();
        setupFormValidation();
        setupClickableSteps();
        setupTermsModal();
        setupEnhancedCaptcha();
        setupProgressTracking();
        updateStepDisplay();
        addProgressBar();
        setupOCRModal();
    }

    // Add progress bar to the form
    function addProgressBar() {
        const progressHTML = `
            <div class="overall-progress" role="progressbar" aria-label="Registration completion progress">
                <div class="progress-header">
                    <span class="progress-label">Registration Progress</span>
                    <span class="progress-percentage">0%</span>
                </div>
                <div class="progress-bar-container">
                    <div class="progress-bar" style="width: 0%" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100"></div>
                </div>
            </div>
        `;
        
        const progressIndicator = document.querySelector('.progress-indicator');
        if (progressIndicator) {
            progressIndicator.insertAdjacentHTML('afterend', progressHTML);
        }
    }

    // Enhanced Progress Tracking
    function setupProgressTracking() {
        const allInputs = registrationForm.querySelectorAll('input, select, textarea');
        allInputs.forEach(input => {
            input.addEventListener('input', updateOverallProgress);
            input.addEventListener('change', updateOverallProgress);
        });
    }

    function updateOverallProgress() {
        let completedFields = 0;
        let totalRequiredFields = 0;
        
        // Count completion across all steps
        for (let step = 1; step <= totalSteps; step++) {
            const stepElement = document.querySelector(`.form-step[data-step="${step}"]`);
            const requiredInputs = stepElement.querySelectorAll('input[required], select[required], textarea[required]');
            
            requiredInputs.forEach(input => {
                totalRequiredFields++;
                
                if (input.type === 'file') {
                    if (input.files && input.files.length > 0) completedFields++;
                } else if (input.type === 'checkbox') {
                    if (input.checked) completedFields++;
                } else if (input.value && input.value.trim()) {
                    completedFields++;
                }
            });
        }
        
        // Add terms and CAPTCHA to calculation
        totalRequiredFields += 2;
        if (termsAccepted) completedFields++;
        if (currentCaptcha && captchaInput && captchaInput.value === currentCaptcha) completedFields++;
        
        const percentage = totalRequiredFields > 0 ? Math.round((completedFields / totalRequiredFields) * 100) : 0;
        
        const progressBar = document.querySelector('.overall-progress .progress-bar');
        const progressPercentage = document.querySelector('.progress-percentage');
        
        if (progressBar) {
            progressBar.style.width = percentage + '%';
            progressBar.setAttribute('aria-valuenow', percentage);
        }
        
        if (progressPercentage) {
            progressPercentage.textContent = percentage + '%';
        }
        
        updateStepCompletionStatus();
    }

    function updateStepCompletionStatus() {
        progressSteps.forEach((step, index) => {
            const stepNumber = index + 1;
            const isCompleted = isStepCompleted(stepNumber);
            
            if (isCompleted) {
                completedSteps.add(stepNumber);
                step.classList.add('completed');
                
                const stepNumberElement = step.querySelector('.step-number');
                if (stepNumberElement && !stepNumberElement.querySelector('.checkmark')) {
                    stepNumberElement.innerHTML = '<span class="checkmark">✓</span>';
                }
            } else {
                completedSteps.delete(stepNumber);
                step.classList.remove('completed');
                
                const stepNumberElement = step.querySelector('.step-number');
                if (stepNumberElement) {
                    stepNumberElement.textContent = stepNumber;
                }
            }
        });
    }

    function isStepCompleted(stepNumber) {
        // Validation Dependency: Future steps cannot be complete if previous steps are not.
        if (stepNumber > 1) {
            for (let i = 1; i < stepNumber; i++) {
                if (!checkStepInputs(i)) return false;
            }
        }
        
        return checkStepInputs(stepNumber);
    }

    function checkStepInputs(stepNumber) {
        const stepElement = document.querySelector(`.form-step[data-step="${stepNumber}"]`);
        if (!stepElement) return false;

        const requiredInputs = stepElement.querySelectorAll('input[required], select[required], textarea[required]');
        
        // If step has no required inputs (like Review step), we treat it as incomplete 
        // until explicitly acted upon, OR we check if it's the current step.
        // HOWEVER, for the visual checkmark, usually regular steps are "complete" when valid.
        // The Review step (3) is special. It shouldn't be "completed" just because it's empty.
        // It's strictly a review page. Let's return false for Step 3 to avoid the checkmark 
        // until the very end (submission), or perhaps we only mark it complete if 
        // terms are accepted?? 
        
        if (requiredInputs.length === 0) {
            // Special handling for Review Step (Step 3) or others with no inputs
            if (stepNumber === 3) {
                 // Only show checkmark if Terms are accepted? 
                 // Or better yet, Step 3 checkmark only appears when SUBMITTED? 
                 // User request: "logo check dont appear if step 1 and 2 not complete".
                 // Since we added the dependency loop above, Step 3 will now return false if 1 or 2 fail.
                 // But if 1 and 2 pass, Step 3 (empty) would return true.
                 // If the user wants Step 3 to NOT show checkmark at all, we can just return false here 
                 // unless some specific "review done" flag is set.
                 // Let's assume Step 3 checkmark is for "Ready to Submit" -> which implies Terms check.
                 
                 const termsCheck = document.getElementById('acceptTerms');
                 if (termsCheck) return termsCheck.checked;
                 return false;
            }
            return true;
        }

        return Array.from(requiredInputs).every(input => {
            if (input.type === 'file') {
                return input.files && input.files.length > 0;
            } else if (input.type === 'checkbox') {
                return input.checked;
            } else {
                return input.value && input.value.trim();
            }
        });
    }

    // Enhanced File Upload with Drag & Drop
    function setupEnhancedFileUploads() {
        fileInputs.forEach(input => {
            const wrapper = input.closest('.file-upload-wrapper');
            const label = wrapper.querySelector('.file-upload-label');
            
            setupDragAndDrop(label, input);
            
            input.addEventListener('change', function() {
                if (this.files.length > 0) {
                    handleFileSelection(this, this.files[0]);
                }
            });
        });
    }

    function setupDragAndDrop(label, input) {
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            label.addEventListener(eventName, preventDefaults, false);
        });

        ['dragenter', 'dragover'].forEach(eventName => {
            label.addEventListener(eventName, () => label.classList.add('drag-over'), false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            label.addEventListener(eventName, () => label.classList.remove('drag-over'), false);
        });

        label.addEventListener('drop', function(e) {
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                input.files = files;
                handleFileSelection(input, files[0]);
            }
        });

        function preventDefaults(e) {
            e.preventDefault();
            e.stopPropagation();
        }
    }

    function handleFileSelection(input, file) {
        const wrapper = input.closest('.file-upload-wrapper');
        const label = wrapper.querySelector('.file-upload-label');
        
        if (!validateFile(file, input.name)) {
            return;
        }
        
        showUploadProgress(label, file, () => {
            if (file.type.startsWith('image/')) {
                generateThumbnail(file, label);
            }
            
            validateField(input.name);
            updateOverallProgress();
        });
    }

    function validateFile(file, fieldName) {
        const rule = validationRules[fieldName];
        if (!rule) return true;
        
        if (rule.fileTypes && !rule.fileTypes.includes(file.type)) {
            showEnhancedError(fieldName, 'Invalid file type', [
                'Accepted formats: ' + rule.fileTypes.map(type => type.split('/')[1].toUpperCase()).join(', '),
                'Please select a different file'
            ]);
            return false;
        }
        
        if (rule.maxSize && file.size > rule.maxSize) {
            showEnhancedError(fieldName, 'File size too large', [
                `Maximum size: ${formatFileSize(rule.maxSize)}`,
                `Your file: ${formatFileSize(file.size)}`,
                'Please compress or select a smaller file'
            ]);
            return false;
        }
        
        return true;
    }

    function showUploadProgress(container, file, callback) {
        const progressElement = document.createElement('div');
        progressElement.className = 'upload-progress-indicator';
        progressElement.innerHTML = `
            <div class="file-info">
                <div class="file-name">${file.name}</div>
                <div class="file-size">${formatFileSize(file.size)}</div>
            </div>
            <div class="progress-bar-container">
                <div class="progress-bar" style="width: 0%"></div>
            </div>
            <div class="progress-text">Preparing upload...</div>
        `;
        
        const originalContent = container.innerHTML;
        container.innerHTML = '';
        container.appendChild(progressElement);
        
        simulateUploadProgress(progressElement, () => {
            container.innerHTML = originalContent;
            
            const textElement = container.querySelector('.file-upload-text');
            if (textElement) {
                textElement.innerHTML = `
                    <div class="selected-file">
                        <span class="file-icon">📄</span>
                        <div class="file-details">
                            <div class="file-name">${file.name}</div>
                            <div class="file-size">${formatFileSize(file.size)}</div>
                        </div>
                        <span class="upload-success">✓</span>
                    </div>
                `;
            }
            
            container.style.borderColor = 'var(--accent-emerald)';
            container.style.background = 'rgba(39, 174, 96, 0.05)';
            
            callback();
        });
    }

    function simulateUploadProgress(progressElement, callback) {
        const progressBar = progressElement.querySelector('.progress-bar');
        const progressText = progressElement.querySelector('.progress-text');
        let progress = 0;
        
        const interval = setInterval(() => {
            progress += Math.random() * 20 + 5;
            
            if (progress >= 100) {
                progress = 100;
                clearInterval(interval);
                progressText.textContent = 'Upload complete!';
                setTimeout(callback, 500);
            } else {
                progressText.textContent = `Uploading... ${Math.round(progress)}%`;
            }
            
            progressBar.style.width = progress + '%';
        }, 150);
    }

    function generateThumbnail(file, container) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const thumbnailContainer = document.createElement('div');
            thumbnailContainer.className = 'file-thumbnail';
            thumbnailContainer.innerHTML = `
                <img src="${e.target.result}" alt="File preview" />
                <div class="thumbnail-overlay">
                    <span class="thumbnail-label">Preview</span>
                </div>
            `;
            
            const existingThumbnail = container.querySelector('.file-thumbnail');
            if (existingThumbnail) {
                existingThumbnail.replaceWith(thumbnailContainer);
            } else {
                container.appendChild(thumbnailContainer);
            }
        };
        reader.readAsDataURL(file);
    }

    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // Enhanced CAPTCHA with Audio Support
    function setupEnhancedCaptcha() {
        const audioBtn = document.createElement('button');
        audioBtn.type = 'button';
        audioBtn.className = 'captcha-audio';
        audioBtn.innerHTML = '🔊';
        audioBtn.title = 'Play audio CAPTCHA';
        audioBtn.setAttribute('aria-label', 'Play audio version of CAPTCHA');
        
        const captchaContainer = document.querySelector('.captcha-container');
        if (captchaContainer) {
            captchaContainer.appendChild(audioBtn);
            audioBtn.addEventListener('click', playAudioCaptcha);
        }
        
        if (captchaRefresh) {
            captchaRefresh.addEventListener('click', generateEnhancedCaptcha);
        }
        
        if (captchaCanvas) {
            captchaCanvas.addEventListener('click', generateEnhancedCaptcha);
        }
        
        if (captchaInput) {
            captchaInput.addEventListener('input', function() {
                this.value = this.value.toUpperCase();
                if (this.value.length === currentCaptcha.length) {
                    validateCaptcha();
                }
            });
        }
    }

    function generateEnhancedCaptcha() {
        if (!captchaCanvas) return;
        
        const ctx = captchaCanvas.getContext('2d');
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        currentCaptcha = '';
        
        const length = Math.random() > 0.5 ? 5 : 6;
        for (let i = 0; i < length; i++) {
            currentCaptcha += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        
        ctx.clearRect(0, 0, captchaCanvas.width, captchaCanvas.height);
        
        const gradient = ctx.createLinearGradient(0, 0, captchaCanvas.width, captchaCanvas.height);
        gradient.addColorStop(0, '#f8f9fa');
        gradient.addColorStop(1, '#e9ecef');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, captchaCanvas.width, captchaCanvas.height);
        
        addCaptchaNoise(ctx);
        drawCaptchaText(ctx);
        
        if (captchaInput) {
            captchaInput.value = '';
            captchaInput.classList.remove('error');
            clearFieldError('captchaInput');
        }
        
        console.log('Generated CAPTCHA:', currentCaptcha);
    }

    function addCaptchaNoise(ctx) {
        for (let i = 0; i < 8; i++) {
            ctx.strokeStyle = `rgba(${Math.random() * 100}, ${Math.random() * 100}, ${Math.random() * 100}, 0.3)`;
            ctx.lineWidth = Math.random() * 2 + 1;
            ctx.beginPath();
            ctx.moveTo(Math.random() * captchaCanvas.width, Math.random() * captchaCanvas.height);
            ctx.lineTo(Math.random() * captchaCanvas.width, Math.random() * captchaCanvas.height);
            ctx.stroke();
        }
        
        for (let i = 0; i < 30; i++) {
            ctx.fillStyle = `rgba(${Math.random() * 150}, ${Math.random() * 150}, ${Math.random() * 150}, 0.4)`;
            ctx.beginPath();
            ctx.arc(
                Math.random() * captchaCanvas.width,
                Math.random() * captchaCanvas.height,
                Math.random() * 3 + 1,
                0,
                2 * Math.PI
            );
            ctx.fill();
        }
    }

    function drawCaptchaText(ctx) {
        const fonts = ['Arial', 'Helvetica', 'Times New Roman', 'Georgia'];
        
        for (let i = 0; i < currentCaptcha.length; i++) {
            const char = currentCaptcha[i];
            const x = (captchaCanvas.width / currentCaptcha.length) * (i + 0.5);
            const y = captchaCanvas.height / 2;
            
            const font = fonts[Math.floor(Math.random() * fonts.length)];
            const size = Math.random() * 8 + 20;
            ctx.font = `bold ${size}px ${font}`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            ctx.fillStyle = `rgb(${Math.floor(Math.random() * 80)}, ${Math.floor(Math.random() * 80)}, ${Math.floor(Math.random() * 80)})`;
            
            const angle = (Math.random() - 0.5) * 0.6;
            const offsetX = (Math.random() - 0.5) * 10;
            const offsetY = (Math.random() - 0.5) * 10;
            
            ctx.save();
            ctx.translate(x + offsetX, y + offsetY);
            ctx.rotate(angle);
            ctx.fillText(char, 0, 0);
            ctx.restore();
        }
    }

    function playAudioCaptcha() {
        if (!currentCaptcha) return;
        
        try {
            if (!audioContext) {
                audioContext = new (window.AudioContext || window.webkitAudioContext)();
            }
            
            if (audioContext.state === 'suspended') {
                audioContext.resume();
            }
            
            let currentTime = audioContext.currentTime + 0.1;
            
            for (let i = 0; i < currentCaptcha.length; i++) {
                const char = currentCaptcha[i];
                const frequency = getFrequencyForChar(char);
                
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);
                
                oscillator.frequency.setValueAtTime(frequency, currentTime);
                oscillator.type = 'sine';
                
                const duration = 0.4;
                gainNode.gain.setValueAtTime(0, currentTime);
                gainNode.gain.linearRampToValueAtTime(0.2, currentTime + 0.05);
                gainNode.gain.linearRampToValueAtTime(0.2, currentTime + duration - 0.05);
                gainNode.gain.linearRampToValueAtTime(0, currentTime + duration);
                
                oscillator.start(currentTime);
                oscillator.stop(currentTime + duration);
                
                currentTime += duration + 0.3;
            }
            
        } catch (error) {
            console.warn('Audio CAPTCHA not supported:', error);
            showNotification('Audio CAPTCHA is not supported in your browser. Please use the visual CAPTCHA.', 'warning');
        }
    }

    function getFrequencyForChar(char) {
        const charMap = {
            'A': 440, 'B': 466, 'C': 494, 'D': 523, 'E': 554, 'F': 587, 'G': 622,
            'H': 659, 'I': 698, 'J': 740, 'K': 784, 'L': 831, 'M': 880, 'N': 932,
            'O': 988, 'P': 1047, 'Q': 1109, 'R': 1175, 'S': 1245, 'T': 1319,
            'U': 1397, 'V': 1480, 'W': 1568, 'X': 1661, 'Y': 1760, 'Z': 1865,
            '0': 261, '1': 277, '2': 294, '3': 311, '4': 330, '5': 349,
            '6': 370, '7': 392, '8': 415, '9': 440
        };
        return charMap[char] || 440;
    }

    // Enhanced Phone Number Validation
    function validatePhoneNumber(phone) {
        const cleaned = phone.replace(/\D/g, '');
        const patterns = [
            /^1?[2-9]\d{2}[2-9]\d{2}\d{4}$/,
            /^\d{10,15}$/
        ];
        return patterns.some(pattern => pattern.test(cleaned)) && cleaned.length >= 10;
    }

    // Enhanced Error Display with Suggestions
    function showEnhancedError(fieldName, message, suggestions = []) {
        const input = document.querySelector(`[name="${fieldName}"]`);
        const errorElement = document.getElementById(fieldName + '-error');
        
        if (!input || !errorElement) return;
        
        if (message) {
            input.classList.add('error');
            input.setAttribute('aria-invalid', 'true');
            
            let errorHTML = `<div class="error-main">${message}</div>`;
            if (suggestions.length > 0) {
                errorHTML += `
                    <div class="error-suggestions">
                        <strong>💡 Suggestions:</strong>
                        <ul>${suggestions.map(s => `<li>${s}</li>`).join('')}</ul>
                    </div>
                `;
            }
            
            errorElement.innerHTML = errorHTML;
            errorElement.classList.add('show');
            
            input.classList.add('shake');
            setTimeout(() => input.classList.remove('shake'), 500);
            
        } else {
            input.classList.remove('error');
            input.removeAttribute('aria-invalid');
            errorElement.classList.remove('show');
        }
    }

    // Notification System
    function showNotification(message, type = 'info', duration = 5000) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">${getNotificationIcon(type)}</span>
                <span class="notification-message">${message}</span>
                <button class="notification-close" aria-label="Close notification">×</button>
            </div>
        `;
        
        let container = document.querySelector('.notification-container');
        if (!container) {
            container = document.createElement('div');
            container.className = 'notification-container';
            document.body.appendChild(container);
        }
        
        container.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('fade-out');
            setTimeout(() => notification.remove(), 300);
        }, duration);
        
        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.classList.add('fade-out');
            setTimeout(() => notification.remove(), 300);
        });
    }

    function getNotificationIcon(type) {
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };
        return icons[type] || icons.info;
    }

    // Core Form Functions
    function setupEventListeners() {
        backBtn.addEventListener('click', goToPreviousStep);
        nextBtn.addEventListener('click', goToNextStep);
        submitBtn.addEventListener('click', handleSubmit);
        registrationForm.addEventListener('submit', handleSubmit);

        const inputs = registrationForm.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            let validationTimeout;
            
            input.addEventListener('input', () => {
                clearTimeout(validationTimeout);
                clearFieldError(input.name);
                
                validationTimeout = setTimeout(() => {
                    if (input.value.trim()) {
                        validateField(input.name);
                    }
                }, 500);
            });
            
            input.addEventListener('blur', () => {
                clearTimeout(validationTimeout);
                validateField(input.name);
            });
        });

        const plateNumberInput = document.getElementById('plateNumber');
        if (plateNumberInput) {
            plateNumberInput.addEventListener('input', function() {
                this.value = this.value.toUpperCase();
            });
        }
    }

    function setupVehicleTypeSelection() {
        vehicleTypeOptions.forEach(option => {
            option.addEventListener('click', function() {
                vehicleTypeOptions.forEach(opt => opt.classList.remove('selected'));
                this.classList.add('selected');
                vehicleTypeInput.value = this.dataset.type;
                clearFieldError('vehicleType');
                updateOverallProgress();
            });
        });
    }

    function setupFormValidation() {
        const formInputs = registrationForm.querySelectorAll('input, select, textarea');
        formInputs.forEach(input => {
            input.addEventListener('input', function() {
                if (this.classList.contains('error')) {
                    this.classList.remove('error');
                    const errorElement = document.getElementById(this.name + '-error');
                    if (errorElement) {
                        errorElement.classList.remove('show');
                    }
                }
            });
        });
    }

    function validateField(fieldName) {
        const input = document.querySelector(`[name="${fieldName}"]`);
        if (!input) return true;

        const rule = validationRules[fieldName];
        if (!rule) return true;

        let isValid = true;
        let errorMessage = '';
        let suggestions = rule.suggestions || [];

        if (input.type === 'file') {
            const file = input.files[0];
            
            if (rule.required && !file) {
                isValid = false;
                errorMessage = 'This file is required';
            } else if (file) {
                if (rule.fileTypes && !rule.fileTypes.includes(file.type)) {
                    isValid = false;
                    errorMessage = 'Invalid file type';
                    suggestions = ['Accepted formats: ' + rule.fileTypes.map(type => type.split('/')[1].toUpperCase()).join(', ')];
                } else if (rule.maxSize && file.size > rule.maxSize) {
                    isValid = false;
                    errorMessage = `File size too large (max ${formatFileSize(rule.maxSize)})`;
                    suggestions = [`Your file: ${formatFileSize(file.size)}`, 'Please compress or select a smaller file'];
                }
            }
        } else {
            const value = input.value.trim();
            
            if (rule.required && !value) {
                isValid = false;
                errorMessage = `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`;
            } else if (value) {
                if (rule.minLength && value.length < rule.minLength) {
                    isValid = false;
                    errorMessage = rule.message || `Must be at least ${rule.minLength} characters`;
                } else if (rule.pattern && !rule.pattern.test(value)) {
                    isValid = false;
                    errorMessage = rule.message || 'Invalid format';
                } else if (rule.custom && !rule.custom(value)) {
                    isValid = false;
                    errorMessage = rule.message || 'Invalid value';
                } else if (input.type === 'number') {
                    const numValue = parseInt(value);
                    if (rule.min && numValue < rule.min) {
                        isValid = false;
                        errorMessage = rule.message || `Must be at least ${rule.min}`;
                    } else if (rule.max && numValue > rule.max) {
                        isValid = false;
                        errorMessage = rule.message || `Must be at most ${rule.max}`;
                    }
                }
            }
        }

        if (isValid) {
            clearFieldError(fieldName);
        } else {
            showEnhancedError(fieldName, errorMessage, suggestions);
        }

        return isValid;
    }

    function clearFieldError(fieldName) {
        const input = document.querySelector(`[name="${fieldName}"]`);
        const errorElement = document.getElementById(fieldName + '-error');
        
        if (input) {
            input.classList.remove('error');
            input.removeAttribute('aria-invalid');
        }
        if (errorElement) {
            errorElement.classList.remove('show');
        }
    }

    function validateCurrentStep() {
        const currentStepElement = document.querySelector(`.form-step[data-step="${currentStep}"]`);
        const inputs = currentStepElement.querySelectorAll('input, select, textarea');
        
        let isValid = true;
        let firstErrorField = null;
        
        inputs.forEach(input => {
            if (input.name && validationRules[input.name]) {
                const fieldValid = validateField(input.name);
                if (!fieldValid) {
                    isValid = false;
                    if (!firstErrorField) {
                        firstErrorField = input;
                    }
                }
            }
        });
        
        if (firstErrorField) {
            firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
            setTimeout(() => firstErrorField.focus(), 300);
        }
        
        return isValid;
    }

    function goToNextStep() {
        if (validateCurrentStep()) {
            if (currentStep < totalSteps) {
                saveCurrentStepData();
                currentStep++;
                updateStepDisplay();
                updateOverallProgress();
                
                if (currentStep === 3) {
                    generateReviewContent();
                }
            }
        }
    }

    function goToPreviousStep() {
        if (currentStep > 1) {
            saveCurrentStepData();
            currentStep--;
            updateStepDisplay();
        }
    }

    function updateStepDisplay() {
        // TRUE STEP-BY-STEP: Hide all steps except current
        formSteps.forEach((step, index) => {
            step.classList.toggle('active', index + 1 === currentStep);
        });

        progressSteps.forEach((step, index) => {
            const stepNumber = index + 1;
            step.classList.toggle('active', stepNumber === currentStep);
        });

        backBtn.style.display = currentStep > 1 ? 'inline-block' : 'none';
        nextBtn.style.display = currentStep < totalSteps ? 'inline-block' : 'none';
        submitBtn.style.display = currentStep === totalSteps ? 'inline-block' : 'none';

        document.querySelector('.registration-card-content').scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
        });
    }

    function saveCurrentStepData() {
        const currentStepElement = document.querySelector(`.form-step[data-step="${currentStep}"]`);
        const inputs = currentStepElement.querySelectorAll('input, select, textarea');
        
        inputs.forEach(input => {
            if (input.type === 'file') {
                if (input.files.length > 0) {
                    formData[input.name] = input.files[0];
                }
            } else if (input.type === 'checkbox') {
                formData[input.name] = input.checked;
            } else {
                formData[input.name] = input.value;
            }
        });
    }

    function generateReviewContent() {
        const reviewHTML = `
            <!-- Owner Information Card -->
            <div class="review-card">
                <div class="review-header">
                    <h4 class="review-section-title">
                        <span class="review-icon">👤</span> Owner Information
                    </h4>
                    <button type="button" class="btn-edit-link clickable-review-title" data-step="1">Edit</button>
                </div>
                <div class="review-grid">
                    <div class="review-item">
                        <span class="review-label">Full Name</span>
                        <span class="review-value">${formData.firstName || '-'} ${formData.lastName || ''}</span>
                    </div>
                    <div class="review-item">
                        <span class="review-label">Email Address</span>
                        <span class="review-value">${formData.email || '-'}</span>
                    </div>
                    <div class="review-item">
                        <span class="review-label">Phone Number</span>
                        <span class="review-value">${formData.phone || '-'}</span>
                    </div>
                    <div class="review-item">
                        <span class="review-label">ID Number</span>
                        <span class="review-value">${formData.idNumber || '-'}</span>
                    </div>
                    <div class="review-item">
                        <span class="review-label">Relationship</span>
                        <span class="review-value" style="text-transform: capitalize;">${formData.relationship || '-'}</span>
                    </div>
                    <div class="review-item full-width">
                        <span class="review-label">Address</span>
                        <span class="review-value">${formData.address || '-'}</span>
                    </div>
                </div>
            </div>
            
            <!-- Vehicle Information Card -->
            <div class="review-card">
                <div class="review-header">
                    <h4 class="review-section-title">
                        <span class="review-icon">🚗</span> Vehicle Information
                    </h4>
                    <button type="button" class="btn-edit-link clickable-review-title" data-step="2">Edit</button>
                </div>
                <div class="review-grid">
                    <div class="review-item">
                        <span class="review-label">Vehicle Type</span>
                        <span class="review-value" style="text-transform: capitalize;">${formData.vehicleType || '-'}</span>
                    </div>
                    <div class="review-item">
                        <span class="review-label">Plate Number</span>
                        <span class="review-value highlight">${formData.plateNumber || '-'}</span>
                    </div>
                    <div class="review-item">
                        <span class="review-label">Make</span>
                        <span class="review-value">${formData.make || '-'}</span>
                    </div>
                    <div class="review-item">
                        <span class="review-label">Model</span>
                        <span class="review-value">${formData.model || '-'}</span>
                    </div>
                    <div class="review-item">
                        <span class="review-label">Year</span>
                        <span class="review-value">${formData.year || '-'}</span>
                    </div>
                    <div class="review-item">
                        <span class="review-label">Color</span>
                        <span class="review-value">${formData.color || '-'}</span>
                    </div>
                    ${formData.engineNumber ? `
                    <div class="review-item">
                        <span class="review-label">Engine No.</span>
                        <span class="review-value">${formData.engineNumber}</span>
                    </div>` : ''}
                </div>
            </div>
            
            <!-- Documents Card -->
            <div class="review-card">
                <div class="review-header">
                    <h4 class="review-section-title">
                        <span class="review-icon">📄</span> Documents
                    </h4>
                    <button type="button" class="btn-edit-link clickable-review-title" data-step="1">Edit</button>
                </div>
                <div class="review-documents-list">
                    <!-- Driver's License -->
                    <div class="doc-status-item">
                        <div class="doc-info">
                            <span class="doc-label">Driver's License</span>
                            <span class="doc-filename">${formData.driverLicense?.name || 'Scan required'}</span>
                        </div>
                        ${formData.driverLicense ? 
                            '<span class="status-badge success">✅ Uploaded</span>' : 
                            '<span class="status-badge warning">⚠️ Not Uploaded</span>'
                        }
                    </div>

                    <!-- Vehicle Registration (Optional/Manual) -->
                    <div class="doc-status-item">
                        <div class="doc-info">
                            <span class="doc-label">Vehicle Registration</span>
                            <span class="doc-filename">${formData.vehicleRegistration?.name || 'Manual Verification'}</span>
                        </div>
                         ${formData.vehicleRegistration ? 
                            '<span class="status-badge success">✅ Uploaded</span>' : 
                            '<span class="status-badge warning" style="background:#fff3cd; color:#856404">⚠️ Pending Check</span>'
                        }
                    </div>

                    <!-- Insurance -->
                    <div class="doc-status-item">
                        <div class="doc-info">
                            <span class="doc-label">Insurance Certificate</span>
                            <span class="doc-filename">${formData.insurance?.name || 'Optional'}</span>
                        </div>
                        ${formData.insurance ? 
                            '<span class="status-badge success">✅ Uploaded</span>' : 
                            '<span class="status-badge info">ℹ️ Optional</span>'
                        }
                    </div>
                </div>
            </div>
        `;
        
        reviewContent.innerHTML = reviewHTML;
        
        const clickableReviewTitles = reviewContent.querySelectorAll('.clickable-review-title');
        clickableReviewTitles.forEach(title => {
            title.addEventListener('click', function() {
                const targetStep = parseInt(this.dataset.step);
                saveCurrentStepData();
                currentStep = targetStep;
                updateStepDisplay();
            });
        });
    }

    function setupClickableSteps() {
        const clickableSteps = document.querySelectorAll('.progress-step.clickable');
        clickableSteps.forEach(step => {
            step.addEventListener('click', function() {
                const targetStep = parseInt(this.dataset.step);
                if (targetStep <= currentStep || completedSteps.has(targetStep)) {
                    saveCurrentStepData();
                    currentStep = targetStep;
                    updateStepDisplay();
                    
                    if (currentStep === 3) {
                        generateReviewContent();
                    }
                }
            });
        });
    }

    function setupTermsModal() {
        setupEmbeddedTerms();
    }

    function setupEmbeddedTerms() {
        const termsScrollContainer = document.getElementById('termsContent');
        const scrollProgressBar = document.getElementById('scrollProgressBar');
        const scrollIndicator = document.getElementById('scrollIndicator');
        const acceptTermsCheckbox = document.getElementById('acceptTerms');

        if (termsScrollContainer) {
            termsScrollContainer.addEventListener('scroll', function() {
                // Calculate progress
                const scrollTop = this.scrollTop;
                const scrollHeight = this.scrollHeight - this.clientHeight;
                const scrollPercent = (scrollTop / scrollHeight) * 100;
                
                // Update progress bar
                if (scrollProgressBar) {
                    scrollProgressBar.style.width = scrollPercent + '%';
                }
                
                // Check if reached bottom (with 20px tolerance)
                if (scrollHeight - scrollTop <= 20) {
                    if (acceptTermsCheckbox) {
                        acceptTermsCheckbox.disabled = false;
                    }
                    if (scrollIndicator) {
                        scrollIndicator.classList.add('hidden');
                    }
                }
            });
        }
        
        if (acceptTermsCheckbox) {
            acceptTermsCheckbox.addEventListener('change', function() {
                termsAccepted = this.checked;
                if (this.checked) {
                    clearFieldError('terms');
                    // Ensure CAPTCHA is ready
                    if (captchaSection && !captchaSection.querySelector('canvas').getContext) {
                        generateEnhancedCaptcha();
                    }
                }
            });
        }
    }

    function validateCaptcha() {
        if (!captchaInput) return false;
        
        const userInput = captchaInput.value.toUpperCase();
        const isValid = userInput === currentCaptcha;
        
        if (isValid) {
            captchaInput.classList.remove('error');
            clearFieldError('captchaInput');
            return true;
        } else {
            captchaInput.classList.add('error');
            showEnhancedError('captchaInput', 'CAPTCHA code is incorrect', [
                'Check the characters carefully',
                'Click the refresh button for a new code',
                'Use the audio button if you have trouble reading'
            ]);
            return false;
        }
    }

    async function handleSubmit(e) {
        e.preventDefault();
        
        if (!termsAccepted) {
            showEnhancedError('terms', 'You must read and accept the terms and conditions', [
                'Click the "Read Terms and Conditions" button',
                'Scroll through the entire document',
                'Click "I have read and agree" at the bottom'
            ]);
            return;
        }
        
        if (!validateCaptcha()) {
            captchaInput.focus();
            return;
        }
        
        saveCurrentStepData();
        
        let allValid = true;
        for (let step = 1; step <= totalSteps; step++) {
            const stepElement = document.querySelector(`.form-step[data-step="${step}"]`);
            const inputs = stepElement.querySelectorAll('input, select, textarea');
            
            inputs.forEach(input => {
                if (input.name && validationRules[input.name]) {
                    const fieldValid = validateField(input.name);
                    if (!fieldValid) {
                        allValid = false;
                    }
                }
            });
        }
        
        if (!allValid) {
            showNotification('Please correct all errors before submitting.', 'error');
            return;
        }
        
        submitBtn.classList.add('loading');
        submitBtn.disabled = true;
        
        try {
            await simulateRegistration();
            showSuccessMessage();
            saveRegistrationData();
            
        } catch (error) {
            console.error('Registration error:', error);
            showNotification('An error occurred during registration. Please try again.', 'error');
        } finally {
            submitBtn.classList.remove('loading');
            submitBtn.disabled = false;
        }
    }

    async function simulateRegistration() {
        await new Promise(resolve => setTimeout(resolve, 2000));
        return { success: true, message: 'Registration successful' };
    }

    function showSuccessMessage() {
        successMessage.classList.add('show');
        registrationForm.style.display = 'none';
        
        successMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 5000);
    }

    function saveRegistrationData() {
        try {
            const registrationData = {
                ...formData,
                registrationDate: new Date().toISOString(),
                status: 'pending'
            };
            
            const storageData = { ...registrationData };
            delete storageData.driverLicense;
            delete storageData.vehicleRegistration;
            delete storageData.insurance;
            
            localStorage.setItem('anpr_registration_' + Date.now(), JSON.stringify(storageData));
            
            const userData = {
                username: formData.email,
                password: 'temp123',
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                role: 'user',
                registrationDate: new Date().toISOString()
            };
            
            localStorage.setItem('anpr_user_' + formData.email, JSON.stringify(userData));
            
        } catch (error) {
            console.warn('Could not save registration data:', error);
        }
    }

    // OCR Modal Logic (Enhanced)
    function setupOCRModal() {
        const ocrModal = document.getElementById('ocrModal');
        const openBtn = document.getElementById('openOcrModalBtn'); // Assuming this exists or is called manually
        const closeOcrBtn = document.getElementById('closeOcrModalBtn');
        const manualBtn = document.getElementById('manualInputBtn');
        
        // New Elements
        const frontDropZone = document.getElementById('frontDropZone');
        const backDropZone = document.getElementById('backDropZone');
        const frontInput = document.getElementById('frontIdFile');
        const backInput = document.getElementById('backIdFile');
        const scanVerifyBtn = document.getElementById('scanVerifyBtn');
        const processingOverlay = document.getElementById('ocrProcessingOverlay');
        
        // Verification Modal Elements
        const verificationModal = document.getElementById('verificationModal');
        const closeVerifyBtn = document.getElementById('closeVerifyModalBtn');
        const rescanBtn = document.getElementById('rescanBtn');
        const editScannedBtn = document.getElementById('editScannedBtn');
        const confirmVerifiedBtn = document.getElementById('confirmVerifiedBtn');
        const extractedDataList = document.getElementById('extractedDataList');
        const verificationBanner = document.getElementById('verificationBanner');

        let frontFile = null;
        let backFile = null;

        if (!ocrModal) return;

        // Auto-show logic
        if (currentStep === 1) {
            setTimeout(() => { ocrModal.classList.add('active'); }, 500);
        }

        // --- Event Listeners ---

        // Open/Close
        if (closeOcrBtn) closeOcrBtn.addEventListener('click', closeOCR);
        if (manualBtn) manualBtn.addEventListener('click', closeOCR);
        
        if (closeVerifyBtn) closeVerifyBtn.addEventListener('click', () => {
             verificationModal.classList.remove('active');
        });

        function closeOCR() {
            ocrModal.classList.remove('active');
        }

        // Drop Zone Handlers
        setupDropZone(frontDropZone, frontInput, 'front');
        setupDropZone(backDropZone, backInput, 'back');

        function setupDropZone(zone, input, type) {
            if (!zone || !input) return;

            zone.addEventListener('click', (e) => {
                // If removing file
                if (e.target.closest('.remove-file-btn')) {
                    removeFile(type);
                    e.stopPropagation();
                    return;
                }
                input.click();
            });

            input.addEventListener('change', () => {
                if (input.files.length > 0) handleFile(input.files[0], type);
            });

            // Drag & Drop
            ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
                zone.addEventListener(eventName, (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                }, false);
            });

            ['dragenter', 'dragover'].forEach(evt => {
                zone.addEventListener(evt, () => zone.classList.add('drag-over'), false);
            });

            ['dragleave', 'drop'].forEach(evt => {
                zone.addEventListener(evt, () => zone.classList.remove('drag-over'), false);
            });

            zone.addEventListener('drop', (e) => {
                const dt = e.dataTransfer;
                if (dt.files.length > 0) handleFile(dt.files[0], type);
            });
        }

        function handleFile(file, type) {
            if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
                showNotification('Please upload an image file.', 'error');
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                const previewUrl = e.target.result;
                updateZoneUI(type, file, previewUrl);
            };
            reader.readAsDataURL(file);
        }

        function updateZoneUI(type, file, url) {
            const zone = type === 'front' ? frontDropZone : backDropZone;
            const previewImg = zone.querySelector('.zone-preview');
            const removeBtn = zone.querySelector('.remove-file-btn');
            const content = zone.querySelector('.ocr-zone-content');

            if (type === 'front') frontFile = { file, url };
            else backFile = { file, url };

            previewImg.src = url;
            previewImg.classList.remove('hidden');
            removeBtn.classList.remove('hidden');
            content.style.opacity = '0'; // Hide text
            zone.classList.add('has-file');

            checkScanReady();
        }

        function removeFile(type) {
             const zone = type === 'front' ? frontDropZone : backDropZone;
            const previewImg = zone.querySelector('.zone-preview');
            const removeBtn = zone.querySelector('.remove-file-btn');
            const content = zone.querySelector('.ocr-zone-content');
            const input = type === 'front' ? frontInput : backInput;

            if (type === 'front') frontFile = null;
            else backFile = null;

            input.value = ''; // Reset input
            previewImg.src = '';
            previewImg.classList.add('hidden');
            removeBtn.classList.add('hidden');
            content.style.opacity = '1';
            zone.classList.remove('has-file');

            checkScanReady();
        }

        function checkScanReady() {
            if (frontFile && backFile) {
                scanVerifyBtn.disabled = false;
            } else {
                scanVerifyBtn.disabled = true;
            }
        }

        // --- Verification Logic ---

        scanVerifyBtn.addEventListener('click', () => {
            if (!frontFile || !backFile) return;

            // 1. Show Processing
            if (processingOverlay) processingOverlay.classList.remove('hidden');

            // 2. Simulate Delay (2.5s)
            setTimeout(() => {
                // 3. Transition Modals
                if (processingOverlay) processingOverlay.classList.add('hidden');
                ocrModal.classList.remove('active');
                
                populateVerificationModal();
                verificationModal.classList.add('active');

            }, 2500);
        });

        function populateVerificationModal() {
            // Set Images
            const resFront = document.getElementById('resFrontImage');
            const resBack = document.getElementById('resBackImage');
            if (resFront) resFront.src = frontFile.url;
            if (resBack) resBack.src = backFile.url;

            // Set Data (Mock)
            const mockData = [
                { label: 'Full Name', value: 'Alex Morgan', status: 'verified' },
                { label: 'Date of Birth', value: '1995-05-15', status: 'verified' },
                { label: 'License No.', value: 'D12-34-567890', status: 'verified' }, // Fixed typical format
                { label: 'Address', value: '123 Main St, Butuan City', status: 'verified' },
                { label: 'Expiration', value: '2028-05-15', status: 'verified' },
                { label: 'Agency', value: 'LTO', status: 'verified' }
            ];

            // Render List
            extractedDataList.innerHTML = mockData.map(item => `
                <div class="extracted-data-item ${item.status}-field">
                    <span class="data-label">${item.label}</span>
                    <div class="data-value-group">
                        <span class="data-value">${item.value}
                            ${item.status === 'verified' ? '<span class="verified-icon">✅</span>' : ''}
                        </span>
                    </div>
                </div>
            `).join('');
        }

        // --- Actions ---

        confirmVerifiedBtn.addEventListener('click', () => {
            // Fill Form
            fillFormData({
                firstName: 'Alex',
                lastName: 'Morgan',
                idNumber: 'D12-34-567890',
                address: '123 Main St, Butuan City'
            });

            verificationModal.classList.remove('active');
            showNotification('Information verified and auto-filled successfully!', 'success');
            
            // Advance/Update UI?
            updateOverallProgress();
        });

        editScannedBtn.addEventListener('click', () => {
            // Fill but focus
             fillFormData({
                firstName: 'Alex',
                lastName: 'Morgan',
                idNumber: 'D12-34-567890',
                address: '123 Main St, Butuan City'
            });
            verificationModal.classList.remove('active');
            
            // Focus first field
            setTimeout(() => {
                const fn = document.querySelector('[name="firstName"]');
                if (fn) fn.focus();
                showNotification('Please review the information below.', 'info');
            }, 300);
        });

        rescanBtn.addEventListener('click', () => {
            verificationModal.classList.remove('active');
            
            // Reset OCR Modal
            removeFile('front');
            removeFile('back');
            ocrModal.classList.add('active');
        });

        function fillFormData(data) {
            for (const [key, value] of Object.entries(data)) {
                const input = document.querySelector(`[name="${key}"]`);
                if (input) {
                    input.value = value;
                    input.dispatchEvent(new Event('input'));
                    input.classList.add('flash-success'); 
                    setTimeout(() => input.classList.remove('flash-success'), 1000);
                }
            }
        }
    }
});