import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { useMutation } from "@tanstack/react-query";
import "./App.css";

//!Function that must return a promise (useMutation)
const makeRequestAPI = async (prompt) => {
  const res = await axios.post(
    "https://vchat-backend-brfn.onrender.com/generate",
    {
      prompt,
    }
  );
  return res.data;
};

function App() {
  const [prompt, setPrompt] = useState("");
  const [copied, setCopied] = useState(false);
  const contentRef = useRef(null);

  //!mutation
  const mutation = useMutation({
    mutationFn: makeRequestAPI,
    mutationKey: ["gemini-ai-request"],
  });

  //!submit handler
  const submitHandler = (e) => {
    e.preventDefault();
    if (prompt.trim()) {
      mutation.mutate(prompt);
      setCopied(false);
    }
  };

  //!copy handler
  const copyToClipboard = () => {
    if (mutation.data) {
      navigator.clipboard.writeText(mutation.data);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Format the generated content with basic markdown-like syntax
  const formatContent = (content) => {
    if (!content) return "";

    // Process content to enhance readability
    // This is a simple example - could be expanded with more sophisticated parsing
    return (
      content
        // Process headings (# Heading)
        .replace(/^# (.+)$/gm, "<h1>$1</h1>")
        .replace(/^## (.+)$/gm, "<h2>$1</h2>")
        .replace(/^### (.+)$/gm, "<h3>$1</h3>")
        // Process lists
        .replace(/^- (.+)$/gm, "<li>$1</li>")
        // Process paragraphs
        .split("\n\n")
        .map((para) => (para.trim().startsWith("<") ? para : `<p>${para}</p>`))
        .join("")
    );
  };

  // Scroll to top of content when new content is generated
  useEffect(() => {
    if (contentRef.current && mutation.isSuccess) {
      contentRef.current.scrollTop = 0;
    }
  }, [mutation.data, mutation.isSuccess]);

  return (
    <div className="App">
      <header>Gemini AI Content Generator</header>
      <p>Enter a prompt and let Gemini AI craft a unique content for you.</p>
      <form className="App-form" onSubmit={submitHandler}>
        <label htmlFor="prompt">Enter your prompt:</label>
        <input
          id="prompt"
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Write a content about..."
          className="App-input"
        />
        <button
          className="App-button"
          type="submit"
          disabled={mutation.isPending}
        >
          {mutation.isPending ? "Generating..." : "Generate Content"}
        </button>
        <section className="App-response">
          {mutation.isPending && (
            <div className="loading-message">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="animate-spin mr-2"
              >
                <path
                  opacity="0.2"
                  d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2Z"
                  fill="currentColor"
                />
                <path
                  d="M12 22C17.5228 22 22 17.5228 22 12H20C20 16.4183 16.4183 20 12 20V22Z"
                  fill="currentColor"
                />
              </svg>
              Generating your content...
            </div>
          )}

          {mutation.isError && (
            <div className="error-message">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Error: {mutation.error.message}
            </div>
          )}

          {mutation.isSuccess && (
            <>
              <button
                className={`copy-button ${copied ? "copied" : ""}`}
                onClick={copyToClipboard}
                aria-label="Copy to clipboard"
              >
                {copied ? (
                  <>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Copied!
                  </>
                ) : (
                  <>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                    Copy
                  </>
                )}
              </button>
              <div className="content-container" ref={contentRef}>
                {/* Use dangerouslySetInnerHTML only for safe, controlled content */}
                {mutation.data ? (
                  <div
                    className="generated-content"
                    dangerouslySetInnerHTML={{
                      __html: formatContent(mutation.data),
                    }}
                  />
                ) : (
                  <div className="generated-content">
                    No content generated yet.
                  </div>
                )}
              </div>
            </>
          )}
        </section>
      </form>
    </div>
  );
}

export default App;
