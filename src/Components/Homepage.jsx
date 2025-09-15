import { useAuth } from "../hooks/AuthHook";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AlertModal from "./Alert";
const Homepage = () => {
  const { isAuthenticated } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();
  const handleProtectedClick = (path) => {
    if (!isAuthenticated) {
      setShowModal(true);
    } else {
      navigate(path);
    }
  };
  return (
    <div className="min-h-screen flex flex-col justify-between bg-gray-50 text-gray-800">
      {/* Hero Section */}
      <main className="flex flex-col items-center text-center px-6 py-16">
        <h2 className="text-4xl font-bold mb-4">
          Chat with your PDF documents using AI
        </h2>
        <p className="text-lg text-gray-600 mb-8 max-w-xl">
          Upload any PDF and start a conversation. Get instant answers,
          insights, and summaries from your documents with our advanced AI
          assistant.
        </p>
        <div className="flex flex-col md:flex-row gap-4 justify-center items-center mx-2 my-4">
          <button
            onClick={() => handleProtectedClick("new-chat")}
            className="bg-indigo-600 text-white px-6 py-3 rounded text-lg hover:bg-indigo-800 transition duration-200"
          >
            Start New Chat
          </button>
          <button
            onClick={() => handleProtectedClick("home")}
            className="bg-indigo-600 text-white px-6 py-3 rounded text-lg hover:bg-indigo-800 transition duration-200"
          >
            Your Chats
          </button>
        </div>

        <div className="mt-4">
          Already have an account?
          <Link to="/login" className="text-indigo-400 hover:underline">
            Login
          </Link>
        </div>
      </main>

      {/* How it works */}
      <section className="bg-white py-16 px-6">
        <h3 className="text-3xl font-bold text-center mb-12">How It Works</h3>
        <div className="grid gap-8 md:grid-cols-3 max-w-6xl mx-auto">
          {[
            {
              title: "1. Upload Your Document",
              desc: "Upload any PDF document you want to chat with. Our system will process and analyze it.",
            },
            {
              title: "2. Ask Questions",
              desc: "Ask any question about your document. Our AI will find relevant information.",
            },
            {
              title: "3. Get Instant Answers",
              desc: "Receive accurate answers and insights instantly, directly from your document.",
            },
          ].map((step, idx) => (
            <div
              key={idx}
              className="p-6 border rounded-lg shadow hover:shadow-lg transition"
            >
              <h4 className="text-xl font-semibold mb-2">{step.title}</h4>
              <p className="text-gray-600">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>
      {showModal && (
        <AlertModal
          message="Please login to continue."
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
};

export default Homepage;
