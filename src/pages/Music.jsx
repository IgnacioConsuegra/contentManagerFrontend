import { useState, useEffect } from "react";
import {
  Music as MusicIcon,
  Upload,
  Search,
  Edit2,
  Save,
  X,
} from "lucide-react";
import toast from "react-hot-toast";

export default function Music() {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [category, setCategory] = useState("");
  const [file, setFile] = useState(null);

  const [editingUrl, setEditingUrl] = useState(null);
  const [editForm, setEditForm] = useState({
    title: "",
    artist: "",
    category: "",
    url: "",
  });

  useEffect(() => {
    fetchSongs();
  }, []);

  const fetchSongs = async () => {
    try {
      const response = await fetch(
        "https://contentmanagerbackend-1.onrender.com/api/music",
      );
      const data = await response.json();
      setSongs(data);
    } catch (error) {
      toast.error("Error loading songs");
    } finally {
      setLoading(false);
    }
  };

  const normalizeStr = str => str.toLowerCase().replace(/\s+/g, "");

  const getSuggestions = (field, value) => {
    if (!value) return [];
    const normalizedValue = normalizeStr(value);
    const uniqueValues = [...new Set(songs.map(s => s[field]))];
    return uniqueValues.filter(
      v =>
        normalizeStr(v).includes(normalizedValue) &&
        normalizeStr(v) !== normalizedValue,
    );
  };

  const handleUpload = async e => {
    e.preventDefault();
    if (!file || !title || !artist || !category) {
      toast.error("Please fill all fields");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("title", title);
    formData.append("artist", artist);
    formData.append("category", category);
    formData.append("file", file);

    try {
      const response = await fetch(
        "https://contentmanagerbackend-1.onrender.com/api/music",
        {
          method: "POST",
          body: formData,
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      const data = await response.json();

      if (response.ok) {
        toast.success("Song uploaded successfully!");
        setTitle("");
        setArtist("");
        setCategory("");
        setFile(null);
        setSongs([...songs, data]);
      } else if (response.status === 409) {
        toast.error("Song already exists");
      } else {
        toast.error(data.error || "Upload failed");
      }
    } catch (error) {
      toast.error("Server connection error");
    } finally {
      setUploading(false);
    }
  };

  const startEditing = song => {
    setEditingUrl(song.url);
    setEditForm({ ...song });
  };

  const cancelEditing = () => {
    setEditingUrl(null);
    setEditForm({ title: "", artist: "", category: "", url: "" });
  };

  const handleEditSave = async () => {
    try {
      const response = await fetch(
        "https://contentmanagerbackend-1.onrender.com/api/music",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            oldUrl: editingUrl,
            ...editForm,
          }),
        },
      );

      if (response.ok) {
        const updatedSong = await response.json();
        setSongs(songs.map(s => (s.url === editingUrl ? updatedSong : s)));
        toast.success("Song updated successfully!");
        setEditingUrl(null);
      } else {
        toast.error("Failed to update song");
      }
    } catch (error) {
      toast.error("Server connection error");
    }
  };

  const filteredSongs = songs.filter(song => {
    const search = normalizeStr(searchTerm);
    return (
      normalizeStr(song.title).includes(search) ||
      normalizeStr(song.artist).includes(search) ||
      normalizeStr(song.category).includes(search)
    );
  });

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center mb-8">
        <MusicIcon className="w-8 h-8 mr-3 text-blue-600" />
        <h2 className="text-3xl font-bold text-gray-800">Music Management</h2>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-fit">
          <h3 className="text-xl font-semibold mb-4 border-b pb-2">
            Upload New Song
          </h3>
          <form onSubmit={handleUpload} className="space-y-4">
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title
              </label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
              {getSuggestions("title", title).length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg">
                  {getSuggestions("title", title).map((s, i) => (
                    <div
                      key={i}
                      onClick={() => setTitle(s)}
                      className="p-2 hover:bg-gray-100 cursor-pointer text-sm"
                    >
                      {s}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Artist
              </label>
              <input
                type="text"
                value={artist}
                onChange={e => setArtist(e.target.value)}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
              {getSuggestions("artist", artist).length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg">
                  {getSuggestions("artist", artist).map((s, i) => (
                    <div
                      key={i}
                      onClick={() => setArtist(s)}
                      className="p-2 hover:bg-gray-100 cursor-pointer text-sm"
                    >
                      {s}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <input
                type="text"
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
              {getSuggestions("category", category).length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg">
                  {getSuggestions("category", category).map((s, i) => (
                    <div
                      key={i}
                      onClick={() => setCategory(s)}
                      className="p-2 hover:bg-gray-100 cursor-pointer text-sm"
                    >
                      {s}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                MP3 File
              </label>
              <input
                type="file"
                accept="audio/mp3"
                onChange={e => setFile(e.target.files[0])}
                className="w-full p-2 border rounded-lg text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>
            <button
              type="submit"
              disabled={uploading}
              className="w-full flex justify-center items-center p-3 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-blue-300"
            >
              {uploading ? (
                "Uploading..."
              ) : (
                <>
                  <Upload className="w-5 h-5 mr-2" />
                  Upload Song
                </>
              )}
            </button>
          </form>
        </div>

        <div className="xl:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-4 border-b pb-2">
            <h3 className="text-xl font-semibold">Current Library</h3>
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Filter library..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none w-64"
              />
            </div>
          </div>

          {loading ? (
            <p className="text-gray-500 text-center py-8">Loading library...</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-max">
                <thead>
                  <tr className="bg-gray-50 text-gray-600 text-sm">
                    <th className="p-3 border-b">Title</th>
                    <th className="p-3 border-b">Artist</th>
                    <th className="p-3 border-b">Category</th>
                    <th className="p-3 border-b">S3 URL</th>
                    <th className="p-3 border-b text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSongs.map((song, index) => (
                    <tr key={index} className="hover:bg-gray-50 border-b">
                      {editingUrl === song.url ? (
                        <>
                          <td className="p-2">
                            <input
                              type="text"
                              value={editForm.title}
                              onChange={e =>
                                setEditForm({
                                  ...editForm,
                                  title: e.target.value,
                                })
                              }
                              className="w-full p-1 border rounded"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="text"
                              value={editForm.artist}
                              onChange={e =>
                                setEditForm({
                                  ...editForm,
                                  artist: e.target.value,
                                })
                              }
                              className="w-full p-1 border rounded"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="text"
                              value={editForm.category}
                              onChange={e =>
                                setEditForm({
                                  ...editForm,
                                  category: e.target.value,
                                })
                              }
                              className="w-full p-1 border rounded"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="text"
                              value={editForm.url}
                              onChange={e =>
                                setEditForm({
                                  ...editForm,
                                  url: e.target.value,
                                })
                              }
                              className="w-full p-1 border rounded"
                            />
                          </td>
                          <td className="p-2 text-center">
                            <button
                              onClick={handleEditSave}
                              className="p-1 text-green-600 hover:bg-green-100 rounded mr-1"
                            >
                              <Save className="w-4 h-4" />
                            </button>
                            <button
                              onClick={cancelEditing}
                              className="p-1 text-red-600 hover:bg-red-100 rounded"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="p-3 font-medium text-gray-800">
                            {song.title}
                          </td>
                          <td className="p-3 text-gray-600">{song.artist}</td>
                          <td className="p-3 text-sm">
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                              {song.category}
                            </span>
                          </td>
                          <td className="p-3 text-xs text-gray-400 font-mono truncate max-w-[150px]">
                            {song.url}
                          </td>
                          <td className="p-3 text-center">
                            <button
                              onClick={() => startEditing(song)}
                              className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredSongs.length === 0 && (
                <p className="text-gray-500 text-center py-8">
                  No matching songs found.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
