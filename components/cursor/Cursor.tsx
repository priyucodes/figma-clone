import CursorSVG from "@/public/assets/CursorSVG";
import React from "react";

type Props = {
  x: number;
  y: number;
  color: string;
  message: string;
};
const Cursor = ({ x, y, color, message }: Props) => {
  return (
    <div
      style={{
        transform: `translate(${x}px, ${y}px)`,
      }}
      className='pointer-events-none absolute top-0 left-0 '
    >
      <CursorSVG color={color} />

      {message && (
        <div
          className='absolute left-2 top-5 rounded-3xl px-4 py-2'
          style={{
            backgroundColor: color,
          }}
        >
          <p className='text-white whitespace-nowrap text-sm leading-relaxed'>{message}</p>
        </div>
      )}
    </div>
  );
};

export default Cursor;
