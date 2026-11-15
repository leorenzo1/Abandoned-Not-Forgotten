import { useRef, useState } from "react";
import { playSfx } from "../utils/sfx";

// Hammer and feather drop. Restarts the CSS transition with a forced reflow.
export default function Drop({ say }) {
  const stage = useRef(null);
  const [earth, setEarth] = useState(false);

  const drop = () => {
    const s = stage.current;
    s.classList.remove("go");
    void s.offsetWidth;
    s.classList.add("go");
    playSfx("whoosh");
    say?.(
      earth
        ? "On Earth, air slows the feather down, so the hammer wins. Now switch to the Moon and drop again!"
        : "Watch closely! On the Moon there is almost no air, so the hammer and feather land together. Switch to Earth to see air slow the feather."
    );
  };

  return (
    <div className="drop-box">
      <b>🔨 Hammer and feather</b>
      <div ref={stage} className={"drop-stage" + (earth ? " earth" : "")}>
        <span className="drop-obj drop-hammer">🔨</span>
        <span className="drop-obj drop-feather">🪶</span>
        <div className="drop-ground" />
      </div>
      <div className="flex flex-wrap gap-2">
        <button className="toon-btn" onClick={drop}>Drop!</button>
        <button className="toon-btn mint" onClick={() => setEarth((e) => !e)}>Place: {earth ? "Earth" : "Moon"}</button>
      </div>
    </div>
  );
}
