import React from "react";

declare global {
  namespace React {
    namespace JSX {
      interface IntrinsicElements {
        "panel-resize-handle": React.DetailedHTMLProps<
          React.HTMLAttributes<HTMLElement>,
          HTMLElement
        >;
      }
    }
  }
}

export {};
