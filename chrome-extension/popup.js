document.addEventListener("DOMContentLoaded", async () => {
  const statusEl = document.getElementById("status");
  const claudeBtn = document.getElementById("openClaudeBtn");
  const geminiBtn = document.getElementById("openGeminiBtn");

  let recommendedEmail = "";

  try {
    const res = await fetch("http://localhost:3002/api/recommended");
    const data = await res.json();
    
    if (data.recommendedAccount) {
      recommendedEmail = data.recommendedAccount.email;
      statusEl.textContent = `Recommended: ${recommendedEmail}`;
      statusEl.className = "success";
    } else {
      statusEl.textContent = "No accounts ready!";
      statusEl.className = "error";
    }
  } catch (err) {
    statusEl.textContent = "Ensure local app is running on port 3000.";
    statusEl.className = "error";
  }

  function openIDE(urlBase) {
    // If you use multiple Chrome profiles, the extension just opens a new tab.
    // For automatic login, email hints can sometimes be passed in URL (like Google auth).
    
    const url = new URL(urlBase);
    
    // Some IDEs allow passing login_hint
    // url.searchParams.append("login_hint", recommendedEmail);

    chrome.tabs.create({ url: url.toString() });
  }

  claudeBtn.addEventListener("click", () => openIDE("https://claude.ai/new"));
  geminiBtn.addEventListener("click", () => openIDE("https://gemini.google.com/app"));
});
