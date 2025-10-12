import React from 'react';
import { Loader } from 'lucide-react';

const Loading = ({ size = 24, text = "Loading..." }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8">
      <Loader className="animate-spin text-[#B7FF00]" size={size} />
      <p className="text-[#E0E0E0] mt-2">{text}</p>
    </div>
  );
};

export default Loading;