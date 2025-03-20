async function fetchQuery(query) {
    try {
        const response = await fetch(`https://lucky1999.pythonanywhere.com/forum/api/user/search/?query=${query}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        })

        // Check if the response is successful
        if (!response.ok) {
            showAlert('❌ Failed to fetch results:', response.statusText);
            return;
        }

        if (response.status === 401) {
            showAlert('❌ login required');
            setTimeout(() => {
                window.location.href = "login.html";
            }, 2000);
            return;
        }

        const data = await response.json();
        console.log(data)
        displayUsers(data.users);
        displayPosts(data.posts);
    } catch (error) {
        showAlert('❌ Error fetching results:', error);
    }
}

function displayUsers(data){
    const usersContent = document.getElementById('users-content');
    usersContent.innerHTML = '';

    if (data.length === 0) {
        const noMessage = document.createElement('div');
        noMessage.classList.add('no-posts-message');
        noMessage.innerHTML = '<p>@corper is empty for this search.</p>';
        usersContent.appendChild(noMessage);
        return;
    }

    data.forEach(user => {
        const userCard = document.createElement('div');
        userCard.classList.add('col-12');
        userCard.innerHTML = `
        <div class="search-result-item">
            <div class="d-flex align-items-center userDetailsShow" gap-3">
                <img src="${user.profile_picture}" 
                        class="compact-avatar"
                        alt="Profile picture">
                <div class="flex-grow-1">
                    <div class="d-flex align-items-center gap-2">
                        <span class="fw-medium"> @${user.username}</span>
                    </div>
                    <div class="user-email">@corper</div>
                </div>
                <i class="bi bi-chevron-right text-mute"></i>
            </div>
        </div>
        `;
        
        const detailsButton = userCard.querySelector('.userDetailsShow');
        detailsButton.addEventListener('click', () => {
            const username = user.username;
            window.location.href = `user-profile.html?username=${username}`;
        });
        

        usersContent.appendChild(userCard);
    });


}


function displayPosts(data){
    const postContent = document.getElementById('posts-content');
    postContent.innerHTML = '';

    if (data.length === 0) {
        const noMessage = document.createElement('div');
        noMessage.classList.add('no-posts-message');
        noMessage.innerHTML = '<p>Post is empty for this search.</p>';
        postContent.appendChild(noMessage);
        return;
    }

    data.forEach(post => {
        const postCard = document.createElement('div');
        postCard.classList.add('col-12');
        postCard.innerHTML = `
        <div class="search-result-item">
            <div class="d-flex align-items-start postDetailsShow gap-3">
                <div class="compact-avatar bg-secondary text-white d-flex align-items-center justify-content-center">
                    <i class="bi bi-file-text"></i>
                </div>
                <div class="flex-grow-1">
                    <div class="post-content mb-1">
                    ${post.short_content}
                    </div>
                    <div class="d-flex align-items-center gap-3">
                        <span class="timestamp">
                            .
                            ${post.category}
                        </span>
                    </div>
                </div>
                <i class="bi bi-chevron-right text-muted"></i>
            </div>
        </div>
        `;
        
        const detailsButton = postCard.querySelector('.postDetailsShow');
        detailsButton.addEventListener('click', () => {
            const postId = post.id;
            window.location.href = `post-details.html?id=${postId}`;
        });
        

        postContent.appendChild(postCard);
    });

}



document.querySelector(".search-box").addEventListener("submit", async function (e) {
    e.preventDefault();
    const formData = new FormData(this);
    const query = formData.get("query");

    fetchQuery(query)


})


async function fetchTrending() {
    try {
        const response = await fetch('https://lucky1999.pythonanywhere.com/forum/api/home/get/trending/posts/', {
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



// Feed switching functionality
const feedTabs = document.querySelectorAll('.feed-tab');
const feedContents = document.querySelectorAll('.feed-content');

feedTabs.forEach(tab => {
    tab.addEventListener('click', function() {
        // Remove active classes
        feedTabs.forEach(t => t.classList.remove('active'));
        feedContents.forEach(c => c.classList.remove('active'));

        // Add active classes
        this.classList.add('active');
        const feedType = this.dataset.feed;
        document.getElementById(`${feedType}-feed`).classList.add('active');
    });
});