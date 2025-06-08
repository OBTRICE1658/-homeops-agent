function showWelcomeMessage() {
  const chatBox = document.getElementById("chat-box");
  if (!chatBox) {
    console.error("❌ chat-box not found");
    return;
  }

  const intro = document.createElement("div");
  intro.className = "agent message";
  intro.innerHTML = `<span class="sender">HomeOps:</span> Hi. I'm HomeOps, your persoanl chief of staff.I specialize in mental clutter, invisible labor, and things you didn’t ask to be responsible for. What’s on deck?`;
  chatBox.appendChild(intro);
}

document.addEventListener("DOMContentLoaded", () => {
  showWelcomeMessage();

  // Also show the welcome message if user toggles into the Chat view
  const chatButton = document.querySelector('[data-view="chat"]');
  if (chatButton) {
    chatButton.addEventListener("click", () => {
      setTimeout(() => {
        const alreadyWelcomed = document.querySelector(".agent.message");
        if (!alreadyWelcomed) showWelcomeMessage();
      }, 100);
    });
  }
});

document.getElementById("chat-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const input = document.getElementById("user-input");
  const chatBox = document.getElementById("chat-box");
  const message = input.value.trim();
  if (!message) return;

  const userMsg = document.createElement("div");
  userMsg.className = "user message";
  userMsg.innerHTML = `<span class="sender">You:</span> ${message}`;
  chatBox.appendChild(userMsg);
  input.value = "";

  try {
    const res = await fetch("/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, user_id: "user_123" })
    });

    const data = await res.json();
    const reply = data.reply || "🤖 No reply received.";

    const botMsg = document.createElement("div");
    botMsg.className = "agent message";
    botMsg.innerHTML = `<span class="sender">HomeOps:</span> ${reply}`;
    chatBox.appendChild(botMsg);
  } catch (error) {
    const errorMsg = document.createElement("div");
    errorMsg.className = "agent message";
    errorMsg.innerHTML = `<span class="sender">Error:</span> Something went wrong.`;
    chatBox.appendChild(errorMsg);
    console.error("❌ Chat error:", error);
  }

  chatBox.scrollTop = chatBox.scrollHeight;
});
