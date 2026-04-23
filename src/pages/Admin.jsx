import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getCategories, createCategory, deleteCategory } from "../lib/categories";

export default function Admin() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user === null) navigate("/login");
  }, [user]);

  useEffect(() => {
    getCategories()
      .then(setCategories)
      .finally(() => setLoading(false));
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newCategory.trim()) return;
    setSaving(true);
    try {
      const doc = await createCategory(newCategory.trim());
      setCategories((prev) => [...prev, doc]);
      setNewCategory("");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this category?")) return;
    await deleteCategory(id);
    setCategories((prev) => prev.filter((c) => c.$id !== id));
  };

  if (user === undefined) return null;

  return (
    <div className="max-w-xl mx-auto px-4 py-10">
      <button
        onClick={() => navigate("/")}
        className="text-sm text-gray-400 hover:text-gray-700 mb-6 block transition-colors"
      >
        ← Back
      </button>

      <h1 className="font-heading text-2xl font-bold mb-1">Manage Categories</h1>
      <p className="text-gray-500 text-sm mb-8">Add or remove story categories.</p>

      <form onSubmit={handleAdd} className="flex gap-2 mb-8">
        <input
          type="text"
          placeholder="New category name..."
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
        />
        <button
          type="submit"
          disabled={saving || !newCategory.trim()}
          className="bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-50 transition-colors"
        >
          Add
        </button>
      </form>

      {loading ? (
        <p className="text-gray-400 text-sm">Loading...</p>
      ) : (
        <ul className="space-y-2">
          {categories.map((cat) => (
            <li
              key={cat.$id}
              className="flex items-center justify-between bg-white border border-gray-100 rounded-lg px-4 py-3"
            >
              <span className="text-sm font-medium">{cat.name}</span>
              <button
                onClick={() => handleDelete(cat.$id)}
                className="text-red-400 hover:text-red-600 text-sm transition-colors"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
