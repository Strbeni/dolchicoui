// components/ShareButton.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { Share2, ExternalLink } from 'lucide-react';

interface ShareButtonProps {
  className?: string;
}

const ShareButton = ({ className }: ShareButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [copyStatus, setCopyStatus] = useState('Copy Link');
  const wrapperRef = useRef<HTMLDivElement>(null);

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const shareText = "Check out this amazing product!";

  const toggleShareMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopyStatus('Copied!');
      setTimeout(() => setCopyStatus('Copy Link'), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
      setCopyStatus('Failed!');
    }
  };
  
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [wrapperRef]);

  return (
    <div className="relative inline-block" ref={wrapperRef}>
      {/* The main share icon - fits within existing button */}
      <Share2 
        className={`h-4 w-4 cursor-pointer ${className}`} 
        onClick={toggleShareMenu}
      />

      {/* The expanding social media menu */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 bg-white rounded-lg shadow-lg border border-gray-200 p-2 min-w-[200px] z-50">
          <div className="space-y-2">
            <a 
              href={`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
            >
              <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center text-white text-xs">W</div>
              WhatsApp
            </a>
            <a 
              href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`}
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
            >
              <div className="w-4 h-4 bg-blue-400 rounded-full flex items-center justify-center text-white text-xs">T</div>
              Twitter
            </a>
            <a 
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
            >
              <div className="w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs">F</div>
              Facebook
            </a>
            <button 
              onClick={handleCopyLink} 
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors w-full text-left"
            >
              <ExternalLink className="w-4 h-4" />
              {copyStatus}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShareButton;