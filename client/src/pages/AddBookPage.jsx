import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  Upload,
  BookOpen,
  DollarSign,
  ArrowRightLeft,
  Gift,
  MapPin,
  CheckCircle2,
  Sparkles,
  Info,
  Trash2,
  Image as ImageIcon,
  ArrowRight
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
    publisher: '',
    edition: '',
    exchangePreferences: '',
    city: user?.city || '',
    description: '',
    category: 'Computer Science',
    subject: '',
    condition: 'Like New',
    price: '',
    originalPrice: '',
    listingType: 'Sell',
    college: user?.college || 'Stanford University',
    location: user?.location || 'Main Campus Library',
    images: []
  });

  const [imageUrlInput, setImageUrlInput] = useState('');

  const categories = [
    'Programming',
    'Computer Science',
    'Data Structures and Algorithms',
    'Artificial Intelligence',
    'Mathematics',
    'Science',
    'Novels',
    'Competitive Examination Preparation'
  ];

  const conditions = [
    { label: 'Like New', desc: 'No marks, clean pages, pristine cover' },
    { label: 'Good', desc: 'Minor wear, no missing pages' },
    { label: 'Fair', desc: 'Noticeable wear, highlighted text' },
    { label: 'Poor', desc: 'Heavy wear, functional and readable' }
  ];

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
              publisher: b.publisher || '',
              edition: b.edition || '',
              exchangePreferences: b.exchangePreferences || '',
              city: b.city || '',
              description: b.description,
              category: b.category,
              subject: b.subject || '',
              condition: b.condition,
              price: b.price !== undefined ? b.price : '',
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

  // Upload image file
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
      showToast('Image upload failed. You can also paste an image URL.', 'error');
    } finally {
      setUploadingImage(false);
    }
  };

  // Add image via URL
  const handleAddImageUrl = () => {
    if (imageUrlInput.trim()) {
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, imageUrlInput.trim()]
      }));
      setImageUrlInput('');
      showToast('Image URL added!', 'success');
    }
  };

  const handleRemoveImage = (indexToRemove) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, idx) => idx !== indexToRemove)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      showToast('Please enter a book title', 'error');
      return;
    }
    if (!formData.author.trim()) {
      showToast('Please enter the author name', 'error');
      return;
    }
    if (!formData.description.trim()) {
      showToast('Please enter a brief book description', 'error');
      return;
    }

    // Default image if none provided
    const submissionImages =
      formData.images.length > 0
        ? formData.images
        : ['https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80'];

    const payload = {
      ...formData,
      images: submissionImages,
      price: formData.listingType === 'Donate' ? 0 : Number(formData.price) || 0,
      originalPrice: Number(formData.originalPrice) || 0
    };

    setSubmitting(true);
    try {
      if (isEditing) {
        const res = await api.put(`/books/${id}`, payload);
        if (res.data.success) {
          showToast('Book listing updated successfully!', 'success');
          navigate(`/books/${id}`);
        }
      } else {
        const res = await api.post('/books', payload);
        if (res.data.success) {
          showToast('Book published successfully to the marketplace!', 'success');
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

  const previewCover =
    formData.images.length > 0
      ? formData.images[0]
      : 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80';

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm font-semibold text-slate-600">Loading book details...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* 1. Header Banner */}
      <div className="bg-gradient-to-r from-cream-100 via-white to-cream-50 p-6 sm:p-10 rounded-3xl border border-cream-200/60 shadow-xs max-w-3xl">
        <span className="text-xs font-bold text-accent uppercase tracking-widest">
          {isEditing ? 'Update Listing' : 'Student Marketplace'}
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-primary tracking-tight mt-1">
          {isEditing ? 'Edit Your Book Listing' : 'Give Your Book a New Home!'}
        </h1>
        <p className="text-sm text-slate-600 mt-2 leading-relaxed">
          Have books you no longer use? List them here and help another student while recovering your expenses.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left: 5-Step Form (8 columns) */}
        <form onSubmit={handleSubmit} className="lg:col-span-7 space-y-8">
          {/* STEP 1: Upload Book Cover Image */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-soft space-y-4">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-xl bg-primary text-accent flex items-center justify-center font-black text-sm">
                1
              </span>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Book Cover Image</h3>
                <p className="text-xs text-slate-500">Upload a clear photo of your book cover</p>
              </div>
            </div>

            {/* Upload Zone */}
            <div className="border-2 border-dashed border-slate-200 hover:border-accent/60 rounded-2xl p-6 text-center transition-colors bg-slate-50/50">
              <input
                type="file"
                id="bookCoverUpload"
                accept="image/*"
                onChange={handleFileUpload}
                disabled={uploadingImage}
                className="hidden"
              />
              <label
                htmlFor="bookCoverUpload"
                className="cursor-pointer flex flex-col items-center space-y-2"
              >
                <div className="w-12 h-12 rounded-2xl bg-cream-100 text-accent flex items-center justify-center">
                  <Upload className="w-6 h-6" />
                </div>
                <span className="text-xs sm:text-sm font-bold text-primary">
                  {uploadingImage ? 'Uploading photo...' : 'Click to Upload Cover Image'}
                </span>
                <span className="text-[11px] text-slate-400">PNG, JPG, or WEBP up to 5MB</span>
              </label>
            </div>

            {/* Alternative: Image URL Input */}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="text"
                placeholder="Or paste an image web link (URL)..."
                value={imageUrlInput}
                onChange={(e) => setImageUrlInput(e.target.value)}
                className="flex-1 text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/40"
              />
              <button
                type="button"
                onClick={handleAddImageUrl}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
              >
                Add URL
              </button>
            </div>

            {/* Image Thumbnails */}
            {formData.images.length > 0 && (
              <div className="flex items-center gap-3 pt-2 overflow-x-auto">
                {formData.images.map((img, idx) => (
                  <div key={idx} className="relative group w-16 h-20 rounded-xl overflow-hidden border border-slate-200 shrink-0">
                    <img src={img} alt="thumbnail" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      className="absolute inset-0 bg-slate-900/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-4 h-4 text-rose-300" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* STEP 2: Enter Book Details */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-soft space-y-4">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-xl bg-primary text-accent flex items-center justify-center font-black text-sm">
                2
              </span>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Book Details</h3>
                <p className="text-xs text-slate-500">Essential information to help students find it</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Book Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g. Operating System Concepts (10th Edition)"
                  required
                  className="w-full text-xs sm:text-sm p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/40"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Author(s) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="author"
                    value={formData.author}
                    onChange={handleChange}
                    placeholder="e.g. Silberschatz, Galvin"
                    required
                    className="w-full text-xs sm:text-sm p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/40"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Category <span className="text-rose-500">*</span>
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full text-xs sm:text-sm p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/40 cursor-pointer"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    ISBN (Optional)
                  </label>
                  <input
                    type="text"
                    name="ISBN"
                    value={formData.ISBN}
                    onChange={handleChange}
                    placeholder="e.g. 978-0134685991"
                    className="w-full text-xs sm:text-sm p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/40"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Publisher (Optional)
                  </label>
                  <input
                    type="text"
                    name="publisher"
                    value={formData.publisher}
                    onChange={handleChange}
                    placeholder="e.g. Pearson, O'Reilly"
                    className="w-full text-xs sm:text-sm p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/40"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Edition (Optional)
                  </label>
                  <input
                    type="text"
                    name="edition"
                    value={formData.edition}
                    onChange={handleChange}
                    placeholder="e.g. 3rd Edition"
                    className="w-full text-xs sm:text-sm p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/40"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Description <span className="text-rose-500">*</span>
                </label>
                <textarea
                  name="description"
                  rows={3}
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Mention edition, highlighting, condition, or relevant course codes..."
                  required
                  className="w-full text-xs sm:text-sm p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/40"
                />
              </div>

              {/* Book Condition Selectable Cards */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 uppercase">
                  Book Condition
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {conditions.map((c) => (
                    <button
                      key={c.label}
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, condition: c.label }))}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        formData.condition === c.label
                          ? 'border-accent bg-accent/10 ring-2 ring-accent/30'
                          : 'border-slate-200 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <span className="block text-xs font-bold text-slate-900">{c.label}</span>
                      <span className="block text-[10px] text-slate-500 mt-0.5">{c.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* STEP 3: Select What You Want (Listing Type) */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-soft space-y-4">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-xl bg-primary text-accent flex items-center justify-center font-black text-sm">
                3
              </span>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Select What You Want</h3>
                <p className="text-xs text-slate-500">Choose how other students can acquire your book</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Option 1: Sell my book */}
              <div
                onClick={() => setFormData((prev) => ({ ...prev, listingType: 'Sell' }))}
                className={`p-4 rounded-2xl border cursor-pointer transition-all space-y-2 ${
                  formData.listingType === 'Sell'
                    ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-accent" />
                </div>
                <h4 className="font-bold text-sm text-slate-900">Sell my book</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Set a fair price and recover your textbook costs.
                </p>
              </div>

              {/* Option 2: Exchange my book */}
              <div
                onClick={() => setFormData((prev) => ({ ...prev, listingType: 'Exchange' }))}
                className={`p-4 rounded-2xl border cursor-pointer transition-all space-y-2 ${
                  formData.listingType === 'Exchange'
                    ? 'border-purple-600 bg-purple-50 ring-2 ring-purple-200'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center">
                  <ArrowRightLeft className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-sm text-slate-900">Exchange my book</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Swap with another student for a book you need.
                </p>
              </div>

              {/* Option 3: Donate my book */}
              <div
                onClick={() => setFormData((prev) => ({ ...prev, listingType: 'Donate', price: 0 }))}
                className={`p-4 rounded-2xl border cursor-pointer transition-all space-y-2 ${
                  formData.listingType === 'Donate'
                    ? 'border-emerald-600 bg-emerald-50 ring-2 ring-emerald-200'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
                  <Gift className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-sm text-slate-900">Donate my book</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Offer it completely free to support a junior student.
                </p>
              </div>
            </div>

            {formData.listingType === 'Exchange' && (
              <div className="pt-2 animate-in fade-in duration-200">
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Exchange Preferences (What books or subjects would you like?)
                </label>
                <input
                  type="text"
                  name="exchangePreferences"
                  value={formData.exchangePreferences}
                  onChange={handleChange}
                  placeholder="e.g. Looking for Machine Learning textbooks, Design Patterns, or Calculus III"
                  className="w-full text-xs sm:text-sm p-3 bg-purple-50/50 border border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
              </div>
            )}
          </div>

          {/* STEP 4: Pricing Details */}
          {formData.listingType !== 'Donate' && (
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-soft space-y-4">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-xl bg-primary text-accent flex items-center justify-center font-black text-sm">
                  4
                </span>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Enter Price</h3>
                  <p className="text-xs text-slate-500">
                    {formData.listingType === 'Exchange'
                      ? 'Optional estimated value for exchange comparison'
                      : 'Your asking price in USD ($)'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Your Price ($) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    placeholder="e.g. 35"
                    min="0"
                    step="0.5"
                    required={formData.listingType === 'Sell'}
                    className="w-full text-xs sm:text-sm p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/40"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Original Retail Price ($) <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="number"
                    name="originalPrice"
                    value={formData.originalPrice}
                    onChange={handleChange}
                    placeholder="e.g. 90"
                    min="0"
                    className="w-full text-xs sm:text-sm p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/40"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: College & Campus Location */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-soft space-y-4">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-xl bg-primary text-accent flex items-center justify-center font-black text-sm">
                5
              </span>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Campus & Meetup Spot</h3>
                <p className="text-xs text-slate-500">Where interested students can meet you to complete the handover</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  College / University
                </label>
                <input
                  type="text"
                  name="college"
                  value={formData.college}
                  onChange={handleChange}
                  placeholder="e.g. Stanford University"
                  required
                  className="w-full text-xs sm:text-sm p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/40"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  City / Region
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="e.g. Palo Alto, CA"
                  className="w-full text-xs sm:text-sm p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/40"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Preferred Campus Meetup Spot
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="e.g. Gates CS Building / Green Library"
                  required
                  className="w-full text-xs sm:text-sm p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/40"
                />
              </div>
            </div>
          </div>

          {/* Submit Action Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 rounded-2xl bg-accent hover:bg-accent-hover text-white text-base font-black shadow-soft hover:shadow-soft-lg transition-all duration-200 flex items-center justify-center gap-2 transform hover:-translate-y-0.5"
            >
              {submitting ? (
                <span>Publishing Your Listing...</span>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span>{isEditing ? 'Save Listing Changes' : 'Publish My Book'}</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Right: Live Listing Preview (5 columns) */}
        <div className="lg:col-span-5 sticky top-28 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Live Listing Preview
            </span>
            <span className="text-[11px] text-accent font-semibold flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> What buyers will see
            </span>
          </div>

          {/* Preview Card */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-soft-lg overflow-hidden">
            <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden">
              <img
                src={previewCover}
                alt="Book cover preview"
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 left-3">
                <span
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg shadow-sm text-white ${
                    formData.listingType === 'Donate'
                      ? 'bg-emerald-600'
                      : formData.listingType === 'Exchange'
                      ? 'bg-purple-600'
                      : 'bg-primary'
                  }`}
                >
                  {formData.listingType === 'Donate'
                    ? 'Free Donation'
                    : formData.listingType === 'Exchange'
                    ? 'For Exchange'
                    : 'For Sale'}
                </span>
              </div>
              <div className="absolute bottom-2.5 left-3">
                <span className="px-2 py-0.5 rounded-md bg-white/95 text-slate-800 text-[11px] font-bold shadow-xs">
                  {formData.condition}
                </span>
              </div>
            </div>

            <div className="p-5 space-y-3">
              <span className="text-[11px] font-bold text-accent uppercase tracking-wider block">
                {formData.category}
              </span>
              <h3 className="font-bold text-lg text-slate-900 line-clamp-1 leading-snug">
                {formData.title || 'Your Book Title Will Appear Here'}
              </h3>
              <p className="text-xs text-slate-600 line-clamp-1">
                by {formData.author || 'Author Name'}
              </p>

              <div className="flex items-center gap-1.5 text-xs text-slate-500 pt-1">
                <MapPin className="w-3.5 h-3.5 text-accent shrink-0" />
                <span className="truncate">{formData.college}</span>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <div>
                  {formData.listingType === 'Donate' ? (
                    <span className="text-xl font-black text-emerald-600">FREE</span>
                  ) : (
                    <span className="text-xl font-black text-primary">
                      ${formData.price || '0'}
                    </span>
                  )}
                </div>
                <span className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-600 text-xs font-bold">
                  View Book
                </span>
              </div>
            </div>

            {formData.listingType === 'Exchange' && (
              <div className="pt-2 animate-in fade-in duration-200">
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Exchange Preferences (What books or subjects would you like?)
                </label>
                <input
                  type="text"
                  name="exchangePreferences"
                  value={formData.exchangePreferences}
                  onChange={handleChange}
                  placeholder="e.g. Looking for Machine Learning textbooks, Design Patterns, or Calculus III"
                  className="w-full text-xs sm:text-sm p-3 bg-purple-50/50 border border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
              </div>
            )}
          </div>

          <div className="p-4 bg-cream-50 rounded-2xl border border-cream-200/60 text-xs text-slate-600 space-y-1.5">
            <p className="font-bold text-slate-800 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-accent" />
              Tip for Fast Responses:
            </p>
            <p>
              Books with real cover photos and accurate condition descriptions sell or swap 3x faster on campus!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddBookPage;
