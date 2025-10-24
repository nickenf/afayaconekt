import React, { useState, useEffect } from 'react';

interface Specialty {
  id: number;
  name: string;
  description: string;
  icon: string;
  category: string;
}

interface AdvancedSearchProps {
  onSearch: (filters: SearchFilters) => void;
  isLoading: boolean;
}

interface SearchFilters {
   specialty?: string;
   treatment?: string;
   hospitalName?: string;
   city?: string;
   district?: string;
   state?: string;
   priceRange?: string;
   accreditation?: string;
   minRating?: number;
   sortBy?: string;
}

export const AdvancedSearch: React.FC<AdvancedSearchProps> = ({ onSearch, isLoading }) => {
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [filters, setFilters] = useState<SearchFilters>({});
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    fetchSpecialties();
  }, []);

  const fetchSpecialties = async () => {
    try {
      const response = await fetch('/api/specialties');
      if (response.ok) {
        const data = await response.json();
        setSpecialties(data);
      }
    } catch (error) {
      console.error('Failed to fetch specialties:', error);
    }
  };

  const handleFilterChange = (key: keyof SearchFilters, value: string | number) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);

    // Auto-refresh when a filter is cleared (set to empty string or 0)
    if (value === '' || value === 0) {
      // Check if all other filters are also empty/cleared
      const allFilters = { ...newFilters };
      delete allFilters[key]; // Remove current filter from check

      const hasActiveFilters = Object.values(allFilters).some(v =>
        v !== '' && v !== 0 && v !== undefined && v !== null
      );

      if (!hasActiveFilters) {
        // All filters are now cleared, trigger search with empty filters
        onSearch({});
      }
    }
  };

  const handleSearch = () => {
    onSearch(filters);
    // Scroll to results section after search
    setTimeout(() => {
      const resultsSection = document.querySelector('[data-results-section]') as HTMLElement;
      if (resultsSection) {
        // Scroll to the results section with some offset for better visibility
        const yOffset = -100; // Offset to show some content above the results
        const y = resultsSection.getBoundingClientRect().top + window.pageYOffset + yOffset;

        window.scrollTo({
          top: y,
          behavior: 'smooth'
        });
      }
    }, 500); // Increased delay to ensure results are fully rendered
  };

  const clearFilters = () => {
    setFilters({});
    onSearch({});
  };

  const cities = [
    // Major Metropolitan Cities
    'Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad',
    'Pune', 'Ahmedabad', 'Gurgaon', 'Noida', 'Jaipur', 'Surat', 'Kanpur',
    'Nagpur', 'Indore', 'Thane', 'Bhopal', 'Visakhapatnam', 'Pimpri-Chinchwad',
    'Patna', 'Vadodara', 'Ghaziabad', 'Ludhiana', 'Agra', 'Nashik', 'Faridabad',
    'Meerut', 'Rajkot', 'Kalyan-Dombivli', 'Vasai-Virar', 'Varanasi', 'Srinagar',
    'Aurangabad', 'Dhanbad', 'Amritsar', 'Navi Mumbai', 'Allahabad', 'Ranchi',
    'Howrah', 'Jabalpur', 'Gwalior', 'Vijayawada', 'Jodhpur', 'Madurai', 'Raipur',
    'Kota', 'Guwahati', 'Chandigarh', 'Solapur', 'Hubli-Dharwad', 'Bareilly',
    'Moradabad', 'Mysore', 'Gurgaon', 'Aligarh', 'Jalandhar', 'Tiruchirappalli',
    'Bhubaneswar', 'Salem', 'Warangal', 'Guntur', 'Bhiwandi', 'Saharanpur',
    'Gorakhpur', 'Bikaner', 'Amravati', 'Noida', 'Jamshedpur', 'Bhilai', 'Cuttack',
    'Firozabad', 'Kochi', 'Nellore', 'Bhavnagar', 'Dehradun', 'Durgapur',
    'Asansol', 'Rourkela', 'Nanded', 'Kolhapur', 'Ajmer', 'Akola', 'Gulbarga',
    'Jamnagar', 'Ujjain', 'Loni', 'Siliguri', 'Jhansi', 'Ulhasnagar', 'Jammu',
    'Sangli-Miraj', 'Mangalore', 'Erode', 'Belgaum', 'Ambattur', 'Tirunelveli',
    'Malegaon', 'Gaya', 'Tiruppur', 'Davanagere', 'Kozhikode', 'Akbarpur',
    'Thiruvananthapuram', 'Karnal', 'Bokaro Steel City', 'Bellary', 'Patiala',
    'Agartala', 'Bhagalpur', 'Muzaffarnagar', 'Bhagalpur', 'Mathura', 'Kharagpur',
    'Sambalpur', 'Bilaspur', 'Shahjahanpur', 'Satara', 'Bijapur', 'Rampur',
    'Shimoga', 'Chandrapur', 'Junagadh', 'Thrissur', 'Alwar', 'Bardhaman',
    'Kulti', 'Kakinada', 'Nizamabad', 'Parbhani', 'Tumkur', 'Khammam', 'Ozhukarai',
    'Bihar Sharif', 'Panipat', 'Darbhanga', 'Bally', 'Aizawl', 'Dewas', 'Ichalkaranji',
    'Karnal', 'Bathinda', 'Jalna', 'Eluru', 'Kirari Suleman Nagar', 'Barasat',
    'Purnia', 'Satna', 'Mau', 'Sonipat', 'Farrukhabad', 'Sagar', 'Rourkela',
    'Durg', 'Imphal', 'Ratlam', 'Hapur', 'Arrah', 'Karimnagar', 'Anantapur',
    'Etawah', 'Ambernath', 'North Dumdum', 'Bharatpur', 'Begusarai', 'New Delhi',
    'Gandhidham', 'Baranagar', 'Tiruvottiyur', 'Pondicherry', 'Sikar', 'Thoothukudi',
    'Rewa', 'Mirzapur', 'Raichur', 'Pali', 'Ramagundam', 'Silchar', 'Haridwar',
    'Vijayanagaram', 'Tenali', 'Nagercoil', 'Sri Ganganagar', 'Karawal Nagar',
    'Mango', 'Thanjavur', 'Bulandshahr', 'Uluberia', 'Katni', 'Sambhal', 'Singrauli',
    'Nadiad', 'Secunderabad', 'Naihati', 'Yamunanagar', 'Bidhannagar', 'Pallavaram',
    'Bidar', 'Munger', 'Panchkula', 'Burhanpur', 'Raurkela Industrial Township',
    'Kharagpur', 'Dindigul', 'Gandhinagar', 'Hospet', 'Nangloi Jat', 'Malda',
    'Ongole', 'Deoghar', 'Chapra', 'Haldia', 'Khandwa', 'Nandyal', 'Morena',
    'Amroha', 'Anand', 'Bhind', 'Bhalswa Jahangir Pur', 'Madhyamgram', 'Bhiwani',
    'Berhampur', 'Ambala', 'Morbi', 'Fatehpur', 'Raebareli', 'Khora', 'Chittoor',
    'Bhusawal', 'Orai', 'Bahraich', 'Vellore', 'Mehsana', 'Raiganj', 'Sirsa',
    'Danapur', 'Serampore', 'Sultan Pur Majra', 'Guna', 'Jaunpur', 'Panvel',
    'Shivpuri', 'Surendranagar Dudhrej', 'Unnao', 'Chinsurah', 'Alappuzha',
    'Kottayam', 'Machilipatnam', 'Shimla', 'Adoni', 'Udupi', 'Katihar', 'Proddatur',
    'Mahbubnagar', 'Saharsa', 'Dibrugarh', 'Jorhat', 'Hazaribagh', 'Hindupur',
    'Nagaon', 'Sasaram', 'Hajipur', 'Giridih', 'Bhimavaram', 'Kumbakonam', 'Rajpur Sonarpur',
    'Kolar', 'South Dumdum', 'Bhatpara', 'Bhilwara', 'Muzaffarpur', 'Ahmednagar',
    'Mathura', 'Kollam', 'Avadi', 'Kadapa', 'Rajahmundry', 'Bilaspur', 'Shahjahanpur',
    'Hugli-Chinsurah', 'Tambaram', 'Guntakal', 'Bongaigaon', 'Dharmavaram', 'Farrukhabad',
    'Neyveli', 'Tiruvannamalai', 'Pollachi', 'Rajapalayam', 'Bettiah', 'Jaynagar',
    'Tadepalligudem', 'Chandannagar', 'Kishanganj', 'Narasaraopet', 'Srikakulam',
    'Adilabad', 'Yemmiganur', 'Banswara', 'Nagaur', 'Nandurbar', 'Mango', 'Palghar',
    'Vapi', 'Bongaigaon', 'Silvassa', 'Pendra', 'Wadhwan', 'Jobner', 'Bhusawal',
    'Neemuch', 'Mandvi', 'Vejalpur', 'Jodhpur', 'Anjar', 'Udaipur', 'Pali', 'Akot',
    'Arvi', 'Ashti', 'Pathardi', 'Paithan', 'Shegaon', 'Chakur', 'Murtijapur', 'Badnera',
    'Daryapur', 'Murtajapur', 'Risod', 'Washim', 'Mangrulpir', 'Jalgaon', 'Bhusawal',
    'Raver', 'Sillod', 'Soygaon', 'Chalisgaon', 'Pachora', 'Jamner', 'Bhadgaon',
    'Yawal', 'Faizpur', 'Savda', 'Shindkheda', 'Dhule', 'Parola', 'Shirpur', 'Dondaicha',
    'Sindkheda', 'Shirpur', 'Nandurbar', 'Navapur', 'Shahada', 'Talode', 'Malegaon',
    'Chandvad', 'Yeola', 'Pimpalgaon Baswant', 'Nashik', 'Ozar', 'Kanhere', 'Trimbakeshwar',
    'Ghoti', 'Igatpuri', 'Ghoti', 'Peint', 'Durg', 'Bhilai', 'Raipur', 'Bilaspur',
    'Korba', 'Rajnandgaon', 'Jagdalpur', 'Ambikapur', 'Mahasamund', 'Dhamtari',
    'Chirmiri', 'Bhatapara', 'Tilda Newra', 'Raigarh', 'Sakti', 'Dharsiwa', 'Arang',
    'Pendra', 'Sargaon', 'Takhatpur', 'Gharghoda', 'Katghora', 'Pasan', 'Pendra Road',
    'Baikunthpur', 'Kawardha', 'Champa', 'Akaltara', 'Naila Janjgir', 'Lormi', 'Mungeli',
    'Pandaria', 'Takhatpur', 'Gharghoda', 'Katghora', 'Pasan', 'Pendra Road', 'Baikunthpur',
    'Kawardha', 'Champa', 'Akaltara', 'Naila Janjgir', 'Lormi', 'Mungeli', 'Pandaria'
  ];

  const states = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
    'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
    'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
    'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
    'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Puducherry', 'Chandigarh',
    'Andaman and Nicobar Islands', 'Dadra and Nagar Haveli and Daman and Diu',
    'Lakshadweep'
  ];

  const districts = [
    // Delhi Districts
    'Central Delhi', 'East Delhi', 'New Delhi', 'North Delhi', 'North East Delhi',
    'North West Delhi', 'South Delhi', 'South East Delhi', 'South West Delhi', 'West Delhi',
    // Maharashtra Districts
    'Ahmednagar', 'Akola', 'Amravati', 'Aurangabad', 'Beed', 'Bhandara', 'Buldhana',
    'Chandrapur', 'Dhule', 'Gadchiroli', 'Gondia', 'Hingoli', 'Jalgaon', 'Jalna',
    'Kolhapur', 'Latur', 'Mumbai City', 'Mumbai Suburban', 'Nagpur', 'Nanded',
    'Nandurbar', 'Nashik', 'Osmanabad', 'Palghar', 'Parbhani', 'Pune', 'Raigad',
    'Ratnagiri', 'Sangli', 'Satara', 'Sindhudurg', 'Solapur', 'Thane', 'Wardha', 'Washim', 'Yavatmal',
    // Karnataka Districts
    'Bagalkot', 'Ballari', 'Belagavi', 'Bengaluru Rural', 'Bengaluru Urban', 'Bidar',
    'Chamarajanagar', 'Chikkaballapur', 'Chikkamagaluru', 'Chitradurga', 'Dakshina Kannada',
    'Davangere', 'Dharwad', 'Gadag', 'Hassan', 'Haveri', 'Kalaburagi', 'Kodagu', 'Kolar',
    'Koppal', 'Mandya', 'Mysuru', 'Raichur', 'Ramanagara', 'Shivamogga', 'Tumakuru',
    'Udupi', 'Uttara Kannada', 'Vijayapura', 'Yadgir',
    // Tamil Nadu Districts
    'Ariyalur', 'Chengalpattu', 'Chennai', 'Coimbatore', 'Cuddalore', 'Dharmapuri',
    'Dindigul', 'Erode', 'Kallakurichi', 'Kancheepuram', 'Karur', 'Krishnagiri',
    'Madurai', 'Nagapattinam', 'Namakkal', 'Nilgiris', 'Perambalur', 'Pudukkottai',
    'Ramanathapuram', 'Ranipet', 'Salem', 'Sivaganga', 'Tenkasi', 'Thanjavur',
    'Theni', 'Thoothukudi', 'Tiruchirappalli', 'Tirunelveli', 'Tirupathur', 'Tiruppur',
    'Tiruvallur', 'Tiruvannamalai', 'Tiruvarur', 'Vellore', 'Viluppuram', 'Virudhunagar'
  ];

  const priceRanges = [
    { value: 'budget', label: 'Budget ($ - $$)' },
    { value: 'moderate', label: 'Moderate ($$ - $$$)' },
    { value: 'premium', label: 'Premium ($$$$ - $$$$$)' }
  ];

  const accreditations = ['JCI', 'NABH', 'ISO 9001', 'ISO 14001', 'NABL'];

  const sortOptions = [
    { value: 'rating', label: 'Highest Rated' },
    { value: 'price_low', label: 'Price: Low to High' },
    { value: 'price_high', label: 'Price: High to Low' },
    { value: 'name', label: 'Name (A-Z)' }
  ];

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-dark">Find Your Perfect Hospital</h2>
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-primary hover:text-primary/80 font-medium flex items-center"
        >
          {showAdvanced ? 'Simple Search' : 'Advanced Search'}
          <svg className={`w-4 h-4 ml-1 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      <div className="space-y-6">
        {/* Basic Search */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
           <div>
             <label className="block text-sm font-medium text-gray-700 mb-2">Hospital Name</label>
             <input
               type="text"
               value={filters.hospitalName || ''}
               onChange={(e) => handleFilterChange('hospitalName', e.target.value)}
               placeholder="e.g., Apollo, Max, Fortis"
               className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
             />
           </div>

           <div>
             <label className="block text-sm font-medium text-gray-700 mb-2">Treatment</label>
             <input
               type="text"
               value={filters.treatment || ''}
               onChange={(e) => handleFilterChange('treatment', e.target.value)}
               placeholder="e.g., Heart Surgery, IVF, Dental"
               className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
             />
           </div>

           <div>
             <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
             <select
               value={filters.city || ''}
               onChange={(e) => handleFilterChange('city', e.target.value)}
               className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
             >
               <option value="">All Cities</option>
               {cities.slice(0, 50).map((city) => ( // Limit to first 50 for performance
                 <option key={city} value={city}>
                   {city}
                 </option>
               ))}
             </select>
           </div>

           <div>
             <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
             <select
               value={filters.state || ''}
               onChange={(e) => handleFilterChange('state', e.target.value)}
               className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
             >
               <option value="">All States</option>
               {states.map((state) => (
                 <option key={state} value={state}>
                   {state}
                 </option>
               ))}
             </select>
           </div>
         </div>

         {/* Secondary Search Row */}
         <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
           <div>
             <label className="block text-sm font-medium text-gray-700 mb-2">Medical Specialty</label>
             <select
               value={filters.specialty || ''}
               onChange={(e) => handleFilterChange('specialty', e.target.value)}
               className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
             >
               <option value="">All Specialties</option>
               {specialties.map((specialty) => (
                 <option key={specialty.id} value={specialty.name}>
                   {specialty.icon} {specialty.name}
                 </option>
               ))}
             </select>
           </div>

           <div>
             <label className="block text-sm font-medium text-gray-700 mb-2">District/Area</label>
             <select
               value={filters.district || ''}
               onChange={(e) => handleFilterChange('district', e.target.value)}
               className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
             >
               <option value="">All Districts</option>
               {districts.slice(0, 30).map((district) => ( // Limit for performance
                 <option key={district} value={district}>
                   {district}
                 </option>
               ))}
             </select>
           </div>

           <div>
             <label className="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
             <select
               value={filters.priceRange || ''}
               onChange={(e) => handleFilterChange('priceRange', e.target.value)}
               className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
             >
               <option value="">All Price Ranges</option>
               {priceRanges.map((range) => (
                 <option key={range.value} value={range.value}>
                   {range.label}
                 </option>
               ))}
             </select>
           </div>
         </div>

        {/* Advanced Filters */}
        {showAdvanced && (
          <div className="border-t pt-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                <select
                  value={filters.state || ''}
                  onChange={(e) => handleFilterChange('state', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="">All States</option>
                  {states.map((state) => (
                    <option key={state} value={state}>
                      {state}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Accreditation</label>
                <select
                  value={filters.accreditation || ''}
                  onChange={(e) => handleFilterChange('accreditation', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="">Any Accreditation</option>
                  {accreditations.map((acc) => (
                    <option key={acc} value={acc}>
                      {acc}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Rating</label>
                <select
                  value={filters.minRating || ''}
                  onChange={(e) => handleFilterChange('minRating', parseFloat(e.target.value))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="">Any Rating</option>
                  <option value="4.5">4.5+ Stars</option>
                  <option value="4.0">4.0+ Stars</option>
                  <option value="3.5">3.5+ Stars</option>
                  <option value="3.0">3.0+ Stars</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                <select
                  value={filters.sortBy || 'rating'}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          <button
            onClick={handleSearch}
            disabled={isLoading}
            className="flex-1 bg-primary text-white py-3 px-6 rounded-lg font-medium hover:bg-primary/90 focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Searching...
              </>
            ) : (
              <>
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Search Hospitals
              </>
            )}
          </button>

          <button
            onClick={clearFilters}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
          >
            Clear Filters
          </button>
        </div>

        {/* Active Filters Display */}
        {Object.keys(filters).length > 0 && (
          <div className="flex flex-wrap gap-2 pt-4 border-t">
            <span className="text-sm font-medium text-gray-600">Active Filters:</span>
            {Object.entries(filters).map(([key, value]) => {
              if (!value) return null;
              return (
                <span
                  key={key}
                  className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary"
                >
                  {key}: {value}
                  <button
                    onClick={() => handleFilterChange(key as keyof SearchFilters, '')}
                    className="ml-2 text-primary/60 hover:text-primary"
                  >
                    ×
                  </button>
                </span>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};