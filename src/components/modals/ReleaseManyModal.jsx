import React, { useState, useEffect } from "react";

export default function ReleaseManyModal({ dex, onConfirm, onClose }) {
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    // Allow one render cycle before showing
    requestAnimationFrame(() => {
      setIsVisible(true);
    });
  }, []);

  const [selected, setSelected] = useState([]);
  const [showConfirm, setShowConfirm] = useState(false);

  const startClose = () => {
    setIsClosing(true);
    setTimeout(onClose, 200); // must be smaller than animation duration
  };

  // Close on ESC key
  useEffect(() => {
    const handleEsc = (e) => e.key === "Escape" && startClose();
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [startClose]);

  const toggle = (name) => {
    setSelected((prev) =>
      prev.includes(name) ? prev.filter((p) => p !== name) : [...prev, name]
    );
  };

  const selectAll = () => {
    if (showConfirm) return; // Disable select all during confirmation
    if (selected.length === dex.length) {
      setSelected([]);
    } else {
      setSelected(dex.map((p) => p.name));
    }
  };

  const handleReleaseClick = () => {
    if (selected.length === 0) return;
    setShowConfirm(true); // Show confirmation prompt
  };

  const confirmRelease = () => {
    onConfirm(selected);
    onClose();
  };

  const cancelRelease = () => {
    setShowConfirm(false);
  };

  return (
    <div
      className={`
        fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50
        transition-opacity duration-300
        ${isClosing ? "opacity-0" : isVisible ? "opacity-100" : "opacity-0"}
    `}
      onClick={startClose}
    >
      <div
        className={`
    bg-black/90 border border-white/20 p-6 rounded-xl w-full max-w-3xl relative
    transform transition-all duration-300
    ${
      isClosing
        ? "scale-95 opacity-0"
        : isVisible
        ? "scale-100 opacity-100"
        : "scale-95 opacity-0"
    }
            `}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button
          className="absolute top-3 right-3 text-white text-xl hover:text-red-300"
          onClick={startClose}
        >
          ✕
        </button>

        <h2 className="text-2xl font-bold text-center mb-4">
          Release Multiple Pokémon
        </h2>

        {/* Buttons */}
        <div className="flex justify-between mb-4">
          <button
            onClick={selectAll}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
          >
            {selected.length === dex.length ? "Deselect All" : "Select All"}
          </button>

          {!showConfirm ? (
            <button
              onClick={handleReleaseClick}
              className={`px-4 py-2 rounded text-white ${
                selected.length === 0
                  ? "bg-gray-500 cursor-not-allowed"
                  : "bg-red-600 hover:bg-red-700"
              }`}
              disabled={selected.length === 0}
            >
              Release Selected ({selected.length})
            </button>
          ) : (
            <div className="flex gap-2">
              <span className="text-white self-center">Are you sure?</span>
              <button
                onClick={confirmRelease}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded"
              >
                Yes
              </button>
              <button
                onClick={cancelRelease}
                className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded"
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        {/* Pokémon Grid */}
        <div
          className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-h-[60vh] overflow-y-auto pr-2 transition-opacity ${
            showConfirm ? "opacity-50 pointer-events-none" : "opacity-100"
          }`}
        >
          {dex.map((pk) => {
            const isSelected = selected.includes(pk.name);

            return (
              <div
                key={pk.name}
                onClick={() => toggle(pk.name)}
                className={`p-3 rounded-lg border cursor-pointer transition-all text-center ${
                  isSelected
                    ? "bg-gray-600 border-red-400 shadow"
                    : "bg-gray/10 border-white/20 hover:bg-red/30"
                }`}
              >
                <img
                  src={
                    pk.data?.sprites?.front_default ||
                    `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pk.id}.png`
                  }
                  alt={pk.name}
                  className="w-16 h-16 mx-auto mb-2"
                />
                <p className="font-semibold capitalize">{pk.name}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
