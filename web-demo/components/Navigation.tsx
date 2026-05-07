'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/' },
  { name: 'Equipment', href: '/equipment' },
  { name: 'Procedures', href: '/procedures' },
  { name: 'Tasks', href: '/tasks' },
  { name: 'Evidence', href: '/evidence' },
  { name: 'Inspections', href: '/inspections' },
  { name: 'History', href: '/history' },
]

export function Navigation() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <div className="h-8 w-8 bg-industrial-700 rounded flex items-center justify-center">
                <span className="text-white font-bold text-lg">V</span>
              </div>
              <span className="ml-2 text-xl font-semibold text-industrial-900">
                VisionClaw
              </span>
            </div>

            {/* Desktop Menu */}
            <div className="hidden sm:flex sm:ml-8 sm:space-x-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
                      isActive
                        ? 'bg-industrial-100 text-industrial-900'
                        : 'text-industrial-600 hover:text-industrial-900 hover:bg-industrial-50'
                    }`}
                  >
                    {item.name}
                  </Link>
                )
              })}
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* User Info - Desktop */}
            <div className="hidden sm:flex items-center space-x-3">
              <span className="text-sm text-industrial-600">
                Pacific Shipyard
              </span>
              <div className="h-8 w-8 bg-industrial-700 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">SM</span>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="sm:hidden p-2 rounded-md text-industrial-600 hover:text-industrial-900 hover:bg-industrial-50"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-t border-gray-200 bg-white">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    isActive
                      ? 'bg-industrial-100 text-industrial-900'
                      : 'text-industrial-600 hover:text-industrial-900 hover:bg-industrial-50'
                  }`}
                >
                  {item.name}
                </Link>
              )
            })}
          </div>
          {/* User Info - Mobile */}
          <div className="border-t border-gray-200 px-4 py-3">
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 bg-industrial-700 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">SM</span>
              </div>
              <span className="text-sm text-industrial-600">
                Pacific Shipyard
              </span>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
