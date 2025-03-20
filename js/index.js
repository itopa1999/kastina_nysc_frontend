document.addEventListener("DOMContentLoaded", function() {
    const initialUrl = 'https://lucky1999.pythonanywhere.com/forum/api/home/get/posts/';
    let nextPageUrl = initialUrl;

    window.loadMorePosts = function(e) {
        if (e) e.preventDefault();
        if (nextPageUrl) {
            fetchPosts(nextPageUrl);
        }
    }

    async function fetchPosts(url = initialUrl) {
        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            })

            // Check if the response is successful
            if (!response.ok) {
                showAlert('❌ Failed to fetch posts:', response.statusText);
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
            displayPosts(data, url !== initialUrl);
            nextPageUrl = data.next;

            // Update View More link visibility
            const viewMoreLink = document.getElementById('view-more-posts');
            viewMoreLink.style.display = nextPageUrl ? 'block' : 'none';

        } catch (error) {
            console.log('❌ Error fetching posts:', error);
        }
    }

    document.getElementById('view-more-link').addEventListener('click', loadMorePosts);


    function displayPosts(posts, append = false) {
        const forYouFeed = document.getElementById('for-you-feed');
        const communitiesFeed = document.getElementById('communities-feed');
        
        if(append){
            [forYouFeed, communitiesFeed].forEach(feed => {
                const noPostsMessage = feed.querySelector('.no-posts-message');
                if (noPostsMessage) noPostsMessage.remove();
            });
        }else{
            // Clear both feeds
            forYouFeed.innerHTML = '';
            communitiesFeed.innerHTML = '';
        }
        // Separate the posts by category
        const newForYouPosts = posts.results.filter(post => post.category.toLowerCase() !== 'cds update');
        const newCdsUpdatePosts = posts.results.filter(post => post.category.toLowerCase() === 'cds update');
        
        // Handle For You feed
        handleFeedPopulation(forYouFeed, newForYouPosts, append, 'For You');
        
        // Handle CDS Update feed
        handleFeedPopulation(communitiesFeed, newCdsUpdatePosts, append, 'Cds Update');

        // Update View More link visibility
        const viewMoreLink = document.getElementById('view-more-posts');
        viewMoreLink.style.display = nextPageUrl ? 'block' : 'none';
        
    }

    function handleFeedPopulation(feedElement, posts, append, feedName) {
        
        // Handle "For You" feed
        if (!append && posts.length === 0) {
            const noPostsMessage = document.createElement('div');
            noPostsMessage.classList.add('no-posts-message');
            noPostsMessage.innerHTML = `<p>No posts available in ${feedName}.</p>`;
            feedElement.appendChild(noPostsMessage);
        } else {
            posts.forEach(post => {
                const postCard = createPostCard(post);
                feedElement.appendChild(postCard);
            });
        }
    }
    
    function createPostCard(post) {
        const postCard = document.createElement('div');
        postCard.classList.add('post-card');
    
        // Handle "Show More" button for long content
        const showMoreButton = post.short_content.length > 199 ? `<div class="show-more" style="cursor: pointer;">Show more</div>` : '';
    
        postCard.innerHTML = `
            <div class="d-flex align-items-center gap-2">
                <a href="user-profile.html?username=${post.user}" style="cursor: pointer;">
                    <img src="${post.user_profile_picture}" class="avatar">
                </a>
                <div>
                    <a href="user-profile.html?username=${post.user}" id="userLink" style="cursor: pointer;">
                        <strong>@${post.user}</strong>
                    </a>
                    <span class="text-mute">· ${post.category}</span>
                    <span  class="text-mute time-ago" data-timestamp="${post.created_at}">· ${timeAgoFormatter(post.created_at)}</span>
                </div>
            </div>
            <div class="mt-3">
                <div class="content-preview">
                    <p style="white-space: pre-line;word-wrap: break-word;">${post.short_content}</p>
                </div>
                ${showMoreButton}
            </div>
            <div class="engagement-metrics" style="cursor: pointer;">
                <span class="comment-btn" onclick="toggleComments(${post.id})"><i class="fas fa-comment"></i>
                    <span class="engagement-count comment-count-${post.id}">${formatNumber(post.total_comment)}</span>
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
                <div class="comments-list" style="max-height: 300px; overflow-y: auto;scrollbar-width: none;
                 -ms-overflow-style: none;" id="comments-list-${post.id}"></div>
                <div class="new-comment" style="display: flex; align-items: center; gap: 8px;">
                    <input id="new-comment-${post.id}" placeholder="Write a comment...">
                    <button onclick="postComment(${post.id})" id="commentBtn-${post.id}">Comment 
                        <span class="spinner-border spinner-border-sm d-none" id="commentSpinner-${post.id}" role="status" aria-hidden="true"></span>
                    </button>
                </div>
            </div>
        `;
    
        // Attach event listener for "Show More" button
        if (showMoreButton) {
            postCard.querySelector('.show-more').addEventListener('click', () => {
                window.location.href = `post-details.html?id=${post.id}`;
            });
        }
    
        return postCard;
    }

    fetchPosts();

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
        const commentButton = document.getElementById(`commentBtn-${postId}`);
        const commentSpinner = document.getElementById(`commentSpinner-${postId}`);

        commentButton.disabled = true;
        commentSpinner.classList.remove("d-none");

        const countSpan = document.querySelector(`.comment-count-${postId}`);

        const currentCount = parseInt(countSpan.textContent.replace(/[^\d.-]/g, ''));
        countSpan.textContent = formatNumber(currentCount + 1);


        try{
            const response = await fetch(`https://lucky1999.pythonanywhere.com/forum/api/home/create/post/comment/`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ content: newCommentContent, post: postId})
            });

            commentButton.disabled = false;
            commentSpinner.classList.add("d-none");

            if (response.ok) {
                fetchComments(postId);
                document.getElementById(`new-comment-${postId}`).value = '';
                showAlert('✅ commented')
            } else {
                countSpan.textContent = formatNumber(currentCount);
                showAlert('❌ Failed to post comment');
            }
        }catch (error) {
            countSpan.textContent = formatNumber(currentCount);
            showAlert("❌ Server is not responding. Please try again later.");
        }finally {
            commentButton.disabled = false;
            commentSpinner.classList.add("d-none");
        }
    }


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



    // Function to fetch comments of a post
    async function fetchComments(postId) {
        try {
            const response = await fetch(`https://lucky1999.pythonanywhere.com/forum/api/home/get/post/${postId}/comments/`,{
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
                                <span  class="text-mute comment-time time-ago" data-timestamp="${comment.created_at}">· ${timeAgoFormatter(comment.created_at)}</span>
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
        
        fetch(`https://lucky1999.pythonanywhere.com/forum/api/home/post/${postId}/like/`, { 
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


    async function fetchCategories() {
        try {
            const response = await fetch(`https://lucky1999.pythonanywhere.com/forum/api/category/`, { 
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                }
            });
    
            if (!response.ok) {
                showAlert("❌  to fetch categories");
            }
    
            const categories = await response.json();
            
            const categoryContainer = document.querySelector(".category-options");
            categoryContainer.innerHTML = ""; // Clear previous options
    
            categories.results.forEach((category, index) => {
                const categoryElement = document.createElement("div");
                categoryElement.innerHTML = `
                    <input type="radio" name="category" id="category-${category.id}" class="category-radio" value="${category.id}" ${index === 0 ? "checked" : ""}>
                    <label for="category-${category.id}" class="category-label">🎯 ${category.name}</label>
                `;
                categoryContainer.appendChild(categoryElement);
            });
        } catch (error) {
            console.error("Error fetching categories:", error);
        }
    }
        

    fetchCategories()



    // Handle post submission
    document.querySelector('.post-button-main').addEventListener('click', async function () {
        const postContent = document.querySelector('.post-textarea').value;
        if (!postContent.trim()) {
            showAlert('❌ post cannot be empty')
            return;
        }
        const selectedCategoryId = document.querySelector('input[name="category"]:checked').value;

        const postData = {
            content: postContent,
            category: selectedCategoryId
        };

        const postButton = document.getElementById("postBtn");
        const postSpinner = document.getElementById("postSpinner");

        postButton.disabled = true;
        postSpinner.classList.remove("d-none");

        try {
            const response = await fetch("https://lucky1999.pythonanywhere.com/forum/api/post/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify(postData),
            });

            postButton.disabled = false;
            postSpinner.classList.add("d-none");

            if (!response.ok){
                showAlert("❌ Failed to post");
            }

            showAlert("✅ Posted");
            fetchPosts()
            bootstrap.Modal.getInstance(document.getElementById("postModal")).hide();
        } catch (error) {
            showAlert("❌ Error posting:", error);
        }finally {
            postButton.disabled = false;
            postSpinner.classList.add("d-none");
        }
    });





    



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


});









