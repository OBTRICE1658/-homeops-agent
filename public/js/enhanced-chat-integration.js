/**
 * Enhanced HomeOps Chat Overlay Integration
 * Easy integration for any HTML page
 */

class HomeOpsChatOverlay {
    constructor(options = {}) {
        this.options = {
            userId: options.userId || 'user123',
            position: options.position || 'bottom-right',
            theme: options.theme || 'default',
            autoLoad: options.autoLoad !== false,
            notifications: options.notifications !== false,
            ...options
        };
        
        this.isOpen = false;
        this.hasUnreadEmails = false;
        this.chatContainer = null;
        this.triggerButton = null;
        
        if (this.options.autoLoad) {
            this.init();
        }
    }
    
    async init() {
        console.log('🚀 Initializing HomeOps Enhanced Chat Overlay');
        
        // Load required CSS if not already loaded
        await this.loadCSS();
        
        // Create the trigger button
        this.createTriggerButton();
        
        // Load initial email notifications
        if (this.options.notifications) {
            await this.checkEmailNotifications();
        }
        
        // Set up event listeners
        this.setupEventListeners();
        
        console.log('✅ HomeOps Chat Overlay initialized successfully');
    }
    
    async loadCSS() {
        return new Promise((resolve) => {
            // Check if CSS is already loaded
            if (document.querySelector('link[href*="enhanced-chat-integration.css"]')) {
                resolve();
                return;
            }
            
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = '/css/enhanced-chat-integration.css';
            link.onload = resolve;
            document.head.appendChild(link);
        });
    }
    
    createTriggerButton() {
        // Remove existing button if present
        const existing = document.getElementById('homeops-chat-trigger');
        if (existing) {
            existing.remove();
        }
        
        // Create trigger button
        this.triggerButton = document.createElement('button');
        this.triggerButton.id = 'homeops-chat-trigger';
        this.triggerButton.className = 'homeops-chat-trigger';
        this.triggerButton.innerHTML = `
            <svg class="chat-icon" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4l4 4 4-4h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
            </svg>
        `;
        
        // Position the button
        this.triggerButton.style.position = 'fixed';
        if (this.options.position === 'bottom-left') {
            this.triggerButton.style.bottom = '30px';
            this.triggerButton.style.left = '30px';
        } else {
            this.triggerButton.style.bottom = '30px';
            this.triggerButton.style.right = '30px';
        }
        
        document.body.appendChild(this.triggerButton);
    }
    
