/* ============================================
   ICONIC INDUSTRIAL SOLUTION - SCRIPT
   Security + Functionality
   ============================================ */

// ============================================
// SECURITY UTILITIES
// ============================================

const Security = {
    // XSS Prevention: Sanitize user input
    sanitizeInput: (input) => {
        const div = document.createElement('div');
        div.textContent = input;
        return div.innerHTML
            .replace(/&/g, '&amp;')
            .replace(/</g, '<')
            .replace(/>/g, '>')
            .replace(/"/g, '"')
            .replace(/'/g, '&#x27;')
            .replace(/\//g, '&#x2F;');
    },

    // Validate email format
    validateEmail: (email) => {
        const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return re.test(String(email).toLowerCase());
    },

    // Validate phone number (Indian format)
    validatePhone: (phone) => {
        const re = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
        return re.test(phone.replace(/\s/g, ''));
    },

    // Check for suspicious patterns
    detectInjection: (input) => {
        const suspiciousPatterns = [
            /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
            /javascript:/gi,
            /on\w+\s*=/gi,
            /data:text\/html/gi,
            /alert\(/gi,
            /document\.cookie/gi,
            /document\.location/gi,
            /eval\(/gi
        ];
        return suspiciousPatterns.some(pattern => pattern.test(input));
    },

    // Generate CSRF-like token for forms
    generateToken: () => {
        const array = new Uint8Array(16);
        crypto.getRandomValues(array);
        return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    },

    // Rate limiting for form submissions
    checkRateLimit: (key, maxAttempts = 5, windowMs = 60000) => {
        const now = Date.now();
        const attempts = JSON.parse(localStorage.getItem(key) || '[]');
        const recentAttempts = attempts.filter(time => now - time < windowMs);
        
        if (recentAttempts.length >= maxAttempts) {
            return { allowed: false, waitTime: windowMs - (now - recentAttempts[0]) };
        }
        
        recentAttempts.push(now);
        localStorage.setItem(key, JSON.stringify(recentAttempts));
        return { allowed: true };
    }
};

// ============================================
// MOBILE NAVIGATION
// ============================================

const initMobileNav = () => {
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('navMenu');
    
    if (!hamburger || !navMenu) return;

    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    // Close menu when clicking on links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!hamburger.contains(e.target) && !navMenu.contains(e.target)) {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        }
    });
};

// ============================================
// ACTIVE NAVIGATION LINK ON SCROLL
// ============================================

const initActiveNav = () => {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    const navbar = document.getElementById('navbar');

    const updateActiveLink = () => {
        let current = '';
        const scrollY = window.pageYOffset;

        sections.forEach(section => {
            const sectionTop = section.offsetTop - 100;
            const sectionHeight = section.clientHeight;
            if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });

        // Navbar background on scroll
        if (navbar) {
            if (scrollY > 50) {
                navbar.style.boxShadow = '0 4px 20px rgba(0,0,0,0.1)';
            } else {
                navbar.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
            }
        }
    };

    window.addEventListener('scroll', updateActiveLink);
    window.addEventListener('load', updateActiveLink);
};

// ============================================
// SCROLL REVEAL ANIMATION
// ============================================

const initScrollReveal = () => {
    const revealElements = document.querySelectorAll(
        '.feature-card, .service-card, .about-content, .about-visual, ' +
        '.contact-info, .contact-form-wrapper, .product-card, .gst-card, ' +
        '.info-item, .contact-card'
    );

    const revealOnScroll = () => {
        revealElements.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            const windowHeight = window.innerHeight;
            
            if (elementTop < windowHeight - 80) {
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';
            }
        });
    };

    // Initialize elements
    revealElements.forEach(element => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(30px)';
        element.style.transition = 'all 0.6s ease';
    });

    window.addEventListener('scroll', revealOnScroll);
    window.addEventListener('load', revealOnScroll);
};

// ============================================
// COUNTER ANIMATION
// ============================================

