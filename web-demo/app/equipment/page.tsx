'use client';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import { Server, Trash2, Box, MapPin, Tag } from 'lucide-react';

export default function EquipmentPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({ name: '', type: 'pump', model: '', serialNumber: '', manufacturer: '', location: '', status: 'operational' });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try { setLoading(true); const data = await api.getEquipment(); setItems(data); }
    catch (err) { toast.error('Failed to load equipment'); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.location) return toast.error('Name and location are required');
    try { setSubmitting(true); await api.createEquipment(formData); toast.success('Equipment created'); loadData(); setFormData({ name: '', type: 'pump', model: '', serialNumber: '', manufacturer: '', location: '', status: 'operational' }); }
    catch (err) { toast.error('Failed to create equipment'); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this equipment?')) return;
    try { await api.deleteEquipment(id); toast.success('Equipment deleted'); loadData(); }
    catch (err) { toast.error('Failed to delete equipment'); }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Equipment Management</h1>
        <p className="text-gray-500 text-sm mt-1">Manage and track industrial assets</p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold mb-4 text-gray-800">Register New Equipment</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div><label className="block text-xs font-medium text-gray-700 mb-1">Name *</label><input className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} /></div>
          <div><label className="block text-xs font-medium text-gray-700 mb-1">Type</label><select className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}><option value="pump">Pump</option><option value="valve">Valve</option><option value="motor">Motor</option><option value="compressor">Compressor</option></select></div>
          <div><label className="block text-xs font-medium text-gray-700 mb-1">Model</label><input className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none" value={formData.model} onChange={e => setFormData({...formData, model: e.target.value})} /></div>
          <div><label className="block text-xs font-medium text-gray-700 mb-1">Serial Number</label><input className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none" value={formData.serialNumber} onChange={e => setFormData({...formData, serialNumber: e.target.value})} /></div>
          <div><label className="block text-xs font-medium text-gray-700 mb-1">Manufacturer</label><input className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none" value={formData.manufacturer} onChange={e => setFormData({...formData, manufacturer: e.target.value})} /></div>
          <div><label className="block text-xs font-medium text-gray-700 mb-1">Location *</label><input className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none" required value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} /></div>
          <div><label className="block text-xs font-medium text-gray-700 mb-1">Status</label><select className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}><option value="operational">Operational</option><option value="maintenance">Maintenance</option><option value="offline">Offline</option></select></div>
          <div className="flex items-end"><button type="submit" disabled={submitting} className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:bg-gray-400 transition-colors font-medium">{submitting ? 'Saving...' : 'Register Equipment'}</button></div>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          [1,2,3].map(i => <div key={i} className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 animate-pulse"><div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div><div className="h-3 bg-gray-100 rounded w-full mb-2"></div><div className="h-3 bg-gray-100 rounded w-3/4"></div></div>)
        ) : items.length === 0 ? (
          <div className="col-span-full text-center py-16 bg-white rounded-lg shadow-sm border border-dashed border-gray-300 text-gray-500">
            <Server className="mx-auto h-12 w-12 text-gray-400 mb-3" />
            <h3 className="text-lg font-medium text-gray-900">No equipment registered</h3>
            <p className="text-sm mt-1">Start by adding your first piece of equipment above.</p>
          </div>
        ) : (
          items.map(item => (
            <div key={item.id} className="bg-white p-5 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2"><Server className="text-blue-500 w-5 h-5" /><h3 className="font-semibold text-lg text-gray-900">{item.name}</h3></div>
                <button onClick={() => handleDelete(item.id)} className="text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={16}/></button>
              </div>
              <div className="space-y-2 text-sm text-gray-600 mb-4">
                <div className="flex items-center gap-2"><Tag size={14}/> <span className="capitalize">{item.type}</span> {item.model && `• ${item.model}`}</div>
                <div className="flex items-center gap-2"><MapPin size={14}/> <span>{item.location}</span></div>
                {item.serialNumber && <div className="flex items-center gap-2"><Box size={14}/> <span className="font-mono text-xs">{item.serialNumber}</span></div>}
              </div>
              <div className="pt-3 border-t border-gray-100">
                <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${item.status === 'operational' ? 'bg-green-100 text-green-800' : item.status === 'offline' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                  {item.status.toUpperCase()}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
