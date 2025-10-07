import * as React from "react";

import { cn } from "./utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-foreground placeholder:text-gray-500 selection:bg-primary selection:text-primary-foreground border-gray-300 flex h-12 w-full min-w-0 rounded-lg border-2 px-4 py-3 text-base bg-white transition-all duration-200 outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        "focus:border-amber-500 focus:ring-4 focus:ring-amber-200 hover:border-amber-400",
        "aria-invalid:ring-red-100 aria-invalid:border-red-400",
        "text-gray-900 font-medium",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
