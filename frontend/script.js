// 后端API地址
const API_URL = 'http://localhost:5002/api';

// DOM元素
const chatMessages = document.getElementById('chat-messages');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');

// 初始化
function init() {
    // 绑定事件
    sendBtn.addEventListener('click', sendMessage);
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
    
    // 检查后端服务状态
    checkHealth();
}

// 检查后端服务状态
async function checkHealth() {
    try {
        const response = await fetch(`${API_URL}/health`);
        const data = await response.json();
        if (data.status === 'ok') {
            console.log('后端服务运行正常');
        } else {
            console.warn('后端服务状态异常');
            addSystemMessage('⚠️ 后端服务状态异常，请检查服务是否启动');
        }
    } catch (error) {
        console.error('无法连接到后端服务:', error);
        addSystemMessage('⚠️ 无法连接到后端服务，请确保服务已启动');
    }
}

// 发送消息
async function sendMessage() {
    const message = userInput.value.trim();
    if (!message) return;
    
    // 清空输入框
    userInput.value = '';
    
    // 添加用户消息
    addUserMessage(message);
    
    // 显示加载状态
    const loadingElement = addLoadingMessage();
    
    try {
        // 发送请求到后端
        const response = await fetch(`${API_URL}/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ prompt: message })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // 移除加载状态
        loadingElement.remove();
        
        if (data.success) {
            // 处理对话历史
            processConversation(data.conversation);
            
            // 添加最终答案
            if (data.final_answer) {
                addFinalAnswer(data.final_answer);
            }
        } else {
            addErrorMessage(`错误: ${data.error || '处理请求失败'}`);
        }
    } catch (error) {
        console.error('发送消息失败:', error);
        // 移除加载状态
        loadingElement.remove();
        addErrorMessage(`发送消息失败: ${error.message}`);
    }
}

// 处理对话历史
function processConversation(conversation) {
    conversation.forEach(item => {
        switch (item.role) {
            case 'assistant':
                // 实时显示模型的思考过程
                addAssistantMessage(item.content);
                break;
            case 'system':
                if (item.content.includes('Observation:')) {
                    addObservationMessage(item.content);
                } else if (item.content.includes('任务完成')) {
                    // 不显示系统的任务完成消息，因为我们会单独显示最终答案
                    // addSystemMessage(item.content);
                }
                break;
            default:
                break;
        }
    });
}

// 添加用户消息
function addUserMessage(content) {
    const messageElement = document.createElement('div');
    messageElement.className = 'message user';
    messageElement.innerHTML = `<p>${content}</p>`;
    chatMessages.appendChild(messageElement);
    scrollToBottom();
}

// 添加助手消息
function addAssistantMessage(content) {
    const messageElement = document.createElement('div');
    messageElement.className = 'message assistant';
    messageElement.innerHTML = `<p>${content}</p>`;
    chatMessages.appendChild(messageElement);
    scrollToBottom();
}

// 添加系统消息
function addSystemMessage(content) {
    const messageElement = document.createElement('div');
    messageElement.className = 'message system';
    messageElement.innerHTML = `<p>${content}</p>`;
    chatMessages.appendChild(messageElement);
    scrollToBottom();
}

// 添加观察结果消息
function addObservationMessage(content) {
    const messageElement = document.createElement('div');
    messageElement.className = 'message observation';
    messageElement.innerHTML = `<p>${content}</p>`;
    chatMessages.appendChild(messageElement);
    scrollToBottom();
}

// 添加错误消息
function addErrorMessage(content) {
    const messageElement = document.createElement('div');
    messageElement.className = 'message error';
    messageElement.innerHTML = `<p>${content}</p>`;
    chatMessages.appendChild(messageElement);
    scrollToBottom();
}

// 添加加载消息
function addLoadingMessage() {
    const messageElement = document.createElement('div');
    messageElement.className = 'message assistant';
    messageElement.innerHTML = '<div class="loading"></div> <span>正在处理...</span>';
    chatMessages.appendChild(messageElement);
    scrollToBottom();
    return messageElement;
}

// 添加最终答案
function addFinalAnswer(content) {
    const messageElement = document.createElement('div');
    messageElement.className = 'final-answer';
    messageElement.innerHTML = `<h3>🌟 最终建议</h3><p>${content}</p>`;
    chatMessages.appendChild(messageElement);
    scrollToBottom();
}

// 滚动到底部
function scrollToBottom() {
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// 页面加载完成后初始化
window.addEventListener('DOMContentLoaded', init);