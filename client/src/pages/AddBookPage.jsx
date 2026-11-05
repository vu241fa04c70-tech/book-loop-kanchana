import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  BookPlus,
  Upload,
  ArrowRight,
  Sparkles,
  Info,
  DollarSign,
  ArrowRightLeft,
  Gift,
  Trash2,
  Image as ImageIcon
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const AddBookPage = () => {
  const { id } = useParams();
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(isEditing);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    author: '',
    ISBN: '',
    description: '',
    category: 'Computer Science',
    subject: '',
    condition: 'Good',
    price: '',
    originalPrice: '',
    listingType: 'Sell',
    college: user?.college || 'Stanford University',
    location: user?.location || 'Campus Center',
    images: []
  });

  const [imageUrlInput, setImageUrlInput] = useState('');

  const categories = [
    'Computer Science',
    'Engineering',
    'Medicine & Health',
    'Business & Economics',
    'Law',
    'Sciences',
    'Mathematics',
    'Literature & Fiction',
    'Social Sciences',
    'Exam Preparation',
    'General Non-Fiction',
    'Other'
  ];

  const conditions = ['Like New', 'Good', 'Fair', 'Poor'];

  // Load existing book data if editing
  useEffect(() => {
    if (isEditing) {
      const fetchBook = async () => {
        try {
          const res = await api.get(`/books/${id}`);
          if (res.data.success && res.data.book) {
            const b = res.data.book;
            setFormData({
              title: b.title,
              author: b.author,
              ISBN: b.ISBN || '',
              description: b.description,
              category: b.category,
              subject: b.subject || '',
              condition: b.condition,
              price: b.price || '',
              originalPrice: b.originalPrice || '',
              listingType: b.listingType,
              college: b.college,
              location: b.location,
              images: b.images || []
            });
          }
        } catch (err) {
          showToast('Failed to load book data for editing', 'error');
          navigate('/dashboard');
        } finally {
          setLoading(false);
        }
      };
      fetchBook();
    }
  }, [id, isEditing, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle local image file upload via backend /api/books/upload
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const uploadForm = new FormData();
    uploadForm.append('image', file);

    setUploadingImage(true);
    try {
      const res = await api.post('/books/upload', uploadForm, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data.success) {
        setFormData((prev) => ({
          ...prev,
          images: [...prev.images, res.data.imageUrl]
        }));
        showToast('Image uploaded successfully!', 'success');
      }
    } catch (err) {
      // If local upload has issue, user can use URL
      showToast('Could not upload file directly. You can also paste an image URL.', 'error');
    } finally {
      setUploadingImage(false);
    }
  };

  // Add image by URL
  const handleAddImageUrl = (e) => {
    e.preventDefault();
    if (imageUrlInput.trim()) {
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, imageUrlInput.trim()]
      }));
      setImageUrlInput('');
    }
  };

  const handleRemoveImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.author.trim() || !formData.description.trim()) {
      showToast('Please fill in title, author, and description', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        price: formData.listingType === 'Donate' ? 0 : Number(formData.price) || 0,
        originalPrice: Number(formData.originalPrice) || 0
      };

      if (isEditing) {
        const res = await api.put(`/books/${id}`, payload);
        if (res.data.success) {
          showToast('Book listing updated successfully!', 'success');
          navigate(`/books/${id}`);
        }
      } else {
        const res = await api.post('/books', payload);
        if (res.data.success) {
          showToast('Book listed successfully on BookLoop!', 'success');
          navigate(`/books/${res.data.book._id}`);
        }
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to save book listing';
      showToast(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto py-16 text-center">
        <div className="w-10 h-10 border-4 border-primary border-t-accent rounded-full animate-spin mx-auto"></div>
        <p className="mt-3 text-xs font-bold text-slate-500 uppercase tracking-wider">
          Loading listing...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-soft">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-accent/20 text-accent flex items-center justify-center">
            <BookPlus className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-primary tracking-tight">
              {isEditing ? 'Edit Book Listing' : 'List a Textbook on BookLoop'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Give your pre-owned course books a second life. Choose to sell, exchange, or donate for free.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Listing Intent */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-soft space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
            Step 1: Listing Intent & Category
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { type: 'Sell', desc: 'Set a cash price for student buyers', icon: DollarSign },
              { type: 'Exchange', desc: 'Trade for another textbook you need', icon: ArrowRightLeft },
              { type: 'Donate', desc: 'Gift for free ($0) to help another student', icon: Gift }
            ].map((option) => (
              <label
                key={option.type}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                  formData.listingType === option.type
                    ? 'border-accent bg-amber-50/50 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-extrabold text-sm text-slate-900">{option.type}</span>
                  <input
                    type="radio"
                    name="listingType"
                    value={option.type}
                    checked={formData.listingType === option.type}
                    onChange={handleChange}
                    className="text-accent focus:ring-accent"
                  />
                </div>
                <p className="text-xs text-slate-500">{option.desc}</p>
              </label>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Category *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent font-medium text-slate-800"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Subject / Course Name
              </label>
              <input
                type="text"
                name="subject"
                placeholder="e.g. CS106B, Algorithms, Organic Chem"
                value={formData.subject}
                onChange={handleChange}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Book Details */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-soft space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
            Step 2: Book Information
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Book Title *
              </label>
              <input
                type="text"
                name="title"
                required
                placeholder="e.g. Introduction to Algorithms (4th Edition)"
                value={formData.title}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent font-semibold"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Author(s) *
                </label>
                <input
                  type="text"
                  name="author"
                  required
                  placeholder="e.g. Cormen, Leiserson, Rivest, Stein"
                  value={formData.author}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  ISBN (Optional)
                </label>
                <input
                  type="text"
                  name="ISBN"
                  placeholder="e.g. 978-0262033848"
                  value={formData.ISBN}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Book Condition *
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {conditions.map((cond) => (
                  <button
                    key={cond}
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, condition: cond }))}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                      formData.condition === cond
                        ? 'border-primary bg-primary text-white shadow-xs'
                        : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {cond}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Description & Notes *
              </label>
              <textarea
                name="description"
                required
                rows="4"
                placeholder="Mention highlighting, page condition, included companion discs/codes, or specific courses it was used for..."
                value={formData.description}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent"
              ></textarea>
            </div>
          </div>
        </div>

        {/* Section 3: Pricing & Campus Location */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-soft space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
            Step 3: Pricing & Campus Meetup
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                {formData.listingType === 'Donate' ? 'Price (Free Donation)' : 'Selling Price ($) *'}
              </label>
              <input
                type="number"
                name="price"
                min="0"
                step="0.5"
                disabled={formData.listingType === 'Donate'}
                placeholder={formData.listingType === 'Donate' ? '0 (Free)' : 'e.g. 25'}
                value={formData.listingType === 'Donate' ? 0 : formData.price}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 text-sm font-bold bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-60"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Original Retail Price ($)
              </label>
              <input
                type="number"
                name="originalPrice"
                min="0"
                step="0.5"
                placeholder="e.g. 85 (helps calculate % saved)"
                value={formData.originalPrice}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                University / College Campus *
              </label>
              <input
                type="text"
                name="college"
                required
                placeholder="e.g. Stanford University"
                value={formData.college}
                onChange={handleChange}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Campus Pickup Location *
              </label>
              <input
                type="text"
                name="location"
                required
                placeholder="e.g. Gates CS Building or Main Library"
                value={formData.location}
                onChange={handleChange}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
          </div>
        </div>

        {/* Section 4: Images */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-soft space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
            Step 4: Book Photos
          </h3>

          <div className="space-y-4">
            {/* File Upload Button */}
            <div className="border-2 border-dashed border-slate-200 hover:border-accent p-6 rounded-2xl text-center transition-colors">
              <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-700">
                Upload cover photo from your computer or phone
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">PNG, JPG, WEBP up to 5MB</p>
              <label className="inline-block mt-3 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl cursor-pointer transition-colors">
                <span>{uploadingImage ? 'Uploading...' : 'Choose Photo'}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  disabled={uploadingImage}
                  className="hidden"
                />
              </label>
            </div>

            {/* Paste URL alternative */}
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">
                Or paste image web link:
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/photo-..."
                  value={imageUrlInput}
                  onChange={(e) => setImageUrlInput(e.target.value)}
                  className="flex-1 px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddImageUrl}
                  className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl"
                >
                  Add Link
                </button>
              </div>
            </div>

            {/* Image Preview List */}
            {formData.images.length > 0 && (
              <div className="flex flex-wrap gap-3 pt-2">
                {formData.images.map((img, i) => (
                  <div
                    key={i}
                    className="relative w-20 h-24 rounded-xl overflow-hidden border border-slate-200 group shadow-xs"
                  >
                    <img src={img} alt="preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(i)}
                      className="absolute inset-0 bg-slate-900/60 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                    >
                      <Trash2 className="w-4 h-4 text-rose-400" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <Link
            to={isEditing ? `/books/${id}` : '/explore'}
            className="px-6 py-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="px-8 py-3.5 rounded-xl bg-accent hover:bg-accent-hover disabled:opacity-50 text-white text-sm font-bold shadow-soft transition-all transform hover:-translate-y-0.5"
          >
            {submitting ? 'Saving Book...' : isEditing ? 'Update Listing' : 'Publish Book Listing'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddBookPage;
