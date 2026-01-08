import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import API from '../../api';
import { FiSearch, FiShield, FiUser, FiMail, FiCalendar, FiTrash2, FiEdit2, FiX, FiCheckCircle, FiAlertTriangle } from 'react-icons/fi';

const UsersList = () => {
    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [newRole, setNewRole] = useState('');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await API.get('/admin/users');
            setUsers(res.data);
        } catch (error) {
            console.error("Failed to fetch users", error);
        }
    };

    const filteredUsers = users.filter(user =>
        user.username.toLowerCase().includes(search.toLowerCase()) ||
        (user.email && user.email.toLowerCase().includes(search.toLowerCase()))
    );

    // Stats
    const totalUsers = users.length;
    const admins = users.filter(u => u.role === 'admin' || u.isAdmin).length;
    const newToday = users.filter(u => new Date(u.createdAt).toDateString() === new Date().toDateString()).length;

    // --- Actions ---
    const openEditModal = (user) => {
        setSelectedUser(user);
        setNewRole(user.role || 'user');
        setIsEditModalOpen(true);
    };

    const openDeleteModal = (user) => {
        setSelectedUser(user);
        setIsDeleteModalOpen(true);
    };

    const handleUpdateRole = async () => {
        if (!selectedUser) return;
        try {
            await API.put(`/admin/users/${selectedUser._id}`, { role: newRole });
            setIsEditModalOpen(false);
            fetchUsers();
        } catch (error) {
            console.error("Update failed", error);
            alert("Failed to update user role");
        }
    };

    const handleDeleteUser = async () => {
        if (!selectedUser) return;
        try {
            await API.delete(`/admin/users/${selectedUser._id}`);
            setIsDeleteModalOpen(false);
            fetchUsers();
        } catch (error) {
            console.error("Delete failed", error);
            alert("Failed to delete user");
        }
    };

    return (
        <div className="p-6 md:p-10 space-y-8 min-h-screen">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight">User Management</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Manage system access and registered accounts</p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-black/50 border border-slate-100 dark:border-slate-800 flex items-center gap-5 relative overflow-hidden group hover:-translate-y-1 transition-transform">
                    <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center text-2xl shadow-sm z-10">
                        <FiUser />
                    </div>
                    <div className="z-10">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Total Users</p>
                        <h3 className="text-3xl font-black text-slate-800 dark:text-white">{totalUsers}</h3>
                    </div>
                    <FiUser className="absolute -bottom-4 -right-4 text-8xl text-slate-50 dark:text-slate-800 z-0 opacity-50 group-hover:rotate-12 transition-transform" />
                </div>

                <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-black/50 border border-slate-100 dark:border-slate-800 flex items-center gap-5 relative overflow-hidden group hover:-translate-y-1 transition-transform">
                    <div className="w-14 h-14 rounded-2xl bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 flex items-center justify-center text-2xl shadow-sm z-10">
                        <FiShield />
                    </div>
                    <div className="z-10">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Administrators</p>
                        <h3 className="text-3xl font-black text-slate-800 dark:text-white">{admins}</h3>
                    </div>
                    <FiShield className="absolute -bottom-4 -right-4 text-8xl text-slate-50 dark:text-slate-800 z-0 opacity-50 group-hover:rotate-12 transition-transform" />
                </div>

                <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-black/50 border border-slate-100 dark:border-slate-800 flex items-center gap-5 relative overflow-hidden group hover:-translate-y-1 transition-transform">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-2xl shadow-sm z-10">
                        <FiCalendar />
                    </div>
                    <div className="z-10">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">New Today</p>
                        <h3 className="text-3xl font-black text-slate-800 dark:text-white">{newToday}</h3>
                    </div>
                    <FiCalendar className="absolute -bottom-4 -right-4 text-8xl text-slate-50 dark:text-slate-800 z-0 opacity-50 group-hover:rotate-12 transition-transform" />
                </div>
            </div>

            {/* Content Area */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-black/50 border border-slate-100 dark:border-slate-800 overflow-hidden">
                {/* Toolbar */}
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="relative w-full md:w-96 group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <FiSearch className="text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                        </div>
                        <input
                            type="text"
                            className="block w-full pl-11 pr-4 py-3 border-emerald-500 border border-slate-200 dark:border-slate-700 rounded-2xl leading-5 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                            placeholder="Search users..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <div className="text-sm font-bold text-slate-500">
                        Showing <span className="text-slate-900 dark:text-white">{filteredUsers.length}</span> users
                    </div>
                </div>

                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/80 dark:bg-slate-800/80 border-b border-slate-100 dark:border-slate-800">
                                <th className="p-6 text-xs font-extrabold text-slate-500 uppercase tracking-wider">User Identity</th>
                                <th className="p-6 text-xs font-extrabold text-slate-500 uppercase tracking-wider">Role</th>
                                <th className="p-6 text-xs font-extrabold text-slate-500 uppercase tracking-wider">Joined Date</th>
                                <th className="p-6 text-xs font-extrabold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {filteredUsers.map(user => (
                                <tr key={user._id} className="group hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors duration-200">
                                    <td className="p-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center text-xl font-bold shadow-lg shadow-blue-500/20">
                                                {user.username.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <div className="font-bold text-slate-800 dark:text-slate-100 text-base">{user.username}</div>
                                                <div className="text-sm text-slate-500 font-medium flex items-center gap-1.5 pt-0.5">
                                                    <FiMail className="text-xs opacity-70" /> {user.email || 'No email linked'}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-6">
                                        <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wide border transition-all ${user.role === 'admin'
                                            ? 'bg-purple-50 text-purple-700 border-purple-100 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800 shadow-sm shadow-purple-500/10'
                                            : 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
                                            }`}>
                                            {user.role === 'admin' ? <FiShield /> : <FiUser />}
                                            {user.role || 'user'}
                                        </span>
                                    </td>
                                    <td className="p-6">
                                        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300 font-bold text-sm">
                                            <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                                                <FiCalendar className="text-xs" />
                                            </div>
                                            {new Date(user.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                                        </div>
                                    </td>
                                    <td className="p-6 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => openEditModal(user)}
                                                className="p-2.5 text-blue-600 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/40 rounded-xl transition-colors"
                                                title="Edit Role"
                                            >
                                                <FiEdit2 />
                                            </button>
                                            <button
                                                onClick={() => openDeleteModal(user)}
                                                className="p-2.5 text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40 rounded-xl transition-colors"
                                                title="Delete User"
                                            >
                                                <FiTrash2 />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden grid grid-cols-1 gap-4 p-4 bg-slate-50/50 dark:bg-black/20">
                    {filteredUsers.map(user => (
                        <div key={user._id} className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col gap-5">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center text-lg font-bold shadow-lg shadow-blue-500/20">
                                        {user.username.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <div className="font-bold text-slate-800 dark:text-slate-100 text-lg">{user.username}</div>
                                        <div className="text-xs text-slate-500 font-bold flex items-center gap-1.5 pt-0.5">
                                            <FiMail className="text-[10px] opacity-70" /> {user.email || 'No Email'}
                                        </div>
                                    </div>
                                </div>
                                <span className={`inline-flex items-center justify-center w-8 h-8 rounded-xl text-sm ${user.role === 'admin'
                                    ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400'
                                    : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                                    }`}>
                                    {user.role === 'admin' ? <FiShield /> : <FiUser />}
                                </span>
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                                <div className="text-xs font-bold text-slate-400 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-lg">
                                    Joined {new Date(user.createdAt).toLocaleDateString()}
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => openEditModal(user)}
                                        className="p-2 text-blue-600 bg-blue-50 dark:bg-blue-900/20 rounded-lg active:scale-95 transition-transform"
                                    >
                                        <FiEdit2 />
                                    </button>
                                    <button
                                        onClick={() => openDeleteModal(user)}
                                        className="p-2 text-red-600 bg-red-50 dark:bg-red-900/20 rounded-lg active:scale-95 transition-transform"
                                    >
                                        <FiTrash2 />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                    {filteredUsers.length === 0 && (
                        <div className="p-10 text-center text-slate-400 flex flex-col items-center">
                            <FiSearch className="text-4xl mb-3 opacity-20" />
                            <p className="font-bold">No users found</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Edit Modal */}
            {isEditModalOpen && createPortal(
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl shadow-2xl animate-scale-in border border-slate-100 dark:border-slate-800 overflow-hidden">
                        <div className="p-6 pb-0">
                            <h2 className="text-xl font-black text-slate-800 dark:text-white mb-1">Edit User Role</h2>
                            <p className="text-sm text-slate-500">Change access permissions for <b>{selectedUser?.username}</b>.</p>
                        </div>
                        <div className="p-6 space-y-3">
                            <button
                                onClick={() => setNewRole('user')}
                                className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${newRole === 'user'
                                    ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/20'
                                    : 'border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-500 flex items-center justify-center">
                                        <FiUser />
                                    </div>
                                    <div className="text-left">
                                        <div className="font-bold text-slate-800 dark:text-white">Regular User</div>
                                        <div className="text-xs text-slate-500">Standard access</div>
                                    </div>
                                </div>
                                {newRole === 'user' && <FiCheckCircle className="text-blue-500 text-xl" />}
                            </button>

                            <button
                                onClick={() => setNewRole('admin')}
                                className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${newRole === 'admin'
                                    ? 'border-purple-500 bg-purple-50/50 dark:bg-purple-900/20'
                                    : 'border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 text-purple-600 flex items-center justify-center">
                                        <FiShield />
                                    </div>
                                    <div className="text-left">
                                        <div className="font-bold text-slate-800 dark:text-white">Administrator</div>
                                        <div className="text-xs text-slate-500">Full system access</div>
                                    </div>
                                </div>
                                {newRole === 'admin' && <FiCheckCircle className="text-purple-500 text-xl" />}
                            </button>
                        </div>
                        <div className="p-6 pt-2 bg-slate-50 dark:bg-slate-800/50 flex gap-3">
                            <button onClick={() => setIsEditModalOpen(false)} className="flex-1 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-200/50 dark:hover:bg-slate-700/50 transition-colors">Cancel</button>
                            <button onClick={handleUpdateRole} className="flex-1 py-3 rounded-xl font-bold bg-blue-600 text-white shadow-lg shadow-blue-500/30 hover:bg-blue-700 transition-all">Save Changes</button>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {/* Delete Modal */}
            {isDeleteModalOpen && createPortal(
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl shadow-2xl animate-scale-in border border-slate-100 dark:border-slate-800 overflow-hidden">
                        <div className="p-8 flex flex-col items-center text-center">
                            <div className="w-16 h-16 rounded-full bg-red-50 dark:bg-red-900/20 text-red-500 flex items-center justify-center text-3xl mb-4">
                                <FiAlertTriangle />
                            </div>
                            <h2 className="text-2xl font-black text-slate-800 dark:text-white mb-2">Delete User?</h2>
                            <p className="text-slate-500 dark:text-slate-400 mb-6 font-medium">
                                Are you sure you want to delete <b>{selectedUser?.username}</b>? This action cannot be undone.
                            </p>
                            <div className="flex gap-3 w-full">
                                <button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 py-3.5 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors">Cancel</button>
                                <button onClick={handleDeleteUser} className="flex-1 py-3.5 rounded-xl font-bold bg-red-500 text-white shadow-lg shadow-red-500/30 hover:bg-red-600 transition-all">Delete User</button>
                            </div>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};

export default UsersList;
