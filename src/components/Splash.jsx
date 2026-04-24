import { useEffect, useState } from "react";

export default function Splash() {
  const [visible, setVisible] = useState(!sessionStorage.getItem("sno_visited"));
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    if (!visible) return;
    const t1 = setTimeout(() => setFadeOut(true), 2800);
    const t2 = setTimeout(() => {
      setVisible(false);
      sessionStorage.setItem("sno_visited", "1");
    }, 3500);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center overflow-hidden"
      style={{ transition: "opacity 0.7s ease", opacity: fadeOut ? 0 : 1, pointerEvents: fadeOut ? "none" : "all" }}
    >
      {/* Background orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-600/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-red-800/15 rounded-full blur-3xl animate-float" style={{ animationDelay: "2s" }} />
      </div>

      {/* Grid overlay */}
      <div className="absolute inset-0 opacity-5" style={{
        backgroundImage: "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
        backgroundSize: "60px 60px"
      }} />

      <div className="relative text-center px-8">
        {/* Live badge */}
        <div className="animate-fade-in-d1 inline-flex items-center gap-2 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full mb-8 tracking-widest uppercase">
          <span className="animate-blink">●</span> BREAKING
        </div>

        {/* SNO */}
        <div className="animate-scale-in font-heading font-black text-white leading-none" style={{ fontSize: "clamp(80px, 20vw, 180px)" }}>
          SNO
        </div>

        {/* Red line */}
        <div className="animate-expand-x h-1 bg-gradient-to-r from-red-600 to-red-400 mx-auto mt-2 mb-4 rounded-full" style={{ width: "100%" }} />

        {/* Subtitle */}
        <div className="animate-fade-in-d2 font-body text-white/70 tracking-[0.4em] uppercase text-sm">
          School News Official
        </div>

        {/* Est */}
        <div className="animate-fade-in-d3 font-body text-white/30 tracking-[0.2em] uppercase text-xs mt-3">
          Est. 2026
        </div>
      </div>
    </div>
  );
}
