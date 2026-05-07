import Link from 'next/link';

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <Link
        href="/evidence"
        className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium mb-4"
      >
        📷 Go to Evidence →
      </Link>

      <div>
        <h1 className="text-3xl font-bold text-industrial-950">Dashboard</h1>
        <p className="mt-1 text-sm text-industrial-600">
          Pacific Shipyard - Dry Dock 3 Operations
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg border border-industrial-200">
          <div className="p-5">
            <p className="text-sm font-medium text-industrial-600">Active Tasks</p>
            <p className="mt-1 text-3xl font-semibold text-industrial-900">8</p>
            <p className="mt-1 text-xs text-industrial-500">+2 from yesterday</p>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg border border-industrial-200">
          <div className="p-5">
            <p className="text-sm font-medium text-industrial-600">Completed Today</p>
            <p className="mt-1 text-3xl font-semibold text-industrial-900">12</p>
            <p className="mt-1 text-xs text-green-600">15% faster than avg</p>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg border border-industrial-200">
          <div className="p-5">
            <p className="text-sm font-medium text-industrial-600">In Progress</p>
            <p className="mt-1 text-3xl font-semibold text-industrial-900">5</p>
            <p className="mt-1 text-xs text-industrial-500">3 paused</p>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg border border-industrial-200">
          <div className="p-5">
            <p className="text-sm font-medium text-industrial-600">Issues Found</p>
            <p className="mt-1 text-3xl font-semibold text-industrial-900">6</p>
            <p className="mt-1 text-xs text-orange-600">3 high priority</p>
          </div>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg border border-industrial-200">
        <div className="px-4 py-5 border-b border-industrial-200">
          <h3 className="text-lg font-semibold text-industrial-900">Safety Alerts</h3>
        </div>
        <div className="px-4 py-4 space-y-3">
          <div className="flex items-start p-3 bg-red-50 border-l-4 border-red-600 rounded-r">
            <div className="flex-1">
              <p className="text-sm font-medium text-red-900">
                Main Propulsion Engine - Cylinder #4 Exhaust Valve Excessive Wear
              </p>
              <p className="mt-1 text-xs text-red-700">
                Reported by tech-091 • WO-2024-1876
              </p>
            </div>
            <span className="ml-3 text-xs font-bold text-red-700 bg-red-100 px-2 py-1 rounded">HIGH</span>
          </div>

          <div className="flex items-start p-3 bg-orange-50 border-l-4 border-orange-500 rounded-r">
            <div className="flex-1">
              <p className="text-sm font-medium text-orange-900">
                Port Main Engine - Coolant Hose #3 Minor Cracking
              </p>
              <p className="mt-1 text-xs text-orange-700">
                Reported by Maria Santos • WO-2024-1247
              </p>
            </div>
            <span className="ml-3 text-xs font-bold text-orange-700 bg-orange-100 px-2 py-1 rounded">MEDIUM</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="bg-white shadow rounded-lg border border-industrial-200">
          <div className="px-4 py-5 border-b border-industrial-200">
            <h3 className="text-lg font-semibold text-industrial-900">Active Procedures</h3>
          </div>
          <div className="px-4 py-4 space-y-4">
            <div className="border-l-4 border-blue-500 pl-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-industrial-900">Port Main Engine - Quarterly Inspection</p>
                  <p className="text-xs text-industrial-600 mt-1">David Park • Step 8 of 19</p>
                </div>
                <span className="text-xs font-medium text-blue-700 bg-blue-100 px-2 py-1 rounded">IN PROGRESS</span>
              </div>
              <div className="mt-2">
                <div className="w-full bg-industrial-200 rounded-full h-1.5">
                  <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: '42%' }}></div>
                </div>
                <p className="text-xs text-industrial-500 mt-1">42% complete • 5 photos</p>
              </div>
            </div>

            <div className="border-l-4 border-blue-500 pl-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-industrial-900">Air Compressor #1 - Emergency Repair</p>
                  <p className="text-xs text-industrial-600 mt-1">David Park • Step 8 of 12</p>
                </div>
                <span className="text-xs font-medium text-red-700 bg-red-100 px-2 py-1 rounded">CRITICAL</span>
              </div>
              <div className="mt-2">
                <div className="w-full bg-industrial-200 rounded-full h-1.5">
                  <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: '67%' }}></div>
                </div>
                <p className="text-xs text-industrial-500 mt-1">67% complete • 2 photos</p>
              </div>
            </div>

            <div className="border-l-4 border-gray-300 pl-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-industrial-900">Lube Oil Pump - Quarterly Inspection</p>
                  <p className="text-xs text-industrial-600 mt-1">Sarah Martinez • Scheduled 14:00</p>
                </div>
                <span className="text-xs font-medium text-gray-700 bg-gray-100 px-2 py-1 rounded">ASSIGNED</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg border border-industrial-200">
          <div className="px-4 py-5 border-b border-industrial-200">
            <h3 className="text-lg font-semibold text-industrial-900">Equipment Status</h3>
          </div>
          <div className="px-4 py-4 space-y-3">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded">
              <div className="flex-1">
                <p className="text-sm font-medium text-industrial-900">Port Main Engine</p>
                <p className="text-xs text-industrial-600">CAT 3516C • 14,237 hrs</p>
              </div>
              <span className="text-xs font-medium text-green-700 bg-green-100 px-2 py-1 rounded">OPERATIONAL</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded">
              <div className="flex-1">
                <p className="text-sm font-medium text-industrial-900">Main Propulsion Engine</p>
                <p className="text-xs text-industrial-600">Sulzer 6RTA58 • 52,184 hrs</p>
              </div>
              <span className="text-xs font-medium text-yellow-700 bg-yellow-100 px-2 py-1 rounded">MAINTENANCE</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-green-50 rounded">
              <div className="flex-1">
                <p className="text-sm font-medium text-industrial-900">Emergency Diesel Generator</p>
                <p className="text-xs text-industrial-600">Cummins C550D5 • 287 hrs</p>
              </div>
              <span className="text-xs font-medium text-green-700 bg-green-100 px-2 py-1 rounded">OPERATIONAL</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-green-50 rounded">
              <div className="flex-1">
                <p className="text-sm font-medium text-industrial-900">Main Seawater Heat Exchanger</p>
                <p className="text-xs text-industrial-600">Alfa Laval M15-BFM</p>
              </div>
              <span className="text-xs font-medium text-green-700 bg-green-100 px-2 py-1 rounded">OPERATIONAL</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg border border-industrial-200">
        <div className="px-4 py-5 border-b border-industrial-200">
          <h3 className="text-lg font-semibold text-industrial-900">Recent Completions</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-industrial-200">
            <thead className="bg-industrial-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-industrial-500 uppercase">Equipment</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-industrial-500 uppercase">Procedure</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-industrial-500 uppercase">Technician</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-industrial-500 uppercase">Duration</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-industrial-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-industrial-200">
              <tr className="hover:bg-industrial-50">
                <td className="px-6 py-4 text-sm font-medium text-industrial-900">Emergency Diesel Generator</td>
                <td className="px-6 py-4 text-sm text-industrial-600">Weekly Load Test</td>
                <td className="px-6 py-4 text-sm text-industrial-600">Maria Santos</td>
                <td className="px-6 py-4 text-sm text-industrial-600">42min</td>
                <td className="px-6 py-4">
                  <span className="text-xs font-medium text-green-700 bg-green-100 px-2 py-1 rounded">COMPLETED</span>
                </td>
              </tr>
              <tr className="hover:bg-industrial-50">
                <td className="px-6 py-4 text-sm font-medium text-industrial-900">Main Seawater Heat Exchanger</td>
                <td className="px-6 py-4 text-sm text-industrial-600">Monthly Inspection</td>
                <td className="px-6 py-4 text-sm text-industrial-600">James Chen</td>
                <td className="px-6 py-4 text-sm text-industrial-600">28min</td>
                <td className="px-6 py-4">
                  <span className="text-xs font-medium text-green-700 bg-green-100 px-2 py-1 rounded">COMPLETED</span>
                </td>
              </tr>
              <tr className="hover:bg-industrial-50">
                <td className="px-6 py-4 text-sm font-medium text-industrial-900">Control Air Compressor #1</td>
                <td className="px-6 py-4 text-sm text-industrial-600">Monthly PM</td>
                <td className="px-6 py-4 text-sm text-industrial-600">tech-029</td>
                <td className="px-6 py-4 text-sm text-industrial-600">38min</td>
                <td className="px-6 py-4">
                  <span className="text-xs font-medium text-green-700 bg-green-100 px-2 py-1 rounded">COMPLETED</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}