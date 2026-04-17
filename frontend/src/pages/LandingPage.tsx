import React from 'react';
import Footer from '../components/Footer';

interface LandingPageProps {
  onStart: () => void;
}

export default function LandingPage({ onStart }: LandingPageProps) {
  return (
    <>
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
            onClick={onStart}
            className="mt-8 px-8 py-4 bg-green-600 hover:bg-green-500 cursor-pointer text-white font-bold rounded-lg shadow-lg shadow-green-600/20 transition-all transform hover:-translate-y-1 text-lg"
          >
            Find a Route
          </button>
        </div>
      </div>
      <Footer />
    </>
  );
}
