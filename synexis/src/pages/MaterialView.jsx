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
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { DataGrid } from '@mui/x-data-grid';
import { materialService } from '../services/materialService';
import { ToastContainer } from 'react-toastify';
import { useNotification } from '../hooks/useNotification';

function MaterialView() {
  const { notifySuccess, notifyError, notifyWarning, notifyDefault } = useNotification();
  const [searchTerm, setSearchTerm] = useState('');
  const [showSidebar, setShowSidebar] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [materialLoading, setMaterialLoading] = useState(false);
  const [paginationModel, setPaginationModel] = useState({
    pageSize: 5,
    page: 0,
  });
  const isInitialLoad = useRef(true);
  const isInitialLoad1 = useRef(true);
  
  // For accessing route parameters and state
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  // Get the selectedMaterialId from state or from URL parameter
  const selectedMaterialId = location.state?.selectedMaterialId || id;

  // State for materials
  const [materials, setMaterials] = useState([]);
  
  // Custom theme for DataGrid
  const customTheme = createTheme({
    components: {
      MuiDataGrid: {
        styleOverrides: {
          root: {
            border: 'none',
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor: '#E9EEF6',
              color: '#1e293b',
              fontWeight: 'bold',
            },
            '& .MuiDataGrid-cell': {
              borderBottom: '1px solid #f1f5f9',
              paddingLeft: '8px 16px',
            },
            '& .MuiDataGrid-columnSeparator': {
              display: 'none',
            },
            '& .MuiDataGrid-footerContainer': {
              borderTop: 'none',
            },
            '& .MuiDataGrid-columnHeader:first-of-type .MuiDataGrid-columnHeaderTitleContainer': {
              paddingLeft: '10px',
              fontWeight: '600'
            },
          },
        },
      },
    },
  });

  const [activityLogs, setActivityLogs] = useState([]);
  const [activityLogLoading, setActivityLogLoading] = useState(false);

  // Add this useEffect to fetch activity logs
  useEffect(() => {
    const fetchActivityLogs = async () => {
      if (!selectedMaterialId) return;
      
      try {
        setActivityLogLoading(true);
        const response = await materialService.getMaterialActivityLogs(selectedMaterialId);
        
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
    
    // Only fetch logs when activity tab is active and we have a material selected
    fetchActivityLogs();
  }, [selectedMaterialId, activeTab]);
  
  // Fetch material list data
  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        setLoading(true);
        const response = await materialService.getSideDrop();
        if (response && response.data) {
          setMaterials(response.data);
        }
      } catch (error) {
        if (isInitialLoad.current) {
          console.error('Error fetching materials:', error);
          notifyError('Failed to load materials');
          isInitialLoad.current = false;
        }
      } finally {
        setLoading(false);
      }
    };

    fetchMaterials();
  }, []);

  // Fetch selected material by ID when selectedMaterialId changes
  useEffect(() => {
    const fetchMaterialById = async (id) => {
      if (!id) return;
          
      try {
        setMaterialLoading(true);
        const response = await materialService.getById(id);
        if (response && response.data) {
          setSelectedMaterial(response.data);
          console.log(response.data);
        } else {
          notifyWarning('Material not found');
        }
      } catch (error) {
        if (isInitialLoad1.current) {
          console.error('Error fetching material details:', error);
          notifyError('Failed to load material details');
          isInitialLoad1.current = false;
        }
      } finally {
        setMaterialLoading(false);
      }
    };
    
    if (selectedMaterialId) {
      fetchMaterialById(selectedMaterialId);
    } else if (materials.length > 0 && !selectedMaterial) {
      // Default to first material if none selected
      handleMaterialSelect(materials[0]);
    }
  }, [selectedMaterialId, materials]);

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

  // Handle material selection and update URL
  const handleMaterialSelect = (material) => {
    navigate(`/materialView/${material.materialId}`, { 
      state: { selectedMaterialId: material.materialId },
      replace: true 
    });
    // The useEffect hook with selectedMaterialId dependency will trigger
    // the API call to fetch the material details
  };

  // Filter materials based on search term
  const filteredMaterials = searchTerm.trim() === '' 
    ? materials 
    : materials.filter(material => 
        material.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        material.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        material.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );

  // Handle back to inventory
  const handleBackToInventory = () => {
    navigate('/material');
  };

  const handleEditMaterial = () => {
    navigate(`/editMaterial/${selectedMaterialId}`);
  };

  const handleDeleteMaterial = async () => {
    if (!selectedMaterialId) return;

    try {
      setLoading(true);
      await materialService.delete(selectedMaterialId);
      notifySuccess(`Material "${selectedMaterial.name}" successfully deleted`);
      
      // After deletion, navigate back to inventory list
      navigate('/material');
    } catch (error) {
      notifyError(`Error deleting material: ${error.message || 'Unknown error'}`);
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
          {/* Material Name Panel */}
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

            {/* Material List */}
            <div className="flex-1 overflow-y-auto p-2">
              {loading ? (
                <div className="flex justify-center items-center h-32">
                  <InlineLoader/>
                </div>
              ) : filteredMaterials.length > 0 ? (
                filteredMaterials.map((material) => (
                  <div 
                    key={material.materialId}
                    onClick={() => handleMaterialSelect(material)}
                    className={`p-3 mb-2 cursor-pointer ${selectedMaterialId == material.materialId ? 'bg-blue-100' : 'hover:bg-gray-100'}`}
                  >
                    <div className="flex items-center">
                      {material.materialImageUrl && (
                        <img
                          alt={`${material.name} image`}
                          src={`http://localhost:8080/api/synexis/material/image/${material.materialId}`}
                          className="size-10 border-2 border-slate-300 mr-2"
                        />
                      )}
                      <div>
                        <div className="text-sm font-medium">{material.materialName}</div>
                        <div className="text-xs text-gray-500">SKU: {material.materialSKU}</div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-gray-500">
                  No materials found
                </div>
              )}
            </div>
          </div>
          
          {/* Content Area */}
          <div className="flex-1 px-4 overflow-hidden">
            {selectedMaterial ? (
              <div className="w-full">
                <div className="flex justify-between items-center mb-4">
                  <h1 className="text-xl font-semibold">
                    {selectedMaterial.name}
                  </h1>
                  <div className="flex gap-4 text-[#3B50DF]">
                    <div 
                      className="rounded cursor-pointer" 
                      title="Edit Material"
                      onClick={handleEditMaterial}
                    >
                      <FaEdit size={18}/>
                    </div>
                    <div 
                      className="rounded cursor-pointer" 
                      title="Delete Material"
                      onClick={handleDeleteMaterial}
                    >
                      <MdDelete size={18} />
                    </div>
                    <div 
                      className="rounded cursor-pointer" 
                      title="Close/Back to inventory"
                      onClick={handleBackToInventory}
                    >
                      <MdOutlineClose size={18} />
                    </div>
                  </div>
                </div>

                {/* Material Content with Loading State */}
                {materialLoading ? (
                  <div className="flex items-center justify-center h-40">
                    <ContentLoader />
                  </div>
                ) : (
                  <div className="p-6 bg-white rounded-lg shadow overflow-hidden">
                    {/* Tabs */}
                    <div className="flex">
                      <button 
                        className={`px-6 py-3 font-medium text-sm bg-white hover:border-white ${activeTab === 'overview' ? 'border-b-2 rounded-none border-b-[#3119C3]' : 'text-gray-500'} focus:outline-none`}
                        onClick={() => setActiveTab('overview')}
                      >
                        Overview
                      </button>
                      <button 
                        className={`px-6 py-3 font-medium text-sm bg-white hover:border-white ${activeTab === 'stock' ? 'border-b-2 rounded-none border-b-[#3119C3]' : 'text-gray-500'} focus:outline-none`}
                        onClick={() => setActiveTab('stock')}
                      >
                        Stock Movement
                      </button>
                      <button 
                        className={`px-6 py-3 font-medium text-sm bg-white hover:border-white ${activeTab === 'activity' ? 'border-b-2 rounded-none border-b-[#3119C3]' : 'text-gray-500'} focus:outline-none`}
                        onClick={() => setActiveTab('activity')}
                      >
                        Activity Log
                      </button>
                    </div>
                    <hr className='mt-2 mb-3' />
                    {/* Tab Content */}
                    <div className="p-6">
                      {activeTab === 'overview' ? (
                        <div className="max-h-[calc(100vh-280px)] overflow-y-auto" style={{
                          scrollbarWidth: 'thin',
                          scrollbarColor: ' #3B50DF #D9D9D9'
                        }}>
                          {/* Layout with two columns */}
                          <div className="flex flex-col md:flex-row gap-6">
                            {/* Left Column */}
                            <div className="flex-1">
                              {/* General Information */}
                              <div className='flex gap-8'>
                                <div className="mb-8">
                                  <h2 className="text-lg font-medium mb-4">General Information</h2>
                                  <div className="space-y-2">
                                    <div className="flex">
                                      <span className="w-32 text-gray-400">Name</span>
                                      <span>{selectedMaterial.materialName}</span>
                                    </div>
                                    <div className="flex">
                                      <span className="w-32 text-gray-400">SKU</span>
                                      <span>{selectedMaterial.materialSKU}</span>
                                    </div>
                                    <div className="flex">
                                      <span className="w-32 text-gray-400">Barcode</span>
                                      <span>{selectedMaterial.materialId}</span>
                                    </div>
                                    <div className="flex">
                                      <span className="w-32 text-gray-400">Description</span>
                                      <span>{selectedMaterial.materialDescription || 'No description available'}</span>
                                    </div>
                                  </div>
                                </div>
                            
                                {/* Material image */}
                                <div className="bg-blue-50 rounded-md p-4 flex flex-col items-center">
                                  <div className="w-40 h-40 bg-gray-100 flex items-center justify-center mb-3">
                                    {selectedMaterial.materialImageUrl ? (
                                      <img 
                                        src={`http://localhost:8080/api/synexis/material/image/${selectedMaterial.materialId}`} 
                                        alt="Material" 
                                        className="max-h-full max-w-full object-contain"
                                      />
                                    ) : (
                                      <div className="text-gray-400">No image available</div>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <hr className='mt-5 mb-5' />
                              {/* Classification Section */}
                              <div className="mb-8">
                                <h2 className="text-lg font-medium mb-4">Classification</h2>
                                <div className="space-y-2">
                                  <div className='flex'>
                                    <div className="flex">
                                      <span className="w-32 text-gray-400">Inventory Type</span>
                                      <span className='w-64'>{selectedMaterial.materialInventoryType || 'Not specified'}</span>
                                    </div>
                                    <div className="flex">
                                      <span className="w-32 text-gray-400">Material Type</span>
                                      <span className="w-64">{selectedMaterial.materialType || 'Not specified'}</span>
                                    </div>
                                  </div>
                                  <div className="flex">
                                      <span className="w-32 text-gray-400">Brand</span>
                                      <span className="w-64">{selectedMaterial.brandName || 'Not specified'}</span>
                                    </div>
                                  <div className='flex'>
                                    <div className="flex">
                                      <span className="w-32 text-gray-400">Category</span>
                                      <span className="w-64">{selectedMaterial.categoryName || 'Not specified'}</span>
                                    </div>
                                    <div className="flex">
                                      <span className="w-32 text-gray-400">Sub Category</span>
                                      <span className="w-64">{selectedMaterial.subCategoryName || 'Not specified'}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <hr className='mt-5 mb-5' />
                              {/* Pricing Section */}
                              <div className="mb-8">
                                <h2 className="text-lg font-medium mb-4">Pricing</h2>
                                <div className="flex">
                                  <div className="flex">
                                    <span className="w-32 text-gray-400">Purchase Price</span>
                                    <span className="w-64">LKR {selectedMaterial.materialPurchasePrice || 'Not specified'}</span>
                                  </div>
                                  <div className="flex">
                                    <span className="w-32 text-gray-400">Market Price</span>
                                    <span className="w-64">LKR {selectedMaterial.materialMarketPrice || 'Not specified'}</span>
                                  </div>
                                </div>
                              </div>
                              <hr className='mt-5 mb-5' />
                              {/* Stock Control Section */}
                              <div className="mb-4">
                                <h2 className="text-lg font-medium mb-4">Stock Control</h2>
                                <div className="space-y-2">
                                  <div className="flex">
                                    <div className="flex">
                                      <span className="w-32 text-gray-400">Alert Quantity</span>
                                      <span className="w-64">{selectedMaterial.alertQuantity || 'Not specified'}</span>
                                    </div>
                                    <div className="flex">
                                      <span className="w-32 text-gray-400">Quantity In Hand</span>
                                      <span className="w-64">{selectedMaterial.quantityInHand || 'Not specified'}</span>
                                    </div>
                                  </div>
                                  <div className="flex">
                                    <div className="flex">
                                      <span className="w-32 text-gray-400">Base Unit</span>
                                      <span className="w-64">{selectedMaterial.baseUnitName || 'Not specified'}</span>
                                    </div>
                                    <div className="flex">
                                      <span className="w-32 text-gray-400">Other Unit</span>
                                      <span className="w-64">{selectedMaterial.otherUnitName || 'Not applicable'}</span>
                                    </div>
                                  </div>
                                  <div className="flex">
                                    <div className="flex">
                                      <span className="w-32 text-gray-400">Status</span>
                                      <span className="w-64">{selectedMaterial.materialStatus.toLowerCase()}</span>
                                    </div>
                                    <div className="flex">
                                      <span className="w-32 text-gray-400">Material Use</span>
                                      <span className="w-64">{selectedMaterial.materialForUse === 'true' ? "Disable" : "Enable"}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>                                                          
                          </div>
                        </div>
                      ) : activeTab === 'stock' ? (
                        <div>
                          <h2 className="text-lg font-medium mb-4">Stock Movement History</h2>
                          {/* Stock Movement DataGrid */}
                          <div className="w-full overflow-x-auto">
                            <ThemeProvider theme={customTheme}>
                              <DataGrid 
                                rows={selectedMaterial.stockMovements ? selectedMaterial.stockMovements.map((movement, index) => ({
                                  id: index,
                                  date: new Date(movement.date).toLocaleDateString(),
                                  type: movement.type,
                                  quantity: movement.quantity,
                                  reference: movement.reference,
                                  user: movement.user
                                })) : []}
                                columns={[
                                  { 
                                    field: 'date', 
                                    headerName: 'Date', 
                                    flex: 1,
                                    minWidth: 120,
                                    headerAlign: 'left',
                                    align: 'left' 
                                  },
                                  { 
                                    field: 'type', 
                                    headerName: 'Type', 
                                    flex: 1,
                                    minWidth: 120,
                                    headerAlign: 'left',
                                    align: 'left' 
                                  },
                                  { 
                                    field: 'quantity', 
                                    headerName: 'Quantity', 
                                    flex: 0.7,
                                    minWidth: 100,
                                    headerAlign: 'left',
                                    align: 'left' 
                                  },
                                  { 
                                    field: 'reference', 
                                    headerName: 'Reference', 
                                    flex: 1,
                                    minWidth: 180,
                                    headerAlign: 'left',
                                    align: 'left' 
                                  },
                                  { 
                                    field: 'user', 
                                    headerName: 'User', 
                                    flex: 1,
                                    minWidth: 120,
                                    headerAlign: 'left',
                                    align: 'left' 
                                  }
                                ]}
                                pagination
                                paginationModel={paginationModel}
                                onPaginationModelChange={setPaginationModel}
                                pageSizeOptions={[5, 10, 25]}
                                disableRowSelectionOnClick
                                autoHeight
                                sx={{
                                  border: 'none',
                                  '& .MuiDataGrid-cell:focus': {
                                    outline: 'none',
                                  },
                                  '& .MuiDataGrid-row:hover': {
                                    backgroundColor: '#f8fafc',
                                  },
                                  // Responsive font sizes
                                  fontSize: isMobile ? '0.8rem' : '0.875rem',
                                }}
                                components={{
                                  NoRowsOverlay: () => (
                                    <div className="flex justify-center items-center h-24 text-gray-500">
                                      No stock movement records found
                                    </div>
                                  )
                                }}
                              />
                            </ThemeProvider>
                          </div>
                        </div>
                      ) : (
                        <div className="max-h-[calc(100vh-270px)] overflow-y-auto" style={{
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
                {loading ? (
                  <div className="flex items-center justify-center h-40">
                    <ContentLoader />
                  </div>
                ) : (
                  <div className="text-gray-500">Select a material to view details</div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default MaterialView;