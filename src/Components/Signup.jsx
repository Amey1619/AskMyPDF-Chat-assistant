import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/AuthHook";
import { Eye, EyeOff } from "lucide-react"; // 👈 Import icons

const Signup = () => {
  const { signup } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // 👈 New state

  // Handle input changes
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError(null); // clear error on typing
  };

  // Handle signup
  const handleSignup = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await signup(form.email.trim(), form.password);
      navigate("/login");
    } catch (err) {
      console.error("Error during signup:", err);
      setError(
        err.response?.data?.detail ||
          err.response?.data?.message ||
          err.message ||
          "Signup failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-lg">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
          Sign Up for ChatDoc AI
        </h2>

        {/* Error Message */}
        {error && (
          <div className="mb-4 text-sm text-red-600 bg-red-100 p-2 rounded-lg text-center">
            {error}
          </div>
        )}

        {/* Signup Form */}
        <form className="space-y-5" onSubmit={handleSignup}>
          {/* Email Field */}
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              placeholder="you@example.com"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"} // 👈 Toggle type
                name="password"
                value={form.password}
                onChange={handleChange}
                required
                placeholder="••••••••"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 rounded-lg font-semibold transition ${
              loading
                ? "bg-blue-300 text-white cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            {loading ? "Creating account…" : "Create Account"}
          </button>
        </form>

        {/* Login Link */}
        <p className="text-center text-sm text-gray-600 mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-600 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
