import React, { useState, useEffect } from 'react';
import { X, Search } from 'lucide-react';
import { materialService } from '../services/materialService';
import { toast } from 'react-toastify';

const NewMaterialAddModal = ({ isOpen, onClose, onSave, sections }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [materialData, setMaterialData] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [errors, setErrors] = useState({ MaterialName: '' });
  const [selectedSection, setSelectedSection] = useState(null);

  // Map material types to section names
  const materialTypeToSection = {
    'SWITCH_GEAR': 'Switch Gear Components',
    'CONTROL_ACCESSORIES': 'Control Accessories',
    'BUS_BAR': 'Bus Bar',
    'WIRING': 'Wiring',
    'OTHER_ACCESSORIES': 'Other Accessories',
    'ELECTRICAL_LABOR': 'Electrical Labor',
    'TRANSPORT': 'Transport',
    'ENCLOSURE': 'Enclosure'
  };

  // Notification helper
  const notifyError = (message) => {
    toast.error(message);
  };

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setSuggestions([]);
      return;
    }

    const fetchSuggestions = async () => {
      setIsLoading(true);
      try {
        const response = await materialService.getAllMaterialBySearch(searchTerm);
        setSuggestions(response.data);
      } catch (error) {
        console.error('Error fetching material suggestions:', error);
        setSuggestions([]);
        notifyError('Failed to fetch material suggestions');
      } finally {
        setIsLoading(false);
      }
    };

    const debounceTimer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchTerm]);

  const handleSuggestionClick = (material) => {
    setSearchTerm(material.materialName);
    setMaterialData(material);
    setShowSuggestions(false);
    
    // Auto-select section based on material type
    const sectionName = materialTypeToSection[material.materialType];
    if (sectionName) {
      const section = sections.find(s => s.name === sectionName);
      if (section) {
        setSelectedSection(section);
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const newErrors = {
      MaterialName: !searchTerm.trim() ? 'Material name is required' : ''
    };
    
    setErrors(newErrors);
    
    if (newErrors.MaterialName) {
      return;
    }
    
    if (!selectedSection) {
      notifyError('Please select a section for this material');
      return;
    }
    
    // Create the material data object with all required fields
    const materialPayload = {
      name: searchTerm,
      marketPrice: materialData?.materialMarketPrice || 0,
      unitPrice: materialData?.materialMarketPrice || 0,
      discount: 0,
      discountedPrice: materialData?.materialMarketPrice || 0,
      material: materialData?.material || '-',
      materialDescription: materialData?.materialDescription || '-',
      materialPartNumber: materialData?.materialPartNumber || '-',
      materialMake: materialData?.materialMake || '-',
      countryOfOrigin: materialData?.materialCountry || '-'
    };
    
    onSave(materialPayload, selectedSection.id);
    resetForm();
  };

  const resetForm = () => {
    setSearchTerm('');
    setMaterialData(null);
    setSelectedSection(null);
    setErrors({ MaterialName: '' });
    setSuggestions([]);
    setShowSuggestions(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Add New Material</h2>
          <button 
            onClick={() => {
              resetForm();
              onClose();
            }}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="MaterialName" className="block text-sm font-medium text-gray-700 mb-1">
              Material Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={16} className="text-gray-400" />
              </div>
              <input 
                type="text"
                id="MaterialName"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                className="w-full pl-10 bg-white p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Search material..."
              />
              {isLoading && (
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#3C50E0]"></div>
                </div>
              )}
            </div>
            
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute z-10 mt-1 w-full max-w-md bg-white shadow-lg rounded-md border border-gray-200 max-h-60 overflow-auto">
                {suggestions.map((material, index) => (
                  <div
                    key={index}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => handleSuggestionClick(material)}
                  >
                    <div className="font-medium">{material.materialName}</div>
                    <div className="text-sm text-gray-500">{material.materialDescription}</div>
                  </div>
                ))}
              </div>
            )}
            
            {errors.MaterialName && (
              <p className="mt-1 text-sm text-red-600">{errors.MaterialName}</p>
            )}
          </div>
          
          {materialData && (
            <div className="mb-4 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-500">Part Number</label>
                  <div className="text-sm">{materialData.materialPartNumber || '-'}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Make</label>
                  <div className="text-sm">{materialData.materialMake || '-'}</div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Market Price</label>
                <div className="text-sm">{materialData.materialMarketPrice?.toFixed(2) || '0.00'}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Country</label>
                <div className="text-sm">{materialData.materialCountry || '-'}</div>
              </div>
              
              {selectedSection && (
                <div>
                  <label className="block text-sm font-medium text-gray-500">Material Type</label>
                  <div className="text-sm">{selectedSection.name}</div>
                </div>
              )}
            </div>
          )}
          
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none"
              disabled={!selectedSection}
            >
              Add Material
            </button>
            <button
              type="button"
              onClick={() => {
                resetForm();
                onClose();
              }}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewMaterialAddModal;