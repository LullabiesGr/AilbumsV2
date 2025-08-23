import React, { useState } from 'react';
import { Bug, HelpCircle } from 'lucide-react';
import BugReportModal from './BugReportModal';
import SupportModal from './SupportModal';

const SupportButtons: React.FC = () => {
  const [showBugReport, setShowBugReport] = useState(false);
  const [showSupport, setShowSupport] = useState(false);

  return (
    <>
      {/* Support Buttons - Fixed position */}
      <div className="fixed bottom-6 left-6 z-40 flex flex-col space-y-3">
        {/* Bug Report Button */}
        <button
          onClick={() => setShowBugReport(true)}
          className="flex items-center space-x-2 px-4 py-3 bg-gradient-to-r from-red-500 to-orange-500 
                   hover:from-red-600 hover:to-orange-600 text-white rounded-lg shadow-lg 
                   hover:shadow-xl transition-all duration-200 transform hover:scale-105
                   border border-red-400/20 backdrop-blur-sm"
          title="Report a bug or issue"
        >
          <Bug className="h-5 w-5" />
          <span className="font-medium">Report Bug</span>
        </button>

        {/* Support Button */}
        <button
          onClick={() => setShowSupport(true)}
          className="flex items-center space-x-2 px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-500 
                   hover:from-blue-600 hover:to-purple-600 text-white rounded-lg shadow-lg 
                   hover:shadow-xl transition-all duration-200 transform hover:scale-105
                   border border-blue-400/20 backdrop-blur-sm"
          title="Get help and support"
        >
          <HelpCircle className="h-5 w-5" />
          <span className="font-medium">Get Support</span>
        </button>
      </div>

      {/* Modals */}
      <BugReportModal 
        isOpen={showBugReport} 
        onClose={() => setShowBugReport(false)} 
      />
      
      <SupportModal 
        isOpen={showSupport} 
        onClose={() => setShowSupport(false)} 
      />
    </>
  );
};

export default SupportButtons;