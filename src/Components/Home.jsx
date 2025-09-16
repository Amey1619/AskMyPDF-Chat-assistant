import { useNavigate } from "react-router-dom";
import { useChat } from "../hooks/ChatHook";
import { Plus, FileText, MessageCircle } from "lucide-react";

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
  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-300 to-yellow-500 p-4 md:p-8">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 bg-white rounded-2xl p-6 shadow-xl border border-yellow-200">
        <div className="mb-4 md:mb-0">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            Your Chat Sessions
          </h2>
          <p className="text-gray-600">
            Continue your conversations with your PDFs
          </p>
        </div>
        <button
          className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-full font-semibold hover:from-blue-700 hover:to-blue-800 transition-all transform hover:scale-105 shadow-lg hover:shadow-xl"
          onClick={handleNewChat}
        >
          <Plus size={20} />
          <span>Start New Chat</span>
        </button>
      </header>

      {/* Content */}
      <div className="max-w-4xl mx-auto">
        {validSessions.length === 0 ? (
          <div className="text-center bg-white rounded-2xl p-12 shadow-xl border border-yellow-200">
            <div className="w-20 h-20 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <MessageCircle size={40} className="text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-4">
              No Chat Sessions Yet
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              You haven't started any conversations with your PDFs yet. Upload a
              PDF and start chatting to see your sessions here.
            </p>
            <button
              onClick={handleNewChat}
              className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-full font-semibold hover:from-blue-700 hover:to-blue-800 transition-all transform hover:scale-105 shadow-lg"
            >
              <Plus size={20} />
              <span>Create Your First Chat</span>
            </button>
          </div>
        ) : (
          <div className="grid gap-6 md:gap-8">
            {validSessions.map((session) => (
              <SessionCard
                key={session.id}
                session={session}
                onClick={() => handleSessionClick(session)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const SessionCard = ({ session, onClick }) => (
  <div
    className="bg-white rounded-2xl p-6 shadow-xl border border-yellow-200 cursor-pointer transform transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl group"
    onClick={onClick}
  >
    <div className="flex items-start space-x-4">
      {/* PDF Icon */}
      <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:from-blue-700 group-hover:to-blue-800 transition-all">
        <FileText size={24} className="text-white" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-xl font-bold text-gray-800 group-hover:text-blue-700 transition-colors truncate">
            {session.pdf?.name || "Unnamed PDF"}
          </h3>
          <div className="ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
              <MessageCircle size={16} className="text-gray-800" />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-sm text-gray-600">
            <span className="font-medium text-gray-700">PDF ID:</span>{" "}
            {session.pdf?.id}
          </p>
          <p className="text-sm text-gray-600">
            <span className="font-medium text-gray-700">Session:</span> #
            {session.id}
          </p>
        </div>

        {/* Action Hint */}
        <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
          <p className="text-sm text-blue-600 font-medium">
            Click to continue conversation →
          </p>
        </div>
      </div>
    </div>
  </div>
);

export default Home;