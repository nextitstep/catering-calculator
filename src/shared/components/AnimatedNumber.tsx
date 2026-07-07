import { useEffect, useState } from 'react';
import { animate, useMotionValue } from 'framer-motion';

interface AnimatedNumberProps {
  value: number;
  format?: (value: number) => string;
}

export function AnimatedNumber({ value, format = (v) => v.toFixed(2) }: AnimatedNumberProps) {
  const motionValue = useMotionValue(value);
  const [display, setDisplay] = useState(format(value));

  useEffect(() => {
    const controls = animate(motionValue, value, {
      duration: 0.6,
      ease: 'easeOut',
      onUpdate: (latest) => setDisplay(format(latest)),
    });
    return () => controls.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return <span>{display}</span>;
}
