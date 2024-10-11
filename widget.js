(function() {
    const config = window.AI_CHAT_CONFIG || {};
    const API_URL = config.API_URL || 'http://localhost:8000';

    function createWidgetHTML() {
        return `
            <div id="ai-chat-widget" style="position:fixed;bottom:20px;right:20px;width:300px;height:400px;border:1px solid #ccc;border-radius:5px;display:flex;flex-direction:column;background-color:white;">
                <div id="ai-chat-messages" style="flex-grow:1;overflow-y:auto;padding:10px;"></div>
                <div id="ai-chat-input" style="display:flex;padding:10px;">
                    <input type="text" id="ai-user-input" placeholder="Type your message..." style="flex-grow:1;margin-right:10px;">
                    <button onclick="window.AIChat.sendMessage()">Send</button>
                </div>
            </div>
        `;
    }

    function addMessage(sender, message) {
        const chatMessages = document.getElementById('ai-chat-messages');
        const messageElement = document.createElement('div');
        messageElement.innerHTML = `<strong>${sender}:</strong> ${message}`;
        chatMessages.appendChild(messageElement);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    async function summarizePage() {
        const response = await fetch(`${API_URL}/api/summarize`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                url: window.location.href,
                content: document.body.innerText
            })
        });
        const data = await response.json();
        addMessage('AI', `Here's a summary of this page: ${data.summary}`);
    }

    async function sendMessage() {
        const userInput = document.getElementById('ai-user-input');
        const message = userInput.value.trim();
        if (message) {
            addMessage('You', message);
            userInput.value = '';

            const response = await fetch(`${API_URL}/api/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: message,
                    page_content: document.body.innerText
                })
            });
            const data = await response.json();
            addMessage('AI', data.reply);
        }
    }

    function initializeWidget() {
        document.body.insertAdjacentHTML('beforeend', createWidgetHTML());
        summarizePage();
    }

    // Expose necessary functions to the global scope
    window.AIChat = {
        sendMessage: sendMessage
    };

    // Initialize the widget when the DOM is fully loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeWidget);
    } else {
        initializeWidget();
    }
})();