function showForm(formType) {
    document.getElementById('loginForm').classList.toggle('active', formType === 'login');
    document.getElementById('signupForm').classList.toggle('active', formType === 'signup');
    }

        
    // Handle form submissions
    document.querySelector(".login-Form").addEventListener("submit", async function (e) {
        e.preventDefault();
        const formData = new FormData(this);
        const password = formData.get("password");

        if (password.length < 8) {
            showAlert("❌ Password must be at least 8 characters long.");
            return;
        }

        const loginButton = document.getElementById("loginBtn");
        const loginSpinner = document.getElementById("loginSpinner");

        loginButton.disabled = true;
        loginSpinner.classList.remove("d-none");


        try {
            const response = await fetch("https://lucky1999.pythonanywhere.com/admins/api/user/login/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(Object.fromEntries(formData.entries()))
            });

            const data = await response.json();

            if (!response.ok) {
                showAlert('❌ '+ data.error || "❌ Something went wrong! Please try again.");
                return;
            }
            localStorage.setItem("access_token", data.access);
            localStorage.setItem("access_username", data.username);
            localStorage.setItem("access_profilePicture", data.profile_pic);
            window.location.href = "index.html";

        } catch (error) {
            showAlert("❌ Server is not responding. Please try again later.");
        } finally {
            loginButton.disabled = false;
            loginSpinner.classList.add("d-none");
        }
    });


    
    document.querySelector(".signup-Form").addEventListener("submit", async function (e) {
        e.preventDefault(); // Prevent form submission
        const formData = new FormData(this);
        const password = formData.get("password");
        const username = formData.get("username");
        if (password.length < 8) {
            showAlert("❌ Password must be at least 8 characters long.");
            return;
        }
        if (username.length > 9) {
            showAlert("❌ Username must not be greater 9 characters long.");
            return;
        }

        const signUpButton = document.getElementById("signUpBtn");
        const signUpSpinner = document.getElementById("signUpSpinner");

        signUpButton.disabled = true;
        signUpSpinner.classList.remove("d-none");


        try {
            const response = await fetch("https://lucky1999.pythonanywhere.com/admins/api/user/create/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(Object.fromEntries(formData.entries()))
            });

            const data = await response.json();

            if (!response.ok) {
                showAlert('❌ ' + data.error || "❌ Something went wrong! Please try again.");
                return;
            }

            if (response.ok){
                showAlert('✅ ' + data.message);
                localStorage.setItem("access_email", data.email);
                setTimeout(() => {
                    window.location.href = "verify-token.html";
                }, 4000);
            }
            
            

        } catch (error) {
            showAlert("❌ Server is not responding. Please try again later.");
        }finally {
            signUpButton.disabled = false;
            loginSpinner.classList.add("d-none");
        }
    });
        