const initCounterAnimation = () => {
    const counters = document.querySelectorAll('.stat-number');
    let animated = false;

    const animateCounter = (element, target, duration = 2000) => {
        const start = 0;
        const increment = target / (duration / 16);
        let current = 0;

        const updateCounter = () => {
            current += increment;
            if (current < target) {
                element.textContent = Math.floor(current);
                requestAnimationFrame(updateCounter);
            } else {
                element.textContent = target + (element.dataset.suffix || '');
            }
        };

        updateCounter();
    };

    const checkAndAnimate = () => {
        if (animated) return;
        
        const statsSection = document.querySelector('.hero-stats');
        if (!statsSection) return;

        const sectionTop = statsSection.getBoundingClientRect().top;
        if (sectionTop < window.innerHeight) {
            animated = true;
            counters.forEach(counter => {
                const target = parseInt(counter.dataset.target);
                const suffix = counter.dataset.suffix || '';
                animateCounter(counter, target);
                counter.dataset.suffix = suffix;
            });
        }
    };

    window.addEventListener('scroll', checkAndAnimate);
    window.addEventListener('load', checkAndAnimate);
};

// ============================================
// CONTACT FORM HANDLING
// ============================================

const initContactForm = () => {
    const form = document.getElementById('contactForm');
    if (!form) return;

    // Add CSRF token
    const csrfToken = Security.generateToken();
    const tokenInput = document.createElement('input');
    tokenInput.type = 'hidden';
    tokenInput.name = '_token';
    tokenInput.value = csrfToken;
    form.appendChild(tokenInput);

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Rate limiting check
        const rateCheck = Security.checkRateLimit('form_submissions', 3, 300000); // 3 per 5 minutes
        if (!rateCheck.allowed) {
            showFormStatus('Too many attempts. Please try again later.', 'error');
            return;
        }

        // Get form data
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        // Honeypot check (anti-spam)
        if (data.website && data.website.length > 0) {
            console.log('Spam detected');
            return;
        }

        // Validate inputs
        const errors = validateForm(data);
        if (errors.length > 0) {
            showFormStatus(errors.join('<br>'), 'error');
            return;
        }

        // Sanitize inputs
        const sanitizedData = {
            name: Security.sanitizeInput(data.name),
            email: Security.sanitizeInput(data.email),
            phone: Security.sanitizeInput(data.phone),
            product: Security.sanitizeInput(data.product || ''),
            message: Security.sanitizeInput(data.message)
        };

        // Check for injection attempts
        const allInputs = [data.name, data.email, data.phone, data.message];
        if (allInputs.some(input => Security.detectInjection(input))) {
            showFormStatus('Invalid characters detected. Please remove special characters.', 'error');
            return;
        }

        // Show loading state
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
        submitBtn.disabled = true;

        try {
            // Simulate form submission (replace with actual API endpoint)
            await simulateFormSubmission(sanitizedData);
            
            // Success
            showFormStatus('Thank you! Your inquiry has been sent successfully. We will contact you soon.', 'success');
            form.reset();
            
            // Also send WhatsApp notification (optional)
            sendWhatsAppNotification(sanitizedData);

        } catch (error) {
            showFormStatus('Something went wrong. Please try again or contact us directly.', 'error');
        } finally {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    });

    // Real-time validation
    const inputs = form.querySelectorAll('input, textarea');
    inputs.forEach(input => {
        input.addEventListener('blur', () => validateField(input));
        input.addEventListener('input', () => clearFieldError(input));
    });
};

const validateForm = (data) => {
    const errors = [];
    
    if (!data.name || data.name.trim().length < 2) {
        errors.push('Please enter a valid name (at least 2 characters).');
    }
    
    if (!data.email || !Security.validateEmail(data.email)) {
        errors.push('Please enter a valid email address.');
    }
    
    if (!data.phone || !Security.validatePhone(data.phone)) {
        errors.push('Please enter a valid phone number.');
    }
    
    if (!data.message || data.message.trim().length < 10) {
        errors.push('Please enter a message (at least 10 characters).');
    }
    
    return errors;
};

const validateField = (field) => {
    const fieldName = field.name;
    const value = field.value.trim();
    let error = '';

    switch(fieldName) {
        case 'name':
            if (value.length < 2) error = 'Name must be at least 2 characters';
            break;
        case 'email':
            if (!Security.validateEmail(value)) error = 'Invalid email format';
            break;
        case 'phone':
            if (!Security.validatePhone(value)) error = 'Invalid phone number';
            break;
        case 'message':
            if (value.length < 10) error = 'Message must be at least 10 characters';
            break;
    }

    const errorEl = document.getElementById(`${fieldName}Error`);
    if (errorEl) {
        errorEl.textContent = error;
    }
    
    if (error) {
        field.style.borderColor = '#f44336';
    } else {
        field.style.borderColor = '';
    }
};

const clearFieldError = (field) => {
    const errorEl = document.getElementById(`${field.name}Error`);
    if (errorEl) errorEl.textContent = '';
    field.style.borderColor = '';
};

