document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("access_token");
  const userId = localStorage.getItem("user_id");

  if (!token || !userId) {
    window.location.href = "signin.html";
    return;
  }

  let selectedLanguageId = null;
  const languageButtons = document.querySelectorAll("#languageOptions button");
  const continueBtn = document.getElementById("continueBtn");

  languageButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      languageButtons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      selectedLanguageId = btn.dataset.value;
      continueBtn.disabled = false;
    });
  });

  continueBtn.addEventListener("click", async () => {
    if (!selectedLanguageId) return;

    const formData = new FormData();
    formData.append("user_id", userId);
    formData.append("language_id", selectedLanguageId);

    try {
      const response = await fetch("http://localhost:5001/select-language", {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` },
        body: formData
      });

      if (response.ok) {
        window.location.href = "level.html";
      } else {
        const data = await response.json();
        alert(data.error || "Failed to save language.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Server error. Please try again.");
    }
  });
});