
import MapView from '../components/MapView';
import Footer from '../components/Footer';
import SearchUI from '../components/SearchUI';
;

interface TransportAppProps {
  onBack: () => void;
}

export default function TransportApp({ onBack }: TransportAppProps) {
  return (
    <div className="flex h-screen bg-black text-gray-100 flex-col md:flex-row overflow-hidden w-full max-w-full">
      {/* Sidebar for Search and Routes */}
      <aside className="w-full md:w-96 bg-gray-900 shadow-2xl z-10 flex flex-col relative h-[50vh] md:h-full border-r border-green-900/30">
        <div className="p-4 border-b border-gray-800 shrink-0 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-green-500 flex items-center gap-2">
              Smart Transport
            </h1>
            <p className="text-sm text-gray-400">Adama, Ethiopia</p>
          </div>
          <button
            onClick={onBack}
            className="text-xs text-gray-400 hover:text-white px-3 py-1 cursor-pointer border border-gray-700 rounded bg-gray-800 transition-colors"
          >
            Back
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <SearchUI />
        </div>
      </aside>

      {/* Main Map Area */}
      <main className="flex-1 relative bg-gray-950 h-[50vh] md:h-full z-10">
        <MapView />

      </main>
      <Footer />
    </div>
  );
}
