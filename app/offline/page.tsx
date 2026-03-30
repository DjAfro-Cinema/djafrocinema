export default function OfflinePage() {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center text-white px-6 text-center">
        <div className="text-6xl mb-6">🎬</div>
        <h1 className="text-3xl font-bold mb-3" style={{ fontFamily: "var(--font-display)" }}>
          You're offline
        </h1>
        <p className="text-gray-400 max-w-sm">
          No internet connection. Connect and come back for your movies — DjAfro Cinema will be waiting.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="mt-8 px-6 py-3 bg-[#e50914] rounded-xl font-semibold hover:bg-[#c4080f] transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }