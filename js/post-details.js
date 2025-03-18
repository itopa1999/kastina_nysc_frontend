const token = localStorage.getItem('access_token');
    if (!token) {
        showAlert('🔐 Login is required.');
        setTimeout(() => {
            window.location.href = "login.html";
        }, 2000);
    }

    const params = new URLSearchParams(window.location.search);
    const postId = params.get("id");
    if (!postId){
        showAlert('🔐 something went wrong.');
        setTimeout(() => {
            window.location.href = "home.html";
        }, 2000);
    }


    async function fetchPostDetails() {
        try {
            const response = await fetch(`http://127.0.0.1:8000/forum/api/post/details/${postId}/`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            })

            // Check if the response is successful
            if (!response.ok) {
                showAlert('❌ Failed to fetch post details:', response.statusText);
                return;
            }

            if (response.status === 401) {
                showAlert('❌ login required');
                setTimeout(() => {
                    window.location.href = "login.html";
                }, 2000);
                return;
            }

            // Parse the JSON response

            const data = await response.json();
            displayPostDetails(data);
        } catch (error) {
            showAlert('❌ Error fetching posts:', error);
        }
    }

    function displayPostDetails(post) {
        const postContainer = document.getElementById("for-you-feed");

    postContainer.innerHTML = `
        <div class="post-card">
            <div class="d-flex align-items-center gap-2">
                <a href="user-profile.html?username=${post.user}" style="cursor: pointer;">
                    <img src="${post.user_profile_picture}" class="avatar">
                </a>
                <div>
                    <a href="user-profile.html?username=${post.user}" id="userLink" style="cursor: pointer;">
                        <strong>@${post.user}</strong>
                    </a>
                    <span class="text-mute">· ${post.category}</span>
                    <span class="text-mute">· ${timeAgoFormatter(post.created_at)}</span>
                </div>
            </div>

            <div class="mt-3">
                <div class="content-previe">
                    <p style="white-space: pre-line; word-wrap: break-word;">${post.content}</p>
                </div>
            </div>

            <div class="engagement-metrics" style="cursor: pointer;">
                <span class="comment-btn" onclick="toggleComments(${post.id})">
                    <i class="fas fa-comment"></i>
                    <span class="engagement-count">${formatNumber(post.total_comment)}</span>
                </span>

                <span class="like-btn" onclick="handleLike(${post.id})">
                    <i class="fas fa-heart ${post.has_liked ? 'liked' : ''}"></i>
                    <span class="engagement-count">${formatNumber(post.likes)}</span>
                </span>

                <span class="views">
                    <i class="fas fa-chart-bar"></i>
                    <span class="engagement-count">${formatNumber(post.views)}</span>
                </span>
            </div>

            <div class="comments-section" id="comments-section-${post.id}" style="display: none;">
                <div class="comments-list" style="max-height: 700px; overflow-y: auto;scrollbar-width: none;
                 -ms-overflow-style: none;" id="comments-list-${post.id}"></div>
                <div class="new-comment" style="display: flex; align-items: center; gap: 8px;">
                    <input id="new-comment-${post.id}" placeholder="Write a comment..." required>
                    <button onclick="postComment(${post.id})">Comment</button>
                </div>
            </div>
            
        </div>
    `;

    }

    fetchPostDetails();

    window.toggleComments = function(postId) {
        const commentsSection = document.getElementById(`comments-section-${postId}`);
        if (commentsSection.style.display === 'none') {
            commentsSection.style.display = 'block';
            fetchComments(postId);
        } else {
            commentsSection.style.display = 'none';
        }
    }

    // Function to post a new comment
    window.postComment = async function(postId) {
        const newCommentContent = document.getElementById(`new-comment-${postId}`).value;
        if (!newCommentContent.trim()) {
            showAlert('❌ comment cannot be empty')
            return;
        }
        const response = await fetch(`http://127.0.0.1:8000/forum/api/home/create/post/comment/`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ content: newCommentContent, post: postId})
        });

        if (response.ok) {
            fetchComments(postId);
            document.getElementById(`new-comment-${postId}`).value = '';
            showAlert('✅ commented')
        } else {
            showAlert('❌ Failed to post comment');
        }
    }

    // Function to fetch comments of a post
    async function fetchComments(postId) {
        try {
            const response = await fetch(`http://127.0.0.1:8000/forum/api/home/get/post/${postId}/comments/`,{
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            })

            // Check if the response is successful
            if (!response.ok) {
                showAlert('❌ Failed to fetch post commentss:', response.statusText);
                return;
            }

            const data = await response.json();
            const commentsList = document.getElementById(`comments-list-${postId}`);
            commentsList.innerHTML = '';
            if (data.results.length === 0) {
                const noComments = document.createElement('div');
                noComments.classList.add('no-comments');
                noComments.textContent = 'No comments yet.';
                commentsList.appendChild(noComments);
                return;
            }
        
            data.results.forEach(comment => {
                const commentDiv = document.createElement('div');
                commentDiv.classList.add('comment-card');
                commentDiv.innerHTML = `
                    <div class="d-flex align-items-start gap-2">
                        <a href="user-profile.html?username=${comment.user}">
                            <img src="${comment.user_profile_picture}" class="avatar-sm">
                        </a>
                        <div class="comment-body">
                            <div class="comment-header">
                                <a href="user-profile.html?username=${comment.user}" class="comment-user text-mute">
                                    <strong>@${comment.user}</strong>
                                </a>
                                <span class="text-mute comment-time">· ${timeAgoFormatter(comment.created_at)}</span>
                            </div>
                            <p class="comment-content text-mute">${comment.content}</p>
                        </div>
                    </div>
                `;
                commentsList.appendChild(commentDiv);
            });
    
    } catch (error) {
        showAlert('❌ Error fetching post commentsws:', error);
        console.log('❌ Error fetching post commentsws:', error);
    }
    }

    // Add hover effects
    window.handleLike = function(postId) {
        const likeBtn = event.currentTarget;
        const heartIcon = likeBtn.querySelector('.fa-heart');
        const countSpan = likeBtn.querySelector('.engagement-count');
        
        // Toggle animation and visual state
        heartIcon.classList.toggle('liked');
        
        // Update count immediately
        const currentCount = parseInt(countSpan.textContent.replace(/[^\d.-]/g, ''));
        countSpan.textContent = formatNumber(heartIcon.classList.contains('liked') ? currentCount + 1 : currentCount - 1);
        
        fetch(`http://127.0.0.1:8000/forum/api/home/post/${postId}/like/`, { 
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            }
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(data => {
                    heartIcon.classList.toggle('liked');
                    countSpan.textContent = formatNumber(currentCount);
                    
                    // Display an alert with the error message
                    showAlert('❌ ' + data.error || '❌ Something went wrong!');
                });
            } else {
                return response.json(); // Proceed if successful
            }
        })
        .catch(error => {
            console.error('Error:', error);
            heartIcon.classList.toggle('liked');
            countSpan.textContent = formatNumber(currentCount);
            showAlert('❌ Failed to like the post. Please try again.');
        });
        
    }
    
    // Add hover effects
    document.querySelectorAll('.engagement-metrics span').forEach(btn => {
        btn.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px)';
        });
        
        btn.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });




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
