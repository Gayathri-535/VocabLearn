document.addEventListener("DOMContentLoaded", () => {

    const successMsg = document.getElementById("successMsg");
    if (window.location.search.includes("new=1")) {
        successMsg.style.display = "block";
    }

    document.getElementById("signinForm").addEventListener("submit", async (e) => {
        e.preventDefault();

        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;
        const errorMsg = document.getElementById("errorMsg");

        errorMsg.style.display = "none";

        try {
            const response = await fetch("http://localhost:5001/signin", {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                body: new URLSearchParams({ email, password })
            });

            const data = await response.json();

            if (!response.ok) {
                errorMsg.textContent = data.error || "Invalid email or password";
                errorMsg.style.display = "block";
                return;
            }

            if (data.token) {
                localStorage.setItem("access_token", data.token);
            }

            localStorage.setItem("email", email);



            // DECODE PAYLOAD TO GET USER_ID (no backend change needed)
            const payloadBase64 = data.token.split('.')[1];
            const payloadJson = atob(payloadBase64);
            const payload = JSON.parse(payloadJson);
            localStorage.setItem("user_id", payload.user_id);

            // Redirect to language selection
            window.location.href = "language.html";

        } catch (err) {
            errorMsg.textContent = "Server error. Please try again.";
            errorMsg.style.display = "block";
        }
    });
});