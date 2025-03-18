const token = localStorage.getItem('access_token');
    if (!token) {
        showAlert('🔐 Login is required.');
        setTimeout(() => {
            window.location.href = "login.html";
        }, 2000);
    }

    
    async function fetchGroups() {
        try {
            const response = await fetch(`http://127.0.0.1:8000/chat/api/chat/`,{
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            })

            // Check if the response is successful
            if (!response.ok) {
                showAlert('❌ Failed to fetch groups:', response.statusText);
                return;
            }

            const data = await response.json();
            const groupsList = document.getElementById(`group-container`);
            groupsList.innerHTML = '';
            if (data.results.length === 0) {
                const noGroupsList = document.createElement('div');
                noGroupsList.classList.add('no-comments');
                noGroupsList.textContent = 'No comments yet.';
                groupsList.appendChild(noGroupsList);
                return;
            }
        
            data.results.forEach(group => {
                const groupDiv = document.createElement('div');
                groupDiv.classList.add('group-card');
                groupDiv.innerHTML = `
                    <div class="group-header">
                        <div class="group-icon">#</div>
                        <div class="group-name">${group.display_name}</div>
                    </div>
                    <p class="group-description">
                        ${group.description}
                    </p>

                    <div class="group-footer">
                        <div class="members">
                            <div class="avatar-stack">
                                <img src="imgs/1.png" class="avatar-group-chat-list">
                                <img src="imgs/2.png" class="avatar-group-chat-list">
                                <img src="imgs/3.png" class="avatar-group-chat-list">
                                <img src="imgs/4.png" class="avatar-group-chat-list">
                            </div>
                            <span class="member-count">${formatNumber(group.total_member)} users</span>
                        </div>
                        <a href="chat-room.html?groupName=${group.name}"><button class="join-button">Join</button></a>
                    </div>
                    
                `;
                groupsList.appendChild(groupDiv);
            });
    
    } catch (error) {
        showAlert('❌ Error fetching groups:', error);
        console.log('❌ Error fetching groups:', error);
    }
}

fetchGroups()







    
async function fetchTrending() {
    try {
        const response = await fetch('http://127.0.0.1:8000/forum/api/home/get/trending/posts/', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        })

        // Check if the response is successful
        if (!response.ok) {
            showAlert('❌ Failed to fetch trending posts:', response.statusText);
            return;
        }

        // Parse the JSON response

        const data = await response.json();
        displayTrendingPosts(data);
    } catch (error) {
        showAlert('❌ Error fetching trending posts:', error);
    }
}

function displayTrendingPosts(posts){
    const feedContainer = document.getElementById('trendingCard');
    feedContainer.innerHTML = '';
    if (posts.results.length === 0) {
        const noPostsMessage = document.createElement('div');
        noPostsMessage.classList.add('no-posts-message');
        noPostsMessage.innerHTML = '<p>No trending posts available.</p>';
        feedContainer.appendChild(noPostsMessage);
        return;
    }

    posts.results.forEach(post => {
        const postCard = document.createElement('div');
        postCard.classList.add('trending-item', 'mb-3');
        postCard.innerHTML = `
            <small class="text-mute">@${post.user} . ${post.category} · Trending</small>
            <div style="cursor:pointer;" class="fw-bold trending-view-detail">${post.short_content}</div>
            <small>${formatNumber(post.total_comment)} comments</small>
            <hr>
        `;
        
        const detailsButton = postCard.querySelector('.trending-view-detail');
        detailsButton.addEventListener('click', () => {
            const postId = post.id;  // Get the post ID
            window.location.href = `post-details.html?id=${postId}`;
        });
        

        feedContainer.appendChild(postCard);
    });

    
}


fetchTrending();
