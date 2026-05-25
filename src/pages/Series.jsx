import { useState, useEffect, useRef } from "react";
import {
  Tv,
  Plus,
  Search,
  Edit2,
  Trash2,
  ArrowLeft,
  Save,
  Upload,
  AlertTriangle,
  Image as ImageIcon,
  Video,
} from "lucide-react";
import toast from "react-hot-toast";

export default function Series() {
  const [seriesList, setSeriesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("list");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSeries, setSelectedSeries] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    isFeatured: false,
    mainPhoto: null,
    thumbnail: null,
  });

  const [episodeData, setEpisodeData] = useState({
    title: "",
    video: null,
    thumbnail: null,
  });
  const [isUploading, setIsUploading] = useState(false);
  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [editInfoForm, setEditInfoForm] = useState({
    title: "",
    description: "",
    category: "",
    isFeatured: false,
    newMainPhoto: null,
    newThumbnail: null,
  });

  const [deleteStep, setDeleteStep] = useState(0);
  const [deleteInput1, setDeleteInput1] = useState("");
  const [deleteInput2, setDeleteInput2] = useState("");

  const epFileInputRefThumb = useRef(null);
  const epFileInputRefVideo = useRef(null);
  const editFileInputRefMain = useRef(null);
  const editFileInputRefThumb = useRef(null);

  const BUCKET_URL = "https://melody-wave-bucket.s3.us-east-2.amazonaws.com/";

  useEffect(() => {
    fetchSeries();
  }, []);

  const fetchSeries = async () => {
    try {
      const res = await fetch(
        "https://contentmanagerbackend-1.onrender.com/api/series",
      );
      const data = await res.json();
      setSeriesList(data);
    } catch (err) {
      toast.error("Error loading series");
    } finally {
      setLoading(false);
    }
  };

  const normalizeStr = str => str.toLowerCase().replace(/\s+/g, "");

  const filteredSeries = seriesList.filter(
    s =>
      normalizeStr(s.title).includes(normalizeStr(searchTerm)) ||
      normalizeStr(s.category).includes(normalizeStr(searchTerm)),
  );

  const handleCreateSeries = async e => {
    e.preventDefault();
    if (
      !formData.title ||
      !formData.category ||
      !formData.mainPhoto ||
      !formData.thumbnail
    ) {
      toast.error("Missing required fields");
      return;
    }

    if (
      seriesList.some(
        s => normalizeStr(s.title) === normalizeStr(formData.title),
      )
    ) {
      toast.error("A series with this title already exists");
      return;
    }

    const fd = new FormData();
    fd.append("title", formData.title);
    fd.append("description", formData.description);
    fd.append("category", formData.category);
    fd.append("isFeatured", formData.isFeatured);
    fd.append("mainPhoto", formData.mainPhoto);
    fd.append("thumbnail", formData.thumbnail);

    try {
      const res = await fetch(
        "https://contentmanagerbackend-1.onrender.com/api/series",
        {
          method: "POST",
          body: fd,
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );
      const data = await res.json();
      if (res.ok) {
        toast.success("Series created successfully");
        setSeriesList([...seriesList, data]);
        setView("list");
        setFormData({
          title: "",
          description: "",
          category: "",
          isFeatured: false,
          mainPhoto: null,
          thumbnail: null,
        });
      } else {
        toast.error(data.error);
      }
    } catch (err) {
      toast.error("Server error");
    }
  };

  const handleSaveInfo = async () => {
    const fd = new FormData();
    fd.append("title", editInfoForm.title);
    fd.append("description", editInfoForm.description);
    fd.append("category", editInfoForm.category);
    fd.append("isFeatured", editInfoForm.isFeatured);
    if (editInfoForm.newMainPhoto)
      fd.append("mainPhoto", editInfoForm.newMainPhoto);
    if (editInfoForm.newThumbnail)
      fd.append("thumbnail", editInfoForm.newThumbnail);

    try {
      const res = await fetch(
        `https://contentmanagerbackend-1.onrender.com/api/series/${selectedSeries.id}`,
        {
          method: "PUT",
          body: fd,
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );
      const data = await res.json();
      if (res.ok) {
        toast.success("Information updated");
        setSeriesList(
          seriesList.map(s => (s.id === selectedSeries.id ? data : s)),
        );
        setSelectedSeries(data);
        setIsEditingInfo(false);
        setEditInfoForm(prev => ({
          ...prev,
          newMainPhoto: null,
          newThumbnail: null,
        }));
      } else {
        toast.error(data.error);
      }
    } catch (err) {
      toast.error("Server error");
    }
  };

  const handleAddEpisode = async e => {
    e.preventDefault();
    if (!episodeData.title || !episodeData.video) {
      toast.error("Title and Video are required");
      return;
    }
    setIsUploading(true);
    let newNum = selectedSeries.episodes.length + 1;
    while (selectedSeries.episodes.some(ep => ep.id === `ep${newNum}`)) {
      newNum++;
    }
    const autoEpId = `ep${newNum}`;

    const fd = new FormData();
    fd.append("epId", autoEpId);
    fd.append("title", episodeData.title);
    fd.append("video", episodeData.video);
    if (episodeData.thumbnail) {
      fd.append("thumbnail", episodeData.thumbnail);
    }

    try {
      const res = await fetch(
        `https://contentmanagerbackend-1.onrender.com/api/series/${selectedSeries.id}/episodes`,
        {
          method: "POST",
          body: fd,
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );
      const data = await res.json();
      if (res.ok) {
        toast.success("Episode added successfully");
        setSeriesList(
          seriesList.map(s => (s.id === selectedSeries.id ? data : s)),
        );
        setSelectedSeries(data);
        setEpisodeData({ title: "", video: null, thumbnail: null });
        if (epFileInputRefThumb.current) epFileInputRefThumb.current.value = "";
        if (epFileInputRefVideo.current) epFileInputRefVideo.current.value = "";
      } else {
        toast.error(data.error);
      }
    } catch (err) {
      toast.error("Server error");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteEpisode = async epId => {
    try {
      const res = await fetch(
        `https://contentmanagerbackend-1.onrender.com/api/series/${selectedSeries.id}/episodes/${epId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );
      const data = await res.json();
      if (res.ok) {
        toast.success("Episode deleted");
        setSeriesList(
          seriesList.map(s => (s.id === selectedSeries.id ? data : s)),
        );
        setSelectedSeries(data);
      } else {
        toast.error(data.error);
      }
    } catch (err) {
      toast.error("Server error");
    }
  };

  const handleFullDelete = async () => {
    try {
      const res = await fetch(
        `https://contentmanagerbackend-1.onrender.com/api/series/${selectedSeries.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );
      if (res.ok) {
        toast.success("Series completely deleted");
        setSeriesList(seriesList.filter(s => s.id !== selectedSeries.id));
        setDeleteStep(0);
        setView("list");
      } else {
        const data = await res.json();
        toast.error(data.error);
      }
    } catch (err) {
      toast.error("Server error");
    }
  };

  const openEdit = series => {
    setSelectedSeries(series);
    setEditInfoForm({
      title: series.title,
      description: series.description,
      category: series.category,
      isFeatured: series.isFeatured,
      newMainPhoto: null,
      newThumbnail: null,
    });
    setIsEditingInfo(false);
    setView("edit");
  };

  return (
    <div className="max-w-7xl mx-auto relative">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center">
          <Tv className="w-8 h-8 mr-3 text-blue-600" />
          <h2 className="text-3xl font-bold text-gray-800">
            Series Management
          </h2>
        </div>
        {view === "list" && (
          <button
            onClick={() => {
              setView("create");
              setFormData({
                title: "",
                description: "",
                category: "",
                isFeatured: false,
                mainPhoto: null,
                thumbnail: null,
              });
            }}
            className="flex items-center px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-5 h-5 mr-2" /> Add Series
          </button>
        )}
      </div>

      {view === "list" && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold">Current Series Library</h3>
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Filter series..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none w-64"
              />
            </div>
          </div>

          {loading ? (
            <p className="text-center py-8 text-gray-500">Loading series...</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredSeries.map(series => (
                <div
                  key={series.id}
                  className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow flex flex-col"
                >
                  <div className="h-48 bg-gray-100 relative">
                    <img
                      src={`${BUCKET_URL}${series.mainPhoto}`}
                      alt={series.title}
                      className="w-full h-full object-cover"
                      onError={e => {
                        e.target.style.display = "none";
                      }}
                    />
                  </div>
                  <div className="p-4 flex-1 flex flex-col">
                    <h4 className="font-bold text-lg mb-1 truncate">
                      {series.title}
                    </h4>
                    <div className="mt-auto pt-3 border-t">
                      <button
                        onClick={() => openEdit(series)}
                        className="flex items-center w-full justify-center text-sm text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 py-2 rounded transition-colors"
                      >
                        <Edit2 className="w-4 h-4 mr-2" /> Edit
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {view === "create" && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 max-w-2xl">
          <button
            onClick={() => setView("list")}
            className="flex items-center text-gray-500 mb-6 hover:text-gray-800"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Library
          </button>
          <h3 className="text-xl font-semibold mb-6">Create New Series</h3>
          <form onSubmit={handleCreateSeries} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={e =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={e =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none h-24"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={e =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />
              </div>
              <div className="flex items-center pt-6">
                <input
                  type="checkbox"
                  id="isFeatured"
                  checked={formData.isFeatured}
                  onChange={e =>
                    setFormData({ ...formData, isFeatured: e.target.checked })
                  }
                  className="mr-2 w-4 h-4"
                />
                <label
                  htmlFor="isFeatured"
                  className="text-sm font-medium text-gray-700"
                >
                  Featured Series
                </label>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Main Cover Photo
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={e =>
                  setFormData({ ...formData, mainPhoto: e.target.files[0] })
                }
                className="w-full p-2 border rounded-lg text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Default Episode Thumbnail
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={e =>
                  setFormData({ ...formData, thumbnail: e.target.files[0] })
                }
                className="w-full p-2 border rounded-lg text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full flex justify-center items-center p-3 mt-6 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              <Save className="w-5 h-5 mr-2" /> Save Series
            </button>
          </form>
        </div>
      )}

      {view === "edit" && selectedSeries && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 relative">
          <div className="xl:col-span-1">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6 relative group">
              <button
                onClick={() => setView("list")}
                className="flex items-center text-gray-500 mb-4 hover:text-gray-800"
              >
                <ArrowLeft className="w-4 h-4 mr-2" /> Back
              </button>

              {!isEditingInfo && (
                <button
                  onClick={() => setIsEditingInfo(true)}
                  className="absolute top-4 right-4 p-2 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              )}

              {isEditingInfo ? (
                <div className="space-y-3 mb-4">
                  <input
                    type="text"
                    value={editInfoForm.title}
                    onChange={e =>
                      setEditInfoForm({
                        ...editInfoForm,
                        title: e.target.value,
                      })
                    }
                    className="w-full font-bold text-xl border rounded p-1"
                  />
                  <textarea
                    value={editInfoForm.description}
                    onChange={e =>
                      setEditInfoForm({
                        ...editInfoForm,
                        description: e.target.value,
                      })
                    }
                    className="w-full text-sm text-gray-600 border rounded p-1 h-20"
                  />
                  <input
                    type="text"
                    value={editInfoForm.category}
                    onChange={e =>
                      setEditInfoForm({
                        ...editInfoForm,
                        category: e.target.value,
                      })
                    }
                    className="w-full text-xs font-semibold border rounded p-1"
                  />
                  <label className="flex items-center text-xs mb-2">
                    <input
                      type="checkbox"
                      checked={editInfoForm.isFeatured}
                      onChange={e =>
                        setEditInfoForm({
                          ...editInfoForm,
                          isFeatured: e.target.checked,
                        })
                      }
                      className="mr-2"
                    />
                    Featured
                  </label>

                  <div className="space-y-2 border-t pt-2 mt-2">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Update Main Cover
                      </label>
                      <div className="flex items-center w-full">
                        <label className="flex items-center justify-center w-full h-8 border border-gray-300 rounded cursor-pointer bg-gray-50 hover:bg-gray-100">
                          <span className="text-xs text-gray-500">
                            {editInfoForm.newMainPhoto
                              ? editInfoForm.newMainPhoto.name
                              : "Choose File"}
                          </span>
                          <input
                            type="file"
                            className="hidden"
                            accept="image/*"
                            ref={editFileInputRefMain}
                            onChange={e =>
                              setEditInfoForm({
                                ...editInfoForm,
                                newMainPhoto: e.target.files[0],
                              })
                            }
                          />
                        </label>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Update Default Thumbnail
                      </label>
                      <div className="flex items-center w-full">
                        <label className="flex items-center justify-center w-full h-8 border border-gray-300 rounded cursor-pointer bg-gray-50 hover:bg-gray-100">
                          <span className="text-xs text-gray-500">
                            {editInfoForm.newThumbnail
                              ? editInfoForm.newThumbnail.name
                              : "Choose File"}
                          </span>
                          <input
                            type="file"
                            className="hidden"
                            accept="image/*"
                            ref={editFileInputRefThumb}
                            onChange={e =>
                              setEditInfoForm({
                                ...editInfoForm,
                                newThumbnail: e.target.files[0],
                              })
                            }
                          />
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={handleSaveInfo}
                      className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 w-full flex justify-center items-center"
                    >
                      <Save className="w-3 h-3 mr-1" /> Save
                    </button>
                    <button
                      onClick={() => setIsEditingInfo(false)}
                      className="px-3 py-1 bg-gray-200 text-gray-700 text-xs rounded hover:bg-gray-300"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <h3 className="font-bold text-xl mb-2 pr-8">
                    {selectedSeries.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    {selectedSeries.description.substring(0, 150)}...
                  </p>
                  <div className="flex flex-wrap items-center gap-2 mb-4">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
                      {selectedSeries.category}
                    </span>
                    {selectedSeries.isFeatured && (
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded-full">
                        Featured
                      </span>
                    )}
                  </div>
                </>
              )}

              <div className="border-t pt-4 flex justify-between items-center">
                <span className="text-sm text-gray-500 font-medium">
                  {selectedSeries.episodes.length} Episodes
                </span>
                <button
                  onClick={() => setDeleteStep(1)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete Series"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h4 className="font-semibold mb-4 border-b pb-2">
                Add New Episode
              </h4>
              <form onSubmit={handleAddEpisode} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Episode Title
                  </label>
                  <input
                    type="text"
                    value={episodeData.title}
                    onChange={e =>
                      setEpisodeData({ ...episodeData, title: e.target.value })
                    }
                    className="w-full p-2 border rounded text-sm outline-none focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Video File
                  </label>
                  <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-20 border-2 border-gray-300 border-dashed rounded cursor-pointer bg-gray-50 hover:bg-gray-100">
                      <div className="flex flex-col items-center justify-center pt-4 pb-4">
                        <Video className="w-5 h-5 text-gray-400 mb-1" />
                        <p className="text-xs text-gray-500">
                          {episodeData.video
                            ? episodeData.video.name
                            : "Click to select MP4"}
                        </p>
                      </div>
                      <input
                        type="file"
                        className="hidden"
                        accept="video/mp4"
                        ref={epFileInputRefVideo}
                        onChange={e =>
                          setEpisodeData({
                            ...episodeData,
                            video: e.target.files[0],
                          })
                        }
                        required
                      />
                    </label>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isUploading}
                  className={`w-full p-3 text-white rounded-lg text-sm font-medium mt-2 flex items-center justify-center transition-colors ${
                    isUploading
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-green-600 hover:bg-green-700"
                  }`}
                >
                  {isUploading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" /> Upload Episode
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          <div className="xl:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-xl font-semibold mb-6 border-b pb-2">
              Episode List
            </h3>
            {selectedSeries.episodes.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No episodes added yet.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedSeries.episodes.map((ep, index) => (
                  <div
                    key={ep.id}
                    className="flex flex-col border rounded-lg overflow-hidden hover:shadow-md transition-shadow bg-gray-50"
                  >
                    <div className="h-32 bg-gray-200 relative">
                      <img
                        src={`${BUCKET_URL}${ep.thumbnail}`}
                        alt={ep.title}
                        className="w-full h-full object-cover"
                        onError={e => {
                          e.target.style.display = "none";
                        }}
                      />
                      <div className="absolute top-2 left-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                        EP {index + 1}
                      </div>
                    </div>
                    <div className="p-3 flex justify-between items-center bg-white border-t">
                      <div className="truncate pr-4">
                        <h5 className="font-semibold text-sm truncate">
                          {ep.title}
                        </h5>
                      </div>
                      <button
                        onClick={() => handleDeleteEpisode(ep.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {deleteStep > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-xl shadow-xl max-w-md w-full">
            <div className="flex items-center text-red-600 mb-4">
              <AlertTriangle className="w-8 h-8 mr-3" />
              <h2 className="text-2xl font-bold">Danger Zone</h2>
            </div>

            {deleteStep === 1 && (
              <>
                <p className="text-gray-600 mb-4">
                  This will permanently delete the series, all its episodes, and
                  all associated media from S3. To proceed, please type: <br />
                  <strong className="select-none">
                    Delete {selectedSeries?.title}
                  </strong>
                </p>
                <input
                  type="text"
                  value={deleteInput1}
                  onChange={e => setDeleteInput1(e.target.value)}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-red-500 outline-none mb-6"
                  placeholder={`Delete ${selectedSeries?.title}`}
                />
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => {
                      setDeleteStep(0);
                      setDeleteInput1("");
                    }}
                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      if (deleteInput1 === `Delete ${selectedSeries?.title}`)
                        setDeleteStep(2);
                      else toast.error("Text does not match");
                    }}
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    Next
                  </button>
                </div>
              </>
            )}

            {deleteStep === 2 && (
              <>
                <p className="text-gray-600 mb-4">
                  Final confirmation. Write below: <br />
                  <strong className="select-none">delete permanent</strong>
                </p>
                <input
                  type="text"
                  value={deleteInput2}
                  onChange={e => setDeleteInput2(e.target.value)}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-red-500 outline-none mb-6"
                  placeholder="delete permanent"
                />
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => {
                      setDeleteStep(0);
                      setDeleteInput1("");
                      setDeleteInput2("");
                    }}
                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      if (deleteInput2 === `delete permanent`)
                        handleFullDelete();
                      else toast.error("Text does not match");
                    }}
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    Permanently Delete
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
      {isUploading && (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl shadow-2xl flex flex-col items-center">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-800 font-semibold text-lg">
              Uploading episode to S3...
            </p>
            <p className="text-gray-500 text-sm">
              Please do not close this window
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
