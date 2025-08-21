import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { usePropertyStore } from '@/store/propertyStore';

export default function UniversalCommandBar() {
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { activeTab } = usePropertyStore();

  const handleInputChange = (value: string) => {
    setInput(value);
    
    // Generate contextual suggestions based on input and active tab
    const newSuggestions = generateSuggestions(value, activeTab);
    setSuggestions(newSuggestions);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    // Process command (Phase 2 functionality)
    console.log('Processing command:', input, 'in tab:', activeTab);
    
    // Clear input and suggestions
    setInput('');
    setSuggestions([]);
  };

  const handleVoiceRecord = () => {
    setIsRecording(!isRecording);
    // Voice recording functionality will be added in Phase 9
  };

  const handleImageUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Image processing functionality will be added in Phase 9
      console.log('Processing image:', file.name);
    }
  };

  return (
    <>
      {/* Suggestions overlay */}
      {suggestions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className="fixed bottom-20 left-4 right-4 bg-white rounded-lg shadow-lg border border-gray-200 max-h-40 overflow-y-auto z-50"
        >
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => {
                setInput(suggestion);
                setSuggestions([]);
              }}
              className="w-full text-left px-4 py-2 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
            >
              <span className="text-sm text-gray-700">{suggestion}</span>
            </button>
          ))}
        </motion.div>
      )}

      {/* Command Bar */}
      <div className="command-bar">
        <form onSubmit={handleSubmit} className="flex items-center gap-3">
          {/* Text Input */}
          <div className="flex-1 relative">
            <input
              type="text"
              value={input}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder={getPlaceholderText(activeTab)}
              className="w-full px-4 py-3 bg-gray-100 rounded-full border-0 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
            />
          </div>

          {/* Voice Button */}
          <button
            type="button"
            onClick={handleVoiceRecord}
            className={`p-3 rounded-full transition-colors ${
              isRecording 
                ? 'bg-red-500 text-white' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
            </svg>
          </button>

          {/* Camera Button */}
          <button
            type="button"
            onClick={handleImageUpload}
            className="p-3 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
            </svg>
          </button>

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </form>
      </div>
    </>
  );
}

function getPlaceholderText(activeTab: string): string {
  switch (activeTab) {
    case 'overview':
      return 'Type address or "show health score"...';
    case 'operations':
      return 'Type address or "fix water heater"...';
    case 'intelligence':
      return 'Type address or "show revenue"...';
    default:
      return 'Type an address or command...';
  }
}

function generateSuggestions(input: string, activeTab: string): string[] {
  if (input.length < 2) return [];

  const commonSuggestions = [
    '123 Main Street',
    '456 Oak Avenue',
    '789 Pine Road',
  ];

  const tabSpecificSuggestions = {
    overview: [
      'show health score',
      'view alerts',
      'recent activity',
      'property summary',
    ],
    operations: [
      'schedule maintenance',
      'create work order',
      'tenant information',
      'fix water heater',
      'inspect HVAC',
    ],
    intelligence: [
      'show revenue',
      'market analysis',
      'expense report',
      'rent optimization',
      'tax deductions',
    ],
  };

  const suggestions = [
    ...commonSuggestions,
    ...tabSpecificSuggestions[activeTab as keyof typeof tabSpecificSuggestions] || [],
  ];

  return suggestions
    .filter(suggestion => 
      suggestion.toLowerCase().includes(input.toLowerCase())
    )
    .slice(0, 5);
}
