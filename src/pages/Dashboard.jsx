import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import { Music, Tv, Book, LogOut, Users } from "lucide-react";
import { useEffect } from "react";

export default function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    }
  }, [navigate]);
  const isDeveloper = true;
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const getLinkClass = path => {
    const isActive = location.pathname.includes(path);
    return `flex items-center p-2 rounded mb-2 ${isActive ? "bg-blue-50 text-blue-600" : "text-gray-700 hover:bg-gray-100"}`;
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <aside className="flex flex-col w-64 bg-white border-r">
        <div className="p-4 border-b">
          <h1 className="text-xl font-bold">Admin Panel</h1>
        </div>
        <nav className="flex-1 p-4">
          <Link
            to="/dashboard/music"
            className={getLinkClass("/dashboard/music")}
          >
            <Music className="w-5 h-5 mr-3" />
            Music
          </Link>
          <Link
            to="/dashboard/series"
            className={getLinkClass("/dashboard/series")}
          >
            <Tv className="w-5 h-5 mr-3" />
            Series
          </Link>
          <Link
            to="/dashboard/epubs"
            className={getLinkClass("/dashboard/epubs")}
          >
            <Book className="w-5 h-5 mr-3" />
            Epubs
          </Link>
          {isDeveloper && (
            <Link
              to="/dashboard/users"
              className={getLinkClass("/dashboard/users")}
            >
              <Users className="w-5 h-5 mr-3" />
              Manage Users
            </Link>
          )}
        </nav>
        <div className="p-4 border-t">
          <button
            onClick={handleLogout}
            className="flex items-center w-full p-2 text-red-600 rounded hover:bg-red-50"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Logout
          </button>
        </div>
      </aside>
      <main className="flex-1 p-8 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
