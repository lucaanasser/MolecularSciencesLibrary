import { useState, useEffect } from "react";

export interface Area {
  name: string;
  color: string;
}

export function useTypewriterAreas(areas: Area[], typingSpeed = 110, pause = 1600, deletingSpeed = 70) {
  const [areaIndex, setAreaIndex] = useState(0);
  const [displayText, setDisplayText] = useState(areas[0]?.name || "");
  const [typing, setTyping] = useState(true);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (typing) {
      if (displayText.length < areas[areaIndex].name.length) {
        timeout = setTimeout(() => {
          setDisplayText(areas[areaIndex].name.slice(0, displayText.length + 1));
        }, typingSpeed);
      } else {
        timeout = setTimeout(() => setTyping(false), pause);
      }
    } else {
      if (displayText.length > 0) {
        timeout = setTimeout(() => {
          setDisplayText(displayText.slice(0, -1));
        }, deletingSpeed);
      } else {
        setAreaIndex((i) => (i + 1) % areas.length);
        setTyping(true);
      }
    }
    return () => clearTimeout(timeout);
  }, [displayText, typing, areaIndex, areas, typingSpeed, pause, deletingSpeed]);

  useEffect(() => {
    if (typing) setDisplayText("");
  }, [areaIndex, typing]);

  return { areaIndex, displayText, typing };
}
