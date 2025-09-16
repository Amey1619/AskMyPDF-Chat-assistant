// src/pages/ChatPage.jsx
import { useEffect, useRef, useState, useCallback } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import {
  Send,
  Bot,
  User,
  MessageCircle,
  AlertCircle,
  Wifi,
  WifiOff,
} from "lucide-react";

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
      <div className="min-h-screen bg-gradient-to-br from-yellow-300 to-yellow-500 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl p-8 shadow-xl border border-yellow-200 text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            Loading Chat
          </h3>
          <p className="text-gray-600">Preparing your conversation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-300 to-yellow-500 p-4">
      <div className="max-w-4xl mx-auto h-screen flex flex-col">
        {/* Header */}
        <div className="bg-white rounded-2xl p-6 mb-4 shadow-xl border border-yellow-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl flex items-center justify-center">
                <MessageCircle size={24} className="text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  {pdfName || "PDF Chat"}
                </h1>
                <p className="text-sm text-gray-600">
                  AI-powered document conversation
                </p>
              </div>
            </div>

            {/* Connection Status */}
            <div className="flex items-center space-x-2">
              {wsConnected ? (
                <Wifi size={20} className="text-green-600" />
              ) : (
                <WifiOff size={20} className="text-red-600" />
              )}
              <span
                className={`text-sm font-medium ${
                  wsConnected ? "text-green-600" : "text-red-600"
                }`}
              >
                {wsConnected ? "Connected" : "Disconnected"}
              </span>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-4 shadow-lg">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <AlertCircle size={16} className="text-red-600" />
              </div>
              <div>
                <p className="text-red-800 font-medium">Connection Issue</p>
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Chat Messages */}
        <div className="flex-1 bg-white rounded-2xl shadow-xl border border-yellow-200 overflow-hidden mb-4">
          <div
            ref={chatboxRef}
            className="h-full overflow-y-auto p-6 bg-gradient-to-b from-gray-50 to-white"
          >
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MessageCircle size={32} className="text-gray-800" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    Start Your Conversation
                  </h3>
                  <p className="text-gray-600">
                    Ask any question about your PDF document
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex ${
                      msg.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-3xl flex ${
                        msg.role === "user" ? "flex-row-reverse" : "flex-row"
                      } items-start space-x-3`}
                    >
                      {/* Avatar */}
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                          msg.role === "user"
                            ? "bg-gradient-to-r from-blue-600 to-blue-700 ml-3"
                            : "bg-gradient-to-r from-yellow-400 to-yellow-500 mr-3"
                        }`}
                      >
                        {msg.role === "user" ? (
                          <User size={20} className="text-white" />
                        ) : (
                          <Bot size={20} className="text-gray-800" />
                        )}
                      </div>

                      {/* Message Content */}
                      <div
                        className={`p-4 rounded-2xl shadow-sm ${
                          msg.role === "user"
                            ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-tr-md"
                            : "bg-white text-gray-800 border border-gray-200 rounded-tl-md"
                        }`}
                      >
                        <div className="mb-1">
                          <span className="text-xs font-semibold opacity-75">
                            {msg.role === "user" ? "You" : "AI Assistant"}
                          </span>
                        </div>
                        <div className="leading-relaxed">
                          {msg.role === "assistant" ? (
                            <div className="prose prose-sm max-w-none prose-headings:text-gray-800 prose-p:text-gray-700 prose-strong:text-gray-800 prose-code:text-blue-600 prose-code:bg-blue-50 prose-code:px-1 prose-code:rounded">
                              <ReactMarkdown>{msg.content}</ReactMarkdown>
                            </div>
                          ) : (
                            <span>{msg.content}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Input Area */}
        <div className="bg-white rounded-2xl p-4 shadow-xl border border-yellow-200">
          <div className="flex space-x-3">
            <input
              type="text"
              placeholder="Ask anything about your PDF..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={!wsConnected}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors bg-gray-50 focus:bg-white"
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || !wsConnected}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all transform hover:scale-105 shadow-lg flex items-center space-x-2"
            >
              <Send size={18} />
              <span className="hidden sm:inline">Send</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;