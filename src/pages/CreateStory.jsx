import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { createStory, uploadImage } from "../lib/stories";
import { getCategories } from "../lib/categories";

export default function CreateStory() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [categories, setCategories] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    summary: "",
    content: "",
    category: "",
    author: "",
    image_url: "",
  });

  useEffect(() => {
    if (user === null) navigate("/login");
  }, [user]);

  useEffect(() => {
    getCategories().then(setCategories);
  }, []);

  const update = (field, value) => setForm((p) => ({ ...p, [field]: value }));

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadImage(file);
      update("image_url", url);
    } catch {
      alert("Image upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const story = await createStory(form);
      navigate(`/story/${story.$id}`);
    } catch (err) {
      alert(err?.message || "Failed to publish.");
      setSubmitting(false);
    }
  };

  if (user === undefined) return null;

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="font-heading text-3xl font-bold mb-1">Write a Story</h1>
      <p className="text-gray-500 text-sm mb-8">
        Share the latest news with your school community.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Cover Image */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Cover Image
          </label>
          {form.image_url ? (
            <div className="relative rounded-xl overflow-hidden aspect-video bg-gray-100">
              <img src={form.image_url} alt="Cover" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => update("image_url", "")}
                className="absolute top-3 right-3 bg-black/60 text-white rounded-full w-7 h-7 flex items-center justify-center hover:bg-black transition-colors text-sm"
              >
                ✕
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center aspect-video rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 cursor-pointer hover:border-black transition-colors">
              {uploading ? (
                <span className="text-sm text-gray-400">Uploading...</span>
              ) : (
                <>
                  <span className="text-3xl mb-2">🖼️</span>
                  <span className="text-sm text-gray-400">Click to upload a cover image</span>
                </>
              )}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
                disabled={uploading}
              />
            </label>
          )}
        </div>

        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Headline *</label>
          <input
            required
            type="text"
            placeholder="Enter your headline..."
            value={form.title}
            onChange={(e) => update("title", e.target.value)}
            className="w-full border-b-2 border-gray-200 focus:border-black px-0 py-2 text-2xl font-heading font-bold focus:outline-none bg-transparent"
          />
        </div>

        {/* Summary */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Summary</label>
          <textarea
            placeholder="A brief description of the story..."
            value={form.summary}
            onChange={(e) => update("summary", e.target.value)}
            rows={2}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black resize-none"
          />
        </div>

        {/* Category & Author */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
            <select
              required
              value={form.category}
              onChange={(e) => update("category", e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
            >
              <option value="">Select category</option>
              {categories.map((cat) => (
                <option key={cat.$id} value={cat.name}>{cat.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Author Name</label>
            <input
              type="text"
              placeholder="Your name"
              value={form.author}
              onChange={(e) => update("author", e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>
        </div>

        {/* Content */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Story Content *</label>
          <textarea
            required
            placeholder="Write your story here..."
            value={form.content}
            onChange={(e) => update("content", e.target.value)}
            rows={14}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black resize-none leading-relaxed"
          />
        </div>

        {/* Submit */}
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={submitting || uploading || !form.title || !form.category}
            className="bg-black text-white px-8 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-50 transition-colors"
          >
            {submitting ? "Publishing..." : "Publish Story"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/")}
            className="border border-gray-200 px-6 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
