// main.jsx
import "./index.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthProvider.jsx";
import { ChatProvider } from "./context/ChatProvider.jsx";
import Layout from "./Layout.jsx";
import NoHeaderFooterLayout from "./NoHeaderFooterLayout.jsx";
import Homepage from "./Components/Homepage";

import Login from "./Components/Login.jsx";
import Signup from "./Components/Signup.jsx";
import Home from "./Components/Home.jsx";
import NewChat from "./Components/NewChat.jsx";
import ChatPage from "./Components/ChatPage.jsx";
import PrivateRoute from "./Components/PrivateRoute.jsx";

// ✅ Router configuration (cleaner & organized)
const router = createBrowserRouter([
  {
    element: <Layout />, // Layout with header/footer
    children: [
      { index: true, element: <Homepage /> },
      {
        element: <PrivateRoute />,
        children: [
          { path: "home", element: <Home /> },
          { path: "new-chat", element: <NewChat /> },
          { path: "chat/:sessionId", element: <ChatPage /> },
        ],
      },
    ],
  },
  {
    element: <NoHeaderFooterLayout />, // Layout without header/footer
    children: [
      { path: "login", element: <Login /> },
      { path: "signup", element: <Signup /> },
    ],
  },
]);

// ✅ Root render
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <ChatProvider>
        <RouterProvider router={router} />
      </ChatProvider>
    </AuthProvider>
  </StrictMode>
);
