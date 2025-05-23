import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { 
  FullPageLoader, 
  InlineLoader, 
  ButtonLoader,
  ContentLoader, 
  ImageLoader
} from '../components/loaders';
import { useState, useEffect, useRef } from 'react';
import { Menu, Search } from 'lucide-react';
import { FaEdit } from "react-icons/fa";
import { MdDelete, MdOutlineClose } from "react-icons/md";
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { useNotification } from '../hooks/useNotification';
import { unitService } from '../services/unitService';

const UnitView = () => {
  const { notifySuccess, notifyError, notifyWarning, notifyDefault } = useNotification();
  const [searchTerm, setSearchTerm] = useState('');
  const [showSidebar, setShowSidebar] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [unitLoading, setUnitLoading] = useState(false);
  const isInitialLoad = useRef(true);
  const isInitialLoad1 = useRef(true);
  
  // For accessing route parameters and state
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get the selectedUnitId from state or from URL parameter
  const selectedUnitId = location.state?.selectedUnitId || id;

  // State for units
  const [units, setUnits] = useState([]);

  const [activityLogs, setActivityLogs] = useState([]);
  const [activityLogLoading, setActivityLogLoading] = useState(false);

  // Add this useEffect to fetch activity logs
  useEffect(() => {
    const fetchActivityLogs = async () => {
      if (!selectedUnitId) return;
      
      try {
        setActivityLogLoading(true);
        const response = await unitService.getUnitActivityLogs(selectedUnitId);
        
        if (response && response.data) {
          setActivityLogs(response.data);
        } else {
          console.log('No activity logs found');
        }
      } catch (error) {
        console.error('Error fetching activity logs:', error);
        notifyError('Failed to load activity logs');
      } finally {
        setActivityLogLoading(false);
      }
    };
    
    // Only fetch logs when activity tab is active and we have a unit selected
    if (activeTab === 'activity' && selectedUnitId) {
      fetchActivityLogs();
    }
  }, [selectedUnitId, activeTab]);
  // Fetch units list data
  useEffect(() => {
    const fetchUnits = async () => {
      try {
        setLoading(true);
        const response = await unitService.getSideDrop();
        if (response && response.data) {
          setUnits(response.data);
        }
      } catch (error) {
        if (isInitialLoad.current) {
          console.error('Error fetching units:', error);
          notifyError('Failed to load units');
          isInitialLoad.current = false;
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUnits();
  }, []);

  // Fetch selected unit by ID when selectedUnitId changes
  useEffect(() => {
    const fetchUnitById = async (id) => {
      if (!id) return;
      
      try {
        setUnitLoading(true);
        const response = await unitService.getById(id);
        if (response && response.data) {
          setSelectedUnit(response.data);
        } else {
          notifyWarning('Unit not found');
        }
      } catch (error) {
        if (isInitialLoad1.current) {
          console.error('Error fetching unit details:', error);
          notifyError('Failed to load unit details');
          isInitialLoad1.current = false;
        }
      } finally {
        setUnitLoading(false);
      }
    };

    if (selectedUnitId) {
      fetchUnitById(selectedUnitId);
    } else if (units.length > 0 && !selectedUnit) {
      // Default to first unit if none selected
      handleUnitSelect(units[0]);
    }
  }, [selectedUnitId, units]);

  // Check screen size and set mobile state
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setShowSidebar(false);
      } else {
        setShowSidebar(true);
      }
    };

    // Initial check
    handleResize();

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Toggle sidebar
  const toggleSidebar = () => {
    setShowSidebar(!showSidebar);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Handle unit selection and update URL
  const handleUnitSelect = (unit) => {
    navigate(`/unitView/${unit.unitId}`, { 
      state: { selectedUnitId: unit.unitId },
      replace: true 
    });
    // The useEffect hook with selectedUnitId dependency will trigger
    // the API call to fetch the unit details
  };

  // Filter units based on search term
  const filteredUnits = searchTerm.trim() === '' 
    ? units 
    : units.filter(unit => 
        unit.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        unit.shortName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        unit.unitId?.toString().toLowerCase().includes(searchTerm.toLowerCase())
      );

  // Handle back to units
  const handleBackToUnits = () => {
    navigate('/unit');
  };

  const handleEditUnit = () => {
    navigate(`/editUnit/${selectedUnitId}`);
  };

  const handleDeleteUnit = async () => {
    if (!selectedUnitId) return;

    try {
      setLoading(true);
      await unitService.delete(selectedUnitId);
      notifySuccess(`Unit "${selectedUnit.unitName}" successfully deleted`);
      
      // After deletion, navigate back to units list
      navigate('unit');
    } catch (error) {
      notifyError(`Error deleting unit: ${error.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex w-screen h-screen text-black bg-gray-100 overflow-hidden" style={{
      scrollbarWidth: 'thin',
      scrollbarColor: ' #3B50DF #D9D9D9'
    }}>

      {/* Toast notifications */}
      <ToastContainer className="mt-[70px]" />

      {/* Mobile Menu Button */}
      {isMobile && !showSidebar && (
        <button 
          onClick={toggleSidebar}
          className="fixed top-4 left-4 z-50 bg-white p-2 rounded-full shadow-md"
        >
          <Menu size={24} className="text-[#3B50DF]" />
        </button>
      )}

      {/* Sidebar - conditionally shown */}
      {showSidebar && (
        <div className={`${isMobile ? 'fixed z-40 h-full shadow-lg' : 'relative'}`}>
          <Sidebar />
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col w-full h-full overflow-hidden">
        {/* Header */}
        <div>
          <Navbar/>
        </div>

        <div className="flex flex-1 mt-1 overflow-hidden">
          {/* Unit Name Panel */}
          <div className="w-[300px] h-full shadow-md bg-white flex flex-col">
            <div className="p-4 relative">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                <Search size={16} className="text-gray-400 ml-2" />
              </div>
              <input
                type="text"
                placeholder="Type to search"
                className="pl-10 bg-white w-full border border-gray-200 pr-4 py-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                value={searchTerm}
                onChange={handleSearchChange}
              />
            </div>

            {/* Unit List */}
            <div className="flex-1 overflow-y-auto p-2">
              {loading ? (
                <div className='flex justify-center items-center h-32'>
                  <InlineLoader/>
                </div>
              ) : filteredUnits.length > 0 ? (
                filteredUnits.map((unit) => (
                  <div 
                    key={unit.unitId}
                    onClick={() => handleUnitSelect(unit)}
                    className={`p-2 mb-2 cursor-pointer ${selectedUnitId == unit.unitId ? 'bg-blue-100' : 'hover:bg-gray-100'}`}
                  >
                    <div className="flex items-center">
                      <span className="text-sm font-medium">{unit.unitName}</span>
                      {unit.unitShortName && (
                        <span className="ml-2 text-xs text-gray-500">({unit.unitShortName})</span>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-gray-500">
                  No units found
                </div>
              )}
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 p-6 overflow-auto">
            {selectedUnit ? (
              <div className="w-full">
                <div className="flex justify-between items-center mb-4">
                  <h1 className="text-xl font-semibold">
                    {selectedUnit.unitName}
                  </h1>
                  <div className="flex text-[#3B50DF]">
                    <div 
                      className="bg-gray-100 rounded cursor-pointer p-2" 
                      title="Edit Unit"
                      onClick={handleEditUnit}
                    >
                      <FaEdit size={18}/>
                    </div>
                    <div 
                      className="bg-gray-100 rounded cursor-pointer p-2" 
                      title="Delete Unit"
                      onClick={handleDeleteUnit}
                    >
                      <MdDelete size={18} />
                    </div>
                    <div 
                      className="bg-gray-100 rounded cursor-pointer p-2" 
                      title="Close/Back to Units"
                      onClick={handleBackToUnits}
                    >
                      <MdOutlineClose size={18} />
                    </div>
                  </div>
                </div>

                {/* Unit Content with Loading State */}
                {unitLoading ? (
                  <ContentLoader/>
                ) : (
                  <div className="bg-white rounded-lg shadow overflow-hidden">
                    {/* Tabs */}
                    <div className="flex">
                      <button 
                        className={`px-6 py-3 font-medium text-sm bg-white hover:border-white ${activeTab === 'overview' ? 'border-b-2 rounded-none border-b-[#3119C3]' : 'text-gray-500'} focus:outline-none`}
                        onClick={() => setActiveTab('overview')}
                      >
                        Overview
                      </button>
                      <button 
                        className={`px-6 py-3 font-medium text-sm bg-white hover:border-white ${activeTab === 'activity' ? 'border-b-2 rounded-none border-b-[#3119C3]' : 'text-gray-500'} focus:outline-none`}
                        onClick={() => setActiveTab('activity')}
                      >
                        Activity Log
                      </button>
                    </div>

                    {/* Tab Content */}
                    <div className="p-4">
                      {activeTab === 'overview' ? (
                        <div className="max-h-[calc(100vh-280px)] overflow-y-auto" style={{
                          scrollbarWidth: 'thin',
                          scrollbarColor: '#3B50DF #D9D9D9'
                        }}>
                          {/* General Information */}
                          <div className="mb-8">
                            <h2 className="text-lg font-medium mb-4">General Information</h2>
                            <div className="space-y-3">
                              <div className="flex">
                                <span className="w-32 text-gray-400">Unit Name</span>
                                <span>{selectedUnit.unitName}</span>
                              </div>
                              <div className="flex">
                                <span className="w-32 text-gray-400">Short Name</span>
                                <span>{selectedUnit.unitShortName || '-'}</span>
                              </div>
                              <div className="flex">
                                <span className="w-32 text-gray-400">Unit ID</span>
                                <span>{selectedUnit.unitId}</span>
                              </div>
                              <div className="flex">
                                <span className="w-32 text-gray-400">Status</span>
                                <span>{selectedUnit.unitStatus.toLowerCase() || 'Inactive'}</span>
                              </div>
                              <div className="flex">
                                <span className="w-32 text-gray-400">Allow Decimal</span>
                                <span>{selectedUnit.unitAllowDecimal ? 'Yes' : 'No'}</span>
                              </div>
                            </div>
                          </div>

                          {/* Associated Materials - If available */}
                          {selectedUnit.associatedMaterialList && selectedUnit.associatedMaterialList.length > 0 && (
                            <div className="mb-8">
                              <h2 className="text-lg font-medium mb-4">Associated Materials</h2>
                              <div className="">
                                {selectedUnit.associatedMaterialList.map((material, index) => (
                                  <div key={`material-${index}`} className="border-b py-2 flex-1 items-center">
                                    <div className="">{material.materialName}</div>
                                    <div className="text-sm text-gray-500">{material.materialSKU}</div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="max-h-[calc(100vh-240px)] overflow-y-auto" style={{
                          scrollbarWidth: 'thin',
                          scrollbarColor: '#3B50DF #D9D9D9'
                        }}>
                          <h2 className="text-lg font-semibold mb-4">Activity Log</h2>
                          {activityLogLoading ? (
                            <div className="flex justify-center items-center h-32">
                              <InlineLoader />
                            </div>
                          ) : (
                            <div className="space-y-4">
                              {activityLogs && activityLogs.length > 0 ? (
                                activityLogs.map((activity, index) => (
                                  <div key={`activity-${index}`} className="border-l-2 border-blue-500 pl-4 py-2">
                                    <p className="text-sm text-gray-500">{activity.actLogTimestamp}</p>
                                    <p>{activity.actLogAction} {activity.actLogPerformedBy}</p>
                                    {activity.actLogDetails && <p className="text-sm text-gray-600">{activity.actLogDetails}</p>}
                                  </div>
                                ))
                              ) : (
                                <div className="border-l-2 border-blue-500 pl-4 py-2">
                                  <p className="text-sm text-gray-500">No activity records found</p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-gray-500">
                  {loading ? <ContentLoader/> : 'Select a unit to view details'}
                </div>
              </div>
            )}
          </div>
        </div>
        
      </div>

      {/* Overlay when mobile sidebar is open */}
      {isMobile && showSidebar && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={toggleSidebar}
        />
      )}
    </div>
  );
};

export default UnitView;