import type { ReactNode } from "react";
import type { PanInfo } from "motion/react";
import { motion, useAnimation } from "motion/react";
import { cn } from "@/lib/utils";

export interface SwipeAction {
  label: string;
  icon: ReactNode;
  onClick: () => void;
  className?: string;
}

interface SwipeableRowProps {
  children: ReactNode;
  actions: SwipeAction[];
  disabled?: boolean;
}

const ACTION_WIDTH = 60;
const SNAP_VELOCITY_THRESHOLD = 400;
const SPRING = { type: "spring", stiffness: 400, damping: 40 } as const;

export function SwipeableRow({ children, actions, disabled = false }: SwipeableRowProps) {
  const controls = useAnimation();
  const revealWidth = actions.length * ACTION_WIDTH;

  if (disabled) {
    return <>{children}</>;
  }

  function handleDragEnd(_: unknown, info: PanInfo) {
    const threshold = revealWidth / 2;
    if (info.offset.x < -threshold || info.velocity.x < -SNAP_VELOCITY_THRESHOLD) {
      void controls.start({ x: -revealWidth, transition: SPRING });
    } else {
      void controls.start({ x: 0, transition: SPRING });
    }
  }

  function handleActionClick(action: SwipeAction) {
    void controls.start({ x: 0, transition: SPRING });
    action.onClick();
  }

  return (
    <div className="relative overflow-hidden">
      <div className="absolute right-0 top-0 flex h-full" style={{ width: revealWidth }}>
        {actions.map((action) => (
          <button
            key={action.label}
            onClick={() => handleActionClick(action)}
            aria-label={action.label}
            className={cn(
              "flex flex-col items-center justify-center gap-1 text-white",
              action.className,
            )}
            style={{ width: ACTION_WIDTH }}
          >
            {action.icon}
            <span className="text-[10px] font-medium leading-tight">{action.label}</span>
          </button>
        ))}
      </div>

      <motion.div
        drag="x"
        dragConstraints={{ left: -revealWidth, right: 0 }}
        dragElastic={0.05}
        animate={controls}
        onDragEnd={handleDragEnd}
        className="relative z-10 bg-card"
      >
        {children}
      </motion.div>
    </div>
  );
}
