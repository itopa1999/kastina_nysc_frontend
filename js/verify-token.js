 // Handle form submissions
 document.querySelector(".verify-Form").addEventListener("submit", async function (e) {
    e.preventDefault(); // Prevent form submission
    const formData = new FormData(this);
    const token = formData.get("token");

    if (token.length != 6) {
        showAlert("❌ Token must be 6 characters long.");
        return;
    }

    try {
        const response = await fetch("http://127.0.0.1:8000/admins/api/user/verify/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(Object.fromEntries(formData.entries()))
        });

        const data = await response.json();

        if (!response.ok) {
            showAlert('❌' + data.error || "❌ Something went wrong! Please try again.");
            return;
        }
        localStorage.setItem("access_token", data.access);
        localStorage.setItem("access_username", data.username);
        localStorage.setItem("access_profilePicture", data.profile_pic);
        showAlert('✅ ' +data.message);
        localStorage.removeItem('access_email');
        setTimeout(() => {
            window.location.href = "index.html";
        }, 4000);


    } catch (error) {
        showAlert("❌ Server is not responding. Please try again later.");
    }
});

async function resendToken(){
    const email = localStorage.getItem("access_email")
    if(email === null){
        showAlert("❌ cannot find email, please contact support");
        return;
    }

    try {
        const response = await fetch("http://127.0.0.1:8000/admins/api/user/resend/verification/token/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email: email })
        });

        const data = await response.json();

        if (!response.ok) {
            showAlert('❌ ' +data.error || "❌ Something went wrong! Please try again.");
            return;
        }
        showAlert('✅ ' +data.message);

    } catch (error) {
        showAlert("❌ Server is not responding. Please try again later.");
    }

}