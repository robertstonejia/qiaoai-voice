// Mobile menu functions
function toggleMobileMenu() {
    const mobileNav = document.getElementById('mobileNav');
    const menuBtn = document.querySelector('.mobile-menu-btn');
    mobileNav.classList.toggle('active');
    menuBtn.classList.toggle('active');
}

function closeMobileMenu() {
    const mobileNav = document.getElementById('mobileNav');
    const menuBtn = document.querySelector('.mobile-menu-btn');
    mobileNav.classList.remove('active');
    menuBtn.classList.remove('active');
}

// Scroll to top function for logo click
function scrollToTop(event) {
    event.preventDefault();
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
    closeMobileMenu();
}

// Language switching function
function setLanguage(lang) {
    const langBtns = document.querySelectorAll('.lang-btn');
    langBtns.forEach(b => b.classList.remove('active'));
    const activeBtn = document.querySelector(`[data-language="${lang}"]`);
    if (activeBtn) activeBtn.classList.add('active');

    document.body.classList.remove('lang-zh', 'lang-en', 'lang-jp');
    if (lang !== 'zh') document.body.classList.add(`lang-${lang}`);

    // Update HTML lang attribute
    const langMap = { zh: 'zh-CN', en: 'en', jp: 'ja' };
    document.documentElement.lang = langMap[lang] || 'zh-CN';

    localStorage.setItem('preferredLang', lang);
}

// Detect browser language
function detectBrowserLanguage() {
    const browserLang = navigator.language || navigator.userLanguage;
    const lang = browserLang.toLowerCase();

    if (lang.startsWith('ja')) {
        return 'jp';
    } else if (lang.startsWith('en')) {
        return 'en';
    } else if (lang.startsWith('zh')) {
        return 'zh';
    }
    // Default to Chinese for other languages
    return 'zh';
}

// Initialize language
function initLanguage() {
    // Priority: 1. Saved preference, 2. Browser language
    const savedLang = localStorage.getItem('preferredLang');
    if (savedLang) {
        setLanguage(savedLang);
    } else {
        const detectedLang = detectBrowserLanguage();
        setLanguage(detectedLang);
    }
}

// Language button click handlers
const langBtns = document.querySelectorAll('.lang-btn');
langBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        setLanguage(btn.dataset.language);
    });
});

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href !== '#') {
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
                closeMobileMenu();
            }
        }
    });
});

// Close mobile menu when clicking outside
document.addEventListener('click', function(e) {
    const mobileNav = document.getElementById('mobileNav');
    const menuBtn = document.querySelector('.mobile-menu-btn');
    if (!mobileNav.contains(e.target) && !menuBtn.contains(e.target) && mobileNav.classList.contains('active')) {
        closeMobileMenu();
    }
});


// Contact form submit (direct send): use standard HTML form POST to .
// To: qiaoai.voice@163.com
// Tip: First delivery may require a one-time confirmation email from  to the recipient inbox.
const contactForm = document.getElementById('contactForm');
const formStatus = document.getElementById('formStatus');
const sendBtn = document.getElementById('sendBtn');
const replyTo = document.getElementById('cfReplyTo');

// Show a success hint if redirected back with ?sent=1
try {
    const params = new URLSearchParams(location.search);
    if (params.get('sent') === '1' && formStatus) {
        formStatus.textContent = '提交成功！我们已收到您的咨询，将尽快回复。';
    }
} catch (_) {}


// Confirm modal logic
const confirmModal = document.getElementById('confirmModal');
const confirmBackdrop = document.getElementById('confirmBackdrop');
const confirmNameEl = document.getElementById('confirmName');
const confirmEmailEl = document.getElementById('confirmEmail');
const confirmSubjectEl = document.getElementById('confirmSubject');
const confirmMessageEl = document.getElementById('confirmMessage');
const confirmCancelBtn = document.getElementById('confirmCancel');
const confirmOkBtn = document.getElementById('confirmOk');

let isConfirmed = false;

function openConfirmModal() {
    if (!confirmModal) return;
    confirmModal.classList.add('active');
    confirmModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
}

function closeConfirmModal() {
    if (!confirmModal) return;
    confirmModal.classList.remove('active');
    confirmModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
}

function fillConfirmContent() {
    const name = (document.getElementById('cfName')?.value || '').trim();
    const email = (document.getElementById('cfEmail')?.value || '').trim();
    const subject = (document.getElementById('cfSubject')?.value || '').trim();
    const message = (document.getElementById('cfMessage')?.value || '').trim();

    if (confirmNameEl) confirmNameEl.textContent = name || '-';
    if (confirmEmailEl) confirmEmailEl.textContent = email || '-';
    if (confirmSubjectEl) confirmSubjectEl.textContent = subject || '-';
    if (confirmMessageEl) confirmMessageEl.textContent = message || '-';

    return { name, email, subject, message };
}

if (confirmBackdrop) {
    confirmBackdrop.addEventListener('click', () => {
        // Clicking the backdrop closes the modal (do not confirm)
        isConfirmed = false;
        closeConfirmModal();
    });
}

if (confirmCancelBtn) {
    confirmCancelBtn.addEventListener('click', () => {
        isConfirmed = false;
        closeConfirmModal();
    });
}

if (confirmOkBtn) {
    confirmOkBtn.addEventListener('click', () => {
        // Confirm and submit
        isConfirmed = true;
        closeConfirmModal();

        // requestSubmit triggers the normal submit flow (including validation and our submit handler).
        if (contactForm?.requestSubmit) {
            contactForm.requestSubmit();
        } else if (contactForm) {
            // Fallback: manually update status and submit (bypasses submit event in some browsers)
            const email = (document.getElementById('cfEmail')?.value || '').trim();
            if (replyTo) replyTo.value = email;
            if (sendBtn) sendBtn.disabled = true;
            if (formStatus) formStatus.textContent = '送信中…';
            contactForm.submit();
        }
    });
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && confirmModal?.classList.contains('active')) {
        isConfirmed = false;
        closeConfirmModal();
    }
});

if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        // Before showing the confirm modal, run native HTML validation.
        if (!isConfirmed) {
            if (!contactForm.checkValidity()) {
                e.preventDefault();
                if (contactForm.reportValidity) contactForm.reportValidity();
                return;
            }
            e.preventDefault();
            fillConfirmContent();
            openConfirmModal();
            return;
        }

        // Confirmed: proceed with sending
        const email = (document.getElementById('cfEmail')?.value || '').trim();
        if (replyTo) replyTo.value = email;
        if (sendBtn) sendBtn.disabled = true;
        if (formStatus) formStatus.textContent = '送信中…';
        // allow normal POST
    });
}



// Initialize on page load

document.addEventListener('DOMContentLoaded', initLanguage);
