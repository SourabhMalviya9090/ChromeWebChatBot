// Flag to track if sidebar is open
let sidebarOpen = false;
let sidebarIframe = null;

async function initSidebarSession() {
  const url = window.location.href;
  const type = url.toLowerCase().includes(".pdf") ? "pdf" : "web";

  const res = await fetch("http://localhost:8000/api/init", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ url, type })
  });

  const data = await res.json();
  console.log("Init Response:", data);
}


// Listen for messages from popup
chrome.runtime.onMessage.addListener(async(message, sender, sendResponse) => {
    if (message.action === 'OPEN_SIDEBAR') {
        if (!sidebarOpen) {
            injectSidebar();
            console.log("Sidebar injected");
            await initSidebarSession();
        }
        
        // If there's an auto action, send it to the sidebar
        if (message.autoAction) {
            setTimeout(() => {
                sendMessageToSidebar({
                    type: 'AUTO_ACTION',
                    action: message.autoAction
                });
            }, 1000); // Wait for sidebar to load
        }
    }
});

function injectSidebar() {
    if (sidebarOpen) return;
    
    // Create iframe for React app
    sidebarIframe = document.createElement('iframe');
    sidebarIframe.src = chrome.runtime.getURL('index.html');
    sidebarIframe.id = 'ai-chat-sidebar';
    sidebarIframe.style.cssText = `
        position: fixed !important;
        top: 0 !important;
        right: 0 !important;
        width: 380px !important;
        height: 100vh !important;
        border: none !important;
        z-index: 999999 !important;
        box-shadow: -4px 0 20px rgba(0,0,0,0.15) !important;
    `;
    
    document.body.appendChild(sidebarIframe);
    sidebarOpen = true;
}

function sendMessageToSidebar(message) {
    if (sidebarIframe) {
        sidebarIframe.contentWindow.postMessage(message, '*');
    }
}

window.addEventListener('message', (event) => {
  if (event.data?.type === 'CLOSE_SIDEBAR') {
    const sidebar = document.getElementById('ai-chat-sidebar');
    if (sidebar) {
      sidebar.remove();
      sidebarOpen = false;
    }
  }
});