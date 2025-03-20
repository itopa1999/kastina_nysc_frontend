const myUsername = localStorage.getItem('access_username');
if (!myUsername) {
    showAlert('🔐 Login is required or username missing.');
    setTimeout(() => {
        window.location.href = "login.html";
    }, 2000);
}

const params = new URLSearchParams(window.location.search);
const groupName = params.get("groupName");
if (!groupName) {
    showAlert('🔐 Something went wrong.');
    setTimeout(() => {
        window.location.href = "index.html";
    }, 2000);
}

async function fetchGroups() {
    try {
        const response = await fetch(`https://lucky1999.pythonanywhere.com/chat/api/chat/`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        // Check if the response is successful
        if (!response.ok) {
            showAlert('❌ Failed to fetch groups:', response.statusText);
            return;
        }

        const data = await response.json();
        const groupsList = document.getElementById('groupsPanel');
        groupsList.innerHTML = '';
        if (data.results.length === 0) {
            const noGroupsList = document.createElement('div');
            noGroupsList.classList.add('no-comments');
            noGroupsList.textContent = 'No group yet.';
            groupsList.appendChild(noGroupsList);
            return;
        }

        data.results.forEach(group => {
            const groupDiv = document.createElement('div');
            groupDiv.classList.add('group-item');
            
            // If the group name matches the URL's groupName, add 'active' class
            if (group.name === groupName) {
                groupDiv.classList.add('active');
            }

            groupDiv.innerHTML = `
                <div class="d-flex align-items-center justify-content-between">
                    <div>
                        <h6 class="mb-0">${group.name}</h6>
                        <small>${group.members_count} members</small>
                    </div>
                    <i class="fas fa-comments"></i>
                </div>
            `;
            groupsList.appendChild(groupDiv);

            groupDiv.addEventListener('click', () => {
                handleGroupClick(group.name);
            })
        });

    } catch (error) {
        showAlert('❌ Error fetching groups:', error);
        console.log('❌ Error fetching groups:', error);
    }
}

fetchGroups();


async function fetchChatMessages(groupName) {
    try {
        const response = await fetch(`https://lucky1999.pythonanywhere.com/chat/api/chat/get/messages/${groupName}/`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        // Check if the response is successful
        if (!response.ok) {
            showAlert('❌ Failed to fetch chat messages:', response.statusText);
            return;
        }

        const data = await response.json();
        document.getElementById("groupName").innerHTML = groupName + " chat group";
        const chatMessagesArea = document.querySelector('.chat-messages');
        chatMessagesArea.innerHTML = '';

        if (data.results.length === 0) {
            const noMessagesDiv = document.createElement('div');
            noMessagesDiv.classList.add('no-comments');
            noMessagesDiv.textContent = 'Welcome to ' + groupName + ' start chatting';
            chatMessagesArea.appendChild(noMessagesDiv);
            return;
        }

        data.results.forEach(message => {
            const messageDiv = document.createElement('div');
            messageDiv.classList.add('message');
            if (message.user === myUsername) {
                messageDiv.classList.add('sent');
            }

            messageDiv.innerHTML = `
                <img src="${message.user_profile_picture}" class="user-avatar">
                <div>
                    <div class="message-content">
                        <p class="mb-0" style="white-space: pre-line; word-wrap: break-word;">${message.content}</p>
                        <span class="message-time">${timeAgoFormatter(message.timestamp)} . @${message.user}</span>
                    </div>
                </div>
            `;
            chatMessagesArea.appendChild(messageDiv);
        });

    } catch (error) {
        showAlert('❌ Error fetching chat messages:', error);
        console.log('❌ Error fetching chat messages:', error);
    }
}

// Call fetch on page load
fetchChatMessages(groupName);

// Fetch and update active class on group click
async function handleGroupClick(clickedGroupName) {
    // Update the active class for groups
    const allGroupItems = document.querySelectorAll('.group-item');
    allGroupItems.forEach(group => {
        if (group.querySelector('h6').textContent === clickedGroupName) {
            group.classList.add('active');
            connectWebSocket(clickedGroupName)
            const chatMessagesArea = document.querySelector('.chat-messages');
            chatMessagesArea.innerHTML = '';
            fetchChatMessages(clickedGroupName);
            
        } else {
            group.classList.remove('active');
        }
    });
    
}


const typingText = document.getElementById('typingText');
let ws;
function connectWebSocket(groupNameChat) {
    ws = new WebSocket(`ws://127.0.0.1:8000/ws/chat/${groupNameChat}/?token=${token}`);

    ws.onopen = function () {
        console.log('Connected to WebSocket');
    };

    ws.onmessage = function (e) {
        const data = JSON.parse(e.data);
        handleMessage(data);
    };

    ws.onclose = function () {
        console.log('WebSocket connection closed');
    };
}


function handleMessage(data) {
    // if (data.is_typing !== undefined) {
    //     handleTypingIndicator(data);
        
    // }
    scrollToBottom();

    if (!data.message.includes("has joined") && !data.message.includes("has left")) {
        addMessageToChat(data);
    }

    if (data.message.includes("has joined")){
        addSystemMessage(data.message, 'join');
    } else if (data.message.includes("has left")) {
        addSystemMessage(data.message, 'leave');
    }
}

function scrollToBottom() {
    window.scrollTo(0, document.body.scrollHeight);
}

window.onload = scrollToBottom;



// Function to add a message to the chat
function addMessageToChat(data) {
    const chatMessagesArea = document.querySelector('.chat-messages');
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message');
    if (data.user === myUsername) {
        messageDiv.classList.add('sent');
    }

    messageDiv.innerHTML = `
        <img src="${data.profile_picture}" alt="${data.user}'s profile picture" class="user-avatar">
        <div>
            <div class="message-content">
                <p class="mb-0" style="white-space: pre-line; word-wrap: break-word;">${data.message}</p>
                <span class="message-time">${timeAgoFormatter(data.timestamp)} . @${data.user}</span>
            </div>
        </div>
    `;
    chatMessagesArea.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}


  // Send message when the user clicks the send button
  document.getElementById('sendMessageButton').addEventListener('click', function () {
    const message = typingText.value.trim();
    if (message) {
        ws.send(JSON.stringify({
            message: message,
            is_typing: false
        }));
        typingText.value = '';  // Clear the input
    }
});

// Detect typing and notify the server
// typingText.addEventListener('input', function () {
//     const isTyping = typingText.value.trim() !== '';
//     ws.send(JSON.stringify({
//         is_typing: isTyping,
//         message: ''
//     }));
// });

// Initialize the WebSocket connection
connectWebSocket(groupName);





// Get chat messages container
const chatMessages = document.querySelector('.chat-messages');

// System message functions
function addSystemMessage(text, type) {
const systemDiv = document.createElement('div');
systemDiv.className = 'system-message';

if(type === 'join') {
    systemDiv.innerHTML = `<span class="user-joined">${text}</span>`;
} else if(type === 'leave') {
    systemDiv.innerHTML = `<span class="user-left">${text}</span>`;
}

chatMessages.appendChild(systemDiv);
chatMessages.scrollTop = chatMessages.scrollHeight;
}


// function handleTypingIndicator(data) {
//     const typingIndicator = document.getElementById("typing-indicator");
//     if (!data.user == myUsername && data.is_typing) {
//         typingIndicator.innerText = `${data.user} is typing...`;
//     } else {
//         typingIndicator.innerText = '';
//     }
// }


// let typingTimer;
// const typingDelay = 1000;

// const inputField = document.getElementById("typingText");

// inputField.addEventListener('input', function () {
//     clearTimeout(typingTimer);
//     sendTypingStatus(true); // User is typing
//     typingTimer = setTimeout(() => sendTypingStatus(false), typingDelay);
// });

// // Send typing status through WebSocket
// function sendTypingStatus(isTyping) {
//     const message = {
//         'is_typing': isTyping,
//     };
//     ws.send(JSON.stringify(message));
// }





// Mobile menu toggle
const menuToggle = document.getElementById('menuToggle');
const groupsPanel = document.getElementById('groupsPanel');

menuToggle.addEventListener('click', () => {
    groupsPanel.classList.toggle('active');
});

// Close menu when clicking outside on mobile
document.addEventListener('click', (e) => {
    if (window.innerWidth <= 768 && 
        !e.target.closest('#groupsPanel') && 
        !e.target.closest('#menuToggle')) {
        groupsPanel.classList.remove('active');
    }
});

// Prevent menu close when clicking inside
groupsPanel.addEventListener('click', (e) => {
    e.stopPropagation();
});