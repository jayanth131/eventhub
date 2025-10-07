// Test the filtering logic
const mockVendors = [
  { id: '1', name: 'Raj Mahal Palace', category: 'Function Halls' },
  { id: '2', name: 'Sangam Musical Group', category: 'Music & Entertainment' },
  { id: '3', name: 'Marigold Dreams Decor', category: 'Decoration' },
  { id: '4', name: 'Royal Baraat Cars', category: 'Wedding Cars' },
  { id: '5', name: 'Swadisht Caterers', category: 'Catering' },
  { id: '6', name: 'Pandit Rajesh Shastri', category: 'Pandits & Priests' }
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

// Test filtering function
function testFiltering(selectedCategory, searchQuery = '') {
  const filteredVendors = mockVendors.filter(vendor => {
    const matchesCategory = selectedCategory === 'All Categories' || vendor.category === selectedCategory;
    const matchesSearch = searchQuery === '' || 
      vendor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vendor.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });
  
  console.log(`Category: ${selectedCategory}, Search: "${searchQuery}"`);
  console.log(`Results: ${filteredVendors.length} vendors found`);
  filteredVendors.forEach(v => console.log(`- ${v.name} (${v.category})`));
  console.log('---');
}

// Run tests
testFiltering('All Categories');
testFiltering('Function Halls');
testFiltering('Decoration');
testFiltering('Catering');
testFiltering('All Categories', 'royal');
testFiltering('Music & Entertainment', 'sangam');