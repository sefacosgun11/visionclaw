'use client';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { History, Clock } from 'lucide-react';

export default function HistoryPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/evidence`);
        if (response.ok) {
          const data = await response.json();
          setItems(data);
        }
      } catch (e) {
        toast.error('Failed to load history');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Activity History</h1>
      
      {loading ? (
        <div className="animate-pulse space-y-4">
          {[1,2,3].map(i => <div key={i} className="h-16 bg-white rounded shadow-sm"></div>)}
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-16 bg-white rounded border border-dashed border-gray-300 text-gray-500">
          <History className="mx-auto h-12 w-12 text-gray-400 mb-3" />
          <h3 className="text-lg font-medium text-gray-900">No activity recorded</h3>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="relative border-l-2 border-gray-200 ml-3 space-y-8">
            {items.map((item, idx) => (
              <div key={item.id} className="relative pl-6">
                <div className="absolute -left-1.5 mt-1.5 h-3 w-3 rounded-full border-2 border-white bg-blue-500"></div>
                <div className="flex flex-col sm:flex-row gap-4">
                  {item.url && <img src={item.url} alt="evidence" className="w-24 h-24 object-cover rounded-md border" />}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 capitalize">{item.type} Captured</h4>
                    <p className="text-xs text-gray-500 mt-1 flex items-center gap-1"><Clock size={12}/> {new Date(item.timestamp).toLocaleString()} • {item.capturedBy}</p>
                    {item.description && <p className="text-sm text-gray-700 mt-2">{item.description}</p>}
                    {item.analysis && (
                      <span className={`inline-block mt-2 px-2 py-1 text-xs font-medium rounded-full ${item.analysis.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-gray-100'}`}>
                        Analysis: {item.analysis.status}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
