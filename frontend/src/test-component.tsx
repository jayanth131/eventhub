import React, { useState } from 'react';

// Mock data from the CustomerBooking component
const mockVendors = [
  { id: '1', name: 'Raj Mahal Palace', category: 'Function Halls' },
  { id: '2', name: 'Maharaja Convention Center', category: 'Function Halls' },
  { id: '3', name: 'Heritage Mandap Gardens', category: 'Function Halls' },
  { id: '4', name: 'Sangam Musical Group', category: 'Music & Entertainment' },
  { id: '5', name: 'Dhol Tasha Pathak', category: 'Music & Entertainment' },
  { id: '6', name: 'Bollywood Beats Orchestra', category: 'Music & Entertainment' },
  { id: '7', name: 'Marigold Dreams Decor', category: 'Decoration' },
  { id: '8', name: 'Royal Lotus Events', category: 'Decoration' },
  { id: '9', name: 'Golden Petals Design', category: 'Decoration' },
  { id: '10', name: 'Royal Baraat Cars', category: 'Wedding Cars' },
  { id: '11', name: 'Maharaja Motors', category: 'Wedding Cars' },
  { id: '12', name: 'Swadisht Caterers', category: 'Catering' },
  { id: '13', name: 'Royal Feast Caterers', category: 'Catering' },
  { id: '14', name: 'Pandit Rajesh Shastri', category: 'Pandits & Priests' }
];

const categories = [
  'All Categories',
  'Function Halls', 
  'Music & Entertainment',
  'Decoration',
  'Wedding Cars',
  'Catering',
  'Pandits & Priests'
];

export default function FilteringTest() {
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter vendors based on selected category and search query
  const filteredVendors = mockVendors.filter(vendor => {
    const matchesCategory = selectedCategory === 'All Categories' || vendor.category === selectedCategory;
    const matchesSearch = searchQuery === '' || 
      vendor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vendor.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Filtering Test</h1>
      
      <div className="mb-4 space-y-2">
        <div>
          <label className="block text-sm font-medium mb-1">Category Filter:</label>
          <select 
            value={selectedCategory} 
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="border rounded px-3 py-2"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Search:</label>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search vendors..."
            className="border rounded px-3 py-2 w-full max-w-xs"
          />
        </div>
      </div>

      <div className="mb-4">
        <p className="text-sm text-gray-600">
          Showing {filteredVendors.length} of {mockVendors.length} vendors
          {selectedCategory !== 'All Categories' && ` in ${selectedCategory}`}
          {searchQuery && ` matching "${searchQuery}"`}
        </p>
      </div>

      <div className="grid gap-2">
        {filteredVendors.map(vendor => (
          <div key={vendor.id} className="border rounded p-3 bg-gray-50">
            <h3 className="font-medium">{vendor.name}</h3>
            <p className="text-sm text-gray-600">{vendor.category}</p>
          </div>
        ))}
        {filteredVendors.length === 0 && (
          <p className="text-gray-500 italic">No vendors match the current filters</p>
        )}
      </div>
    </div>
  );
}