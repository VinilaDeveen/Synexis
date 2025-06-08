import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { 
  FullPageLoader, 
  InlineLoader, 
  ButtonLoader,
  ContentLoader, 
  ImageLoader
} from '../components/loaders';
import { IoMdInformationCircle } from "react-icons/io";
import { ToastContainer } from 'react-toastify';
import { useNotification } from '../hooks/useNotification';
import { useState, useEffect, useRef } from 'react';
import { unitService } from '../services/unitService';
import { useNavigate, useParams } from 'react-router-dom';
import useTooltip from '../hooks/useTooltip';

const AddUnitPage = () => {
  const { notifySuccess, notifyError, notifyWarning, notifyDefault } = useNotification();
  const { id } = useParams(); // Get the unit ID from URL if editing
  const isEditMode = !!id;
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    unitName: '',
    shortName: '',
    allowDecimal: false,
    isMultiple: false,
    baseUnitId: null,
    conversionFactor: 1
  });
  
  const [baseUnits, setBaseUnits] = useState([]);
  const [baseUnitSearchTerm, setBaseUnitSearchTerm] = useState("");
  const [showBaseUnitDropdown, setShowBaseUnitDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const isInitialLoad = useRef(true);

  // Use the custom tooltip hook
  const decimalTooltip = useTooltip(
    () => <div>Allow decimal values for quantities using this unit.</div>,
    'right'
  );

  const multipleTooltip = useTooltip(
    () => <div>Define this unit as a multiple of another base unit for conversion purposes.</div>,
    'right'
  );

  // Fetch base units for dropdown
  useEffect(() => {
    const fetchBaseUnits = async () => {
      try {
        const response = await unitService.getBaseUnitDropDown(baseUnitSearchTerm);
        setBaseUnits(response.data);
      } catch (err) {
        if (isInitialLoad.current) {
          notifyError('Failed to load units. Please try again.')
          isInitialLoad.current = false;
        }
      }
    };

    const debounceTimer = setTimeout(() => {
    if (baseUnitSearchTerm.trim() !== "" || showBaseUnitDropdown) {
      fetchBaseUnits();
    }
  }, 300);
    return () => clearTimeout(debounceTimer)

  }, [baseUnitSearchTerm, showBaseUnitDropdown]);

  // If in edit mode, fetch the unit details
  useEffect(() => {
    if (isEditMode) {
      const fetchUnitDetails = async () => {
        setLoading(true);
        try {
          const response = await unitService.getById(id);
          const unitData = response.data;
          
          setFormData({
            unitName: unitData.unitName,
            shortName: unitData.unitShortName,
            allowDecimal: unitData.unitAllowDecimal || false,
            isMultiple: !!unitData.baseUnitId,
            baseUnitId: unitData.baseUnitId || null,
            conversionFactor: unitData.unitConversionFactor || 1
          });
          
          // Set the base unit search term if in edit mode and has base unit
          if (unitData.baseUnitId) {
            const baseUnit = baseUnits.find(u => u.baseUnitId === unitData.baseUnitId);
            if (baseUnit) {
              setBaseUnitSearchTerm(baseUnit.baseUnitName);
            }
          }
          
        } catch (err) {
          notifyError('Failed to load unit details. Please try again.')
        } finally {
          setLoading(false);
        }
      };

      fetchUnitDetails();
    }
  }, [id, isEditMode]);
  
  const handleMultipleChange = (e) => {
    const isChecked = e.target.checked;
    setFormData(prev => ({
      ...prev,
      isMultiple: isChecked,
      baseUnitId: isChecked ? prev.baseUnitId : null,
      conversionFactor: isChecked ? prev.conversionFactor : 1
    }));
  };

  const handleInputChange = (e) => {
    const { id, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const unitData = {
      unitName: formData.unitName,
      unitShortName: formData.shortName,
      unitAllowDecimal: formData.allowDecimal,
      baseUnitId: formData.isMultiple ? formData.baseUnitId : null,
      unitConversionFactor: formData.isMultiple ? formData.conversionFactor : null
    };

    try {
      if (isEditMode) {
        await unitService.update(id, unitData);
        notifySuccess('Unit updated successfully!');
      } else {
        await unitService.create(unitData);
        notifySuccess('Unit created successfully!');
      }
      // Redirect to units list page after successful operation
      navigate('/inventory/unit');
    } catch (err) {
      console.error('Error saving unit:', err);
      isEditMode 
          ? notifyError('Failed to update unit. Please try again.') 
          : notifyError('Failed to create unit. Please try again.')
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/inventory/unit');
  };

  if (loading && isEditMode) {
    return <FullPageLoader />;
  }

  return (
    <div className="flex w-screen h-screen text-black bg-gray-100" style={{
      scrollbarWidth: 'thin',
      scrollbarColor: ' #3B50DF #D9D9D9'}}>
      {/* Sidebar */}
      <div className="">
        <div className=""><Sidebar/></div>
      </div>

      {/* Main Content */}
      <div className="flex w-screen flex-col">
        {/* Header */}
        <div>
          <Navbar/>
        </div>

        {/* Content Area */}
        <div className="p-6 flex-1">

          {/* Toast notifications */}
          <ToastContainer className="mt-[70px]" />

          <h1 className="text-2xl font-semibold mb-4">
            {isEditMode ? 'Update Unit' : 'New Unit'}
          </h1>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {/* Add/Edit Unit Form */}
          <form onSubmit={handleSubmit}>
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="p-4 justify-between">
                <div className="flex gap-6">
                  <div>
                    <label htmlFor="unitName">Unit Name</label>
                    <div className='mt-3'>
                      <input 
                        type="text" 
                        id="unitName"
                        value={formData.unitName}
                        onChange={handleInputChange}
                        className='p-2 bg-[#E3F0FF] w-[400px] rounded'
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="shortName">Short Name</label>
                    <div className='mt-3'>
                      <input 
                        type="text" 
                        id="shortName"
                        value={formData.shortName}
                        onChange={handleInputChange}
                        className='p-2 bg-[#E3F0FF] w-[400px] rounded'
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className='mt-4 flex items-center'>
                  {/* Custom styled checkbox for Allow Decimal */}
                  <div className="relative flex items-center">
                    <input
                      type="checkbox"
                      id="allowDecimal"
                      name="allowDecimal"
                      checked={formData.allowDecimal}
                      onChange={handleInputChange}
                      className="absolute opacity-0 w-4 h-4 cursor-pointer"
                    />
                    <div className={`w-4 h-4 mr-2 border ${
                      formData.allowDecimal 
                        ? 'bg-[#3C50E0] border-blue-500' 
                        : 'bg-slate-200 border-slate-300'
                    } flex items-center justify-center`}>
                      {formData.allowDecimal && (
                        <svg 
                          className="w-3 h-3 text-white" 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24" 
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth="3" 
                            d="M5 13l4 4L19 7"
                          ></path>
                        </svg>
                      )}
                    </div>
                    <label className="text-black cursor-pointer mr-2" htmlFor="allowDecimal">
                      Allow Decimal
                    </label>

                    {/* Using the custom tooltip hook */}
                    <decimalTooltip.Tooltip {...decimalTooltip.tooltipProps}>
                      <div className="text-slate-700 cursor-help">
                        <IoMdInformationCircle size={18} />
                      </div>
                    </decimalTooltip.Tooltip>
                  </div>
                </div>
                
                <div className='mt-4 flex items-center'>
                  {/* Custom styled checkbox for Multiple */}
                  <div className="relative flex items-center">
                    <input
                      type="checkbox"
                      id="isMultiple"
                      name="isMultiple"
                      checked={formData.isMultiple}
                      onChange={handleMultipleChange}
                      className="absolute opacity-0 w-4 h-4 cursor-pointer"
                    />
                    <div className={`w-4 h-4 mr-2 border ${
                      formData.isMultiple 
                        ? 'bg-[#3C50E0] border-blue-500' 
                        : 'bg-slate-200 border-slate-300'
                    } flex items-center justify-center`}>
                      {formData.isMultiple && (
                        <svg 
                          className="w-3 h-3 text-white" 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24" 
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth="3" 
                            d="M5 13l4 4L19 7"
                          ></path>
                        </svg>
                      )}
                    </div>
                    <label className="text-black cursor-pointer mr-2" htmlFor="isMultiple">
                      Add as a multiple of other units
                    </label>

                    {/* Using the multiple tooltip hook */}
                    <multipleTooltip.Tooltip {...multipleTooltip.tooltipProps}>
                      <div className="text-slate-700 cursor-help">
                        <IoMdInformationCircle size={18} />
                      </div>
                    </multipleTooltip.Tooltip>
                  </div>
                </div>
                
                {/* Base Unit Dropdown - Only visible when isMultiple is checked */}
                {formData.isMultiple && (
                  <div className="mt-4 p-4 bg-gray-50 rounded border border-gray-200">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">1 {formData.unitName || 'Unit Name'}</span>
                      <span>=</span>
                      <input 
                        type="number" 
                        id="conversionFactor"
                        value={formData.conversionFactor}
                        onChange={handleInputChange}
                        className='p-2 bg-white border border-gray-300 w-20 rounded text-center'
                        required={formData.isMultiple}
                      />
                      <div className="flex gap-2 items-center">
                        <div className="relative">
                          <input
                            type="text"
                            id="baseUnit"
                            autoComplete='off'
                            value={baseUnitSearchTerm}
                            onChange={(e) => {
                              setBaseUnitSearchTerm(e.target.value);
                              setShowBaseUnitDropdown(true);
                            }}
                            onFocus={() => setShowBaseUnitDropdown(true)}
                            onBlur={() => setTimeout(() => setShowBaseUnitDropdown(false), 200)}
                            className="py-2 bg-blue-100 w-[250px] rounded focus:outline-none px-3"
                            placeholder="Search base unit..."
                            required={formData.isMultiple}
                          />
                          {showBaseUnitDropdown && (
                            <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md border border-gray-200 max-h-60 overflow-auto">
                              {baseUnits.length > 0 ? (
                                baseUnits.map((unit) => (
                                  <div
                                    key={unit.baseUnitId}
                                    className="px-4 py-2 text-left hover:bg-gray-100 cursor-pointer"
                                    onClick={() => {
                                      setFormData(prev => ({
                                        ...prev,
                                        baseUnitId: unit.baseUnitId
                                      }));
                                      setBaseUnitSearchTerm(unit.baseUnitName);
                                      setShowBaseUnitDropdown(false);
                                    }}
                                  >
                                    {unit.baseUnitName}
                                  </div>
                                ))
                              ) : (
                                <div className="px-4 py-2 text-gray-500">No base units found</div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className='flex justify-end mt-4'>
              <button 
                type="submit"
                disabled={submitting}
                className='bg-[#3C50E0] text-white px-6 py-2 rounded mr-4 hover:bg-blue-700 disabled:bg-blue-400'
              >
                {submitting ? <ButtonLoader text={isEditMode ? "Updating..." : "Saving..."} /> : isEditMode ? 'Update' : 'Save'}
              </button>
              <button 
                type="button"
                onClick={handleCancel}
                className='bg-gray-100 text-black border border-[#3B50DF] px-4 py-2 rounded hover:bg-gray-100'
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddUnitPage;