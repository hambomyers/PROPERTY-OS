// Address detection utility with comprehensive regex patterns

export interface AddressMatch {
  isAddress: boolean;
  formatted: string;
  components: {
    number?: string;
    street?: string;
    city?: string;
    state?: string;
    zip?: string;
  };
  confidence: number;
}

// Comprehensive address regex patterns
const ADDRESS_PATTERNS = [
  // Standard US addresses: "123 Main St", "456 Oak Avenue"
  /^(\d+)\s+([A-Za-z\s]+(?:Street|St|Avenue|Ave|Road|Rd|Drive|Dr|Lane|Ln|Boulevard|Blvd|Circle|Cir|Court|Ct|Place|Pl|Way|Parkway|Pkwy))\b/i,
  
  // With city and state: "123 Main St, Boston MA"
  /^(\d+)\s+([A-Za-z\s]+(?:Street|St|Avenue|Ave|Road|Rd|Drive|Dr|Lane|Ln|Boulevard|Blvd|Circle|Cir|Court|Ct|Place|Pl|Way|Parkway|Pkwy)),?\s+([A-Za-z\s]+),?\s+([A-Z]{2})\b/i,
  
  // With ZIP: "123 Main St, Boston MA 02101"
  /^(\d+)\s+([A-Za-z\s]+(?:Street|St|Avenue|Ave|Road|Rd|Drive|Dr|Lane|Ln|Boulevard|Blvd|Circle|Cir|Court|Ct|Place|Pl|Way|Parkway|Pkwy)),?\s+([A-Za-z\s]+),?\s+([A-Z]{2})\s+(\d{5}(?:-\d{4})?)\b/i,
  
  // Apartment/Unit numbers: "123 Main St Apt 4B"
  /^(\d+)\s+([A-Za-z\s]+(?:Street|St|Avenue|Ave|Road|Rd|Drive|Dr|Lane|Ln|Boulevard|Blvd|Circle|Cir|Court|Ct|Place|Pl|Way|Parkway|Pkwy))\s+(?:Apt|Apartment|Unit|#)\s*([A-Za-z0-9]+)/i,
  
  // Simple number + street name: "123 Main"
  /^(\d+)\s+([A-Za-z\s]{2,})\b/i,
];

const STREET_SUFFIXES = [
  'Street', 'St', 'Avenue', 'Ave', 'Road', 'Rd', 'Drive', 'Dr',
  'Lane', 'Ln', 'Boulevard', 'Blvd', 'Circle', 'Cir', 'Court', 'Ct',
  'Place', 'Pl', 'Way', 'Parkway', 'Pkwy', 'Trail', 'Tr'
];

export function detectAddress(input: string): AddressMatch {
  const trimmed = input.trim();
  
  if (!trimmed || trimmed.length < 3) {
    return {
      isAddress: false,
      formatted: input,
      components: {},
      confidence: 0
    };
  }

  // Try each pattern in order of specificity
  for (let i = 0; i < ADDRESS_PATTERNS.length; i++) {
    const pattern = ADDRESS_PATTERNS[i];
    const match = trimmed.match(pattern);
    
    if (match) {
      const confidence = calculateConfidence(match, i);
      
      if (confidence > 0.6) {
        return {
          isAddress: true,
          formatted: formatAddress(match),
          components: extractComponents(match),
          confidence
        };
      }
    }
  }

  // Fallback: check if it contains address-like elements
  const hasNumber = /^\d+/.test(trimmed);
  const hasStreetSuffix = STREET_SUFFIXES.some(suffix => 
    new RegExp(`\\b${suffix}\\b`, 'i').test(trimmed)
  );
  
  if (hasNumber && hasStreetSuffix) {
    return {
      isAddress: true,
      formatted: trimmed,
      components: { street: trimmed },
      confidence: 0.7
    };
  }

  return {
    isAddress: false,
    formatted: input,
    components: {},
    confidence: 0
  };
}

function calculateConfidence(match: RegExpMatchArray, patternIndex: number): number {
  let confidence = 0.8; // Base confidence
  
  // Higher confidence for more specific patterns
  if (patternIndex === 0) confidence = 0.9; // Standard format
  if (patternIndex === 1) confidence = 0.95; // With city/state
  if (patternIndex === 2) confidence = 0.98; // With ZIP
  if (patternIndex === 3) confidence = 0.85; // With apartment
  if (patternIndex === 4) confidence = 0.7; // Simple format
  
  // Boost confidence for common street suffixes
  const streetText = match[2] || '';
  const hasCommonSuffix = STREET_SUFFIXES.slice(0, 8).some(suffix =>
    new RegExp(`\\b${suffix}\\b`, 'i').test(streetText)
  );
  
  if (hasCommonSuffix) confidence += 0.05;
  
  // Reduce confidence for very short street names
  if (streetText.length < 4) confidence -= 0.1;
  
  return Math.min(0.99, Math.max(0, confidence));
}

function formatAddress(match: RegExpMatchArray): string {
  const [, number, street, city, state, zip] = match;
  
  let formatted = `${number} ${street}`;
  
  if (city && state) {
    formatted += `, ${city}, ${state}`;
  }
  
  if (zip) {
    formatted += ` ${zip}`;
  }
  
  return formatted;
}

function extractComponents(match: RegExpMatchArray): AddressMatch['components'] {
  const [, number, street, city, state, zip] = match;
  
  return {
    number,
    street,
    city,
    state,
    zip
  };
}

// Test function for development
export function testAddressDetection() {
  const testCases = [
    "123 Main Street",
    "456 Oak Avenue",
    "789 Pine Rd",
    "123 Main St, Boston MA",
    "456 Oak Ave, New York NY 10001",
    "789 Pine Road Apt 4B",
    "not an address",
    "123",
    "Main Street",
    "1234 Very Long Street Name Drive"
  ];
  
  console.log('Address Detection Tests:');
  testCases.forEach(test => {
    const result = detectAddress(test);
    console.log(`"${test}" -> ${result.isAddress ? 'ADDRESS' : 'NOT ADDRESS'} (${result.confidence.toFixed(2)})`);
    if (result.isAddress) {
      console.log(`  Formatted: ${result.formatted}`);
    }
  });
}
