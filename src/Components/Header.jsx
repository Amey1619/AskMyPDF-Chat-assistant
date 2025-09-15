// components/Header.jsx
import  { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/AuthHook";

const Header = () => {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
      console.log("Successfully logged out");
      navigate("/", { replace: true });
    } catch (error) {
      console.error("Error occurred during logout:", error);
      // You might want to show a toast notification here
    } finally {
      setIsLoggingOut(false);
      setShowMobileMenu(false);
    }
  };
  const storedEmail = localStorage.getItem("user");

  const toggleMobileMenu = () => {
    setShowMobileMenu(!showMobileMenu);
  };

  const isActivePath = (path) => {
    return location.pathname === path;
  };

  return (
    <header className="sticky top-0 z-50 bg-white shadow-lg border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="flex items-center space-x-2 text-2xl font-bold text-blue-600 hover:text-blue-700 transition-colors duration-200">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
              </svg>
              <span>ChatDoc AI</span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                {/* User Info */}
                {storedEmail && (
                  <div className="flex items-center space-x-2 text-gray-700">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-semibold text-blue-600">
                        {storedEmail?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className="text-sm font-medium">{storedEmail}</span>
                  </div>
                )}

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="flex items-center space-x-2 bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:bg-red-300 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  {isLoggingOut ? (
                    <>
                      <svg
                        className="animate-spin h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      <span>Logging out...</span>
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                        />
                      </svg>
                      <span>Logout</span>
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                    isActivePath("/login")
                      ? "bg-blue-100 text-blue-700"
                      : "text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                  }`}
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                    isActivePath("/signup")
                      ? "bg-blue-700 text-white"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                  } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
                >
                  Sign Up
                </Link>
              </div>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={toggleMobileMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
            >
              <svg
                className={`${showMobileMenu ? "hidden" : "block"} h-6 w-6`}
                stroke="currentColor"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
              <svg
                className={`${showMobileMenu ? "block" : "hidden"} h-6 w-6`}
                stroke="currentColor"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div className={`${showMobileMenu ? "block" : "hidden"} md:hidden`}>
          <div className="px-2 pt-2 pb-3 space-y-1 bg-gray-50 border-t border-gray-200">
            {isAuthenticated ? (
              <>
                {/* User Info Mobile */}
                {storedEmail && (
                  <div className="flex items-center space-x-3 px-3 py-2 text-gray-700">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-lg font-semibold text-blue-600">
                        {storedEmail?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <div className="font-medium">{storedEmail}</div>
                    </div>
                  </div>
                )}

                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 hover:text-red-700 hover:bg-red-50 disabled:text-red-300 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  {isLoggingOut ? "Logging out..." : "Logout"}
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setShowMobileMenu(false)}
                  className={`block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${
                    isActivePath("/login")
                      ? "bg-blue-100 text-blue-700"
                      : "text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                  }`}
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setShowMobileMenu(false)}
                  className={`block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${
                    isActivePath("/signup")
                      ? "bg-blue-700 text-white"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                  }`}
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
