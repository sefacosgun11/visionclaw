'use client';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import { FileText, Trash2 } from 'lucide-react';

export default function ProceduresPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({ title: '', description: '', category: 'maintenance', version: '1.0', stepsText: '', equipmentTypesText: '' });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try { setLoading(true); const data = await api.getProcedures(); setItems(data); }
    catch (err) { toast.error('Failed to load procedures'); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) return toast.error('Title is required');
    
    const equipmentTypes = formData.equipmentTypesText.split(',').map(s => s.trim()).filter(Boolean);
    const stepsArray = formData.stepsText.split('\n').filter(Boolean).map((s, i) => ({ stepNumber: i+1, description: s }));

    try { 
      setSubmitting(true); 
      await api.createProcedure({
        title: formData.title,
        description: formData.description,
        category: formData.category,
        version: formData.version,
        equipmentTypes,
        steps: stepsArray,
        createdBy: 'admin'
      }); 
      toast.success('Procedure created'); 
      loadData(); 
      setFormData({ title: '', description: '', category: 'maintenance', version: '1.0', stepsText: '', equipmentTypesText: '' }); 
    }
    catch (err) { toast.error('Failed to create procedure'); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure?')) return;
    try { await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/procedures/${id}`, { method: 'DELETE' }); toast.success('Deleted'); loadData(); }
    catch (err) { toast.error('Failed to delete'); }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Standard Operating Procedures</h1>
        <p className="text-gray-500 text-sm mt-1">Manage maintenance and safety guidelines</p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold mb-4 text-gray-800">Create Procedure</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div><label className="block text-xs font-medium text-gray-700 mb-1">Title *</label><input className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500" required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} /></div>
          <div><label className="block text-xs font-medium text-gray-700 mb-1">Category</label><select className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}><option value="maintenance">Maintenance</option><option value="safety">Safety</option><option value="operation">Operation</option><option value="emergency">Emergency</option></select></div>
          <div><label className="block text-xs font-medium text-gray-700 mb-1">Version</label><input className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500" value={formData.version} onChange={e => setFormData({...formData, version: e.target.value})} /></div>
          <div className="md:col-span-2 lg:col-span-3"><label className="block text-xs font-medium text-gray-700 mb-1">Description</label><input className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} /></div>
          <div className="md:col-span-2 lg:col-span-3"><label className="block text-xs font-medium text-gray-700 mb-1">Equipment Types (comma separated)</label><input className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500" placeholder="pump, valve" value={formData.equipmentTypesText} onChange={e => setFormData({...formData, equipmentTypesText: e.target.value})} /></div>
          <div className="md:col-span-2 lg:col-span-3"><label className="block text-xs font-medium text-gray-700 mb-1">Steps (one per line)</label><textarea rows={3} className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500" placeholder="Step 1...&#10;Step 2..." value={formData.stepsText} onChange={e => setFormData({...formData, stepsText: e.target.value})} /></div>
          <div className="md:col-span-2 lg:col-span-3 flex justify-end"><button type="submit" disabled={submitting} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400 font-medium">{submitting ? 'Saving...' : 'Create Procedure'}</button></div>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          [1,2].map(i => <div key={i} className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 animate-pulse h-40"></div>)
        ) : items.length === 0 ? (
          <div className="col-span-full text-center py-16 bg-white rounded-lg shadow-sm border border-dashed border-gray-300 text-gray-500">
            <FileText className="mx-auto h-12 w-12 text-gray-400 mb-3" />
            <h3 className="text-lg font-medium text-gray-900">No procedures created</h3>
          </div>
        ) : (
          items.map(item => (
            <div key={item.id} className="bg-white p-5 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow flex flex-col">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2"><FileText className="text-blue-500 w-5 h-5" /><h3 className="font-semibold text-lg text-gray-900 line-clamp-1">{item.title}</h3></div>
                <button onClick={() => handleDelete(item.id)} className="text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={16}/></button>
              </div>
              <p className="text-sm text-gray-500 mb-4 line-clamp-2 flex-1">{item.description}</p>
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 capitalize">{item.category}</span>
                <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">v{item.version}</span>
                {item.steps && <span className="px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800">{Array.isArray(item.steps) ? item.steps.length : 0} Steps</span>}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
