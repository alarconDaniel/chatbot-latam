import { useMemo, useState } from "react";
import { askChatbot } from "../services/chatApi";

const containerStyle = {
  width: "100%",
  maxWidth: "420px",
  height: "560px",
  border: "1px solid #e5e7eb",
  borderRadius: "16px",
  display: "flex",
  flexDirection: "column",
  background: "#ffffff",
  boxShadow: "0 10px 30px rgba(0, 0, 0, 0.08)",
  overflow: "hidden",
  fontFamily: "Inter, system-ui, sans-serif",
};

const headerStyle = {
  padding: "14px 16px",
  background: "#0f172a",
  color: "#ffffff",
  fontSize: "15px",
  fontWeight: 600,
};

const listStyle = {
  flex: 1,
  display: "flex",
  flexDirection: "column",
  gap: "10px",
  padding: "14px",
  overflowY: "auto",
  background: "#f8fafc",
};

const messageBaseStyle = {
  maxWidth: "85%",
  padding: "10px 12px",
  borderRadius: "14px",
  fontSize: "14px",
  lineHeight: 1.4,
  whiteSpace: "pre-wrap",
};

const botMessageStyle = {
  ...messageBaseStyle,
  alignSelf: "flex-start",
  background: "#e2e8f0",
  color: "#0f172a",
};

const userMessageStyle = {
  ...messageBaseStyle,
  alignSelf: "flex-end",
  background: "#2563eb",
  color: "#ffffff",
};

const typingStyle = {
  fontSize: "13px",
  color: "#475569",
  fontStyle: "italic",
};

const footerStyle = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
  padding: "12px",
  borderTop: "1px solid #e5e7eb",
  background: "#ffffff",
};

const inputStyle = {
  flex: 1,
  border: "1px solid #cbd5e1",
  borderRadius: "10px",
  padding: "10px 12px",
  fontSize: "14px",
  outline: "none",
};

const buttonStyle = {
  border: "none",
  borderRadius: "10px",
  background: "#0f172a",
  color: "#ffffff",
  padding: "10px 14px",
  fontSize: "14px",
  fontWeight: 600,
  cursor: "pointer",
};

export default function ChatWidget({
  apiBaseUrl = "http://localhost:8000",
  country = "latam",
  sessionId,
  title = "Asistente Virtual",
  placeholder = "Escribe tu mensaje...",
}) {
  const [messages, setMessages] = useState([
    {
      id: "welcome",
      role: "bot",
      text: "¡Hola! Soy tu asistente. ¿En qué te puedo ayudar hoy?",
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState("");

  const resolvedSessionId = useMemo(() => {
    if (sessionId) return sessionId;
    if (typeof crypto !== "undefined" && crypto.randomUUID) {
      return crypto.randomUUID();
    }

    return `session-${Date.now()}`;
  }, [sessionId]);

  const handleSendMessage = async () => {
    const trimmedMessage = input.trim();

    if (!trimmedMessage || loading) return;

    const userMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      text: trimmedMessage,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const result = await askChatbot({
        message: trimmedMessage,
        country,
        sessionId: resolvedSessionId,
        apiBaseUrl,
      });

      const botMessage = {
        id: `bot-${Date.now()}`,
        role: "bot",
        text: result.answer || "No recibí respuesta del backend.",
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      const fallbackError = {
        id: `error-${Date.now()}`,
        role: "bot",
        text:
          error.message || "Hubo un problema conectando con el backend del chatbot.",
      };

      setMessages((prev) => [...prev, fallbackError]);
    } finally {
      setLoading(false);
    }
  };

  const onKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <section style={containerStyle}>
      <header style={headerStyle}>{title}</header>

      <div style={listStyle}>
        {messages.map((message) => (
          <article
            key={message.id}
            style={message.role === "user" ? userMessageStyle : botMessageStyle}
          >
            {message.text}
          </article>
        ))}

        {loading && <span style={typingStyle}>escribiendo...</span>}
      </div>

      <footer style={footerStyle}>
        <input
          style={inputStyle}
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          aria-label="Mensaje"
        />

        <button
          type="button"
          style={buttonStyle}
          onClick={handleSendMessage}
          disabled={loading}
        >
          Enviar
        </button>
      </footer>
    </section>
  );
}