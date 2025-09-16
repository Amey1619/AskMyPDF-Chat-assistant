// src/pages/ChatPage.jsx
import { useEffect, useRef, useState, useCallback } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { API_BASE_URL, WEBSOCKET_URL } from "../api/auth";

const ChatPage = () => {
  const { sessionId } = useParams();
  const [pdfId, setPdfId] = useState(null);
  const [pdfHash, setPdfHash] = useState(null);
  const [pdfName, setPdfName] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [wsConnected, setWsConnected] = useState(false);
  const [error, setError] = useState(null);

  const wsRef = useRef(null);
  const chatboxRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const reconnectAttemptsRef = useRef(0);
  // Initialize session data
  useEffect(() => {
    const initializeSession = () => {
      try {
        const sessionDataStr = localStorage.getItem("active_chat_session");
        if (!sessionDataStr) {
          throw new Error("No active session in localStorage");
        }
        const sessionData = JSON.parse(sessionDataStr);

        setPdfId(sessionData.pdf_id);
        setPdfHash(sessionData.pdf_hash);
        setPdfName(sessionData.pdf_name);

        return sessionId;
      } catch (err) {
        console.error("Error initializing session:", err);
        setError("Failed to initialize session");
        return null;
      }
    };

    const sId = initializeSession();
    if (sId) {
      fetchChatHistory(sId);
    }
  }, [sessionId]);

  // Fetch chat history
  const fetchChatHistory = useCallback(async (sId) => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(`${API_BASE_URL}/chat_data/history`, {
        params: { sessionId: sId },
        withCredentials: true,
        timeout: 10000,
      });
      const chatHistory = response.data?.data?.chat_history || [];
      setMessages(chatHistory);
    } catch (err) {
      console.error("Error fetching chat history:", err);
      setError(err.response?.data?.message || "Failed to load chat history");
      setMessages([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // WebSocket connection
  const connectWebSocket = useCallback(() => {
    if (!sessionId || !pdfId) return;

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.close();
    }

    try {
      const ws = new WebSocket(`${WEBSOCKET_URL}`);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log("WebSocket connected");
        setWsConnected(true);
        setError(null);
        reconnectAttemptsRef.current = 0;

        ws.send(
          JSON.stringify({
            session_id: sessionId,
            pdf_id: pdfId,
            is_legal_doc: false,
          })
        );
      };

      ws.onmessage = (event) => {
        const data = event.data;

        if (data === "__END__") return;

        setMessages((prevMessages) => {
          const lastMessage = prevMessages[prevMessages.length - 1];
          if (lastMessage && lastMessage.role === "assistant") {
            return [
              ...prevMessages.slice(0, -1),
              { ...lastMessage, content: lastMessage.content + data },
            ];
          } else {
            return [...prevMessages, { role: "assistant", content: data }];
          }
        });
      };

      ws.onerror = (err) => {
        console.error("WebSocket error:", err);
        setError("Connection error occurred");
        setWsConnected(false);
      };

      ws.onclose = (event) => {
        console.log("WebSocket closed:", event.code, event.reason);
        setWsConnected(false);

        if (event.code !== 1000 && reconnectAttemptsRef.current < 5) {
          reconnectAttemptsRef.current++;
          const delay = Math.min(
            1000 * Math.pow(2, reconnectAttemptsRef.current),
            30000
          );
          console.log(
            `Reconnecting in ${delay}ms... (attempt ${reconnectAttemptsRef.current})`
          );
          reconnectTimeoutRef.current = setTimeout(() => {
            connectWebSocket();
          }, delay);
        } else {
          setError("Connection lost. Please refresh the page.");
        }
      };
    } catch (err) {
      console.error("Failed to create WebSocket connection:", err);
      setError("Failed to establish connection");
      setWsConnected(false);
    }
  }, [sessionId, pdfId]);

  // Initialize WebSocket
  useEffect(() => {
    if (sessionId && !loading) {
      connectWebSocket();
    }
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [sessionId, loading, connectWebSocket]);


  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (chatboxRef.current) {
      chatboxRef.current.scrollTop = chatboxRef.current.scrollHeight;
    }
  }, [messages]);

  // Send message with validation
  const sendMessage = useCallback(() => {
    if (
      !input.trim() ||
      !wsRef.current ||
      wsRef.current.readyState !== WebSocket.OPEN
    ) {
      if (!wsConnected) {
        setError(
          "Connection lost. Please wait for reconnection or refresh the page."
        );
      }
      return;
    }

    const userMessage = { role: "user", content: input.trim() };

    // Add user message immediately
    setMessages((prev) => [...prev, userMessage]);

    // Send to WebSocket
    try {
      wsRef.current.send(
        JSON.stringify({
          message: input.trim(),
          pdf_hash: pdfHash,
        })
      );

      // Clear input and prepare for assistant response
      setInput("");

      // Pre-create empty assistant message for streaming
      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);
    } catch (err) {
      console.error("Failed to send message:", err);
      setError("Failed to send message");
    }
  }, [input, wsConnected, pdfHash]);

  // Handle Enter key press
  const handleKeyPress = useCallback(
    (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    },
    [sendMessage]
  );

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading chat history...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 h-screen flex flex-col">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">
          Chat with: {pdfName}
        </h1>

        {/* Connection Status */}
        <div className="flex justify-center items-center space-x-2">
          <div
            className={`w-3 h-3 rounded-full ${
              wsConnected ? "bg-green-500" : "bg-red-500"
            }`}
          ></div>
          <span
            className={`text-sm ${
              wsConnected ? "text-green-600" : "text-red-600"
            }`}
          >
            {wsConnected ? "Connected" : "Disconnected"}
          </span>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          <div className="flex items-center">
            <svg
              className="w-5 h-5 mr-2"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            {error}
          </div>
        </div>
      )}

      {/* Chat Messages */}
      <div
        ref={chatboxRef}
        className="flex-1 border border-gray-300 rounded-lg p-4 bg-gray-50 overflow-y-auto mb-4 shadow-inner"
      >
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <svg
                className="w-12 h-12 mx-auto mb-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
              <p>No messages yet. Start the conversation!</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`max-w-full ${
                  msg.role === "user" ? "ml-auto" : "mr-auto"
                }`}
              >
                <div
                  className={`p-3 rounded-lg break-words ${
                    msg.role === "user"
                      ? "bg-blue-600 text-white rounded-br-sm max-w-xs ml-auto"
                      : "bg-white text-gray-800 rounded-bl-sm shadow-sm border border-gray-200"
                  }`}
                >
                  <div className="flex items-start space-x-2">
                    <strong className="text-sm font-semibold">
                      {msg.role === "user" ? "You" : "AI"}:
                    </strong>
                  </div>
                  <div className="mt-1">
                    {msg.role === "assistant" ? (
                      <div className="prose prose-sm max-w-none">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
                    ) : (
                      <span>{msg.content}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="flex space-x-3">
        <input
          type="text"
          placeholder="Type your question..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={!wsConnected}
          className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
        />
        <button
          onClick={sendMessage}
          disabled={!input.trim() || !wsConnected}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatPage;


