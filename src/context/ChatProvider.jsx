import { useState, useEffect} from "react";
import { ChatContext } from "./ChatContext";
import { getChatSessions } from "../api/chat"; // ✅ use camelCase for consistency
import { useAuth } from "../hooks/AuthHook";

export const ChatProvider = ({ children }) => {
  const [chatSessions, setChatSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuth();

  const fetchSessions = async () => {
    try {
      const res = await getChatSessions();
      console.log("Amey logged getSessions: ",res);
      setChatSessions(res.data.chat_sessions || []);
    } catch (err) {
      console.error("Failed to fetch chat sessions:", err);
      setChatSessions([]); // fallback to empty array
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchSessions();
    } else {
      setChatSessions([]);
      setLoading(false);
    }
  }, [isAuthenticated]);

  return (
    <ChatContext.Provider
      value={{ chatSessions, loading, refreshChatSessions: fetchSessions }}
    >
      {children}
    </ChatContext.Provider>
  );
};

