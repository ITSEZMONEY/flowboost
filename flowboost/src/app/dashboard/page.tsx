'use client'

import { useState } from 'react'
import { Header } from '@/components/layout/header'
import { Button } from '@/components/ui/button'
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  Globe,
  TrendingUp,
  ExternalLink
} from 'lucide-react'

export default function DashboardPage() {
  const [sites] = useState([
    {
      id: '1',
      name: 'My SaaS Website',
      domain: 'mysaas.com',
      healthScore: 85,
      lastCrawl: '2 hours ago',
      issues: 12,
      isConnected: true
    },
    {
      id: '2',
      name: 'Landing Page',
      domain: 'landing.mysaas.com',
      healthScore: 92,
      lastCrawl: '1 day ago',
      issues: 3,
      isConnected: true
    }
  ])

  const handleConnectWebflow = () => {
    window.location.href = '/api/auth/webflow'
  }

  const handleRunAudit = (siteId: string) => {
    // TODO: Implement audit functionality
    console.log('Running audit for site:', siteId)
  }

  return (
    <div className="flex flex-col h-full">
      <Header
        title="Dashboard"
        subtitle="Monitor your sites' SEO health and performance"
        action={{
          label: 'Connect Site',
          onClick: handleConnectWebflow
        }}
      />

      <div className="flex-1 overflow-auto p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center">
              <Globe className="h-8 w-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Sites</p>
                <p className="text-2xl font-bold text-gray-900">{sites.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-orange-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Issues</p>
                <p className="text-2xl font-bold text-gray-900">
                  {sites.reduce((sum, site) => sum + site.issues, 0)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg Health Score</p>
                <p className="text-2xl font-bold text-gray-900">
                  {Math.round(sites.reduce((sum, site) => sum + site.healthScore, 0) / sites.length)}%
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center">
              <Activity className="h-8 w-8 text-purple-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Crawls</p>
                <p className="text-2xl font-bold text-gray-900">0</p>
              </div>
            </div>
          </div>
        </div>

        {/* Sites List */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Your Sites</h2>
          </div>

          {sites.length === 0 ? (
            <div className="p-12 text-center">
              <Globe className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">No sites connected</h3>
              <p className="mt-2 text-sm text-gray-600">
                Connect your first Webflow site to start monitoring SEO health.
              </p>
              <Button onClick={handleConnectWebflow} className="mt-4">
                Connect Webflow Site
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {sites.map((site) => (
                <div key={site.id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <div className={`h-3 w-3 rounded-full ${
                          site.isConnected ? 'bg-green-400' : 'bg-red-400'
                        }`} />
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">{site.name}</h3>
                        <div className="flex items-center text-sm text-gray-500">
                          <span>{site.domain}</span>
                          <ExternalLink className="ml-1 h-3 w-3" />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-6">
                      <div className="text-center">
                        <div className={`text-2xl font-bold ${
                          site.healthScore >= 80 ? 'text-green-600' :
                          site.healthScore >= 60 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {site.healthScore}%
                        </div>
                        <div className="text-xs text-gray-500">Health Score</div>
                      </div>

                      <div className="text-center">
                        <div className="text-2xl font-bold text-orange-600">{site.issues}</div>
                        <div className="text-xs text-gray-500">Issues</div>
                      </div>

                      <div className="text-center">
                        <div className="text-sm text-gray-900">{site.lastCrawl}</div>
                        <div className="text-xs text-gray-500">Last Crawl</div>
                      </div>

                      <Button
                        onClick={() => handleRunAudit(site.id)}
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        Run Audit
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}