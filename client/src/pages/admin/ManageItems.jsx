import React, { useEffect, useState } from 'react';
import API from '../../api';
import { FaEdit, FaTrash, FaPlus, FaTimes, FaSearch } from 'react-icons/fa';

const ManageItems = () => {
    const [items, setItems] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState(null);
    const [search, setSearch] = useState('');

    // Form State
    const [formData, setFormData] = useState({
        title_en: '', title_ta: '', category: 'Service', sub_category: '',
        description_en: '', description_ta: '', official_link: '', youtube_link: '',
        steps: []
    });

    useEffect(() => {
        fetchItems();
    }, []);

    const fetchItems = async () => {
        const res = await API.get('/items');
        setItems(res.data);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this item?')) {
            await API.delete(`/admin/items/${id}`);
            fetchItems();
        }
    };

    const handleEdit = (item) => {
        setCurrentItem(item);
        setFormData({
            title_en: item.title_en,
            title_ta: item.title_ta,
            category: item.category,
            sub_category: item.sub_category,
            description_en: item.description_en,
            description_ta: item.description_ta,
            official_link: item.official_link,
            youtube_link: item.youtube_link || '',
            steps: item.steps || []
        });
        setIsModalOpen(true);
    };

    const handleAdd = () => {
        setCurrentItem(null);
        setFormData({
            title_en: '', title_ta: '', category: 'Service', sub_category: '',
            description_en: '', description_ta: '', official_link: '', youtube_link: '',
            steps: []
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
        i.title_en.toLowerCase().includes(search.toLowerCase()) ||
        i.category.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Manage Items</h1>
                <button onClick={handleAdd} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl transition-colors font-bold shadow-lg shadow-blue-500/30">
                    <FaPlus /> Add New
                </button>
            </div>

            {/* Search */}
            <div className="mb-6 relative max-w-md">
                <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                    type="text"
                    placeholder="Search items..."
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-blue-500/20"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">
                                <th className="p-4 font-bold border-b dark:border-slate-700">Title (EN)</th>
                                <th className="p-4 font-bold border-b dark:border-slate-700">Category</th>
                                <th className="p-4 font-bold border-b dark:border-slate-700">Sub Category</th>
                                <th className="p-4 font-bold border-b dark:border-slate-700 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                            {filteredItems.map(item => (
                                <tr key={item._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                    <td className="p-4 text-slate-800 dark:text-slate-200 font-medium">{item.title_en}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${item.category === 'Service' ? 'bg-blue-100 text-blue-700' :
                                            item.category === 'Scheme' ? 'bg-purple-100 text-purple-700' : 'bg-orange-100 text-orange-700'
                                            }`}>
                                            {item.category}
                                        </span>
                                    </td>
                                    <td className="p-4 text-slate-500">{item.sub_category}</td>
                                    <td className="p-4 text-right space-x-2">
                                        <button onClick={() => handleEdit(item)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><FaEdit /></button>
                                        <button onClick={() => handleDelete(item._id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"><FaTrash /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center sticky top-0 bg-white dark:bg-slate-900 z-10">
                            <h2 className="text-2xl font-bold text-slate-800 dark:text-white">{currentItem ? 'Edit Item' : 'Add New Item'}</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600"><FaTimes className="text-xl" /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            {/* Basic Info Section */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-bold text-slate-800 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">Basic Info</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Title (EN)</label>
                                        <input required className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20"
                                            value={formData.title_en} onChange={e => setFormData({ ...formData, title_en: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Title (TA)</label>
                                        <input required className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20"
                                            value={formData.title_ta} onChange={e => setFormData({ ...formData, title_ta: e.target.value })} />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Category</label>
                                        <select className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20"
                                            value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}>
                                            <option value="Service">Service</option>
                                            <option value="Scheme">Scheme</option>
                                            <option value="Exam">Exam</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Sub Category</label>
                                        <input className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20"
                                            value={formData.sub_category} onChange={e => setFormData({ ...formData, sub_category: e.target.value })} />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Description (EN)</label>
                                    <textarea rows="3" className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20"
                                        value={formData.description_en} onChange={e => setFormData({ ...formData, description_en: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Description (TA)</label>
                                    <textarea rows="3" className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20"
                                        value={formData.description_ta} onChange={e => setFormData({ ...formData, description_ta: e.target.value })} />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Official Link</label>
                                        <input className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20"
                                            value={formData.official_link} onChange={e => setFormData({ ...formData, official_link: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">YouTube Video Link</label>
                                        <input className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20"
                                            placeholder="https://youtube.com/..."
                                            value={formData.youtube_link} onChange={e => setFormData({ ...formData, youtube_link: e.target.value })} />
                                    </div>
                                </div>
                            </div>

                            {/* Steps Section */}
                            <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-lg font-bold text-slate-800 dark:text-white">Application Steps</h3>
                                    <button type="button" onClick={handleAddStep} className="text-sm flex items-center gap-2 text-blue-600 hover:text-blue-700 font-bold bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors">
                                        <FaPlus /> Add Step
                                    </button>
                                </div>

                                {formData.steps && formData.steps.length > 0 ? (
                                    <div className="space-y-4">
                                        {formData.steps.map((step, index) => (
                                            <div key={index} className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700 relative group">
                                                <button type="button" onClick={() => handleRemoveStep(index)} className="absolute top-2 right-2 text-slate-400 hover:text-red-500 p-2 transition-colors">
                                                    <FaTrash />
                                                </button>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pr-8">
                                                    <div>
                                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Step Title (EN)</label>
                                                        <input className="w-full p-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none focus:border-blue-500 transition-colors"
                                                            value={step.title_en} onChange={e => handleStepChange(index, 'title_en', e.target.value)} placeholder="e.g. Visit Official Portal" />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Step Title (TA)</label>
                                                        <input className="w-full p-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none focus:border-blue-500 transition-colors"
                                                            value={step.title_ta} onChange={e => handleStepChange(index, 'title_ta', e.target.value)} placeholder="e.g. அதிகாரப்பூர்வ தளத்தை அணுகவும்" />
                                                    </div>
                                                    <div className="md:col-span-2">
                                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Description (EN)</label>
                                                        <input className="w-full p-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none focus:border-blue-500 transition-colors"
                                                            value={step.desc_en} onChange={e => handleStepChange(index, 'desc_en', e.target.value)} placeholder="Brief description of the step..." />
                                                    </div>
                                                    <div className="md:col-span-2">
                                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Description (TA)</label>
                                                        <input className="w-full p-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none focus:border-blue-500 transition-colors"
                                                            value={step.desc_ta} onChange={e => handleStepChange(index, 'desc_ta', e.target.value)} placeholder="படியின் சுருக்கமான விளக்கம்..." />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-slate-400 bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
                                        No steps added yet. Click "Add Step" to begin.
                                    </div>
                                )}
                            </div>

                            <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-xl font-bold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors">Cancel</button>
                                <button type="submit" className="px-5 py-2.5 rounded-xl font-bold bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition-colors">Save Item</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageItems;
