'use client';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import { CheckSquare, Trash2 } from 'lucide-react';

export default function InspectionsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [equipments, setEquipments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({ type: 'routine', equipmentId: '', inspector: '', date: new Date().toISOString().split('T')[0], status: 'scheduled', overallStatus: 'pass' });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try { setLoading(true); const [insp, eq] = await Promise.all([api.getInspections(), api.getEquipment()]); setItems(insp); setEquipments(eq); }
    catch (err) { toast.error('Failed to load data'); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.equipmentId || !formData.inspector) return toast.error('Equipment and Inspector required');
    try { setSubmitting(true); await api.createInspection({ ...formData, date: new Date(formData.date).toISOString(), findings: [] }); toast.success('Inspection scheduled'); loadData(); }
    catch (err) { toast.error('Failed to schedule'); }
    finally { setSubmitting(false); }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Inspections</h1>
      
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold mb-4 text-gray-800">Schedule Inspection</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div><label className="block text-xs font-medium text-gray-700 mb-1">Equipment *</label><select className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500" required value={formData.equipmentId} onChange={e => setFormData({...formData, equipmentId: e.target.value})}><option value="">Select...</option>{equipments.map(eq => <option key={eq.id} value={eq.id}>{eq.name}</option>)}</select></div>
          <div><label className="block text-xs font-medium text-gray-700 mb-1">Inspector *</label><input className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500" required value={formData.inspector} onChange={e => setFormData({...formData, inspector: e.target.value})} /></div>
          <div><label className="block text-xs font-medium text-gray-700 mb-1">Date</label><input type="date" className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500" required value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} /></div>
          <div><label className="block text-xs font-medium text-gray-700 mb-1">Type</label><select className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}><option value="routine">Routine</option><option value="emergency">Emergency</option><option value="compliance">Compliance</option></select></div>
          <div className="md:col-span-2 flex items-end"><button type="submit" disabled={submitting} className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 font-medium">{submitting ? 'Scheduling...' : 'Schedule Inspection'}</button></div>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          [1,2].map(i => <div key={i} className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 animate-pulse h-32"></div>)
        ) : items.length === 0 ? (
          <div className="col-span-full text-center py-16 bg-white rounded-lg border border-dashed border-gray-300 text-gray-500">
            <CheckSquare className="mx-auto h-12 w-12 text-gray-400 mb-3" />
            <h3 className="text-lg font-medium text-gray-900">No inspections scheduled</h3>
          </div>
        ) : (
          items.map(item => (
            <div key={item.id} className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
              <h3 className="font-semibold text-lg text-gray-900 mb-1">{item.equipment?.name || 'Unknown Equipment'}</h3>
              <p className="text-sm text-gray-500 mb-3">{new Date(item.date).toLocaleDateString()} • {item.inspector}</p>
              <div className="flex gap-2">
                <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 capitalize">{item.type}</span>
                <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800 capitalize">{item.status}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
