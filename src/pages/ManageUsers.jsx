import { useState, useEffect } from "react";
import toast from "react-hot-toast";

export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [isDeveloper, setIsDeveloper] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyAndFetch = async () => {
      const token = localStorage.getItem("token");

      // 1. Verify if the current user is developer
      const profileRes = await fetch("http://localhost:5000/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const profile = await profileRes.json();

      if (profile.developer) {
        setIsDeveloper(true);
        // 2. Fetch user list
        const usersRes = await fetch("http://localhost:5000/api/users", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const usersData = await usersRes.json();
        setUsers(usersData);
      }
      setLoading(false);
    };

    verifyAndFetch();
  }, []);

  const changeRole = async (id, currentRole) => {
    const newRole = currentRole === "admin" ? "user" : "admin";
    const res = await fetch(`http://localhost:5000/api/users/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({ role: newRole }),
    });

    if (res.ok) {
      setUsers(users.map(u => (u._id === id ? { ...u, role: newRole } : u)));
      toast.success("Role updated");
    } else {
      toast.error("Update failed");
    }
  };

  if (loading) return <div>Loading...</div>;

  if (!isDeveloper) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-bold text-red-600">Access Denied</h2>
        <p>You do not have developer privileges.</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Manage Users</h2>
      <table className="w-full bg-white rounded-lg shadow">
        <thead>
          <tr className="border-b">
            <th className="p-4 text-left">Username</th>
            <th className="p-4 text-left">Role</th>
            <th className="p-4 text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user._id} className="border-b">
              <td className="p-4">{user.username}</td>
              <td className="p-4 capitalize">{user.role}</td>
              <td className="p-4 text-center">
                <button
                  onClick={() => changeRole(user._id, user.role)}
                  className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                >
                  Toggle Role
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
