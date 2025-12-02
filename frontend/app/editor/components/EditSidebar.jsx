export default function EditSidebar({
  hits,
  selectedHit,
  setSelectedHit,
  newText,
  setNewText,
  apply
}) {
  if (!hits.length) return null;

  return (
    <div className="mt-4">
      <h3 className="font-medium">Matches</h3>

      {hits.map((h, i) => (
        <div key={i}
          className={`p-2 border rounded mt-2 cursor-pointer ${
            i === selectedHit ? "border-blue-500 bg-blue-50" : ""
          }`}
          onClick={() => setSelectedHit(i)}>
          {h.span_text}
        </div>
      ))}

      {selectedHit !== null && (
        <>
          <label className="block mt-4 font-medium">Replace with</label>
          <input className="w-full border p-2 rounded"
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
          />

          <button className="w-full bg-green-600 text-white mt-3 p-2 rounded"
            onClick={apply}>
            Apply Change
          </button>
        </>
      )}
    </div>
  );
}
