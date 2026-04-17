import { useState } from 'react'

function App() {
  return (
    <div className="flex h-screen bg-gray-50 flex-col md:flex-row overflow-hidden w-full max-w-full">
      {/* Sidebar for Search and Routes */}
      <aside className="w-full md:w-96 bg-white shadow-lg z-10 flex flex-col relative h-[50vh] md:h-full">
        <div className="p-4 border-b border-gray-100 flex-shrink-0">
          <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            Smart Transport
          </h1>
          <p className="text-sm text-gray-500">Adama, Ethiopia</p>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4">
          {/* We will add SearchUI here in a future step */}
          <div className="text-gray-400 text-sm text-center mt-10">
            Search interface will go here
          </div>
        </div>
      </aside>

      {/* Main Map Area */}
      <main className="flex-1 relative bg-gray-200 h-[50vh] md:h-full">
          {/* We will add MapView here in a future step */}
          <div className="absolute inset-0 flex items-center justify-center text-gray-400">
            Map View will go here
          </div>
      </main>
    </div>
  )
}

export default App
