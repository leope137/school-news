export default function Ticker({ stories }) {
  if (!stories || stories.length === 0) return null;

  const items = [...stories, ...stories]; // duplicate for seamless loop

  return (
    <div className="bg-red-600 text-white overflow-hidden flex items-center" style={{ height: "36px" }}>
      <div className="flex-shrink-0 bg-black text-white text-xs font-bold px-4 h-full flex items-center tracking-widest uppercase z-10">
        LATEST
      </div>
      <div className="flex overflow-hidden flex-1">
        <div className="animate-ticker flex whitespace-nowrap">
          {items.map((s, i) => (
            <a
              key={i}
              href={`/story/${s.$id}`}
              className="inline-flex items-center gap-3 text-xs font-medium px-6 hover:text-red-200 transition-colors"
            >
              <span className="text-red-300">●</span>
              {s.title}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
