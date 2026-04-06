// Manguli AI Chat Interface
// Handles UI interactions and form submission (server-side rendering)

(function() {
    // DOM elements
    const chatForm = document.getElementById('chatForm');
    const questionInput = document.getElementById('questionInput');
    const chatBody = document.querySelector('.chat-body');
    const sendBtn = document.getElementById('sendBtn');
    const welcomeScreen = document.getElementById('welcomeScreen');
    
    // Helper: scroll chat to bottom smoothly
    function scrollChatToBottom() {
        if (chatBody) {
            chatBody.scrollTop = chatBody.scrollHeight;
        }
    }
    
    // Auto-resize textarea as user types
    function autoResizeTextarea() {
        if (!questionInput) return;
        questionInput.addEventListener('input', function() {
            this.style.height = 'auto';
            const newHeight = Math.min(this.scrollHeight, 150);
            this.style.height = newHeight + 'px';
        });
    }
    
    // Show loading state on form submission
    function showLoadingState() {
        if (sendBtn) {
            sendBtn.disabled = true;
            sendBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i> Thinking...';
        }
        if (questionInput) {
            questionInput.readOnly = true;
        }
    }
    
    // Reset loading state
    function resetLoadingState() {
        if (sendBtn) {
            sendBtn.disabled = false;
            sendBtn.innerHTML = '<i class="fas fa-paper-plane me-1"></i> Send';
        }
        if (questionInput) {
            questionInput.readOnly = false;
            questionInput.focus();
        }
    }
    
    // Get CSRF token from cookie
    function getCSRFToken() {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.substring(0, 10) === ('csrftoken' + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(10));
                    break;
                }
            }
        }
        return cookieValue;
    }
    
    // Create and submit a hidden form with the prompt question
    function submitPromptDirectly(promptText) {
        if (!promptText || promptText.trim() === '') return;
        
        // Create a hidden form
        const hiddenForm = document.createElement('form');
        hiddenForm.method = 'POST';
        hiddenForm.action = window.location.href;  // Use current URL
        hiddenForm.style.display = 'none';
        
        // Add CSRF token
        const csrfInput = document.createElement('input');
        csrfInput.type = 'hidden';
        csrfInput.name = 'csrfmiddlewaretoken';
        csrfInput.value = getCSRFToken();
        hiddenForm.appendChild(csrfInput);
        
        // Add question input
        const questionInputHidden = document.createElement('input');
        questionInputHidden.type = 'hidden';
        questionInputHidden.name = 'question';
        questionInputHidden.value = promptText.trim();
        hiddenForm.appendChild(questionInputHidden);
        
        // Add to body and submit
        document.body.appendChild(hiddenForm);
        
        // Show loading state
        showLoadingState();
        
        // Submit the form
        hiddenForm.submit();
    }
    
    // Handle form submission
    function handleSubmit(e) {
        const message = questionInput.value.trim();
        if (!message) {
            e.preventDefault();
            return false;
        }
        
        // Show loading state
        showLoadingState();
        
        // Form will submit normally to Django backend
        return true;
    }
    
    // Prompt suggestions click handler
    function setupPromptCards() {
        const promptItems = document.querySelectorAll('.prompt-item');
        promptItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const promptText = item.getAttribute('data-prompt');
                if (promptText) {
                    // Directly submit the prompt to views.py
                    submitPromptDirectly(promptText);
                }
            });
        });
    }
    
    // Keyboard shortcut: Enter to submit form
    function handleKeyboardShortcuts() {
        if (!questionInput) return;
        questionInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (questionInput.value.trim() && chatForm) {
                    showLoadingState();
                    chatForm.submit();
                }
            }
        });
    }
    
    // Highlight the latest bot message
    function highlightLatestBotMessage() {
        const botMessages = document.querySelectorAll('.message-row.bot');
        if (botMessages.length > 0) {
            const latestBot = botMessages[botMessages.length - 1];
            const bubble = latestBot.querySelector('.message-bubble');
            if (bubble) {
                bubble.style.transition = 'background-color 0.5s ease';
                bubble.style.backgroundColor = '#fff0e6';
                setTimeout(() => {
                    bubble.style.backgroundColor = '';
                }, 1000);
            }
        }
    }
    
    // Clear textarea after successful submission
    function clearTextareaIfNeeded() {
        if (questionInput && questionInput.value) {
            // Clear the textarea for better UX
            questionInput.value = '';
            questionInput.style.height = 'auto';
        }
    }
    
    // Initialize the chat interface
    function init() {
        // Set up form submission
        if (chatForm) {
            chatForm.addEventListener('submit', handleSubmit);
        }
        
        // Focus input on load
        if (questionInput) {
            questionInput.focus();
            autoResizeTextarea();
            handleKeyboardShortcuts();
        }
        
        // Setup prompt cards
        setupPromptCards();
        
        // Scroll to bottom to show latest messages
        scrollChatToBottom();
        
        // Highlight the latest bot message
        highlightLatestBotMessage();
        
        // Clear textarea for better UX
        clearTextareaIfNeeded();
        
        // Reset loading state
        resetLoadingState();
        
        // Hide welcome screen if there are messages
        const hasMessages = document.querySelectorAll('.message-row').length > 0;
        if (hasMessages && welcomeScreen) {
            welcomeScreen.style.display = 'none';
        }
    }
    
    // Handle browser back/forward navigation
    window.addEventListener('pageshow', function() {
        resetLoadingState();
        scrollChatToBottom();
    });
    
    // Start the app when DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
