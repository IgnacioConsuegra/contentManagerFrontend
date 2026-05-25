import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [requestAdmin, setRequestAdmin] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleRegister = async e => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, requestAdmin }),
      });
      const data = await response.json();

      if (response.ok) {
        navigate("/login");
      } else {
        setError(data.message || data.error);
      }
    } catch (err) {
      setError("Server error");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="p-8 bg-white rounded-lg shadow-md w-96">
        <h2 className="mb-6 text-2xl font-bold text-center">Register</h2>
        {error && <p className="mb-4 text-red-500 text-center">{error}</p>}
        <form onSubmit={handleRegister} className="space-y-4">
          <input
            type="text"
            placeholder="Username"
            className="w-full p-2 border rounded"
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full p-2 border rounded"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          <div className="flex items-center">
            <input
              type="checkbox"
              id="requestAdmin"
              className="mr-2"
              checked={requestAdmin}
              onChange={e => setRequestAdmin(e.target.checked)}
            />
            <label htmlFor="requestAdmin" className="text-sm text-gray-700">
              Request Admin Role
            </label>
          </div>
          <button
            type="submit"
            className="w-full p-2 text-white bg-green-600 rounded hover:bg-green-700"
          >
            Sign Up
          </button>
        </form>
        <div className="mt-4 text-center">
          <Link to="/login" className="text-sm text-blue-600 hover:underline">
            Already have an account? Login
          </Link>
        </div>
      </div>
    </div>
  );
}
