import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MicrophoneIcon, CameraIcon, PaperAirplaneIcon, MapPinIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import { usePropertyStore } from '@/store/propertyStore';
import { CommandProcessor } from '@/services/CommandProcessor';
import { PropertyGenesis } from '@/services/PropertyGenesis';
import { GeolocationService } from '@/services/GeolocationService';
import PropertyDataPreview from './PropertyDataPreview';

const CONTEXTUAL_SUGGESTIONS = {
  overview: [
    '123 Main Street',
    'Add new property',
    'Search properties'
  ],
  operations: [
    'Schedule maintenance',
    'Contact tenant',
    'Create work order'
  ],
  intelligence: [
    'Analyze market trends',
    'Optimize rent pricing',
    'Review expenses'
  ]
};

export default function UniversalCommandBar() {
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showDataPreview, setShowDataPreview] = useState(false);
  const [previewAddress, setPreviewAddress] = useState('');
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { activeTab, addProperty, setActiveProperty } = usePropertyStore();

  const commandProcessor = CommandProcessor.getInstance();
  const propertyGenesis = PropertyGenesis.getInstance();
  const geolocationService = GeolocationService.getInstance();

  const currentSuggestions = CONTEXTUAL_SUGGESTIONS[activeTab as keyof typeof CONTEXTUAL_SUGGESTIONS] || CONTEXTUAL_SUGGESTIONS.overview;
  const placeholder = activeTab === 'overview' 
    ? 'Type an address or command...' 
    : `Ask about ${activeTab}...`;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && e.target !== inputRef.current) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isProcessing) return;
    
    console.log('Processing input:', input);
    setIsProcessing(true);
    setShowSuggestions(false);

    try {
      // Process the command
      const command = await commandProcessor.processInput(input, { activeTab });
      console.log('Processed command:', command);

      // Handle address commands specially - show data preview first
      if (command.type === 'address' && command.addressMatch) {
        setPreviewAddress(command.addressMatch.formatted);
        setShowDataPreview(true);
      } else {
        // Execute other command types
        const result = await commandProcessor.executeCommand(command);
        console.log('Command result:', result);
        
        // Handle navigation commands
        if (result.data?.type === 'navigation') {
          const target = result.data.target;
          if (target === 'home') {
            navigate('/');
          } else if (['overview', 'operations', 'intelligence'].includes(target)) {
            // If we have an active property, navigate to that tab
            const currentProperty = usePropertyStore.getState().activeProperty;
            if (currentProperty) {
              navigate(`/property/${currentProperty.id}`);
              // The PropertyView component will handle tab switching
            }
          }
        }
      }
    } catch (error) {
      console.error('Error processing command:', error);
    } finally {
      setInput('');
      setIsProcessing(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const getCurrentLocationAddress = async () => {
    setIsGettingLocation(true);
    try {
      const address = await geolocationService.getCurrentAddress();
      setInput(address.formatted);
      setPreviewAddress(address.formatted);
      setShowDataPreview(true);
    } catch (error) {
      console.error('Failed to get current location:', error);
      alert('Unable to get your location. Please ensure location access is enabled.');
    } finally {
      setIsGettingLocation(false);
    }
  };

  const startListening = () => {
    setIsListening(true);
    // TODO: Implement voice recognition
    setTimeout(() => setIsListening(false), 3000);
  };

  const handleCameraInput = () => {
    // TODO: Implement camera/photo input
    console.log('Camera input requested');
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-50">
      <div className="max-w-md mx-auto">
        <AnimatePresence>
          {showSuggestions && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="mb-3 bg-gray-50 rounded-lg p-3"
            >
              <div className="text-xs text-gray-500 mb-2">Suggestions:</div>
              <div className="space-y-1">
                {currentSuggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="block w-full text-left text-sm text-gray-700 hover:text-blue-600 transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="flex items-center space-x-2">
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              placeholder={isProcessing ? 'Processing...' : placeholder}
              disabled={isProcessing}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
            />
            {isProcessing && (
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={getCurrentLocationAddress}
            disabled={isGettingLocation}
            className={`p-3 rounded-full transition-colors ${
              isGettingLocation
                ? 'bg-blue-500 text-white animate-pulse'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            title="Use my current location"
          >
            <MapPinIcon className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={startListening}
            className={`p-3 rounded-full transition-colors ${
              isListening 
                ? 'bg-red-500 text-white' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <MicrophoneIcon className="w-5 h-5" />
          </button>

          <button
            type="button"
            className="p-3 bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 transition-colors"
          >
            <CameraIcon className="w-5 h-5" />
          </button>

          <button
            type="submit"
            disabled={!input.trim() || isProcessing}
            className="p-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <PaperAirplaneIcon className="w-5 h-5" />
          </button>
        </form>
      </div>
      
      {/* Property Data Preview Modal */}
      {showDataPreview && (
        <PropertyDataPreview
          address={previewAddress}
          onClose={() => {
            setShowDataPreview(false);
            setPreviewAddress('');
          }}
        />
      )}
    </div>
  );
}
