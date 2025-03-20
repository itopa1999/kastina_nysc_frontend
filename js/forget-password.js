function showForm(formType) {
    document.getElementById('ForgetPasswordForm').classList.toggle('active', formType === 'ForgetPassword');
    document.getElementById('confirmTokenForm').classList.toggle('active', formType === 'confirmToken');
}

// Handle form submissions
document.querySelector(".ForgetPassword-Form").addEventListener("submit", async function (e) {
    e.preventDefault();
    const formData = new FormData(this);

    const forgetButton = document.getElementById("forgetBtn");
    const forgetSpinner = document.getElementById("forgetSpinner");

    forgetButton.disabled = true;
    forgetSpinner.classList.remove("d-none");


    try {
        const response = await fetch("https://lucky1999.pythonanywhere.com/admins/api/user/forget/password/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(Object.fromEntries(formData.entries()))
        });

        

        const data = await response.json();
        
        forgetButton.disabled = false;
        forgetSpinner.classList.add("d-none");

        if (!response.ok) {
            showAlert('❌ '+ data.error || "❌ Something went wrong! Please try again.");
            return;
        }
        showAlert('✅ ' + data.message);
        setTimeout(() => {
            document.querySelector(".toggle-link").click()
        }, 2000);

    } catch (error) {
        showAlert("❌ Server is not responding. Please try again later.");
    } finally{
        forgetButton.disabled = false;
        forgetSpinner.classList.add("d-none");
    }
});

document.querySelector('.confirmToken-Form').addEventListener('submit', async function(e) {
    e.preventDefault();
    const formData = new FormData(this);
        const password = formData.get("password");
        const token = formData.get("token");
        if (password.length < 8) {
            showAlert("❌ Password must be at least 8 characters long.");
            return;
        }
        if (token.length !== 6) {
            showAlert("❌ token must not be 6 characters long.");
            return;
        }
        const confirmButton = document.getElementById("confirmBtn");
        const confirmSpinner = document.getElementById("confirmSpinner");

        confirmButton.disabled = true;
        confirmSpinner.classList.remove("d-none");

        
        try {
            const response = await fetch("https://lucky1999.pythonanywhere.com/admins/api/user/forget/password/verify/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(Object.fromEntries(formData.entries()))
            });

            const data = await response.json();

            confirmButton.disabled = false;
            confirmSpinner.classList.add("d-none");

            if (!response.ok) {
                showAlert('❌ ' + data.error || "❌ Something went wrong! Please try again.");
                return;
            }

            localStorage.setItem("access_token", data.access);
            localStorage.setItem("access_username", data.username);
            localStorage.setItem("access_profilePicture", data.profile_pic);
            showAlert('✅ ' +data.message);
            setTimeout(() => {
                window.location.href = "index.html";
            }, 3000);
            
            

        } catch (error) {
            showAlert("❌ Server is not responding. Please try again later.");
        }finally {
            confirmButton.disabled = false;
            confirmSpinner.classList.add("d-none");
        }

});