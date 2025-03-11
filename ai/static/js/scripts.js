let currentSessionId = "{{ active_session.id|default:'null' }}";

// Auto-resize textarea
const textarea = document.getElementById("question");
textarea.addEventListener("input", function () {
  this.style.height = "auto";
  this.style.height = this.scrollHeight + "px";
});

function toggleSidebar() {
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("sidebarOverlay");

  if (
    sidebar.classList.contains("w-0") ||
    sidebar.classList.contains("md:w-72")
  ) {
    sidebar.classList.remove("w-0", "md:w-72");
    sidebar.classList.add("w-72");
    overlay.classList.remove("hidden");
  } else {
    sidebar.classList.remove("w-72");
    sidebar.classList.add("w-0", "md:w-72");
    overlay.classList.add("hidden");
  }
}

document
  .getElementById("toggleSidebar")
  .addEventListener("click", toggleSidebar);

function startNewChat() {
  currentSessionId = null;
  document.getElementById("answer").innerHTML = "";
  window.history.pushState({}, "", "{% url 'ai-home' %}");

  // On mobile, close the sidebar after selecting new chat
  if (window.innerWidth < 768) {
    toggleSidebar();
  }
}

function handleEnter(event) {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault(); // Prevents newline in textarea
    sendQuestion();
  }
}

function formatAIResponse(text) {
  if (!text) return "No answer received from AI.";

  // Replace URLs with clickable links
  text = text.replace(
    /(https?:\/\/[^\s]+)/g,
    '<a href="$1" target="_blank" class="text-blue-200 underline">$1</a>'
  );

  // Handle code blocks with ```
  text = text.replace(
    /```(\w*)([\s\S]*?)```/g,
    function (match, language, code) {
      return `<pre><code class="language-${language}">${code.trim()}</code></pre>`;
    }
  );

  // Handle inline code with `
  text = text.replace(/`([^`]+)`/g, "<code>$1</code>");

  // Convert line breaks to paragraphs, but preserve existing HTML
  const paragraphs = text.split(/\n\n+/);
  const formatted = paragraphs
    .map((p) => {
      // Skip if paragraph starts with HTML tag
      if (p.trim().startsWith("<")) return p;

      // Replace single newlines with <br>
      const withLineBreaks = p.replace(/\n/g, "<br>");
      return `<p>${withLineBreaks}</p>`;
    })
    .join("");

  return formatted;
}

function sendQuestion() {
  const questionInput = document.getElementById("question");
  const answerBox = document.getElementById("answer");
  const thinkingIndicator = document.getElementById("thinkingIndicator");
  const question = questionInput.value.trim();

  if (!question) {
    answerBox.innerHTML += `<p class="text-red-600 text-center mb-3">Please enter a question.</p>`;
    return;
  }

  // Append user's question (Right aligned)
  answerBox.innerHTML += `
            <div class="flex justify-end mb-3">
                <div class="bg-orange-500 text-black px-4 py-2 rounded-lg max-w-xs md:max-w-md lg:max-w-lg text-right shadow-md">
                    ${question}
                </div>
            </div>
        `;

  // Clear input field immediately after submission
  questionInput.value = "";
  questionInput.style.height = "auto";

  // Show thinking indicator
  thinkingIndicator.classList.remove("hidden");
  answerBox.appendChild(thinkingIndicator);

  // Scroll to the bottom
  answerBox.scrollTop = answerBox.scrollHeight;

  // Prepare data payload
  const data = {
    question: question,
  };

  // Include session ID if we're in an existing session
  if (currentSessionId && currentSessionId !== "null") {
    data.session_id = currentSessionId;
  } else {
    data.new_session_title =
      question.length > 50 ? question.substring(0, 50) + "..." : question;
  }

  fetch("{% url 'ai-home' %}", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-CSRFToken": "{{ csrf_token }}",
    },
    body: JSON.stringify(data),
  })
    .then((response) => response.json())
    .then((data) => {
      // Hide thinking indicator
      thinkingIndicator.classList.add("hidden");

      // Save the session ID for subsequent messages
      if (data.session_id) {
        currentSessionId = data.session_id;

        // Update URL without reloading the page
        const newUrl = `{% url 'ai-home' %}?session=${data.session_id}`;
        window.history.pushState({}, "", newUrl);

        // If this is a new session, and we're on mobile, refresh to show in sidebar
        if (!document.referrer.includes(`session=${data.session_id}`)) {
          setTimeout(() => {
            window.location.href = newUrl;
          }, 1000);
        }
      }

      // Format the AI response
      const formattedAnswer = formatAIResponse(data.answer);

      // Append AI's response (Left aligned)
      answerBox.innerHTML += `
                <div class="flex justify-start mb-3">
                    <div class="bg-orange-500 text-white px-4 py-2 rounded-lg max-w-xs md:max-w-md lg:max-w-lg text-left shadow-md ai-message">
                        <div class="ai-message-content whitespace-pre-wrap">${formattedAnswer}</div>
                    </div>
                </div>
            `;

      // Scroll to the bottom
      answerBox.scrollTop = answerBox.scrollHeight;
    })
    .catch((error) => {
      // Hide thinking indicator
      thinkingIndicator.classList.add("hidden");

      console.error("Error:", error);
      answerBox.innerHTML += `
                <div class="flex justify-start mb-3">
                    <div class="bg-red-500 text-white px-4 py-2 rounded-lg max-w-xs md:max-w-md text-left shadow-md">
                        There was an error processing your request.
                    </div>
                </div>
            `;

      // Scroll to the bottom
      answerBox.scrollTop = answerBox.scrollHeight;
    });
}

// Check if mobile sidebar should be open
function checkSidebarState() {
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("sidebarOverlay");

  if (window.innerWidth >= 768) {
    sidebar.classList.add("md:w-72");
    overlay.classList.add("hidden");
  } else {
    sidebar.classList.add("w-0");
    sidebar.classList.remove("w-72");
    overlay.classList.add("hidden");
  }
}

// Adjust textarea height on load
function adjustTextareaHeight() {
  const textarea = document.getElementById("question");
  textarea.style.height = "auto";
  textarea.style.height = textarea.scrollHeight + "px";
}

// Initial setup on page load
document.addEventListener("DOMContentLoaded", function () {
  const answerBox = document.getElementById("answer");
  answerBox.scrollTop = answerBox.scrollHeight;
  checkSidebarState();
  adjustTextareaHeight();

  // Add resize listener for responsive adjustments
  window.addEventListener("resize", checkSidebarState);
});
