import { useState } from 'react';

function App() {
  const [showApp, setShowApp] = useState(false)

  // Landing Page View
  if (!showApp) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 w-full">
        <div className="max-w-2xl text-center space-y-8">
          <div className="inline-block p-4 rounded-full bg-green-900/30 mb-4">
            <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-green-600">
              Smart Transport
            </h1>
          </div>
          <h2 className="text-2xl text-gray-300 font-medium">
            Ethiopia's First Integrated Public Transport Assistant
          </h2>
          <p className="text-gray-400 leading-relaxed text-lg">
            Find the optimal minibus, taxi, or bajaj routes across Adama. Real-time insights, accurate pricing, and seamless navigation in the palm of your hand.
          </p>
          <button 
            onClick={() => setShowApp(true)}
            className="mt-8 px-8 py-4 bg-green-600 hover:bg-green-500 cursor-pointer text-white font-bold rounded-lg shadow-lg shadow-green-600/20 transition-all transform hover:-translate-y-1 text-lg"
          >
            Find a Route
          </button>
        </div>
      </div>
    )
  }

  // Main App View
  return (
    <div className="flex h-screen bg-black text-gray-100 flex-col md:flex-row overflow-hidden w-full max-w-full">
      {/* Sidebar for Search and Routes */}
      <aside className="w-full md:w-96 bg-gray-900 shadow-2xl z-10 flex flex-col relative h-[50vh] md:h-full border-r border-green-900/30">
        <div className="p-4 border-b border-gray-800 flex-shrink-0 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-green-500 flex items-center gap-2">
              Smart Transport
            </h1>
            <p className="text-sm text-gray-400">Adama, Ethiopia</p>
          </div>
          <button 
            onClick={() => setShowApp(false)}
            className="text-xs text-gray-400 hover:text-white px-3 py-1 cursor-pointer border border-gray-700 rounded bg-gray-800 transition-colors"
          >
            Back
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4">
          {/* We will add SearchUI here in a future step */}
          <div className="text-gray-500 text-sm text-center mt-10">
            Search interface will go here
          </div>
        </div>
      </aside>

      {/* Main Map Area */}
      <main className="flex-1 relative bg-gray-950 h-[50vh] md:h-full">
        {/* We will add MapView here in a future step */}
        <div className="absolute inset-0 flex items-center justify-center text-gray-600">
          Map View will go here
        </div>
      </main>
    </div>
  )
}

export default App
