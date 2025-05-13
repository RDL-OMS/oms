import React, { useState, useEffect } from 'react';

const getToken = () => {
    return localStorage.getItem("token");
};

const AuditLogReport = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        action: '',
        entityType: '',
        startDate: '',
        endDate: '',
        search: ''
    });
    const [expandedReasons, setExpandedReasons] = useState({});

    useEffect(() => {
        fetchLogs();
    }, [filters]);

    const toggleExpandReason = (logId) => {
        setExpandedReasons(prev => ({
            ...prev,
            [logId]: !prev[logId]
        }));
    };

    const fetchLogs = async () => {
        try {
            const token = getToken();
            if (!token) {
                throw new Error("No token provided");
            }
            setLoading(true);

            const requestBody = {
                action: filters.action || undefined,
                entityType: filters.entityType || undefined,
                startDate: filters.startDate || undefined,
                endDate: filters.endDate || undefined,
                search: filters.search || undefined
            };

            Object.keys(requestBody).forEach(key =>
                requestBody[key] === undefined && delete requestBody[key]
            );

            const response = await fetch('http://localhost:5000/api/logs/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            setLogs(data);
            setLoading(false);
        } catch (err) {
            console.error('Fetch error:', err);
            setLoading(false);
        }
    };

    const handleFilterChange = (e) => {
        setFilters({
            ...filters,
            [e.target.name]: e.target.value
        });
    };

    const getBadgeColor = (action) => {
        switch (action) {
            case 'CREATE': return 'bg-green-100 text-green-800';
            case 'UPDATE': return 'bg-blue-100 text-blue-800';
            case 'DELETE': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const exportToCSV = () => {
        const headers = ['Timestamp', 'Action', 'Entity', 'User', 'Reason'];
        const csvContent = [
            headers.join(','),
            ...logs.map(log => [
                new Date(log.timestamp).toLocaleString(),
                log.action,
                `${log.entityType} #${log.entityId.toString().substring(0, 6)}...`,
                `User #${log.performedBy.toString().substring(0, 6)}...`,
                `"${log.reason || 'N/A'}"`
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'audit_logs.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold text-teal-700 mb-6">Audit Logs</h1>

            <div className="bg-white p-4 rounded-lg shadow-md mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Action</label>
                        <select
                            name="action"
                            value={filters.action}
                            onChange={handleFilterChange}
                            className="w-full p-2 border border-gray-300 rounded-md"
                        >
                            <option value="">All Actions</option>
                            <option value="CREATE">CREATE</option>
                            <option value="UPDATE">UPDATE</option>
                            <option value="DELETE">DELETE</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Entity Type</label>
                        <select
                            name="entityType"
                            value={filters.entityType}
                            onChange={handleFilterChange}
                            className="w-full p-2 border border-gray-300 rounded-md"
                        >
                            <option value="">All Entities</option>
                            <option value="CostEntry">CostEntry</option>
                            <option value="Project">Project</option>
                            <option value="User">User</option>
                            <option value="Overhead">Overhead</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                        <input
                            type="text"
                            name="search"
                            value={filters.search}
                            onChange={handleFilterChange}
                            placeholder="Search by reason or ID..."
                            className="w-full p-2 border border-gray-300 rounded-md"
                        />
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                        <input
                            type="date"
                            name="startDate"
                            value={filters.startDate}
                            onChange={handleFilterChange}
                            className="w-full p-2 border border-gray-300 rounded-md"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                        <input
                            type="date"
                            name="endDate"
                            value={filters.endDate}
                            onChange={handleFilterChange}
                            className="w-full p-2 border border-gray-300 rounded-md"
                        />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
                    <p className="text-sm text-gray-500">Total Logs</p>
                    <p className="text-2xl font-bold">{logs.length}</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-md border border-green-200">
                    <p className="text-sm text-gray-500">CREATES</p>
                    <p className="text-2xl font-bold text-green-600">
                        {logs.filter(log => log.action === 'CREATE').length}
                    </p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-md border border-blue-200">
                    <p className="text-sm text-gray-500">UPDATES</p>
                    <p className="text-2xl font-bold text-blue-600">
                        {logs.filter(log => log.action === 'UPDATE').length}
                    </p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-md border border-red-200">
                    <p className="text-sm text-gray-500">DELETES</p>
                    <p className="text-2xl font-bold text-red-600">
                        {logs.filter(log => log.action === 'DELETE').length}
                    </p>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="flex justify-between items-center p-4 border-b">
                    <h2 className="text-lg font-semibold text-gray-800">Recent Activity</h2>
                    <button
                        onClick={exportToCSV}
                        className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition"
                    >
                        Export CSV
                    </button>
                </div>
                {loading ? (
                    <div className="p-8 text-center">Loading...</div>
                ) : logs.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">No logs found</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Timestamp</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Entity</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Entity ID</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User Id</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reason</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {logs.map((log) => (
                                    <tr key={log._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {new Date(log.timestamp).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 text-xs rounded-full ${getBadgeColor(log.action)}`}>
                                                {log.action}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {log.entityType}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {log.entityId.toString().substring(0, 6)}...
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {log.performedByUsername}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {log.performedBy.toString().substring(0, 6)}...
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500 max-w-xs">
                                            <div className={`${expandedReasons[log._id] ? '' : 'line-clamp-2'} break-words`}>
                                                {log.reason || 'N/A'}
                                            </div>
                                            {log.reason && log.reason.length > 100 && (
                                                <button 
                                                    onClick={() => toggleExpandReason(log._id)}
                                                    className="text-teal-600 text-xs mt-1 hover:underline"
                                                >
                                                    {expandedReasons[log._id] ? 'Show less' : 'Read more'}
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AuditLogReport;