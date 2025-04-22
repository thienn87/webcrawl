import Link from 'next/link'
import Image from 'next/image';

export default function Header() {
  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <div className="w-40  flex items-center justify-center text-white font-bold mr-3">
                  <Image
                    src="/winwinLogo-02.png"
                    alt="WinWin Solutions"
                    title="WinWin Solutions"
                    width={160} // or your preferred width
                    height={40} // or your preferred height
                    priority // if you want to preload the logo
                  />
                </div>
                <span className="ml-2 text-xl font-semibold text-gray-900">LLM Web Craler</span>
              </div>
            </Link>
          </div>
          
          {/* User Widget */}
          <div className="flex items-center">
            <div className="ml-3 relative flex items-center space-x-3">
              <span className="text-sm text-gray-700">John Doe</span>
              <div className="h-8 w-8 rounded-full bg-blue-500 text-white flex items-center justify-center">
                JD
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}