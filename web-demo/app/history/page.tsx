'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';

export default function HistoryPage() {
  const [inspections, setInspections] = useState<any[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | string[] | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  // Load inspections
  useEffect(() => {
    loadInspections();
  }, []);

  const loadInspections = async () => {
    try {
      const data = await api.getInspections();
      setInspections(data || []);
    } catch (error) {
      toast.error('Failed to load history');
    }
  };

  // Single delete
  const handleSingleDelete = (id: string) => {
    setDeleteTarget(id);
    setShowDeleteConfirm(true);
  };

  // Checkbox toggle
  const toggleSelectId = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id)
        ? prev.filter(i => i !== id)
        : [...prev, id]
    );
  };

  // Select all
  const toggleSelectAll = () => {
    if (selectedIds.length === inspections.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(inspections.map(i => i.id));
    }
  };

  // Bulk delete
  const handleBulkDelete = () => {
    if (selectedIds.length === 0) {
      toast.error('No items selected');
      return;
    }
    setDeleteTarget(selectedIds);
    setShowDeleteConfirm(true);
  };

  // Confirm delete
  const confirmDelete = async () => {
    setDeleteLoading(true);
    try {
      if (Array.isArray(deleteTarget)) {
        // Bulk delete
        const res = await fetch(`${API_URL}/api/inspections/bulk-delete`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ids: deleteTarget })
        });
        if (!res.ok) throw new Error('Bulk delete failed');
        toast.success(`${deleteTarget.length} items archived`);
        setSelectedIds([]);
      } else {
        // Single delete
        const res = await fetch(`${API_URL}/api/inspections/${deleteTarget}`, {
          method: 'DELETE'
        });
        if (!res.ok) throw new Error('Delete failed');
        toast.success('Inspection archived');
      }
      
      setShowDeleteConfirm(false);
      setDeleteTarget(null);
      loadInspections();
    } catch (error) {
      toast.error('Delete failed');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">History</h1>

      {/* Bulk delete toolbar */}
      {selectedIds.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex justify-between items-center">
          <span className="text-blue-900">
            {selectedIds.length} item selected
          </span>
          <button
            onClick={handleBulkDelete}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            🗑️ Delete Selected
          </button>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto bg-white rounded-lg shadow-sm border border-gray-200">
        <table className="w-full border-collapse border border-gray-200">
          <thead className="bg-gray-100">
            <tr>
              {/* Checkbox header */}
              <th className="p-3 text-left w-12">
                <input
                  type="checkbox"
                  checked={selectedIds.length === inspections.length && inspections.length > 0}
                  onChange={toggleSelectAll}
                />
              </th>
              <th className="p-3 text-left">Date</th>
              <th className="p-3 text-left">Module</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {inspections.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-gray-500">
                  No history found
                </td>
              </tr>
            )}
            {inspections.map(inspection => (
              <tr key={inspection.id} className="border-t border-gray-200 hover:bg-gray-50">
                {/* Checkbox */}
                <td className="p-3">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(inspection.id)}
                    onChange={() => toggleSelectId(inspection.id)}
                  />
                </td>
                <td className="p-3">{new Date(inspection.createdAt).toLocaleDateString()}</td>
                <td className="p-3 capitalize">{inspection.type}</td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded text-sm ${
                    inspection.status === 'passed' || inspection.status === 'success' || inspection.status === 'completed'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {inspection.status || 'needs-review'}
                  </span>
                </td>
                <td className="p-3">
                  <button
                    onClick={() => handleSingleDelete(inspection.id)}
                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                  >
                    🗑️ Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Delete confirmation dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <h2 className="text-lg font-bold mb-4">Delete Inspection?</h2>
            <p className="text-gray-600 mb-6">
              {Array.isArray(deleteTarget)
                ? `Delete ${deleteTarget.length} items? Data will be archived, not permanent.`
                : 'Delete this inspection? Data will be archived, not permanent.'}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 font-medium"
                disabled={deleteLoading}
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 font-medium"
                disabled={deleteLoading}
              >
                {deleteLoading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
