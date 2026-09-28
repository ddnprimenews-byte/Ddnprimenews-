import React from 'react';

interface MediaEmbedProps {
  url: string;
}

export const MediaEmbed: React.FC<MediaEmbedProps> = ({ url }) => {
  if (!url) return null;
  const cleanUrl = url.trim();

  // YouTube match
  // e.g. https://www.youtube.com/watch?v=dQw4w9WgXcQ or https://youtu.be/dQw4w9WgXcQ or shorts
  const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const ytMatch = cleanUrl.match(youtubeRegex);
  if (ytMatch && ytMatch[1]) {
    const videoId = ytMatch[1];
    return (
      <div className="relative w-full aspect-video rounded-lg overflow-hidden my-4 shadow-md bg-black">
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${videoId}`}
          title="YouTube video player"
          className="absolute top-0 left-0 w-full h-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  // Instagram Post or Reel match
  // e.g. https://www.instagram.com/p/C-XXXX/ or /reel/C-XXXX/
  const instaRegex = /instagram\.com\/(?:p|reel)\/([A-Za-z0-9_-]+)/;
  const instaMatch = cleanUrl.match(instaRegex);
  if (instaMatch && instaMatch[1]) {
    const instaId = instaMatch[1];
    return (
      <div className="my-4 flex justify-center">
        <div className="w-full max-w-md aspect-[9/16] max-h-[550px] rounded-lg overflow-hidden border border-gray-200 shadow bg-white">
          <iframe
            src={`https://www.instagram.com/p/${instaId}/embed`}
            title="Instagram Reel or Post"
            className="w-full h-full border-0"
            allowTransparency={true}
          />
        </div>
      </div>
    );
  }

  // Facebook Video embed
  // e.g. https://www.facebook.com/watch/?v=12345 or fb.watch
  if (cleanUrl.includes('facebook.com') || cleanUrl.includes('fb.watch')) {
    const fbEmbedUrl = `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(
      cleanUrl
    )}&show_text=false&width=560`;
    return (
      <div className="relative w-full aspect-video rounded-lg overflow-hidden my-4 shadow-md bg-black">
        <iframe
          src={fbEmbedUrl}
          title="Facebook video player"
          className="absolute top-0 left-0 w-full h-full border-0"
          allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>
    );
  }

  // Generic video link fallback
  return (
    <div className="my-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between text-sm">
      <div className="flex items-center space-x-2 text-red-800">
        <span className="font-semibold">वीडियो लिंक:</span>
        <a href={cleanUrl} target="_blank" rel="noreferrer" className="text-blue-600 underline truncate max-w-xs md:max-w-md">
          {cleanUrl}
        </a>
      </div>
      <a
        href={cleanUrl}
        target="_blank"
        rel="noreferrer"
        className="px-3 py-1 bg-red-600 text-white rounded text-xs font-semibold hover:bg-red-700"
      >
        देखें
      </a>
    </div>
  );
};
