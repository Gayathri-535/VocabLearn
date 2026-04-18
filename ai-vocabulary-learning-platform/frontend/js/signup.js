document.getElementById("signupForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = document.getElementById("username").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const message = document.getElementById("message");

    message.textContent = "Creating account...";
    message.style.color = "#5b9dff";

    try {
        const response = await fetch("http://localhost:5001/signup", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: new URLSearchParams({ username, email, password })
        });

        const data = await response.json();

        // USER ALREADY EXISTS
        if (!response.ok) {
            message.textContent = data.error || "Signup failed.";
            message.style.color = "#ef4444";

            // Redirect existing user to signin
            if (response.status === 409) {
                setTimeout(() => {
                    window.location.href = "signin.html?exists=1";
                }, 1200);
            }

            return;
        }

        // SUCCESS
        message.textContent = "Account created successfully 🎉";
        message.style.color = "#16a34a";

        setTimeout(() => {
            window.location.href = "signin.html?new=1";
        }, 1200);

    } catch (err) {
        // REAL server/network failure only
        message.textContent = "Server error. Please try again.";
        message.style.color = "#ef4444";
    }
});