
import React from 'react';

export default function DashboardPage() {
  return (
    <div className="py-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>
      
      {/* Stats Overview */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <StatCard title="Total Crawls" value="24" change="+3" />
        <StatCard title="Pages Crawled" value="2,451" change="+156" />
        <StatCard title="Avg. Crawl Time" value="3m 12s" change="-14s" isImprovement={true} />
        <StatCard title="Data Extracted" value="8.2 MB" change="+0.6 MB" />
      </div>
      
      {/* Recent Crawls */}
      <div className="bg-white shadow-sm rounded-lg overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-medium text-gray-900">Recent Crawls</h2>
          <a href="/results" className="text-sm text-blue-600 hover:text-blue-800">View all</a>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Website
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pages
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <CrawlRow 
                website="example.com" 
                date="Today, 10:23 AM" 
                pages={145} 
                status="completed" 
              />
              <CrawlRow 
                website="blog.example.org" 
                date="Yesterday, 3:45 PM" 
                pages={67} 
                status="completed" 
              />
              <CrawlRow 
                website="store.example.net" 
                date="Jul 12, 2023" 
                pages={212} 
                status="completed" 
              />
              <CrawlRow 
                website="docs.example.io" 
                date="Jul 10, 2023" 
                pages={89} 
                status="failed" 
              />
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Quick Actions */}
      <div className="bg-white shadow-sm rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <ActionCard 
            title="New Crawl" 
            description="Start a new website crawl with custom parameters" 
            buttonText="Start" 
            href="/crawl" 
          />
          <ActionCard 
            title="Schedule Crawl" 
            description="Set up recurring crawls for regular monitoring" 
            buttonText="Schedule" 
            href="/schedule" 
          />
          <ActionCard 
            title="Export Data" 
            description="Download your crawled data in various formats" 
            buttonText="Export" 
            href="/results" 
          />
        </div>
      </div>
    </div>
  )
}

// Stat Card Component
interface StatCardProps {
  title: string;
  value: string;
  change: string;
  isImprovement?: boolean;
}
function StatCard({ title, value, change, isImprovement = false }: StatCardProps) {
  return (
    <div className="bg-white overflow-hidden shadow-sm rounded-lg">
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <p className="text-sm font-medium text-gray-500 truncate">{title}</p>
            <p className="mt-1 text-3xl font-semibold text-gray-900">{value}</p>
          </div>
          <div className="ml-auto">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              isImprovement ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
            }`}>
              {change}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

// Crawl Row Component
interface CrawlRowProps {
  website: string;
  date: string;
  pages: number;
  status: 'completed' | 'running' | 'failed' | 'paused';
}
function CrawlRow({ website, date, pages, status }: CrawlRowProps) {
  const statusClasses: Record<string, string> = {
    completed: "bg-green-100 text-green-800",
    running: "bg-blue-100 text-blue-800",
    failed: "bg-red-100 text-red-800",
    paused: "bg-yellow-100 text-yellow-800"
  };
  
  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
        {website}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {date}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {pages}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`px-2 py-1 text-xs rounded-full ${statusClasses[status]}`}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        <a href={`/results/${website}`} className="text-blue-600 hover:text-blue-900 mr-3">
          View
        </a>
        <a href="#" className="text-gray-600 hover:text-gray-900">
          Delete
        </a>
      </td>
    </tr>
  )
}

// Action Card Component
interface ActionCardProps {
  title: string;
  description: string;
  buttonText: string;
  href: string;
}
function ActionCard({ title, description, buttonText, href }: ActionCardProps) {
  return (
    <div className="border border-gray-200 rounded-lg p-5 hover:border-gray-300 transition-colors">
      <h3 className="text-md font-medium text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-500 mb-4">{description}</p>
      <a
        href={href}
        className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        {buttonText}
      </a>
    </div>
  )
}
