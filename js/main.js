function showAlert(message) {
    const alert = document.getElementById('customAlert');
    const content = alert.querySelector('.alert-content');
    
    content.textContent = message;
    alert.classList.add('active');
    
    setTimeout(() => {
        alert.classList.remove('active');
    }, 6000);
}

document.getElementById('logoutUser').addEventListener('click', function() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('access_username');
    localStorage.removeItem('access_profilePicture');
    showAlert("✅ Logout successful! ")
    setTimeout(() => {
        window.location.href = "login.html";
    }, 2000);
});

username = localStorage.getItem('access_username');
profilePicture = localStorage.getItem('access_profilePicture');


if (username) {
    document.getElementById('username').textContent = '@corper_' + username;
}

// If profile picture exists, update the image src attribute
if (profilePicture) {
    document.getElementById('profilePic').src = profilePicture;
}


document.addEventListener('DOMContentLoaded', () => {
    if (localStorage.getItem('darkMode') === 'enabled') {
        document.body.classList.add('dark-mode');
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const toggleIcon = document.getElementById('toggleIcon');
    const isDarkMode = localStorage.getItem('darkMode') === 'enabled';

    if (isDarkMode) {
        document.body.classList.add('dark-mode');
        toggleIcon.classList.replace('bi-toggle-off', 'bi-toggle-on');
        toggleIcon.style.color = '#026e57';
    }
});

    const toggleIcon = document.getElementById('toggleIcon');
    let isDarkMode = false;

function toggleDarkMode() {
    const toggleIcon = document.getElementById('toggleIcon');
    const isDarkMode = document.body.classList.toggle('dark-mode'); // Toggle dark mode

    // Save dark mode state in localStorage
    localStorage.setItem('darkMode', isDarkMode ? 'enabled' : 'disabled');

    // Toggle icon classes & color
    toggleIcon.classList.toggle('bi-toggle-off', !isDarkMode);
    toggleIcon.classList.toggle('bi-toggle-on', isDarkMode);
    toggleIcon.style.color = isDarkMode ? '#026e57' : '';

    // Save icon state in localStorage
    localStorage.setItem('toggleIcon', isDarkMode ? 'bi-toggle-on' : 'bi-toggle-off');
}



document.addEventListener('DOMContentLoaded', function() {
    const avatar = document.querySelector('.avatar');
    const dropdown = document.getElementById('userDropdown');
    

    // Toggle dropdown
    avatar.addEventListener('click', function(e) {
        e.stopPropagation();
        const isOpen = dropdown.style.display === 'block';
        dropdown.style.display = isOpen ? 'none' : 'block';
    });

    document.querySelectorAll('.dropdown-item').forEach(item => {
        item.addEventListener('click', function(e) {
            e.stopPropagation(); 

        })
    })

    // Close dropdown when clicking outside
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.dropdown-toggle')) {
            dropdown.style.display = 'none';
        }
    });
});




function timeAgoFormatter(date) {
    const now = new Date();
    const diffInSeconds = Math.floor((now - new Date(date)) / 1000); // Difference in seconds

    if (diffInSeconds < 60) {
        return `${diffInSeconds} secs ago`;
    }

    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
        return `${diffInMinutes} mins ago`;
    }

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
        return `${diffInHours} hours ago`;
    }

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) {
        return `${diffInDays} days ago`;
    }

    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths < 12) {
        return `${diffInMonths} months ago`;
    }

    const diffInYears = Math.floor(diffInDays / 365);
    return `${diffInYears} years ago`;
}


function formatNumber(number) {
    if (number === 0) {
        return '0';
    } else if (number < 1000) {
        return number.toFixed();
    } else if (number < 1000000) {
        return (number / 1000).toFixed(1) + 'K';
    } else if (number < 1000000000) {
        return (number / 1000000).toFixed(1) + 'M';
    }
}

token = localStorage.getItem('access_token');
if (!token) {
    showAlert('🔐 Login is required.');
    setTimeout(() => {
        window.location.href = "login.html";
    }, 2000);
}
// Set up WebSocket connection
const socket = new WebSocket(`ws://127.0.0.1:8000/ws/notifications/?token=${token}`);

socket.onmessage = function(e) {
    const data = JSON.parse(e.data);
    const message = data.message;
    console.log("New notification: ", message);
    // You can add your code to show the notification in the frontend
};

// Handle WebSocket errors
socket.onerror = function(e) {
    console.error('WebSocket error: ', e);
};

// Handle WebSocket close
socket.onclose = function(e) {
    console.log('WebSocket closed: ', e);
};
