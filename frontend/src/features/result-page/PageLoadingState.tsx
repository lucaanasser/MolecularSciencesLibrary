import React from "react";
import { Loader2 } from "lucide-react";

interface PageLoadingStateProps {
  color?: string;
}

const PageLoadingState: React.FC<PageLoadingStateProps> = ({ color = "library-purple" }) => (
  <div className="min-h-screen flex flex-col">
    <div className="flex-grow flex items-center justify-center">
      <Loader2 className={`w-8 h-8 animate-spin text-${color}`} />
    </div>
  </div>
);

export default PageLoadingState;
