import React from 'react';
import { VideoConsult } from '../modules/telemedicine/components/VideoConsult';
import { Video } from 'lucide-react';

export default function TelemedicinePage() {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Video className="w-6 h-6 text-blue-600" />
        <h1 className="text-2xl font-bold text-gray-800">Telemedicina</h1>
      </div>
      <VideoConsult />
    </div>
  );
}
