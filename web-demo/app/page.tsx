'use client';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { AlertCircle, Server, ClipboardList, CheckCircle, Clock, Camera } from 'lucide-react';
import Link from 'next/link';

export default function Dashboard() {
  const [stats, setStats] = useState({ equipment: 0, activeTasks: 0, inspections: 0, evidence: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const [eq, tasks, insp] = await Promise.all([
          api.getEquipment(),
          api.getTasksByStatus('in-progress').catch(() => []),
          api.getInspections().catch(() => [])
        ]);
        setStats({
          equipment: eq.length,
          activeTasks: tasks.length,
          inspections: insp.length,
          evidence: 0
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-600">Industrial Operations Overview</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Total Equipment', value: loading ? '...' : stats.equipment, icon: Server, color: 'text-blue-600' },
          { label: 'Active Tasks', value: loading ? '...' : stats.activeTasks, icon: ClipboardList, color: 'text-orange-600' },
          { label: 'Inspections', value: loading ? '...' : stats.inspections, icon: CheckCircle, color: 'text-green-600' },
          { label: 'System Health', value: '100%', icon: AlertCircle, color: 'text-gray-600' }
        ].map((s, i) => (
          <div key={i} className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200">
            <div className="p-5 flex items-center gap-4">
              <div className={`p-3 rounded-full bg-gray-50 ${s.color}`}><s.icon size={24} /></div>
              <div>
                <p className="text-sm font-medium text-gray-600">{s.label}</p>
                <p className="mt-1 text-2xl font-semibold text-gray-900">{s.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white shadow-sm rounded-lg border border-gray-200">
          <div className="px-4 py-5 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
          </div>
          <div className="p-4 grid grid-cols-2 gap-4">
            <Link href="/evidence" className="flex flex-col items-center justify-center p-6 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <Camera className="h-8 w-8 text-blue-500 mb-2" />
              <span className="font-medium text-gray-900">New Evidence</span>
            </Link>
            <Link href="/tasks" className="flex flex-col items-center justify-center p-6 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <ClipboardList className="h-8 w-8 text-orange-500 mb-2" />
              <span className="font-medium text-gray-900">Assign Task</span>
            </Link>
            <Link href="/equipment" className="flex flex-col items-center justify-center p-6 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <Server className="h-8 w-8 text-green-500 mb-2" />
              <span className="font-medium text-gray-900">Add Equipment</span>
            </Link>
            <Link href="/inspections" className="flex flex-col items-center justify-center p-6 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <CheckCircle className="h-8 w-8 text-purple-500 mb-2" />
              <span className="font-medium text-gray-900">Schedule Inspection</span>
            </Link>
          </div>
        </div>
        
        <div className="bg-white shadow-sm rounded-lg border border-gray-200">
          <div className="px-4 py-5 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
          </div>
          <div className="p-4 flex flex-col items-center justify-center h-48 text-gray-500">
            <Clock className="h-8 w-8 text-gray-300 mb-2" />
            <p>Activity timeline connected in History view.</p>
            <Link href="/history" className="mt-4 text-blue-600 hover:underline text-sm font-medium">View Full History &rarr;</Link>
          </div>
        </div>
      </div>
    </div>
  );
}