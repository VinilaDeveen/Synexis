import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { 
  FullPageLoader, 
  InlineLoader, 
  ButtonLoader,
  ContentLoader, 
  ImageLoader
} from '../components/loaders'; // Fixed path to match casing in other imports
import { useState, useEffect, useRef } from 'react';
import { Menu, Search } from 'lucide-react';
import { FaEdit } from "react-icons/fa";
import { MdDelete, MdOutlineClose } from "react-icons/md";
import { DataGrid } from '@mui/x-data-grid';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import { brandService } from '../services/brandService';
import { ToastContainer } from 'react-toastify';
import { useNotification } from '../hooks/useNotification';

function BrandView() {
  const { notifySuccess, notifyError, notifyWarning, notifyDefault } = useNotification();
  const [searchTerm, setSearchTerm] = useState('');
  const [showSidebar, setShowSidebar] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [paginationModel, setPaginationModel] = useState({
    pageSize: 5,
    page: 0,
  });
  const [loading, setLoading] = useState(false);
  const [brandLoading, setBrandLoading] = useState(false);
  const isInitialLoad = useRef(true);
  const isInitialLoad1 = useRef(true);
  
  // For accessing route parameters and state
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  // Get the selectedBrandId from state or from URL parameter
  const selectedBrandId = location.state?.selectedBrandId || id;

  // State for categories
  const [brands, setBrands] = useState([]);
  
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

  // Fetch brand list data
    useEffect(() => {
      const fetchBrands = async () => {
        try {
          setLoading(true);
          const response = await brandService.getBrandList();
          if (response && response.data) {
            setBrands(response.data);
          }
        } catch (error) {
          if (isInitialLoad.current) {
            console.error('Error fetching brands:', error);
            notifyError('Failed to load brands');
            isInitialLoad.current = false
          }
        } finally {
          setLoading(false);
        }
      };
  
      fetchBrands();
    }, []);

  // Fetch selected brand by ID when selectedBrandId changes
  useEffect(() => {
    const fetchBrandById = async (id) => {
      if (!id) return;
          
      try {
        setBrandLoading(true);
        const response = await brandService.getById(id);
        if (response && response.data) {
          setSelectedBrand(response.data);
        } else {
          notifyWarning('Brand not found');
        }
      } catch (error) {
          if (isInitialLoad1.current) {
            console.error('Error fetching brand details:', error);
            notifyError('Failed to load brand details');
            isInitialLoad1.current = false;
          }
        
      } finally {
        setBrandLoading(false);
      }
    };
    
    if (selectedBrandId) {
      fetchBrandById(selectedBrandId);
    } else if (brands.length > 0 && !selectedBrand) {
      // Default to first brand if none selected
      handleBrandSelect(brands[0]);
    }
  }, [selectedBrandId, brands]);

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

  // Handle brand selection and update URL
  const handleBrandSelect = (brand) => {
    navigate(`/brandView/${brand.brandId}`, { 
      state: { selectedBrandId: brand.brandId },
      replace: true 
    });
    // The useEffect hook with selectedBrandId dependency will trigger
    // the API call to fetch the brand details
  };

  // Filter categories based on search term
  const filteredBrands = searchTerm.trim() === '' 
    ? brands 
    : brands.filter(brand => 
        brand.brandName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        brand.brandCountry?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        brand.brandDescription?.toLowerCase().includes(searchTerm.toLowerCase())
      );

    // Material columns setup
    const getMaterialColumns = () => {
      // Base columns
      const columns = [
        { 
          field: 'name', 
          headerName: 'Name', 
          flex: 1,
          minWidth: 180,
          renderCell: (params) => (
            <div className="flex items-center mt-2">
              <div className={`w-2 h-2 rounded-full mr-2 ${params.row.isActive ? 'bg-green-500' : 'bg-red-500'}`}></div>
              {params.row.image && (
                <div>
                  <img
                    alt={`${params.row.name} logo`}
                    src={params.row.image}
                    className="size-10 border-2 border-slate-300 mr-2"
                  />
                </div>
              )}
              <div className="text-sm font-medium text-gray-900">{params.row.name}</div>
            </div>
          ),
          headerAlign: 'left',
          align: 'left',
          headerClassName: 'name-column-header',
        },
        { 
          field: 'sku', 
          headerName: 'SKU', 
          flex: 0.7,
          minWidth: 120,
          headerAlign: 'left',
          align: 'left'
        },
      ];
      
      // Add additional columns for larger screens
      if (!isMobile) {
        columns.push(
          { 
            field: 'description', 
            headerName: 'Description', 
            flex: 1,
            minWidth: 200,
            headerAlign: 'left',
            align: 'left'
          },
          { 
            field: 'inStock', 
            headerName: 'In Stock', 
            flex: 0.5,
            minWidth: 100,
            headerAlign: 'left',
            align: 'left'
          },
          { 
            field: 'price', 
            headerName: 'Price', 
            flex: 0.5,
            minWidth: 100,
            headerAlign: 'left',
            align: 'left',
            renderCell: (params) => (
              <span>{params.value?.toFixed(2) || '0.00'}</span>
            )
          }
        );
      }
      return columns;
    };

  // Handle back to categories
  const handleBackToBrands = () => {
    navigate('/brand');
  };

  const handleEditToBrand = () => {
    navigate(`/editBrand/${selectedBrandId}`);
  };

  const handleDeleteBrand = async () => {
      if (!selectedBrandId) return;
  
      try {
        setLoading(true);
        await brandService.delete(selectedBrandId);
        notifySuccess(`Brand "${ selectedBrand.brand }" successfully deleted`);
        
        // After deletion, navigate back to categories list
        navigate('/brand');
      } catch (error) {
        notifyError(`Error deleting brand: ${error.message || 'Unknown error'}`);
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
          {/* Brand Name Panel */}
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

            {/* Brand List */}
            <div className="flex-1 overflow-y-auto p-2">
              {loading ? (
                <div className="flex justify-center items-center h-32">
                  <InlineLoader/>
                </div>
              ) : filteredBrands.length > 0 ? (
                filteredBrands.map((brand) => (
                  <div 
                    key={brand.brandId}
                    onClick={() => handleBrandSelect(brand)}
                    className={`p-1 mb-2 cursor-pointer ${selectedBrandId == brand.brandId ? 'bg-blue-100' : 'hover:bg-gray-100'}`}
                  >
                      <div className="flex flex-wrap gap-1">
                      {loading ? (
                        <ImageLoader/>
                      ):(
                        <img
                          alt={`${brand.brandName} logo`}
                          src={`http://localhost:8080/api/synexis/brand/image/${brand.brandId}`}
                          className="size-9 my-1 border-2 border-slate-300"
                        />
                      )}
                        <span className='text-sm mx-3 my-2'>{brand.brandName}</span>
                      </div>
                    
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-gray-500">
                  No brands found
                </div>
              )}
            </div>
          </div>
          {/* Content Area */}
          <div className="flex-1 p-6 overflow-auto">
            {selectedBrand ? (
              <div className="w-full">
                <div className="flex justify-between items-center mb-4">
                  <h1 className="text-xl font-semibold">
                    {selectedBrand.brandName}
                  </h1>
                  <div className="flex gap-4 text-[#3B50DF]">
                    <div 
                      className="bg-gray-100 rounded cursor-pointer" 
                      title="Edit Brand"
                      onClick={handleEditToBrand}
                    >
                      <FaEdit size={18}/>
                    </div>
                    <div 
                      className="bg-gray-100 rounded cursor-pointer" 
                      title="Delete Brand"
                      onClick={handleDeleteBrand}
                    >
                      <MdDelete size={18} />
                    </div>
                    <div 
                      className="bg-gray-100 rounded cursor-pointer" 
                      title="Close/Back to brands"
                      onClick={handleBackToBrands}
                    >
                      <MdOutlineClose size={18} />
                    </div>
                  </div>
                </div>

                {/* Brand Content with Loading State */}
                {brandLoading ? (
                  <div className="flex items-center justify-center h-40">
                    <InlineLoader />
                  </div>
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
                    <div className="p-6">
                      {activeTab === 'overview' ? (
                        <div>
                          {/* General Information */}
                          <div className="flex gap-20 mb-8">
                            <div className=''>
                              <h2 className="text-lg font-medium mb-4">General Information</h2>
                              <div className="space-y-3">
                                <div className="flex">
                                  <span className="w-32 text-gray-400">Name</span>
                                  <span>{selectedBrand.brandName}</span>
                                </div>
                                <div className="flex">
                                  <span className="w-32 text-gray-400">Order ID</span>
                                  <span>{selectedBrand.brandId}</span>
                                </div>
                                <div className="flex">
                                  <span className="w-32 text-gray-400">Country</span>
                                  <span>{selectedBrand.brandCountry}</span>
                                </div>
                                <div className="flex">
                                  <span className="w-32 text-gray-400">Status</span>
                                  <span>{selectedBrand.brandStatus?.toLowerCase()}</span>
                                </div>
                                <div className="flex">
                                  <span className="w-32 text-gray-400">Description</span>
                                  <span>{selectedBrand.brandDescription || 'No description available'}</span>
                                </div>
                                <div className="flex">
                                  <span className="w-32 text-gray-400">Web site URL</span>
                                  <span>{selectedBrand.brandWebsite || 'No website available'}</span>
                                </div>
                              </div>
                            </div>

                            {/* Brand image */}
                            <div className='ml-[100px] p-5'>
                              <div className='bg-blue-50 rounded-md p-4 flex flex-col items-center'>
                                <div className="w-[200px] h-[] bg-black flex items-center justify-center mb-3">
                                  <img 
                                    src={`http://localhost:8080/api/synexis/brand/image/${selectedBrand.brandId}`} 
                                    alt="Preview" 
                                    className="size-30 object-contain"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Materials Section - Only show if materials exist */}
                          {selectedBrand.materials && selectedBrand.materials.length > 0 ? (
                            <div>
                              <div className="flex justify-between items-center mb-4">
                                <h2 className="text-lg font-medium">Materials</h2>
                              </div>
                              
                              {/* DataGrid with ThemeProvider */}
                              <div className="w-full overflow-x-auto">
                                <ThemeProvider theme={customTheme}>
                                  <DataGrid 
                                    rows={selectedBrand.materials} 
                                    columns={getMaterialColumns()} 
                                    pagination
                                    paginationModel={paginationModel}
                                    onPaginationModelChange={setPaginationModel}
                                    pageSizeOptions={[5]}
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
                                      '& .name-column-header .MuiDataGrid-columnHeaderTitleContainer': {
                                        paddingLeft: '15px',
                                        fontWeight: '600',
                                      },
                                      // Responsive font sizes
                                      fontSize: isMobile ? '0.8rem' : '0.875rem',
                                    }}
                                  />
                                </ThemeProvider>
                              </div>
                            </div>
                          ) : (
                            <div className="text-center py-6 bg-gray-50 rounded-lg">
                              <p className="text-gray-500">No materials associated with this brand</p>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div>
                          <h2 className="text-lg font-semibold mb-4">Activity Log</h2>
                          <div className="space-y-4">
                            <div className="border-l-2 border-blue-500 pl-4 py-2">
                              <p className="text-sm text-gray-500">10 April 2025 09:23</p>
                              <p>Category created by Steve Johns</p>
                            </div>
                            <div className="border-l-2 border-blue-500 pl-4 py-2">
                              <p className="text-sm text-gray-500">10 April 2025 09:25</p>
                              <p>Materials added by Steve Johns</p>
                            </div>
                          </div>
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
                    <ContentLoader size={10} borderWidth={3} color="#3C50E0" />
                  </div>
                ) : (
                  <div className="text-gray-500">Select a brand to view details</div>
                )}
              </div>
            )}
          </div>
          
        </div>


      </div>

    </div>
  )
}

export default BrandView