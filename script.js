document.addEventListener('DOMContentLoaded', function() {
    const chatForm = document.getElementById('chat-form');
    const userInput = document.getElementById('user-input');
    const chatMessages = document.getElementById('chat-messages');
    const clearChatBtn = document.getElementById('clear-chat');
    
    // Load chat history from localStorage
    loadChatHistory();
    
    // Focus input field on load
    userInput.focus();
    
    // Form submission
    chatForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        const message = userInput.value.trim();
        if (message) {
            addMessage('user', message);
            userInput.value = '';
            
            // Show typing indicator
            showTypingIndicator();
            
            try {
                const response = await fetch('http://localhost:8000/api/chat', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ content: message })
                });
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                const data = await response.json();
                const botMessage = data.choices[0].message.content;
                
                // Remove typing indicator and add bot message
                removeTypingIndicator();
                addMessage('bot', botMessage);
                
                // Save to chat history
                saveChatHistory();
            } catch (error) {
                removeTypingIndicator();
                addMessage('bot', `Sorry, I encountered an error: ${error.message}`);
                console.error('Error:', error);
            }
        }
    });
    
    // Clear chat history
    clearChatBtn.addEventListener('click', function() {
        if (confirm('Are you sure you want to clear the conversation?')) {
            localStorage.removeItem('chatHistory');
            chatMessages.innerHTML = '';
        }
    });
    
    // Add a message to the chat
    function addMessage(role, content) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', `${role}-message`);
        
        const messageContent = document.createElement('div');
        messageContent.textContent = content;
        
        const messageTime = document.createElement('span');
        messageTime.classList.add('message-time');
        messageTime.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        messageDiv.appendChild(messageContent);
        messageDiv.appendChild(messageTime);
        chatMessages.appendChild(messageDiv);
        
        // Scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    // Show typing indicator
    function showTypingIndicator() {
        const typingDiv = document.createElement('div');
        typingDiv.classList.add('typing-indicator');
        typingDiv.id = 'typing-indicator';
        typingDiv.innerHTML = '<span></span><span></span><span></span>';
        chatMessages.appendChild(typingDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    // Remove typing indicator
    function removeTypingIndicator() {
        const typingIndicator = document.getElementById('typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }
    
    // Save chat history to localStorage
    function saveChatHistory() {
        const messages = [];
        document.querySelectorAll('.message').forEach(msg => {
            const role = msg.classList.contains('user-message') ? 'user' : 'bot';
            const content = msg.querySelector('div').textContent;
            const time = msg.querySelector('.message-time').textContent;
            messages.push({ role, content, time });
        });
        localStorage.setItem('chatHistory', JSON.stringify(messages));
    }
    
    // Load chat history from localStorage
    function loadChatHistory() {
        const history = localStorage.getItem('chatHistory');
        if (history) {
            JSON.parse(history).forEach(msg => {
                addMessage(msg.role, msg.content);
            });
        } else {
            // Add welcome message if no history exists
            addMessage('bot', "Hello! I'm your DeepSeek AI assistant. How can I help you today?");
        }
    }
});