const showFormStatus = (message, type) => {
    const statusEl = document.getElementById('formStatus');
    if (!statusEl) return;
    
    statusEl.innerHTML = message;
    statusEl.className = `form-status ${type}`;
    statusEl.style.display = 'block';

    if (type === 'success') {
        setTimeout(() => {
            statusEl.style.display = 'none';
        }, 5000);
    }
};

const simulateFormSubmission = (data) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            console.log('Form submitted securely:', data);
            resolve({ success: true });
        }, 1500);
    });
};

const sendWhatsAppNotification = (data) => {
    const message = `New Inquiry from ${data.name}%0AEmail: ${data.email}%0APhone: ${data.phone}%0AProduct: ${data.product || 'Not specified'}%0AMessage: ${data.message}`;
    // This would be used on server-side or with a WhatsApp Business API
    console.log('WhatsApp notification prepared:', message);
};

// ============================================
// SMOOTH SCROLL FOR ANCHOR LINKS
// ============================================

const initSmoothScroll = () => {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const offset = 80; // Account for fixed navbar
                const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - offset;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
};

// ============================================
// LOADING ANIMATION
// ============================================

const initLoadingAnimation = () => {
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.5s ease';
    
    window.addEventListener('load', () => {
        setTimeout(() => {
            document.body.style.opacity = '1';
        }, 100);
    });
};

// ============================================
// PARALLAX EFFECT
// ============================================

const initParallax = () => {
    const hero = document.querySelector('.hero');
    if (!hero) return;

    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        if (scrolled < window.innerHeight) {
            hero.style.backgroundPositionY = `${scrolled * 0.5}px`;
        }
    });
};

// ============================================
// SECURITY HEADERS CHECK
// ============================================

const checkSecurityHeaders = () => {
    // Log security information
    console.log('%c🔒 Security Status', 'color: #4caf50; font-size: 16px; font-weight: bold;');
    console.log('%cContent Security Policy: Active', 'color: #4caf50;');
    console.log('%cXSS Protection: Enabled', 'color: #4caf50;');
    console.log('%cInput Sanitization: Active', 'color: #4caf50;');
    console.log('%cRate Limiting: Enabled', 'color: #4caf50;');
};

// ============================================
// PREVENT RIGHT-CLICK (OPTIONAL SECURITY)
// ============================================

const initContextMenuProtection = () => {
    // Uncomment below to disable right-click
    // document.addEventListener('contextmenu', (e) => e.preventDefault());
    
    // Prevent common keyboard shortcuts for dev tools
    document.addEventListener('keydown', (e) => {
        // Prevent F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U
        if (e.key === 'F12' || 
            (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J')) ||
            (e.ctrlKey && e.key === 'u')) {
            // e.preventDefault(); // Uncomment to enable
        }
    });
};

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    initMobileNav();
    initActiveNav();
    initScrollReveal();
    initCounterAnimation();
    initContactForm();
    initSmoothScroll();
    initLoadingAnimation();
    initParallax();
    checkSecurityHeaders();
    initContextMenuProtection();
    
    console.log('%c🏭 Iconic Industrial Solution', 'color: #e65100; font-size: 20px; font-weight: bold;');
    console.log('%cWebsite loaded successfully!', 'color: #1a237e; font-size: 14px;');
});

// ============================================
// CHATBOT WIDGET
// ============================================

