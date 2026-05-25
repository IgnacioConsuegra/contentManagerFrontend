import { useState, useEffect, useRef } from "react";
import {
  Book,
  Upload,
  Trash2,
  Edit2,
  Plus,
  X,
  Search,
  Loader2,
  Image as ImageIcon,
  FileText,
  Save,
  AlertTriangle,
} from "lucide-react";
import toast from "react-hot-toast";

const BUCKET_URL = "https://melody-wave-bucket.s3.us-east-2.amazonaws.com/";

export default function Epubs() {
  const [list, setList] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState({ type: null, data: null });
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ title: "", epub: null, cover: null });

  const [deleteStep, setDeleteStep] = useState(0);
  const [deleteInput, setDeleteInput] = useState("");

  useEffect(() => {
    fetchEpubs();
  }, []);

  const fetchEpubs = async () => {
    const res = await fetch(
      "https://contentmanagerbackend-1.onrender.com/api/epubs",
    );
    const data = await res.json();
    setList(data);
  };

  const handleAction = async e => {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData();
    fd.append("title", form.title);
    if (form.epub) fd.append("epub", form.epub);
    if (form.cover) fd.append("cover", form.cover);

    const url =
      showModal.type === "edit"
        ? `https://contentmanagerbackend-1.onrender.com/api/epubs/${encodeURIComponent(showModal.data.url)}`
        : "https://contentmanagerbackend-1.onrender.com/api/epubs";
    const method = showModal.type === "edit" ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      body: fd,
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    if (res.ok) {
      toast.success(
        `Epub ${showModal.type === "edit" ? "updated" : "uploaded"}`,
      );
      fetchEpubs();
      setShowModal({ type: null, data: null });
      setForm({ title: "", epub: null, cover: null });
    } else {
      toast.error("Action failed");
    }
    setLoading(false);
  };

  const startDelete = item => {
    setShowModal({ type: "delete", data: item });
    setDeleteStep(1);
  };

  const handleFullDelete = async () => {
    await fetch(
      `https://contentmanagerbackend-1.onrender.com/api/epubs/${encodeURIComponent(showModal.data.url)}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      },
    );
    toast.success("Permanently deleted");
    fetchEpubs();
    setShowModal({ type: null, data: null });
    setDeleteStep(0);
    setDeleteInput("");
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center">
          <Book className="w-8 h-8 mr-3 text-blue-600" />{" "}
          <h2 className="text-3xl font-bold">Epub Management</h2>
        </div>
        <button
          onClick={() => setShowModal({ type: "add", data: null })}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-5 h-5 mr-2" /> Add Epub
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
        {list
          .filter(i => i.title.toLowerCase().includes(searchTerm.toLowerCase()))
          .map(item => (
            <div
              key={item.url}
              className="group border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition bg-white"
            >
              <img
                src={`${BUCKET_URL}${item.cover}`}
                className="h-48 w-full object-cover"
              />
              <div className="p-2 text-center text-sm font-medium truncate">
                {item.title}
              </div>
              <div className="flex justify-center gap-2 pb-2 opacity-0 group-hover:opacity-100 transition">
                <button
                  onClick={() => setShowModal({ type: "edit", data: item })}
                  className="p-1.5 bg-blue-50 text-blue-600 rounded"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => startDelete(item)}
                  className="p-1.5 bg-red-50 text-red-600 rounded"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
      </div>

      {showModal.type &&
        (showModal.type === "add" || showModal.type === "edit") && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <form
              onSubmit={handleAction}
              className="bg-white p-6 rounded-xl w-full max-w-md space-y-4"
            >
              <h3 className="text-xl font-bold">
                {showModal.type === "add" ? "New Epub" : "Edit Epub"}
              </h3>
              <input
                type="text"
                placeholder="Title"
                defaultValue={showModal.data?.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
                className="w-full p-2 border rounded"
                required
              />

              <label className="flex items-center justify-center w-full h-20 border-2 border-dashed rounded cursor-pointer hover:bg-gray-50">
                <div className="text-center">
                  <FileText className="mx-auto w-6 h-6 text-gray-400" />
                  <span className="text-xs">
                    {form.epub ? form.epub.name : "Select Epub/PDF"}
                  </span>
                </div>
                <input
                  type="file"
                  className="hidden"
                  onChange={e => setForm({ ...form, epub: e.target.files[0] })}
                />
              </label>

              <label className="flex items-center justify-center w-full h-20 border-2 border-dashed rounded cursor-pointer hover:bg-gray-50">
                <div className="text-center">
                  <ImageIcon className="mx-auto w-6 h-6 text-gray-400" />
                  <span className="text-xs">
                    {form.cover ? form.cover.name : "Select Cover"}
                  </span>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={e => setForm({ ...form, cover: e.target.files[0] })}
                />
              </label>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal({ type: null, data: null })}
                  className="flex-1 py-2 bg-gray-200 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-blue-600 text-white rounded font-bold"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        )}

      {/* Delete Confirmation */}
      {showModal.type === "delete" && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-xl w-full max-w-sm">
            <AlertTriangle className="text-red-600 w-12 h-12 mx-auto mb-4" />
            {deleteStep === 1 ? (
              <>
                <p className="mb-4">
                  Type{" "}
                  <strong className="select-none">
                    Delete {showModal.data.title}
                  </strong>
                </p>
                <input
                  className="w-full p-2 border rounded mb-4"
                  onChange={e => setDeleteInput(e.target.value)}
                />
                <button
                  onClick={() =>
                    deleteInput === `Delete ${showModal.data.title}`
                      ? setDeleteStep(2)
                      : toast.error("Wrong")
                  }
                  className="w-full py-2 bg-red-600 text-white rounded"
                >
                  Next
                </button>
              </>
            ) : (
              <>
                <p className="mb-4">
                  Write{" "}
                  <strong className="select-none">delete permanent</strong>
                </p>
                <input
                  className="w-full p-2 border rounded mb-4"
                  onChange={e => setDeleteInput(e.target.value)}
                />
                <button
                  onClick={() =>
                    deleteInput === "delete permanent"
                      ? handleFullDelete()
                      : toast.error("Wrong")
                  }
                  className="w-full py-2 bg-red-600 text-white rounded"
                >
                  Confirm Permanently
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {loading && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[60] text-white">
          <Loader2 className="w-12 h-12 animate-spin" />
        </div>
      )}
    </div>
  );
}
