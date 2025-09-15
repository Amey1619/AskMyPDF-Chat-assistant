import { useNavigate } from "react-router-dom";
import { useChat } from "../hooks/ChatHook";

function Home() {
  const { chatSessions } = useChat();
  const navigate = useNavigate();

  const handleSessionClick = (session) => {
    if (!session.pdf?.hash) {
      alert("This session has no associated PDF.");
      return;
    }

    // Save details in localStorage
    localStorage.setItem(
      "active_chat_session",
      JSON.stringify({
        session_id: session.id,
        pdf_id: session.pdf.id,
        pdf_hash: session.pdf.hash,
        pdf_name: session.pdf.name,
      })
    );

    navigate(`/chat/${session.id}`);
  };

  const handleNewChat = () => navigate("/new-chat");

  const validSessions =
    chatSessions?.filter((session) => session.pdfId && session.pdf?.hash) || [];
  console.log("Amey loggs valid: ", validSessions);
  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h2 style={styles.heading}>Chat Sessions</h2>
        <button style={styles.button} onClick={handleNewChat}>
          Start New Chat
        </button>
      </header>

      {validSessions.length === 0 ? (
        <div style={styles.noSessionContainer}>
          <h3>No valid chat sessions found</h3>
        </div>
      ) : (
        validSessions.map((session) => (
          <SessionCard
            key={session.id}
            session={session}
            onClick={() => handleSessionClick(session)}
          />
        ))
      )}
    </div>
  );
}

const SessionCard = ({ session, onClick }) => (
  <div style={styles.cardContainer} onClick={onClick}>
    <div style={styles.card}>
      <div style={styles.cardHeader}>
        <h3 style={styles.pdfName}>{session.pdf?.name || "Unnamed PDF"}</h3>
      </div>
      <div style={styles.cardBody}>
        <p style={styles.text}>
          <strong>PDF ID:</strong> {session.pdf?.id}
        </p>
      </div>
    </div>
  </div>
);

const styles = {
  container: {
    padding: "2rem",
    backgroundColor: "#f8f9fa",
    minHeight: "100vh",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "2rem",
  },
  heading: {
    fontSize: "2rem",
    color: "#333",
  },
  button: {
    padding: "0.6rem 1.2rem",
    backgroundColor: "#007bff",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontSize: "1rem",
    cursor: "pointer",
    transition: "background-color 0.3s ease",
  },
  cardContainer: {
    display: "flex",
    justifyContent: "center",
    marginBottom: "1.5rem",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: "12px",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
    width: "80%",
    maxWidth: "600px",
    padding: "1.5rem",
    cursor: "pointer",
    transition: "transform 0.3s ease, box-shadow 0.3s ease",
  },
  cardHeader: {
    marginBottom: "1rem",
  },
  pdfName: {
    fontSize: "1.2rem",
    fontWeight: "bold",
    color: "#007bff",
    margin: 0,
  },
  cardBody: {
    fontSize: "1rem",
    color: "#555",
  },
  text: {
    margin: "0.5rem 0",
    lineHeight: "1.5",
  },
  noSessionContainer: {
    padding: "2rem",
    textAlign: "center",
  },
};

export default Home;