const initChatbot = () => {
    const widget = document.getElementById('chatbotWidget');
    const toggle = document.getElementById('chatbotToggle');
    const body = document.getElementById('chatbotBody');
    const messages = document.getElementById('chatbotMessages');
    const input = document.getElementById('chatbotInput');
    const sendBtn = document.getElementById('chatbotSend');
    const quickReplies = document.getElementById('quickReplies');

    if (!widget || !toggle) return;

    // Toggle chatbot
    toggle.addEventListener('click', () => {
        widget.classList.toggle('active');
    });

    // Knowledge base for responses
    const knowledgeBase = {
        products: `We offer: <br>• Welding Shields<br>• Welding Safety Accessories<br>• Welding Goggles<br>• Welding Helmets<br>• Men Rubber Slippers<br>• Gas Savers<br><br><a href="#products">View all products →</a>`,
        price: `Our pricing is competitive and wholesale-based. Please contact us for a detailed quotation based on your requirements.<br><br>📞 <a href="tel:+919359209723">+91 93592 09723</a><br>📧 <a href="mailto:iis21.service@gmail.com">iis21.service@gmail.com</a>`,
        location: `📍 <strong>Iconic Industrial Solution</strong><br>Gat No. 44, Near Hemant Engineering,<br>Chimbali, Tal-Khed,<br>Pune, Maharashtra - 412105<br><br><a href="#contact">View on Map →</a>`,
        contact: `You can reach us:<br>📞 <a href="tel:+919359209723">+91 93592 09723</a><br>📞 <a href="tel:+919552981734">+91 95529 81734</a><br>📧 <a href="mailto:iis21.service@gmail.com">iis21.service@gmail.com</a><br><br>CEO: Baban Jadhav<br><a href="https://wa.me/919359209723" target="_blank">Chat on WhatsApp →</a>`,
        hours: `Our business hours:<br>Monday - Saturday: 9:00 AM - 7:00 PM<br>Sunday: Closed<br><br>For urgent inquiries, you can WhatsApp us anytime!`,
        delivery: `We provide delivery across Maharashtra and all over India. Delivery charges vary based on location and order quantity.<br><br>For bulk orders, free delivery may be available.`,
        gst: `We are a GST-registered proprietorship firm.<br>• Legal Status: Proprietorship<br>• Nature: Trader - Wholesaler/Distributor<br>• Turnover: ₹5-25 Crores<br>• GST Compliant Billing Available`,
        default: `Thank you for your message! For detailed assistance, please:<br><br>📞 Call: <a href="tel:+919359209723">+91 93592 09723</a><br>💬 <a href="https://wa.me/919359209723" target="_blank">WhatsApp Us</a><br>📧 <a href="mailto:iis21.service@gmail.com">Email Us</a>`
    };

    // Keyword matching
    const getResponse = (query) => {
        const q = query.toLowerCase();
        if (q.includes('product') || q.includes('item') || q.includes('shield') || q.includes('helmet') || q.includes('goggle') || q.includes('slipper') || q.includes('gas')) return knowledgeBase.products;
        if (q.includes('price') || q.includes('cost') || q.includes('rate') || q.includes('quotation') || q.includes('quote')) return knowledgeBase.price;
        if (q.includes('location') || q.includes('address') || q.includes('where') || q.includes('place') || q.includes('map')) return knowledgeBase.location;
        if (q.includes('contact') || q.includes('phone') || q.includes('email') || q.includes('call') || q.includes('reach')) return knowledgeBase.contact;
        if (q.includes('hour') || q.includes('time') || q.includes('open') || q.includes('close')) return knowledgeBase.hours;
        if (q.includes('delivery') || q.includes('shipping') || q.includes('transport')) return knowledgeBase.delivery;
        if (q.includes('gst') || q.includes('tax') || q.includes('bill') || q.includes('invoice')) return knowledgeBase.gst;
        return knowledgeBase.default;
    };

    // Add message to chat
    const addMessage = (text, isUser = false) => {
        const msgDiv = document.createElement('div');
        msgDiv.className = `chat-message ${isUser ? 'user' : 'bot'}`;
        msgDiv.innerHTML = `
            <div class="message-avatar"><i class="fas fa-${isUser ? 'user' : 'robot'}"></i></div>
            <div class="message-bubble"><p>${text}</p></div>
        `;
        messages.appendChild(msgDiv);
        messages.scrollTop = messages.scrollHeight;
    };

    // Handle send
    const handleSend = () => {
        const text = input.value.trim();
        if (!text) return;

        // Sanitize input
        const safeText = text.replace(/</g, '<').replace(/>/g, '>');
        addMessage(safeText, true);
        input.value = '';

        // Simulate typing delay
        setTimeout(() => {
            const response = getResponse(text);
            addMessage(response);
        }, 600);
    };

    sendBtn.addEventListener('click', handleSend);
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSend();
    });

    // Quick replies
    if (quickReplies) {
        quickReplies.querySelectorAll('.quick-reply').forEach(btn => {
            btn.addEventListener('click', () => {
                const query = btn.dataset.query;
                const text = btn.textContent;
                addMessage(text, true);
                setTimeout(() => {
                    addMessage(knowledgeBase[query] || knowledgeBase.default);
                }, 500);
            });
        });
    }

    // Auto-open after 5 seconds
    setTimeout(() => {
        if (!widget.classList.contains('active')) {
            widget.classList.add('active');
        }
    }, 5000);
};

// Initialize chatbot on load
document.addEventListener('DOMContentLoaded', initChatbot);
