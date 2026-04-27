import React from "react";
import ChatWidget from "./components/ChatWidget.jsx";

const pageStyle = {
  minHeight: "100vh",
  margin: 0,
  padding: "32px 16px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background:
    "radial-gradient(circle at top left, #dbeafe 0, transparent 28%), radial-gradient(circle at bottom right, #e0e7ff 0, transparent 28%), #f8fafc",
};

export default function App() {
  return (
    <main style={pageStyle}>
      <ChatWidget
        apiBaseUrl="http://127.0.0.1:8000"
        country="latam"
        title="Asistente Virtual"
        placeholder="Escribe tu mensaje..."
      />
    </main>
  );
}
