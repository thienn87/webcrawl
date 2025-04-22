export default function ResultsPage() {
  return (
    <div className="py-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Crawl Results</h1>
      
      <div className="bg-white shadow-sm rounded-lg p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium text-gray-900">example.com</h2>
          <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
            Completed
          </span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="bg-gray-50 p-4 rounded-md">
            <p className="text-sm text-gray-500">Pages Crawled</p>
            <p className="text-xl font-semibold">145</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-md">
            <p className="text-sm text-gray-500">Images Found</p>
            <p className="text-xl font-semibold">327</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-md">
            <p className="text-sm text-gray-500">Crawl Time</p>
            <p className="text-xl font-semibold">2m 34s</p>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <button className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700">
            Export CSV
          </button>
          <button className="text-sm bg-gray-100 text-gray-700 px-3 py-1 rounded hover:bg-gray-200">
            Export JSON
          </button>
        </div>
      </div>
      
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Crawled Pages</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  URL
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Links
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {[1, 2, 3, 4, 5].map((item) => (
                <tr key={item} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                    https://example.com/page-{item}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    Example Page {item}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                      200 OK
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {Math.floor(Math.random() * 20) + 5}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing <span className="font-medium">1</span> to <span className="font-medium">5</span> of <span className="font-medium">145</span> results
          </div>
          <div className="flex space-x-2">
            <button className="px-3 py-1 border rounded text-sm disabled:opacity-50">
              Previous
            </button>
            <button className="px-3 py-1 border rounded text-sm bg-blue-600 text-white">
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}