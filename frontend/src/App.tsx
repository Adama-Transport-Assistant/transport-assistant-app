import { useState } from 'react';
import LandingPage from './pages/LandingPage';
import TransportApp from './pages/TransportApp';

function App() {
  const [showApp, setShowApp] = useState(false)

  // Landing Page View
  if (!showApp) {
    return <LandingPage onStart={() => setShowApp(true)} />
  }

  // Main App View
  return <TransportApp onBack={() => setShowApp(false)} />
}

export default App
