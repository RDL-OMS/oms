import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import '../pages.css';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [roleChangeData, setRoleChangeData] = useState({ userId: '', newRole: '' });
    const [userProjects, setUserProjects] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [editedUser, setEditedUser] = useState(null);
    const navigate = useNavigate();

    const roles = ['owner', 'teamlead', 'member'];

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/login");
            return;
        }

        const decoded = jwtDecode(token);
        if (decoded.role !== 'owner') {
            navigate("/");
            return;
        }

        fetchUsers();
    }, [navigate]);

    const fetchUsers = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/users', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem("token")}`
                }
            });

            if (!response.ok) throw new Error('Failed to fetch users');
            
            const data = await response.json();
            setUsers(data.data || []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchUserProjects = async (userId, role) => {
        try {
            let endpoint = '';
            if (role === 'teamlead') {
                endpoint = `http://localhost:5000/api/projects/getProjects/${userId}/${role}`;
            } else if (role === 'member') {
                endpoint = `http://localhost:5000/api/projects/getProjects/${userId}/${role}`;
            } else {
                return []; // Owners don't have assigned projects
            }

            const response = await fetch(endpoint, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem("token")}`
                }
            });

            if (!response.ok) throw new Error('Failed to fetch projects');
            
            const data = await response.json();
            return data.data || [];
        } catch (err) {
            console.error('Error fetching projects:', err);
            return [];
        }
    };

    const handleRoleChangeInit = (userId, newRole) => {
        setRoleChangeData({ userId, newRole });
        setShowConfirmModal(true);
    };

    const confirmRoleChange = async () => {
        try {
            const { userId, newRole } = roleChangeData;
            setUsers(users.map(user => 
                user._id === userId ? { ...user, role: newRole } : user
            ));
            
            if (selectedUser && selectedUser._id === userId) {
                setSelectedUser({ ...selectedUser, role: newRole });
            }
            
            setShowConfirmModal(false);
        } catch (err) {
            setError(err.message);
            setShowConfirmModal(false);
        }
    };

    const openUserModal = async (user) => {
        setLoading(true);
        try {
            const projects = await fetchUserProjects(user.username, user.role);
            setUserProjects(projects);
            setSelectedUser(user);
            setEditedUser({ ...user });
            setShowModal(true);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleEditToggle = () => {
        setIsEditing(!isEditing);
        if (!isEditing) {
            setEditedUser({ ...selectedUser });
        } else {
            setEditedUser(null);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditedUser(prev => ({ ...prev, [name]: value }));
    };

    const saveChanges = () => {
        if (!editedUser) return;

        // Update users array
        setUsers(prevUsers => prevUsers.map(user => 
            user._id === editedUser._id ? { ...user, ...editedUser } : user
        ));

        // Update selected user
        setSelectedUser(prev => ({ ...prev, ...editedUser }));

        // Exit editing mode
        setIsEditing(false);
        setEditedUser(null);
    };

    // Group users by role
    const groupedUsers = {
        owner: users.filter(user => user.role === 'owner'),
        teamlead: users.filter(user => user.role === 'teamlead'),
        member: users.filter(user => user.role === 'member')
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="text-xl">Loading users...</div>
        </div>
    );

    if (error) return (
        <div className="p-6 text-red-500">
            Error: {error}
            <button 
                onClick={() => {
                    setError(null);
                    fetchUsers();
                }}
                className="ml-4 bg-blue-500 text-white px-4 py-2 rounded"
            >
                Retry
            </button>
        </div>
    );

    return (
        <div className="pt-20 px-6 pb-6 bg-gray-100 min-h-screen">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold text-gray-800">User Management</h1>
                <button 
                    onClick={() => navigate('/admin/dashboard')}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                >
                    Back to Dashboard
                </button>
            </div>

            {users.length === 0 ? (
                <div className="text-center py-10">
                    <p className="text-gray-600 text-lg">No users found</p>
                </div>
            ) : (
                <div className="space-y-12">
                    {roles.map(role => (
                        groupedUsers[role].length > 0 && (
                            <div key={role}>
                                <h2 className="text-xl font-semibold mb-4 capitalize text-gray-700">
                                    {role}s
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {groupedUsers[role].map(user => (
                                        <div key={user._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                                            <div className="p-4">
                                                <div className="flex items-center space-x-4 mb-4">
                                                    <div className="w-16 h-16 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden">
                                                        {user.avatar ? (
                                                            <img 
                                                                src={user.avatar} 
                                                                alt={user.name} 
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <span className="text-2xl text-gray-600">
                                                                {user.name.charAt(0).toUpperCase()}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <h3 className="font-semibold text-lg">
                                                            {user.name.charAt(0).toUpperCase() + user.name.slice(1)}
                                                        </h3>
                                                        <p className="text-gray-600">ID: {user.employeeId}</p>
                                                        <p className={`text-sm font-medium ${
                                                            user.role === 'owner' ? 'text-purple-600' : 
                                                            user.role === 'teamlead' ? 'text-blue-600' : 'text-green-600'
                                                        }`}>
                                                            {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="mb-4">
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Change Role
                                                    </label>
                                                    <select
                                                        value={user.role}
                                                        onChange={(e) => handleRoleChangeInit(user._id, e.target.value)}
                                                        className="w-full p-2 border border-gray-300 rounded"
                                                    >
                                                        {roles.map(roleOption => (
                                                            <option key={roleOption} value={roleOption}>
                                                                {roleOption.charAt(0).toUpperCase() + roleOption.slice(1)}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>

                                                <button
                                                    onClick={() => openUserModal(user)}
                                                    className="w-full bg-blue-100 text-blue-600 py-2 rounded hover:bg-blue-200 transition"
                                                >
                                                    View Full Profile
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )
                    ))}
                </div>
            )}

            {/* User Profile Modal */}
            {showModal && selectedUser && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <h2 className="text-xl font-bold">{selectedUser.name.charAt(0).toUpperCase() + selectedUser.name.slice(1)}'s Profile</h2>
                                <div className="flex items-center space-x-2">
                                    <button 
                                        onClick={handleEditToggle}
                                        className="text-gray-500 hover:text-gray-700"
                                    >
                                        {isEditing ? (
                                            <span className="text-sm">Cancel</span>
                                        ) : (
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                            </svg>
                                        )}
                                    </button>
                                    {isEditing && (
                                        <button 
                                            onClick={saveChanges}
                                            className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                                        >
                                            Save
                                        </button>
                                    )}
                                    <button 
                                        onClick={() => setShowModal(false)}
                                        className="text-gray-500 hover:text-gray-700 text-2xl"
                                    >
                                        ×
                                    </button>
                                </div>
                            </div>

                            <div className="flex flex-col items-center mb-6">
                                <div className="w-24 h-24 rounded-full bg-gray-200 mb-4 overflow-hidden">
                                    {selectedUser.avatar ? (
                                        <img 
                                            src={selectedUser.avatar} 
                                            alt={selectedUser.name.charAt(0).toUpperCase()}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <span className="flex items-center justify-center h-full text-4xl text-gray-500">
                                            {selectedUser.name.charAt(0).toUpperCase()}
                                        </span>
                                    )}
                                </div>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        name="name"
                                        value={editedUser.name}
                                        onChange={handleInputChange}
                                        className="text-lg font-semibold text-center border rounded p-1 w-full mb-2"
                                    />
                                ) : (
                                    <h3 className="text-lg font-semibold">{selectedUser.name.charAt(0).toUpperCase() + selectedUser.name.slice(1)}</h3>
                                )}
                                {isEditing ? (
                                    <input
                                        type="email"
                                        name="email"
                                        value={editedUser.email}
                                        onChange={handleInputChange}
                                        className="text-gray-600 text-center border rounded p-1 w-full"
                                    />
                                ) : (
                                    <p className="text-gray-600">{selectedUser.email}</p>
                                )}
                                <p className={`mt-1 px-3 py-1 rounded-full text-sm font-medium ${
                                    selectedUser.role === 'owner' ? 'bg-purple-100 text-purple-800' : 
                                    selectedUser.role === 'teamlead' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                                }`}>
                                    {selectedUser.role.charAt(0).toUpperCase() + selectedUser.role.slice(1)}
                                </p>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <h4 className="font-medium text-gray-700">User ID</h4>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            name="employeeId"
                                            value={editedUser.employeeId}
                                            onChange={handleInputChange}
                                            className="w-full p-1 border rounded"
                                        />
                                    ) : (
                                        <p className="text-gray-900">{selectedUser.employeeId}</p>
                                    )}
                                </div>

                                <div>
                                    <h4 className="font-medium text-gray-700">Current Role</h4>
                                    {isEditing ? (
                                        <select
                                            name="role"
                                            value={editedUser.role}
                                            onChange={handleInputChange}
                                            className="w-full p-2 border border-gray-300 rounded mt-1"
                                        >
                                            {roles.map(role => (
                                                <option key={role} value={role}>
                                                    {role.charAt(0).toUpperCase() + role.slice(1)}
                                                </option>
                                            ))}
                                        </select>
                                    ) : (
                                        <p className="text-gray-900">{selectedUser.role.charAt(0).toUpperCase() + selectedUser.role.slice(1)}</p>
                                    )}
                                </div>

                                <div>
                                    <h4 className="font-medium text-gray-700">Joined On</h4>
                                    <p className="text-gray-900">
                                        {new Date(selectedUser.createdAt).toLocaleDateString()}
                                    </p>
                                </div>

                                {userProjects.length > 0 && (
                                    <div>
                                        <h4 className="font-medium text-gray-700">
                                            {selectedUser.role === 'teamlead' ? 'Projects Leading' : 'Projects Working On'}
                                        </h4>
                                        <div className="mt-2 space-y-2">
                                            {userProjects.map(project => (
                                                <div key={project._id} className="p-3 bg-gray-50 rounded-lg">
                                                    <h5 className="font-medium">{project.name}</h5>
                                                    <p className="text-sm text-gray-600">{project.description}</p>
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        Last updated: {new Date(project.updatedAt).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {userProjects.length === 0 && (
                                    <div className="p-3 bg-gray-50 rounded-lg text-center text-gray-500">
                                        {selectedUser.role === 'owner' 
                                            ? 'Owners have access to all projects'
                                            : 'No projects assigned'}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Role Change Confirmation Modal */}
            {showConfirmModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
                        <h3 className="text-lg font-bold mb-4">Confirm Role Change</h3>
                        <p className="mb-6">
                            Are you sure you want to change this user's role to <strong>{roleChangeData.newRole}</strong>?
                            This will affect their system permissions.
                        </p>
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => setShowConfirmModal(false)}
                                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmRoleChange}
                                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                            >
                                Confirm Change
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserManagement;