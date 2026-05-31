'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Trash2 } from 'lucide-react';

export default function HistoryPage() {
  const [executions, setExecutions] = useState<any[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | string[] | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    loadExecutions();
  }, []);

  const loadExecutions = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/modules/executions`);
      if (!res.ok) throw new Error('Failed to load');
      const data = await res.json();
      setExecutions(data || []);
    } catch (error) {
      toast.error('Failed to load history');
    } finally {
      setLoading(false);
    }
  };

  const toggleSelectId = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === executions.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(executions.map(e => e.id));
    }
  };

  const handleDelete = (id: string) => {
    setDeleteTarget(id);
    setShowDeleteConfirm(true);
  };

  const handleBulkDelete = () => {
    if (selectedIds.length === 0) {
      toast.error('No items selected');
      return;
    }
    setDeleteTarget(selectedIds);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    setDeleteLoading(true);
    try {
      if (Array.isArray(deleteTarget)) {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/modules/executions/bulk-delete`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ids: deleteTarget })
        });
        toast.success(`${deleteTarget.length} items archived`);
        setSelectedIds([]);
      } else {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/modules/executions/${deleteTarget}`, {
          method: 'DELETE'
        });
        toast.success('Execution archived');
      }
      setShowDeleteConfirm(false);
      setDeleteTarget(null);
      loadExecutions();
    } catch (error) {
      toast.error('Delete failed');
    } finally {
      setDeleteLoading(false);
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-3xl font-bold">History</h1>

      {selectedIds.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex justify-between items-center">
          <span>{selectedIds.length} item selected</span>
          <button
            onClick={handleBulkDelete}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 flex items-center gap-2"
          >
            <Trash2 size={18} />
            Delete Selected
          </button>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">
                <input
                  type="checkbox"
                  checked={selectedIds.length === executions.length && executions.length > 0}
                  onChange={toggleSelectAll}
                />
              </th>
              <th className="p-3 text-left">Date</th>
              <th className="p-3 text-left">Module</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Confidence</th>
              <th className="p-3 text-left">Time</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {executions.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-6 text-center text-gray-500">
                  No history found
                </td>
              </tr>
            ) : (
              executions.map(exec => (
                <tr key={exec.id} className="border-t hover:bg-gray-50">
                  <td className="p-3">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(exec.id)}
                      onChange={() => toggleSelectId(exec.id)}
                    />
                  </td>
                  <td className="p-3 text-sm">
                    {new Date(exec.createdAt).toLocaleString()}
                  </td>
                  <td className="p-3">
                    <span className="flex items-center gap-2">
                      {exec.module?.icon} {exec.module?.name}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded text-sm font-medium ${
                      exec.status === 'success'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {exec.status}
                    </span>
                  </td>
                  <td className="p-3">{(exec.confidence * 100).toFixed(0)}%</td>
                  <td className="p-3 text-sm">{exec.processingTimeMs}ms</td>
                  <td className="p-3">
                    <button
                      onClick={() => handleDelete(exec.id)}
                      className="text-red-600 hover:text-red-800 p-2 hover:bg-red-50 rounded transition"
                      title="Delete"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <h2 className="text-lg font-bold mb-4">Delete Execution?</h2>
            <p className="text-gray-600 mb-6">
              {Array.isArray(deleteTarget)
                ? `Delete ${deleteTarget.length} items? Data will be archived.`
                : 'Delete this execution? Data will be archived.'}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                disabled={deleteLoading}
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
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
