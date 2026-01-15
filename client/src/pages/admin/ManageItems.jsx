import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import API from '../../api';
import { FiEdit2, FiTrash2, FiPlus, FiX, FiSearch, FiLink, FiLayers, FiInfo, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { FaYoutube } from 'react-icons/fa';

const ManageItems = ({ pageCategory }) => {
    const [items, setItems] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState(null);
    const [search, setSearch] = useState('');

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    // Form State
    const [formData, setFormData] = useState({
        title_en: '', title_ta: '', category: pageCategory || 'Service', sub_category: '',
        description_en: '', description_ta: '',
        official_links: [], youtube_links: [],
        steps: [],
        vacancies: '', location: '', applicationStartDate: '', applicationEndDate: '', examDate: ''
    });

    useEffect(() => {
        fetchItems();
    }, [pageCategory]);

    // Reset to page 1 when category or search changes
    useEffect(() => {
        setCurrentPage(1);
    }, [pageCategory, search]);

    const fetchItems = async () => {
        try {
            const res = await API.get('/admin/items'); // Fetch full data without cache
            setItems(res.data);
        } catch (error) {
            console.error("Failed to fetch items", error);
        }
    };

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);

    const checkDelete = (item) => {
        setItemToDelete(item);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!itemToDelete) return;
        try {
            await API.delete(`/admin/items/${itemToDelete._id}`);
            fetchItems();
            setIsDeleteModalOpen(false);
            setItemToDelete(null);
        } catch (error) {
            console.error("Delete failed", error);
            alert("Failed to delete item");
        }
    };

    const handleEdit = (item) => {
        setCurrentItem(item);

        // Handle migration from old single fields to new array fields if necessary
        const officialLinks = item.official_links && item.official_links.length > 0
            ? item.official_links
            : (item.official_link ? [{ url: item.official_link, label_en: 'Official Link', label_ta: 'அதிகாரப்பூர்வ இணைப்பு' }] : []);

        const youtubeLinks = item.youtube_links && item.youtube_links.length > 0
            ? item.youtube_links
            : (item.youtube_link ? [item.youtube_link] : []);

        setFormData({
            title_en: item.title_en,
            title_ta: item.title_ta,
            category: item.category,
            sub_category: item.sub_category,
            description_en: item.description_en,
            description_ta: item.description_ta,
            official_links: officialLinks,
            youtube_links: youtubeLinks,
            steps: item.steps || [],
            vacancies: item.vacancies || '',
            location: item.location || '',
            applicationStartDate: item.applicationStartDate || '',
            applicationEndDate: item.applicationEndDate || '',
            examDate: item.examDate || ''
        });
        setIsModalOpen(true);
    };

    const handleAdd = () => {
        setCurrentItem(null);
        setFormData({
            title_en: '', title_ta: '', category: pageCategory || 'Service', sub_category: '',
            description_en: '', description_ta: '',
            official_links: [], youtube_links: [],
            steps: [],
            vacancies: '', location: '', applicationStartDate: '', applicationEndDate: '', examDate: ''
        });
        setIsModalOpen(true);
    };

    // Step Handlers
    const handleAddStep = () => {
        setFormData({
            ...formData,
            steps: [...formData.steps, { title_en: '', title_ta: '', desc_en: '', desc_ta: '' }]
        });
    };

    const handleRemoveStep = (index) => {
        const newSteps = formData.steps.filter((_, i) => i !== index);
        setFormData({ ...formData, steps: newSteps });
    };

    const handleStepChange = (index, field, value) => {
        const newSteps = [...formData.steps];
        newSteps[index][field] = value;
        setFormData({ ...formData, steps: newSteps });
    };

    // Official Link Handlers
    const handleAddOfficialLink = () => {
        setFormData({
            ...formData,
            official_links: [...formData.official_links, { url: '', label_en: '', label_ta: '' }]
        });
    };

    const handleRemoveOfficialLink = (index) => {
        const newLinks = formData.official_links.filter((_, i) => i !== index);
        setFormData({ ...formData, official_links: newLinks });
    };

    const handleOfficialLinkChange = (index, field, value) => {
        const newLinks = [...formData.official_links];
        newLinks[index][field] = value;
        setFormData({ ...formData, official_links: newLinks });
    };

    // YouTube Link Handlers
    const handleAddYoutubeLink = () => {
        setFormData({
            ...formData,
            youtube_links: [...formData.youtube_links, '']
        });
    };

    const handleRemoveYoutubeLink = (index) => {
        const newLinks = formData.youtube_links.filter((_, i) => i !== index);
        setFormData({ ...formData, youtube_links: newLinks });
    };

    const handleYoutubeLinkChange = (index, value) => {
        const newLinks = [...formData.youtube_links];
        newLinks[index] = value;
        setFormData({ ...formData, youtube_links: newLinks });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (currentItem) {
                await API.put(`/admin/items/${currentItem._id}`, formData);
            } else {
                await API.post('/admin/items', formData);
            }
            setIsModalOpen(false);
            fetchItems();
        } catch (error) {
            console.error(error);
            alert('Error saving item');
        }
    };

    const filteredItems = items.filter(i =>
        (i.title_en.toLowerCase().includes(search.toLowerCase()) ||
            i.category.toLowerCase().includes(search.toLowerCase())) &&
        (!pageCategory || i.category === pageCategory)
    );

    // Pagination Logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredItems.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const getPageNumbers = () => {
        if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
        if (currentPage <= 3) return [1, 2, 3, 4, 5];
        if (currentPage >= totalPages - 2) return [totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
        return [currentPage - 2, currentPage - 1, currentPage, currentPage + 1, currentPage + 2];
    };

    return (
        <div className="p-6 md:p-10 space-y-8">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight">
                        Manage {pageCategory ? `${pageCategory}s` : 'Items'}
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm md:text-base">
                        Create, edit, and organize your {pageCategory ? pageCategory.toLowerCase() : 'service'} content
                    </p>
                </div>
                <button
                    onClick={handleAdd}
                    className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl transition-all font-bold shadow-lg shadow-blue-600/30 hover:shadow-blue-600/50 hover:-translate-y-0.5 w-full md:w-auto"
                >
                    <FiPlus />
                    <span>Add New {pageCategory || 'Item'}</span>
                </button>
            </div>

            {/* Main Content Card */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-black/50 border border-slate-100 dark:border-slate-800 overflow-hidden">
                {/* Toolbar */}
                <div className="p-4 md:p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="relative w-full md:w-96">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FiSearch className="text-slate-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search..."
                            className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl leading-5 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition duration-150 ease-in-out text-sm font-medium"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-4">
                        <select
                            value={itemsPerPage}
                            onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm font-bold rounded-xl focus:ring-blue-500 focus:border-blue-500 block p-2.5 px-4 outline-none appearance-none cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                        >
                            <option value={10}>10 per page</option>
                            <option value={25}>25 per page</option>
                            <option value={50}>50 per page</option>
                            <option value={100}>100 per page</option>
                        </select>
                        <div className="text-sm text-slate-500 font-medium whitespace-nowrap">
                            Showing <span className="text-slate-800 dark:text-white font-bold">{filteredItems.length}</span> results
                        </div>
                    </div>
                </div>

                {/* Table View (Desktop) */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">
                                <th className="p-5 font-bold">Content Details</th>
                                <th className="p-5 font-bold">Category</th>
                                <th className="p-5 font-bold">Links</th>
                                <th className="p-5 font-bold text-right" width="120">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {currentItems.map(item => (
                                <tr key={item._id} className="group hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-colors duration-200">
                                    <td className="p-5">
                                        <div className="space-y-1">
                                            <div className="font-bold text-slate-800 dark:text-slate-100 text-base">{item.title_en}</div>
                                            <div className="text-sm text-slate-500 font-medium font-tamil">{item.title_ta}</div>
                                        </div>
                                    </td>
                                    <td className="p-5">
                                        <div className="flex flex-col gap-2 items-start">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wide border ${item.category === 'Service' ? 'bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800' :
                                                item.category === 'Scheme' ? 'bg-purple-50 text-purple-700 border-purple-100 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800' :
                                                    item.category === 'Exam' ? 'bg-indigo-50 text-indigo-700 border-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-800' :
                                                        'bg-orange-50 text-orange-700 border-orange-100 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800'
                                                }`}>
                                                <FiLayers className="text-[10px]" />
                                                {item.category}
                                            </span>
                                            {item.sub_category && (
                                                <span className="text-xs font-medium text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                                                    {item.sub_category}
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="p-5">
                                        <div className="flex items-center gap-2">
                                            {/* Show Count of Links if array, or single icon if migrated */}
                                            {(item.official_links && item.official_links.length > 0) || item.official_link ? (
                                                <span className="flex items-center gap-1 bg-emerald-50 text-emerald-600 px-2 py-1 rounded-lg text-xs font-bold">
                                                    <FiLink /> {(item.official_links?.length || 1)}
                                                </span>
                                            ) : null}

                                            {(item.youtube_links && item.youtube_links.length > 0) || item.youtube_link ? (
                                                <span className="flex items-center gap-1 bg-red-50 text-red-600 px-2 py-1 rounded-lg text-xs font-bold">
                                                    <FaYoutube /> {(item.youtube_links?.length || 1)}
                                                </span>
                                            ) : null}
                                        </div>
                                    </td>
                                    <td className="p-5 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button onClick={() => handleEdit(item)} className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors" title="Edit">
                                                <FiEdit2 />
                                            </button>
                                            <button onClick={() => checkDelete(item)} className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors" title="Delete">
                                                <FiTrash2 />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredItems.length === 0 && (
                                <tr>
                                    <td colSpan="4" className="p-12 text-center text-slate-400">
                                        <div className="flex flex-col items-center gap-2">
                                            <FiInfo className="text-3xl text-slate-300" />
                                            <p>No items found. Click "Add New" to create one.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden grid grid-cols-1 gap-4 p-4">
                    {currentItems.map(item => (
                        <div key={item._id} className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 flex flex-col gap-4">
                            <div className="flex justify-between items-start">
                                <div className="space-y-1">
                                    <div className="font-bold text-slate-800 dark:text-slate-100">{item.title_en}</div>
                                    <div className="text-sm text-slate-500 font-medium font-tamil line-clamp-1">{item.title_ta}</div>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => handleEdit(item)} className="p-2 text-blue-600 bg-blue-50 dark:bg-blue-900/20 rounded-lg" title="Edit">
                                        <FiEdit2 />
                                    </button>
                                    <button onClick={() => checkDelete(item)} className="p-2 text-red-600 bg-red-50 dark:bg-red-900/20 rounded-lg" title="Delete">
                                        <FiTrash2 />
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 flex-wrap">
                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wide border ${item.category === 'Service' ? 'bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800' :
                                    item.category === 'Scheme' ? 'bg-purple-50 text-purple-700 border-purple-100 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800' :
                                        item.category === 'Exam' ? 'bg-indigo-50 text-indigo-700 border-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-800' :
                                            'bg-orange-50 text-orange-700 border-orange-100 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800'
                                    }`}>
                                    <FiLayers className="text-[10px]" />
                                    {item.category}
                                </span>
                                {item.sub_category && (
                                    <span className="text-xs font-medium text-slate-500 bg-white dark:bg-slate-900 px-2 py-1 rounded-md border border-slate-100 dark:border-slate-700">
                                        {item.sub_category}
                                    </span>
                                )}
                            </div>

                            <div className="flex items-center gap-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                                {/* Show Count of Links if array, or single link text if migrated */}
                                {(item.official_links && item.official_links.length > 0) || item.official_link ? (
                                    <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                                        <FiLink /> {(item.official_links?.length || 1)} Links
                                    </span>
                                ) : null}

                                {(item.youtube_links && item.youtube_links.length > 0) || item.youtube_link ? (
                                    <span className="text-xs font-bold text-red-600 flex items-center gap-1 ml-3">
                                        <FaYoutube /> {(item.youtube_links?.length || 1)} Videos
                                    </span>
                                ) : null}
                            </div>
                        </div>
                    ))}
                    {filteredItems.length === 0 && (
                        <div className="p-8 text-center text-slate-400 flex flex-col items-center gap-2">
                            <FiInfo className="text-3xl text-slate-300" />
                            <p>No items found.</p>
                        </div>
                    )}
                </div>

                {/* Pagination Controls */}
                {filteredItems.length > 0 && (
                    <div className="border-t border-slate-100 dark:border-slate-800 p-4 md:p-6 flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-50/50 dark:bg-slate-800/20">
                        <div className="text-sm text-slate-500 font-medium">
                            Showing <span className="font-bold text-slate-800 dark:text-slate-200">{indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredItems.length)}</span> of <span className="font-bold text-slate-800 dark:text-slate-200">{filteredItems.length}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => paginate(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <FiChevronLeft />
                            </button>
                            <div className="hidden sm:flex gap-1">
                                {getPageNumbers().map(number => (
                                    <button
                                        key={number}
                                        onClick={() => paginate(number)}
                                        className={`w-8 h-8 rounded-lg text-sm font-bold transition-all ${currentPage === number
                                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                                            : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                                            }`}
                                    >
                                        {number}
                                    </button>
                                ))}
                            </div>
                            <span className="sm:hidden text-sm font-bold text-slate-600 dark:text-slate-400">
                                Page {currentPage} of {totalPages}
                            </span>
                            <button
                                onClick={() => paginate(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <FiChevronRight />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Premium Modal */}
            {isModalOpen && createPortal(
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[100]">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl animate-fade-in-up border border-slate-100 dark:border-slate-800">
                        {/* Modal Header */}
                        <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center sticky top-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur z-20">
                            <div>
                                <h2 className="text-2xl font-bold text-slate-800 dark:text-white">{currentItem ? 'Edit Content' : 'Create New Content'}</h2>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Fill in the details below to publish.</p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-center text-slate-500 hover:text-slate-800 dark:hover:text-white transition-all">
                                <FiX />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-8 space-y-8">
                            {/* Basic Info Group */}
                            <div className="space-y-6">
                                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                    <span className="w-8 h-[1px] bg-slate-300 dark:bg-slate-700"></span> Basic Information
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Title (English)</label>
                                        <input required className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium placeholder-slate-400"
                                            placeholder="e.g., Apply for Voter ID"
                                            value={formData.title_en} onChange={e => setFormData({ ...formData, title_en: e.target.value })} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Title (Tamil)</label>
                                        <input required className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium placeholder-slate-400"
                                            placeholder="e.g., வாக்காளர் அட்டை விண்ணப்பிக்க"
                                            value={formData.title_ta} onChange={e => setFormData({ ...formData, title_ta: e.target.value })} />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Category</label>
                                        <select className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium disabled:opacity-60 disabled:cursor-not-allowed appearance-none"
                                            value={formData.category}
                                            onChange={e => setFormData({ ...formData, category: e.target.value })}
                                            disabled={!!pageCategory}
                                        >
                                            <option value="Service">Service</option>
                                            <option value="Scheme">Scheme</option>
                                            <option value="Exam">Exam</option>
                                            <option value="Job">Job</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Sub Category</label>
                                        <input className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium placeholder-slate-400"
                                            placeholder="e.g., Identity, Agriculture"
                                            value={formData.sub_category} onChange={e => setFormData({ ...formData, sub_category: e.target.value })} />
                                    </div>
                                </div>

                                {/* Job & Exam Specific Fields */}
                                {(formData.category === 'Job' || formData.category === 'Exam') && (
                                    <div className="bg-blue-50/50 dark:bg-blue-900/10 p-6 rounded-2xl border border-blue-100 dark:border-blue-800/30 space-y-6">
                                        <h3 className="text-sm font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider flex items-center gap-2">
                                            <span className="w-8 h-[1px] bg-blue-300 dark:bg-blue-700"></span> {formData.category} Details
                                        </h3>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Vacancies / Posts</label>
                                                <input className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium placeholder-slate-400"
                                                    placeholder="e.g., 6244 Posts"
                                                    value={formData.vacancies || ''} onChange={e => setFormData({ ...formData, vacancies: e.target.value })} />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Location</label>
                                                <input className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium placeholder-slate-400"
                                                    placeholder="e.g., Tamil Nadu, All India"
                                                    value={formData.location || ''} onChange={e => setFormData({ ...formData, location: e.target.value })} />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Application Start Date</label>
                                                <input type="date" className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium placeholder-slate-400"
                                                    value={formData.applicationStartDate ? new Date(formData.applicationStartDate).toISOString().split('T')[0] : ''}
                                                    onChange={e => setFormData({ ...formData, applicationStartDate: e.target.value })} />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Application End Date</label>
                                                <input type="date" className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium placeholder-slate-400"
                                                    value={formData.applicationEndDate ? new Date(formData.applicationEndDate).toISOString().split('T')[0] : ''}
                                                    onChange={e => setFormData({ ...formData, applicationEndDate: e.target.value })} />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Exam Date</label>
                                                <input type="date" className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium placeholder-slate-400"
                                                    value={formData.examDate ? new Date(formData.examDate).toISOString().split('T')[0] : ''}
                                                    onChange={e => setFormData({ ...formData, examDate: e.target.value })} />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Description (English)</label>
                                        <textarea rows="3" className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium placeholder-slate-400 resize-none"
                                            value={formData.description_en} onChange={e => setFormData({ ...formData, description_en: e.target.value })} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Description (Tamil)</label>
                                        <textarea rows="3" className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium placeholder-slate-400 resize-none"
                                            value={formData.description_ta} onChange={e => setFormData({ ...formData, description_ta: e.target.value })} />
                                    </div>
                                </div>

                                {/* Official Links Section */}
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                                            Official Link(s)
                                        </label>
                                        <button type="button" onClick={handleAddOfficialLink} className="text-xs font-bold bg-blue-50 hover:bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 dark:text-blue-400 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-2 border border-blue-100 dark:border-blue-800">
                                            <FiPlus /> Add Link
                                        </button>
                                    </div>

                                    {formData.official_links.map((link, index) => (
                                        <div key={index} className="flex flex-col gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 relative group">
                                            <button type="button" onClick={() => handleRemoveOfficialLink(index)} className="absolute top-2 right-2 p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors">
                                                <FiX size={14} />
                                            </button>
                                            <div className="space-y-1">
                                                <label className="text-xs font-semibold text-slate-500">URL</label>
                                                <input className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                                    placeholder="https://..."
                                                    value={link.url} onChange={e => handleOfficialLinkChange(index, 'url', e.target.value)} />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-1">
                                                    <label className="text-xs font-semibold text-slate-500">Label (EN)</label>
                                                    <input className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                                        placeholder="e.g. Apply Online"
                                                        value={link.label_en} onChange={e => handleOfficialLinkChange(index, 'label_en', e.target.value)} />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-xs font-semibold text-slate-500">Label (TA)</label>
                                                    <input className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                                        placeholder="e.g. விண்ணப்பிக்க"
                                                        value={link.label_ta} onChange={e => handleOfficialLinkChange(index, 'label_ta', e.target.value)} />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {formData.official_links.length === 0 && (
                                        <div className="text-center py-6 text-slate-400 bg-slate-50/50 dark:bg-slate-800/20 rounded-xl border border-dashed border-slate-200 dark:border-slate-700 text-sm">
                                            No official links added.
                                        </div>
                                    )}
                                </div>

                                {/* YouTube Links Section */}
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                                            YouTube Video(s)
                                        </label>
                                        <button type="button" onClick={handleAddYoutubeLink} className="text-xs font-bold bg-blue-50 hover:bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 dark:text-blue-400 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-2 border border-blue-100 dark:border-blue-800">
                                            <FiPlus /> Add Video
                                        </button>
                                    </div>

                                    {formData.youtube_links.map((link, index) => (
                                        <div key={index} className="flex items-center gap-3">
                                            <div className="relative flex-1">
                                                <FaYoutube className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                                <input className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium placeholder-slate-400"
                                                    placeholder="https://youtube.com/..."
                                                    value={link} onChange={e => handleYoutubeLinkChange(index, e.target.value)} />
                                            </div>
                                            <button type="button" onClick={() => handleRemoveYoutubeLink(index)} className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors">
                                                <FiTrash2 size={16} />
                                            </button>
                                        </div>
                                    ))}
                                    {formData.youtube_links.length === 0 && (
                                        <div className="text-center py-6 text-slate-400 bg-slate-50/50 dark:bg-slate-800/20 rounded-xl border border-dashed border-slate-200 dark:border-slate-700 text-sm">
                                            No videos added.
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Steps Section */}
                            <div className="space-y-6 pt-2">
                                <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-2">
                                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                        <span className="w-8 h-[1px] bg-slate-300 dark:bg-slate-700"></span> Application Steps
                                    </h3>
                                    <button type="button" onClick={handleAddStep} className="text-xs font-bold bg-blue-50 hover:bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 dark:text-blue-400 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-2 border border-blue-100 dark:border-blue-800">
                                        <FiPlus /> Add Step
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    {formData.steps && formData.steps.length > 0 ? (
                                        formData.steps.map((step, index) => (
                                            <div key={index} className="bg-slate-50 dark:bg-slate-800/40 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 relative group transition-all hover:bg-slate-100 dark:hover:bg-slate-800/60">
                                                <div className="absolute top-4 right-4 flex gap-2">
                                                    <span className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-500 text-xs font-bold flex items-center justify-center">
                                                        {index + 1}
                                                    </span>
                                                    <button type="button" onClick={() => handleRemoveStep(index)} className="w-6 h-6 rounded-full bg-red-100 dark:bg-red-900/30 text-red-500 hover:bg-red-200 dark:hover:bg-red-900/50 flex items-center justify-center text-xs transition-colors" title="Remove Step">
                                                        <FiTrash2 />
                                                    </button>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pr-8">
                                                    <div className="space-y-1.5">
                                                        <label className="text-xs font-bold text-slate-400 uppercase">Step Title (EN)</label>
                                                        <input className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900/50 outline-none focus:border-blue-500 transition-colors"
                                                            value={step.title_en} onChange={e => handleStepChange(index, 'title_en', e.target.value)} placeholder="e.g. Visit Portal" />
                                                    </div>
                                                    <div className="space-y-1.5">
                                                        <label className="text-xs font-bold text-slate-400 uppercase">Step Title (TA)</label>
                                                        <input className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900/50 outline-none focus:border-blue-500 transition-colors"
                                                            value={step.title_ta} onChange={e => handleStepChange(index, 'title_ta', e.target.value)} placeholder="e.g. தளம் அணுகவும்" />
                                                    </div>
                                                    <div className="md:col-span-2 space-y-1.5">
                                                        <label className="text-xs font-bold text-slate-400 uppercase">Description (EN)</label>
                                                        <input className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900/50 outline-none focus:border-blue-500 transition-colors"
                                                            value={step.desc_en} onChange={e => handleStepChange(index, 'desc_en', e.target.value)} placeholder="Step details..." />
                                                    </div>
                                                    <div className="md:col-span-2 space-y-1.5">
                                                        <label className="text-xs font-bold text-slate-400 uppercase">Description (TA)</label>
                                                        <input className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900/50 outline-none focus:border-blue-500 transition-colors"
                                                            value={step.desc_ta} onChange={e => handleStepChange(index, 'desc_ta', e.target.value)} placeholder="விளக்கம்..." />
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-12 text-slate-400 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center gap-2">
                                            <FiLayers className="text-2xl opacity-50" />
                                            <p>No steps added yet. Add steps to guide users.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </form>

                        {/* Modal Footer */}
                        <div className="px-8 py-5 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-4 sticky bottom-0 bg-white dark:bg-slate-900 z-20 rounded-b-3xl">
                            <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 rounded-xl font-bold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors">
                                Cancel
                            </button>
                            <button onClick={handleSubmit} type="button" className="px-8 py-2.5 rounded-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:-translate-y-0.5 transition-all">
                                {currentItem ? 'Save Changes' : 'Publish Content'}
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
            {/* Delete Confirmation Modal */}
            {isDeleteModalOpen && createPortal(
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl shadow-2xl animate-scale-in border border-slate-100 dark:border-slate-800 overflow-hidden">
                        <div className="p-8 flex flex-col items-center text-center">
                            <div className="w-16 h-16 rounded-full bg-red-50 dark:bg-red-900/20 text-red-500 flex items-center justify-center text-3xl mb-4">
                                <FiTrash2 />
                            </div>
                            <h2 className="text-2xl font-black text-slate-800 dark:text-white mb-2">Delete Item?</h2>
                            <p className="text-slate-500 dark:text-slate-400 mb-6 font-medium">
                                Are you sure you want to delete <b>{itemToDelete?.title_en}</b>? This action cannot be undone.
                            </p>
                            <div className="flex gap-3 w-full">
                                <button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 py-3.5 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors">Cancel</button>
                                <button onClick={confirmDelete} className="flex-1 py-3.5 rounded-xl font-bold bg-red-500 text-white shadow-lg shadow-red-500/30 hover:bg-red-600 transition-all">Delete</button>
                            </div>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};

export default ManageItems;
