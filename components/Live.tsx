import React, { useCallback, useEffect, useState } from "react";
import LiveCursors from "./cursor/LiveCursors";
import {
  useBroadcastEvent,
  useEventListener,
  useMyPresence,
  useOthers,
} from "@/liveblocks.config";
import CursorChat from "./cursor/CursorChat";
import { CursorMode, CursorState, Reaction, ReactionEvent } from "@/types/type";
import ReactionSelector from "./reaction/ReactionButton";
import FlyingReaction from "./reaction/FlyingReaction";
import useInterval from "@/hooks/useInterval";

const Live = () => {
  const [cursorState, setCursorState] = useState<CursorState>({
    mode: CursorMode.Hidden,
  });
  // const [reactions, setReactions] = useState([] as any[]);
  const [reaction, setReaction] = useState<Reaction[]>([]);
  const others = useOthers();
  const broadcast = useBroadcastEvent();

  const [{ cursor }, updateMyPresence] = useMyPresence() as any;

  useInterval(() => {
    if (
      cursorState.mode === CursorMode.Reaction &&
      cursorState.isPressed &&
      cursor
    ) {
      setReaction(reactions =>
        reactions.concat([
          {
            point: {
              x: cursor.x,
              y: cursor.y,
            },
            value: cursorState.reaction,

            timestamp: Date.now(),
          },
        ])
      );
      broadcast({
        x: cursor.x,
        y: cursor.y,
        value: cursorState.reaction,
      });
    }
  }, 100);

  // runs everytime an event is broadcasted
  useEventListener(eventData => {
    const e = eventData.event as ReactionEvent;

    setReaction(reactions =>
      reactions.concat([
        {
          point: {
            x: e.x,
            y: e.y,
          },
          value: e.value,

          timestamp: Date.now(),
        },
      ])
    );
  });
  // memoized function
  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();

      if (cursor == null || cursorState.mode !== CursorMode.ReactionSelector) {
        const x =
          e.clientX -
          // subsctracing position of cursor relative to browser
          e.currentTarget.getBoundingClientRect().x;
        const y = e.clientY - e.currentTarget.getBoundingClientRect().y;
        updateMyPresence({ cursor: { x, y } });
      }
    },
    [updateMyPresence, cursor, cursorState.mode]
  );
  const handlePointerLeave = useCallback(
    (e: React.PointerEvent) => {
      setCursorState({ mode: CursorMode.Hidden });
      updateMyPresence({ cursor: null, message: null });
    },
    [updateMyPresence]
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      setCursorState((state: CursorState) =>
        cursorState.mode === CursorMode.Reaction
          ? { ...state, isPressed: true }
          : state
      );
    },
    [cursorState.mode, setCursorState]
  );

  const setReactions = useCallback(
    (reaction: string) => {
      setCursorState({
        mode: CursorMode.Reaction,
        reaction,
        isPressed: false,
      });
    },
    [setCursorState]
  );
  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      const x =
        e.clientX -
        // subsctracing position of cursor relative to browser
        e.currentTarget.getBoundingClientRect().x;
      const y = e.clientY - e.currentTarget.getBoundingClientRect().y;
      updateMyPresence({ cursor: { x, y } });

      setCursorState((state: CursorState) =>
        cursorState.mode === CursorMode.Reaction
          ? { ...state, isPressed: true }
          : state
      );
    },
    [updateMyPresence, cursorState.mode, setCursorState]
  );

  useEffect(() => {
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key === "/") {
        setCursorState({
          mode: CursorMode.Chat,
          previousMessage: null,
          message: "",
        });
      } else if (e.key === "Escape") {
        updateMyPresence({ message: null });
        setCursorState({
          mode: CursorMode.Hidden,
        });
      } else if (e.key === "e") {
        setCursorState({
          mode: CursorMode.ReactionSelector,
        });
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "/") {
        e.preventDefault();
      }
    };
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [updateMyPresence]);
  return (
    <div
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      className='w-full h-screen flex justify-center items-center text-center '
    >
      {reaction.map(r => (
        <FlyingReaction
          key={r.timestamp.toString()}
          x={r.point.x}
          y={r.point.y}
          timestamp={r.timestamp}
          value={r.value}
        />
      ))}
      {cursor && (
        <CursorChat
          cursor={cursor}
          cursorState={cursorState}
          setCursorState={setCursorState}
          updateMyPresence={updateMyPresence}
        />
      )}

      {cursorState.mode === CursorMode.ReactionSelector && (
        <ReactionSelector
          // setReaction={reaction => { }}
          setReaction={setReactions}
        />
      )}
      <LiveCursors others={others} />
    </div>
  );
};

export default Live;
