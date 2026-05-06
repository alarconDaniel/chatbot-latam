import React, { useEffect, useMemo, useRef, useState } from "react";
import { askChatbot } from "../services/chatApi";

const containerStyle = {
  width: "100%",
  maxWidth: "420px",
  height: "620px",
  border: "1px solid #e5e7eb",
  borderRadius: "22px",
  display: "flex",
  flexDirection: "column",
  background: "#ffffff",
  boxShadow: "0 18px 45px rgba(15, 23, 42, 0.16)",
  overflow: "hidden",
  fontFamily: "Inter, system-ui, sans-serif",
};

const headerStyle = {
  padding: "16px",
  background: "linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)",
  color: "#ffffff",
  display: "flex",
  alignItems: "center",
  gap: "12px",
};

const botAvatarStyle = {
  width: "38px",
  height: "38px",
  borderRadius: "50%",
  background: "#ffffff",
  color: "#1e3a8a",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontWeight: 800,
  fontSize: "16px",
  flexShrink: 0,
};

const headerTextStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "2px",
  flex: 1,
};

const titleStyle = {
  fontSize: "15px",
  fontWeight: 700,
};

const statusStyle = {
  fontSize: "12px",
  color: "#dbeafe",
  display: "flex",
  alignItems: "center",
  gap: "6px",
};

const onlineDotStyle = {
  width: "8px",
  height: "8px",
  borderRadius: "50%",
  background: "#22c55e",
  display: "inline-block",
};

const closeButtonStyle = {
  width: "32px",
  height: "32px",
  borderRadius: "999px",
  border: "none",
  background: "rgba(255, 255, 255, 0.14)",
  color: "#ffffff",
  fontSize: "20px",
  fontWeight: 700,
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  lineHeight: 1,
};

const listStyle = {
  flex: 1,
  display: "flex",
  flexDirection: "column",
  gap: "12px",
  padding: "16px",
  overflowY: "auto",
  background:
    "radial-gradient(circle at top left, #eef2ff 0, transparent 28%), #f8fafc",
};

const rowBaseStyle = {
  display: "flex",
  alignItems: "flex-end",
  gap: "8px",
};

const botRowStyle = {
  ...rowBaseStyle,
  justifyContent: "flex-start",
};

const userRowStyle = {
  ...rowBaseStyle,
  justifyContent: "flex-end",
};

const smallAvatarStyle = {
  width: "28px",
  height: "28px",
  borderRadius: "50%",
  background: "#1e3a8a",
  color: "#ffffff",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "12px",
  fontWeight: 700,
  flexShrink: 0,
};

const bubbleWrapperStyle = {
  maxWidth: "78%",
  display: "flex",
  flexDirection: "column",
  gap: "4px",
};

const messageBaseStyle = {
  padding: "11px 13px",
  borderRadius: "16px",
  fontSize: "14px",
  lineHeight: 1.45,
  whiteSpace: "pre-wrap",
  wordBreak: "break-word",
};

const botMessageStyle = {
  ...messageBaseStyle,
  background: "#ffffff",
  color: "#0f172a",
  borderBottomLeftRadius: "5px",
  boxShadow: "0 2px 8px rgba(15, 23, 42, 0.08)",
};

const userMessageStyle = {
  ...messageBaseStyle,
  background: "#2563eb",
  color: "#ffffff",
  borderBottomRightRadius: "5px",
  boxShadow: "0 2px 8px rgba(37, 99, 235, 0.2)",
};

const errorMessageStyle = {
  ...messageBaseStyle,
  background: "#fee2e2",
  color: "#991b1b",
  borderBottomLeftRadius: "5px",
};

const timeStyle = {
  fontSize: "11px",
  color: "#94a3b8",
  padding: "0 4px",
};

const typingBubbleStyle = {
  ...botMessageStyle,
  display: "flex",
  alignItems: "center",
  gap: "4px",
  width: "fit-content",
};

const dotStyle = {
  width: "6px",
  height: "6px",
  borderRadius: "50%",
  background: "#64748b",
  display: "inline-block",
};

const faqContainerStyle = {
  display: "flex",
  flexWrap: "wrap",
  gap: "7px",
  marginTop: "6px",
};

const faqButtonStyle = {
  border: "1px solid #bfdbfe",
  background: "#eff6ff",
  color: "#1e3a8a",
  borderRadius: "999px",
  padding: "7px 10px",
  fontSize: "12px",
  fontWeight: 600,
  cursor: "pointer",
};

const disabledFaqButtonStyle = {
  ...faqButtonStyle,
  opacity: 0.6,
  cursor: "not-allowed",
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
  borderRadius: "999px",
  padding: "12px 14px",
  fontSize: "14px",
  outline: "none",
  background: "#f8fafc",
};

const buttonStyle = {
  border: "none",
  borderRadius: "999px",
  background: "#0f172a",
  color: "#ffffff",
  padding: "12px 16px",
  fontSize: "14px",
  fontWeight: 700,
  cursor: "pointer",
};

