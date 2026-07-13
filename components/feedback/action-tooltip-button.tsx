"use client";

import type { ComponentProps, ReactNode } from "react";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useMounted } from "@/hooks/use-mounted";

type ActionTooltipButtonProps = ComponentProps<typeof Button> & {
  tooltip: string;
  children: ReactNode;
};

export function ActionTooltipButton({
  tooltip,
  children,
  disabled,
  ...buttonProps
}: ActionTooltipButtonProps) {
  const mounted = useMounted();
  const ariaLabel = buttonProps["aria-label"] ?? tooltip;

  const button = (
    <Button {...buttonProps} disabled={disabled} aria-label={ariaLabel}>
      {children}
    </Button>
  );

  if (!mounted) {
    return button;
  }

  if (disabled) {
    return (
      <Tooltip>
        <TooltipTrigger render={<span className="inline-flex" />}>
          {button}
        </TooltipTrigger>
        <TooltipContent side="top">{tooltip}</TooltipContent>
      </Tooltip>
    );
  }

  return (
    <Tooltip>
      <TooltipTrigger
        render={<Button {...buttonProps} aria-label={ariaLabel} />}
      >
        {children}
      </TooltipTrigger>
      <TooltipContent side="top">{tooltip}</TooltipContent>
    </Tooltip>
  );
}
