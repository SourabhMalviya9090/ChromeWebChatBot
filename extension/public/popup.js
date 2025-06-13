// Get current tab info
let currentTab = null;

// Get active tab when popup opens
chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    currentTab = tabs[0];
    updateStatus();
});

function updateStatus() {
    const statusText = document.getElementById('statusText');
    if (currentTab) {
        if (currentTab.url.startsWith('chrome://') || currentTab.url.startsWith('chrome-extension://')) {
            statusText.textContent = 'Cannot access system pages';
            document.querySelectorAll('.action-button:not(.disabled)').forEach(btn => {
                btn.classList.add('disabled');
            });
        } else {
            statusText.textContent = 'Ready to assist';
        }
    }
}

// Button event listeners
document.getElementById('openSidebar').addEventListener('click', () => {
    if (currentTab && !currentTab.url.startsWith('chrome://')) {
        chrome.tabs.sendMessage(currentTab.id, { 
            action: 'OPEN_SIDEBAR'
        });
        window.close();
    }
});

document.getElementById('summarizePage').addEventListener('click', () => {
    if (currentTab && !currentTab.url.startsWith('chrome://')) {
        chrome.tabs.sendMessage(currentTab.id, { 
            action: 'OPEN_SIDEBAR',
            autoAction: 'SUMMARIZE'
        });
        window.close();
    }
});

document.getElementById('extractKey').addEventListener('click', () => {
    if (currentTab && !currentTab.url.startsWith('chrome://')) {
        chrome.tabs.sendMessage(currentTab.id, { 
            action: 'OPEN_SIDEBAR',
            autoAction: 'EXTRACT_KEY_POINTS'
        });
        window.close();
    }
});

// Handle keyboard shortcuts info
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.shiftKey && e.key === 'Y') {
        e.preventDefault();
        document.getElementById('openSidebar').click();
    }
});

// Add loading states
function showLoading(buttonId, loadingText) {
    const button = document.getElementById(buttonId);
    const originalContent = button.innerHTML;
    button.innerHTML = `
        <span class="icon">⏳</span>
        <div class="content">
            <div class="title">${loadingText}</div>
            <div class="description">Please wait...</div>
        </div>
    `;
    button.classList.add('disabled');
    
    setTimeout(() => {
        button.innerHTML = originalContent;
        button.classList.remove('disabled');
    }, 2000);
}

// Error handling
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'ERROR') {
        document.getElementById('statusText').textContent = 'Error: ' + message.message;
    }
});