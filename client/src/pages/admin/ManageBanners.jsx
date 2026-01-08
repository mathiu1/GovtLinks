import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import API from '../../api';
import { FiEdit2, FiTrash2, FiPlus, FiX, FiSearch, FiImage, FiDroplet, FiCheckCircle, FiXCircle } from 'react-icons/fi';

const ManageBanners = () => {
    const [banners, setBanners] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentBanner, setCurrentBanner] = useState(null);
    const [search, setSearch] = useState('');

    const GRADIENT_OPTIONS = [
        { label: 'Green - Emerald', value: 'from-green-900/90 to-emerald-900/40' },
        { label: 'Blue - Indigo', value: 'from-blue-900/90 to-indigo-900/40' },
        { label: 'Purple - Pink', value: 'from-purple-900/90 to-pink-900/40' },
        { label: 'Orange - Red', value: 'from-orange-900/90 to-red-900/40' },
        { label: 'Slate - Gray', value: 'from-slate-900/90 to-gray-900/40' },
    ];

    const [formData, setFormData] = useState({
        title_en: '', title_ta: '', desc_en: '', desc_ta: '',
        image: '', gradient: GRADIENT_OPTIONS[0].value, link: '', isActive: true
    });

    useEffect(() => {
        fetchBanners();
    }, []);

    const fetchBanners = async () => {
        try {
            const res = await API.get('/banners/all');
            setBanners(res.data);
        } catch (error) {
            console.error("Failed to fetch banners", error);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this banner?')) {
            try {
                await API.delete(`/banners/${id}`);
                fetchBanners();
            } catch (error) {
                console.error("Delete failed", error);
            }
        }
    };

    const handleEdit = (banner) => {
        setCurrentBanner(banner);
        setFormData({
            title_en: banner.title_en,
            title_ta: banner.title_ta,
            desc_en: banner.desc_en,
            desc_ta: banner.desc_ta,
            image: banner.image,
            gradient: banner.gradient,
            link: banner.link || '',
            isActive: banner.isActive
        });
        setIsModalOpen(true);
    };

    const handleAdd = () => {
        setCurrentBanner(null);
        setFormData({
            title_en: '', title_ta: '', desc_en: '', desc_ta: '',
            image: '', gradient: GRADIENT_OPTIONS[0].value, link: '', isActive: true
        });
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (currentBanner) {
                await API.put(`/banners/${currentBanner._id}`, formData);
            } else {
                await API.post('/banners', formData);
            }
            setIsModalOpen(false);
            fetchBanners();
        } catch (error) {
            console.error(error);
            alert('Error saving banner');
        }
    };

    const filteredBanners = banners.filter(b =>
        b.title_en.toLowerCase().includes(search.toLowerCase()) ||
        b.title_ta.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="p-6 md:p-10 space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight">Banner Management</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm md:text-base">Control the home page sliding banners</p>
                </div>
                <button
                    onClick={handleAdd}
                    className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl transition-all font-bold shadow-lg shadow-blue-600/30 hover:shadow-blue-600/50 hover:-translate-y-0.5 w-full md:w-auto"
                >
                    <FiPlus />
                    <span>Add New Banner</span>
                </button>
            </div>

            {/* Content Card */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-black/50 border border-slate-100 dark:border-slate-800 overflow-hidden">
                {/* Toolbar */}
                <div className="p-4 md:p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="relative w-full md:w-96">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FiSearch className="text-slate-400" />
                        </div>
                        <input
                            type="text"
                            className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl leading-5 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition duration-150 ease-in-out text-sm font-medium"
                            placeholder="Search banners..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                {/* Grid View for Banners */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 p-6">
                    {filteredBanners.map(banner => (
                        <div key={banner._id} className="group relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 shadow-sm hover:shadow-lg transition-all">
                            {/* Image Preview */}
                            <div className="h-40 w-full relative">
                                <img src={banner.image} alt={banner.title_en} className="w-full h-full object-cover" />
                                <div className={`absolute inset-0 bg-gradient-to-r ${banner.gradient} mix-blend-multiply opacity-80`} />
                                <div className="absolute top-2 right-2 flex gap-2">
                                    <button
                                        onClick={() => handleEdit(banner)}
                                        className="bg-white/20 backdrop-blur-md p-2 rounded-lg text-white hover:bg-white/40 transition-colors"
                                    >
                                        <FiEdit2 />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(banner._id)}
                                        className="bg-red-500/80 backdrop-blur-md p-2 rounded-lg text-white hover:bg-red-600 transition-colors"
                                    >
                                        <FiTrash2 />
                                    </button>
                                </div>
                                <div className="absolute bottom-2 left-2">
                                    {banner.isActive ?
                                        <span className="bg-emerald-500/90 text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded-full flex items-center gap-1"><FiCheckCircle /> Active</span> :
                                        <span className="bg-slate-500/90 text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded-full flex items-center gap-1"><FiXCircle /> Inactive</span>
                                    }
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-4 space-y-2">
                                <h3 className="font-bold text-slate-800 dark:text-white line-clamp-1">{banner.title_en}</h3>
                                <p className="text-xs text-slate-500 line-clamp-2">{banner.desc_en}</p>
                            </div>
                        </div>
                    ))}

                    {filteredBanners.length === 0 && (
                        <div className="col-span-full py-10 text-center text-slate-400">
                            No banners found.
                        </div>
                    )}
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && createPortal(
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl animate-scale-in border border-slate-100 dark:border-slate-800">
                        <div className="sticky top-0 z-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-slate-800 dark:text-white">
                                {currentBanner ? 'Edit Banner' : 'Create New Banner'}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
                                <FiX className="text-xl" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            {/* Titles */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase text-slate-500">Title (English)</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-semibold"
                                        value={formData.title_en}
                                        onChange={(e) => setFormData({ ...formData, title_en: e.target.value })}
                                        placeholder="e.g. New Scheme 2024"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase text-slate-500">Title (Tamil)</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-semibold"
                                        value={formData.title_ta}
                                        onChange={(e) => setFormData({ ...formData, title_ta: e.target.value })}
                                        placeholder="e.g. புதிய திட்டம்"
                                    />
                                </div>
                            </div>

                            {/* Descriptions */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase text-slate-500">Description (English)</label>
                                <textarea
                                    required
                                    rows="2"
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                    value={formData.desc_en}
                                    onChange={(e) => setFormData({ ...formData, desc_en: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase text-slate-500">Description (Tamil)</label>
                                <textarea
                                    required
                                    rows="2"
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                    value={formData.desc_ta}
                                    onChange={(e) => setFormData({ ...formData, desc_ta: e.target.value })}
                                />
                            </div>

                            {/* Image & Gradient */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase text-slate-500 flex items-center gap-2"><FiImage /> Image URL</label>
                                    <input
                                        type="url"
                                        required
                                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-mono text-sm"
                                        value={formData.image}
                                        onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                                        placeholder="https://..."
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase text-slate-500 flex items-center gap-2"><FiDroplet /> Gradient Overlay</label>
                                    <select
                                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none cursor-pointer"
                                        value={formData.gradient}
                                        onChange={(e) => setFormData({ ...formData, gradient: e.target.value })}
                                    >
                                        {GRADIENT_OPTIONS.map(opt => (
                                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Link & Status */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase text-slate-500">Target Link (Optional)</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                        value={formData.link}
                                        onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                                        placeholder="/detail/..."
                                    />
                                </div>
                                <div className="space-y-2 flex items-end pb-3">
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                            checked={formData.isActive}
                                            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                        />
                                        <span className="font-bold text-slate-700 dark:text-slate-300">Set Active</span>
                                    </label>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="sticky bottom-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md pt-4 pb-0 flex justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-6 py-2.5 rounded-xl font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2.5 rounded-xl font-bold bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition-all hover:scale-105"
                                >
                                    {currentBanner ? 'Update Banner' : 'Create Banner'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};

export default ManageBanners;
