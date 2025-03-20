
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
    
    // Check for the user's system theme preference
    function checkSystemTheme() {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        // Apply dark mode based on system preference if no preference is set in localStorage
        const savedDarkMode = localStorage.getItem('darkMode');
        if (savedDarkMode === null) {
            // If there's no preference in localStorage, use system theme
            document.body.classList.toggle('dark-mode', prefersDark);
        } else if (savedDarkMode === 'enabled') {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
        
        // Update the toggle icon based on the current theme
        const toggleIcon = document.getElementById('toggleIcon');
        if (document.body.classList.contains('dark-mode')) {
            toggleIcon.classList.add('bi-toggle-on');
            toggleIcon.classList.remove('bi-toggle-off');
            toggleIcon.style.color = '#026e57';
        } else {
            toggleIcon.classList.add('bi-toggle-off');
            toggleIcon.classList.remove('bi-toggle-on');
            toggleIcon.style.color = '';
        }
    }
    
    // Listen for system theme changes and apply it
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        const isDarkMode = e.matches;
        if (localStorage.getItem('darkMode') === null) {
            // If no localStorage preference, apply system theme
            document.body.classList.toggle('dark-mode', isDarkMode);
        }
    });
    
    // Run the check on page load to apply the correct theme
    checkSystemTheme();

    


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




// Function to create and show the modal
function showChangePasswordModal() {
    // If modal already exists, remove it first
    let existingModal = document.getElementById("changePasswordModal");
    if (existingModal) {
        existingModal.remove();
    }

    // Create modal HTML dynamically
    let modalHTML = `
    <div class="modal fade" id="changePasswordModal" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Change Password</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <form id="changePasswordForm">
                        <div class="mb-3">
                            <label for="oldPassword" class="form-label">Old Password</label>
                            <input type="password" name='password' class="form-control" id="oldPassword" required>
                        </div>
                        <div class="mb-3">
                            <label for="newPassword" class="form-label">New Password</label>
                            <input type="password"  name='password1' class="form-control" id="newPassword" required>
                        </div>
                        <div class="mb-3">
                            <label for="confirmPassword" class="form-label">Confirm Password</label>
                            <input type="password"  name='password2' class="form-control" id="confirmPassword" required>
                        </div>
                        <button type="submit" id="changePasswordBtn" class="btn btn-forget w-100" >Change Password → 
                            <span class="spinner-border spinner-border-sm d-none" id="changePasswordSpinnerBtn" role="status" aria-hidden="true"></span>
                        </button>
                    </form>
                </div>
            </div>
        </div>
    </div>`;

    // Append modal to body
    document.body.insertAdjacentHTML("beforeend", modalHTML);

    // Show the modal
    let modal = new bootstrap.Modal(document.getElementById("changePasswordModal"));
    modal.show();

    // Add submit event listener for the form
    document.getElementById('changePasswordForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        const formData = new FormData(this);
        const password = formData.get("password");
        const password1 = formData.get("password1");
        const password2 = formData.get("password2");

        if (password.length < 8 || password1.length < 8 || password2.length < 8) {
            showAlert("❌ Password must be at least 8 characters long.");
            return;
        }

        if (password1 !== password2) {
            showAlert("❌ New Password and Confirm Password do not match.");
            return;
        }

        const changePasswordButton = document.getElementById("changePasswordBtn");
        const changePasswordSpinner = document.getElementById("changePasswordSpinnerBtn");

        changePasswordButton.disabled = true;
        changePasswordSpinner.classList.remove("d-none");

        try {
            const response = await fetch("https://lucky1999.pythonanywhere.com/admins/api/user/change/password/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(Object.fromEntries(formData.entries()))
            });

            const data = await response.json();

            if (!response.ok) {
                showAlert('❌ ' + data.error || "❌ Something went wrong! Please try again.");
                return;
            }

            localStorage.removeItem("access_token", data.access);
            localStorage.removeItem("access_username", data.username);
            localStorage.removeItem("access_profilePicture", data.profile_pic);
            showAlert('✅ ' + data.message);

            setTimeout(() => {
                window.location.href = "login.html";
            }, 3000);

        } catch (error) {
            showAlert("❌ Server is not responding. Please try again later.");
        }finally {
            changePasswordButton.disabled = false;
            changePasswordSpinner.classList.add("d-none");
        }
    });
}

// Add the event listener to the "Change Password" dropdown item
document.getElementById("ChangePassword").addEventListener("click", showChangePasswordModal);
