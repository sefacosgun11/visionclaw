'use client';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import { ClipboardList, Trash2 } from 'lucide-react';

export default function TasksPage() {
  const [items, setItems] = useState<any[]>([]);
  const [equipments, setEquipments] = useState<any[]>([]);
  const [procedures, setProcedures] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [formData, setFormData] = useState({ title: '', description: '', type: 'maintenance', assignedTo: '', priority: 'medium', equipmentId: '', procedureId: '' });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try { 
      setLoading(true); 
      const [tasks, eq, proc] = await Promise.all([
        api.getTasks(), api.getEquipment(), api.getProcedures()
      ]);
      setItems(tasks); setEquipments(eq); setProcedures(proc);
    } catch (err) { toast.error('Failed to load data'); }
    finally { setLoading(false); }
  };

  const filteredItems = statusFilter === 'all' ? items : items.filter(i => i.status === statusFilter);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.assignedTo) return toast.error('Title and Assignee are required');
    try { 
      setSubmitting(true); 
      await api.createTask({ ...formData, status: 'pending' }); 
      toast.success('Task created'); 
      loadData(); 
      setFormData({ title: '', description: '', type: 'maintenance', assignedTo: '', priority: 'medium', equipmentId: '', procedureId: '' }); 
    } catch (err) { toast.error('Failed to create task'); }
    finally { setSubmitting(false); }
  };

  const updateStatus = async (id: string, newStatus: string) => {
    try { await api.updateTask(id, { status: newStatus }); toast.success('Status updated'); loadData(); }
    catch (err) { toast.error('Failed to update status'); }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Task Management</h1>
          <p className="text-gray-500 text-sm mt-1">Assign and track operational tasks</p>
        </div>
        <div className="flex bg-white rounded-lg shadow-sm p-1 border border-gray-200">
          {['all', 'pending', 'in-progress', 'completed'].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)} className={`px-4 py-1.5 text-sm font-medium rounded-md capitalize ${statusFilter === s ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold mb-4 text-gray-800">Assign New Task</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="lg:col-span-2"><label className="block text-xs font-medium text-gray-700 mb-1">Title *</label><input className="w-full border border-gray-300 p-2 rounded" required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} /></div>
          <div><label className="block text-xs font-medium text-gray-700 mb-1">Assignee *</label><input className="w-full border border-gray-300 p-2 rounded" required value={formData.assignedTo} onChange={e => setFormData({...formData, assignedTo: e.target.value})} /></div>
          <div><label className="block text-xs font-medium text-gray-700 mb-1">Priority</label><select className="w-full border border-gray-300 p-2 rounded" value={formData.priority} onChange={e => setFormData({...formData, priority: e.target.value})}><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="critical">Critical</option></select></div>
          <div><label className="block text-xs font-medium text-gray-700 mb-1">Type</label><select className="w-full border border-gray-300 p-2 rounded" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}><option value="maintenance">Maintenance</option><option value="inspection">Inspection</option><option value="repair">Repair</option></select></div>
          <div><label className="block text-xs font-medium text-gray-700 mb-1">Equipment</label><select className="w-full border border-gray-300 p-2 rounded" value={formData.equipmentId} onChange={e => setFormData({...formData, equipmentId: e.target.value})}><option value="">None</option>{equipments.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}</select></div>
          <div className="lg:col-span-2"><label className="block text-xs font-medium text-gray-700 mb-1">Procedure</label><select className="w-full border border-gray-300 p-2 rounded" value={formData.procedureId} onChange={e => setFormData({...formData, procedureId: e.target.value})}><option value="">None</option>{procedures.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}</select></div>
          <div className="lg:col-span-4 flex justify-end"><button type="submit" disabled={submitting} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400 font-medium">{submitting ? 'Assigning...' : 'Assign Task'}</button></div>
        </form>
      </div>

      <div className="space-y-4">
        {loading ? (
          [1,2,3].map(i => <div key={i} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 animate-pulse h-24"></div>)
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-lg shadow-sm border border-dashed border-gray-300 text-gray-500">
            <ClipboardList className="mx-auto h-12 w-12 text-gray-400 mb-3" />
            <h3 className="text-lg font-medium text-gray-900">No tasks assigned</h3>
          </div>
        ) : (
          filteredItems.map(item => (
            <div key={item.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:shadow-md transition-shadow">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="font-semibold text-gray-900">{item.title}</h3>
                  <span className={`px-2 py-0.5 text-xs font-bold rounded ${item.priority === 'critical' ? 'bg-red-100 text-red-800' : item.priority === 'high' ? 'bg-orange-100 text-orange-800' : item.priority === 'medium' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>{item.priority.toUpperCase()}</span>
                </div>
                <p className="text-sm text-gray-500 mb-2">Assigned to: <span className="font-medium text-gray-700">{item.assignedTo}</span> • {item.type}</p>
                {(item.equipment || item.procedure) && (
                  <div className="flex gap-4 text-xs text-gray-500">
                    {item.equipment && <span>Eq: {item.equipment.name}</span>}
                    {item.procedure && <span>Proc: {item.procedure.title}</span>}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-3">
                <select className="border border-gray-300 p-1.5 text-sm rounded bg-gray-50 font-medium" value={item.status} onChange={(e) => updateStatus(item.id, e.target.value)}>
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                <button onClick={async () => { if(confirm('Delete task?')){ await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tasks/${item.id}`, {method:'DELETE'}); loadData(); } }} className="text-gray-400 hover:text-red-500"><Trash2 size={18}/></button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