    setupEventListeners() {
        // Trigger button click
        this.triggerButton.addEventListener('click', () => {
            this.toggle();
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + Shift + C to toggle chat
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'C') {
                e.preventDefault();
                this.toggle();
            }
            
            // Escape to close chat
            if (e.key === 'Escape' && this.isOpen) {
                this.close();
            }
        });
    }
    
    async checkEmailNotifications() {
        try {
            const response = await fetch(`/api/email-summary?userId=${this.options.userId}`);
            const data = await response.json();
            
            if (data.success) {
                const urgentEmails = data.categorizedEmails.urgent?.length || 0;
                const schoolEmails = data.categorizedEmails.school?.length || 0;
                
                this.hasUnreadEmails = urgentEmails > 0 || schoolEmails > 0;
                
                if (this.hasUnreadEmails) {
                    this.triggerButton.classList.add('has-notification');
                    this.triggerButton.title = `You have ${urgentEmails + schoolEmails} important emails`;
                } else {
                    this.triggerButton.classList.remove('has-notification');
                    this.triggerButton.title = 'Open HomeOps Chat';
                }
            }
        } catch (error) {
            console.error('❌ Error checking email notifications:', error);
        }
    }
    
    async toggle() {
        if (this.isOpen) {
            this.close();
        } else {
            await this.open();
        }
    }
    
    async open() {
        if (this.isOpen) return;
        
        console.log('📧 Opening HomeOps Enhanced Chat Overlay');
        
        // Create chat container if it doesn't exist
        if (!this.chatContainer) {
            await this.createChatContainer();
        }
        
        // Show the overlay
        this.chatContainer.classList.add('active');
        this.isOpen = true;
        
        // Prevent body scroll
        document.body.style.overflow = 'hidden';
        
        // Clear notification
        this.triggerButton.classList.remove('has-notification');
        
        // Focus on chat input
        setTimeout(() => {
            const chatInput = this.chatContainer.querySelector('#messageInput');
            if (chatInput) {
                chatInput.focus();
            }
        }, 300);
    }
    
    close() {
        if (!this.isOpen || !this.chatContainer) return;
        
        console.log('📧 Closing HomeOps Enhanced Chat Overlay');
        
        // Hide the overlay
        this.chatContainer.classList.remove('active');
        this.isOpen = false;
        
        // Restore body scroll
        document.body.style.overflow = 'auto';
    }
    
    async createChatContainer() {
        // Load the chat overlay HTML
        try {
            const response = await fetch('/enhanced-chat-overlay.html');
            const html = await response.text();
            
            // Create a temporary container to parse the HTML
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = html;
            
            // Extract the chat overlay content
            const chatOverlay = tempDiv.querySelector('.chat-overlay');
            if (chatOverlay) {
                chatOverlay.id = 'homeops-chat-overlay';
                document.body.appendChild(chatOverlay);
                this.chatContainer = chatOverlay;
                
                // Set up chat-specific event listeners
                this.setupChatEventListeners();
                
                // Initialize chat functionality
                this.initializeChatFunctionality();
            } else {
                throw new Error('Chat overlay HTML not found');
            }
        } catch (error) {
            console.error('❌ Error creating chat container:', error);
            
            // Fallback: create a simple iframe
            this.createFallbackChat();
        }
    }
    
    createFallbackChat() {
        this.chatContainer = document.createElement('div');
        this.chatContainer.className = 'chat-overlay';
        this.chatContainer.id = 'homeops-chat-overlay';
        this.chatContainer.innerHTML = `
            <div style="position: absolute; top: 20px; right: 20px; z-index: 10;">
                <button onclick="window.homeopsChat.close()" style="background: rgba(255,255,255,0.2); border: none; border-radius: 50%; width: 40px; height: 40px; color: white; cursor: pointer;">✕</button>
            </div>
            <iframe src="/enhanced-chat-overlay.html" style="width: 100%; height: 100%; border: none; border-radius: 20px;"></iframe>
        `;
        document.body.appendChild(this.chatContainer);
    }
    
    setupChatEventListeners() {
        // Close button
        const closeBtn = this.chatContainer.querySelector('.close-btn');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.close());
        }
        
        // Click outside to close
        this.chatContainer.addEventListener('click', (e) => {
            if (e.target === this.chatContainer) {
                this.close();
            }
        });
    }
    
    initializeChatFunctionality() {
        // Set the user ID for the chat
        if (window.chatOverlaySetUserId) {
            window.chatOverlaySetUserId(this.options.userId);
        }
        
        // Load initial data
        if (window.loadInboxData) {
            window.loadInboxData();
        }
    }
    
    // Public methods for external integration
    sendMessage(message) {
        if (this.isOpen && window.insertQuickQuery) {
            window.insertQuickQuery(message);
        } else {
            // Store message to send when chat opens
            this.pendingMessage = message;
        }
    }
    
    showEmailSummary() {
        this.sendMessage('Show me a summary of my recent emails');
    }
    
    showSchoolEmails() {
        this.sendMessage('Show me emails from KISD school district');
    }
    
    showCommerceDeals() {
        this.sendMessage('What deals or sales have I received recently?');
    }
    
    // Auto-refresh notifications
    startNotificationCheck(intervalMs = 300000) { // 5 minutes default
        setInterval(() => {
            if (!this.isOpen) {
                this.checkEmailNotifications();
            }
        }, intervalMs);
    }
    
    destroy() {
        if (this.triggerButton) {
            this.triggerButton.remove();
        }
        if (this.chatContainer) {
            this.chatContainer.remove();
        }
        this.isOpen = false;
    }
}

// Auto-initialize if on a page with data-homeops-chat attribute
document.addEventListener('DOMContentLoaded', () => {
    const autoInit = document.querySelector('[data-homeops-chat]');
    if (autoInit) {
        const options = {};
        
        // Parse data attributes
        if (autoInit.dataset.userId) options.userId = autoInit.dataset.userId;
        if (autoInit.dataset.position) options.position = autoInit.dataset.position;
        if (autoInit.dataset.notifications) options.notifications = autoInit.dataset.notifications === 'true';
        
        window.homeopsChat = new HomeOpsChatOverlay(options);
        
        // Start notification checking
        window.homeopsChat.startNotificationCheck();
        
        console.log('✅ HomeOps Chat auto-initialized');
    }
});

// Global access
window.HomeOpsChatOverlay = HomeOpsChatOverlay;

// Create simple integration function
window.initHomeOpsChat = function(options = {}) {
    if (window.homeopsChat) {
        window.homeopsChat.destroy();
    }
    window.homeopsChat = new HomeOpsChatOverlay(options);
    return window.homeopsChat;
};
