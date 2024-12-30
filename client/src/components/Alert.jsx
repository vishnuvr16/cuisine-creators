import React from "react";
import {X} from "lucide-react"
const CustomAlert = ({ children, onClose }) => {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative mb-4">
        <span className="block sm:inline">{children}</span>
        {onClose && (
          <button
            className="absolute top-0 right-0 px-4 py-3"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>
    );
  };

  export default CustomAlert;