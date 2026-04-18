document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("access_token");
  const userId = localStorage.getItem("user_id");

  if (!token || !userId) {
    window.location.href = "signin.html";
    return;
  }

  let selectedLevel = null;
  const levelButtons = document.querySelectorAll("#levelOptions button");
  const finishBtn = document.getElementById("finishBtn");

  levelButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      levelButtons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      selectedLevel = btn.dataset.value;
      finishBtn.disabled = false;
    });
  });

  finishBtn.addEventListener("click", async () => {
    if (!selectedLevel) return;

    const formData = new FormData();
    formData.append("user_id", userId);
    formData.append("level", selectedLevel);

    try {
      const response = await fetch("http://localhost:5001/select-level", {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` },
        body: formData
      });

      if (response.ok) {
        window.location.href = "dashboard.html";
      } else {
        const data = await response.json();
        alert(data.error || "Failed to save level.");
      }
    } catch (error) {
      console.error("Submission error:", error);
      alert("Server error. Please try again.");
    }
  });
});