const disabledButtonStyle = {
  ...buttonStyle,
  opacity: 0.55,
  cursor: "not-allowed",
};

const frequentQuestions = [
  "¿Qué es Latinoamérica Comparte?",
  "¿Qué es Colombia Comparte?",
  "¿Qué es EDIFICA?",
  "¿Cómo funciona EDIFICA?",
  "¿Qué es NODUS?",
  "¿Cómo puedo apoyar?",
];

function formatTime() {
  return new Intl.DateTimeFormat("es-CO", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date());
}

function TypingIndicator() {
  return (
    <div style={botRowStyle}>
      <div style={smallAvatarStyle}>AI</div>

      <div style={typingBubbleStyle}>
        <span style={dotStyle}></span>
        <span style={dotStyle}></span>
        <span style={dotStyle}></span>
      </div>
    </div>
  );
}

export default function ChatWidget({
  apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000",
  country = "co",
  sessionId,
  title = "Asistente Virtual",
  placeholder = "Escribe tu mensaje...",
  onClose,
}) {
  const [messages, setMessages] = useState([
    {
      id: "welcome",
      role: "bot",
      text: "¡Hola! Soy tu asistente virtual. ¿En qué puedo ayudarte hoy?",
      time: formatTime(),
    },
  ]);

  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState("");
  const [isOpen, setIsOpen] = useState(true);

  const listRef = useRef(null);
  const inputRef = useRef(null);

  const resolvedSessionId = useMemo(() => {
    if (sessionId) return sessionId;

    if (typeof crypto !== "undefined" && crypto.randomUUID) {
      return crypto.randomUUID();
    }

    return `session-${Date.now()}`;
  }, [sessionId]);

  const focusInput = () => {
    window.requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
  };

  useEffect(() => {
    focusInput();
  }, []);

  useEffect(() => {
    if (!listRef.current) return;
    listRef.current.scrollTop = listRef.current.scrollHeight;
    focusInput();
  }, [messages, loading]);

  const handleClose = () => {
    setIsOpen(false);

    if (typeof onClose === "function") {
      onClose();
    }
  };

  const handleSendMessage = async (messageToSend) => {
    const trimmedMessage = (messageToSend ?? input).trim();

    if (!trimmedMessage || loading) return;

    const userMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      text: trimmedMessage,
      time: formatTime(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);
    focusInput();

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
        text: result?.answer || "No encontré una respuesta para mostrar.",
        time: formatTime(),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Error conectando con el backend:", error);

      const fallbackError = {
        id: `error-${Date.now()}`,
        role: "error",
        text: "No pude conectar con el servidor. Intenta de nuevo.",
        time: formatTime(),
      };

      setMessages((prev) => [...prev, fallbackError]);
    } finally {
      setLoading(false);
      focusInput();
    }
  };

  const handleFrequentQuestion = (question) => {
    handleSendMessage(question);
  };

  const onKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <section style={containerStyle}>
      <header style={headerStyle}>
        <div style={botAvatarStyle}>AI</div>

        <div style={headerTextStyle}>
          <div style={titleStyle}>{title}</div>

          <div style={statusStyle}>
            <span style={onlineDotStyle}></span>
            En línea
          </div>
        </div>

        <button
          type="button"
          style={closeButtonStyle}
          onClick={handleClose}
          aria-label="Cerrar chatbot"
          title="Cerrar"
        >
          ×
        </button>
      </header>

      <div ref={listRef} style={listStyle}>
        {messages.map((message, index) => {
          const isUser = message.role === "user";
          const isError = message.role === "error";
          const isLastMessage = index === messages.length - 1;
          const showFrequentQuestions = !isUser && isLastMessage && !loading;

          return (
            <div key={message.id} style={isUser ? userRowStyle : botRowStyle}>
              {!isUser && <div style={smallAvatarStyle}>AI</div>}

              <div style={bubbleWrapperStyle}>
                <article
                  style={
                    isUser
                      ? userMessageStyle
                      : isError
                        ? errorMessageStyle
                        : botMessageStyle
                  }
                >
                  {message.text}
                </article>

                <span
                  style={{
                    ...timeStyle,
                    alignSelf: isUser ? "flex-end" : "flex-start",
                  }}
                >
                  {message.time}
                </span>

                {showFrequentQuestions && (
                  <div style={faqContainerStyle}>
                    {frequentQuestions.map((question) => (
                      <button
                        key={question}
                        type="button"
                        style={loading ? disabledFaqButtonStyle : faqButtonStyle}
                        onClick={() => handleFrequentQuestion(question)}
                        disabled={loading}
                      >
                        {question}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {loading && <TypingIndicator />}
      </div>

      <footer style={footerStyle}>
        <input
          ref={inputRef}
          style={inputStyle}
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          aria-label="Mensaje"
          autoComplete="off"
        />

        <button
          type="button"
          style={loading ? disabledButtonStyle : buttonStyle}
          onClick={() => handleSendMessage()}
          disabled={loading}
        >
          Enviar
        </button>
      </footer>
    </section>
  );
}