import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import RecentActivities from '../components/RecentActivity';
import { 
  FullPageLoader, 
  InlineLoader, 
  ButtonLoader,
  ContentLoader, 
  ImageLoader
} from '../components/loaders';
import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaEdit, FaEye } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { LuHistory } from "react-icons/lu";
import { Search, Plus, Menu } from 'lucide-react';
import { DataGrid } from '@mui/x-data-grid';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { ToastContainer } from 'react-toastify';
import { useNotification } from '../hooks/useNotification';
import { materialService } from '../services/materialService';
import { recentActivityService } from '../services/recentActivityService';

const MaterialPage = () => {
  const { notifySuccess, notifyError, notifyWarning, notifyDefault } = useNotification();
  const [materials, setMaterials] = useState([]);
  const navigate = useNavigate();
  
  // State for recent activities panel and sidebar visibility
  const [recentActivities, setRecentActivities] = useState('');
  const [showActivities, setShowActivities] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [paginationModel, setPaginationModel] = useState({
    pageSize: 5,
    page: 0,
  });

  const [loading, setLoading] = useState(true);
  const isInitialLoad = useRef(true);

  // Fetch recent activities from API
  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setLoading(true);
        const response = await recentActivityService.getAllMaterialActivity();
        if (response && response.data) {
          setRecentActivities(response.data);
        }
      } catch (error) {
        if (isInitialLoad.current){
          console.error('Error fetching categories:', error);
          notifyError(`Failed to load recent activities: ${error.message || 'Unknown error'}`);
          isInitialLoad.current = false;
        }
      } finally {
        setLoading(false);
      }
    };

    // Fetch the categories
    fetchActivities();
  }, []);

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

  // Fetch materials from API
  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        setLoading(true);
        // In a real app this would be an API call
        const response = await materialService.getAll();
        if (response && response.data) {
            setMaterials(response.data);
        }
        setLoading(false);
      } catch (error) {
        if (isInitialLoad.current){
          console.error('Error fetching materials:', error);
          notifyError(`Failed to load materials: ${error.message || 'Unknown error'}`);
          isInitialLoad.current = false;
        }
        setLoading(false);
      }
    };

    // Fetch the materials
    fetchMaterials();
  }, []);

  // We need to check loading state before returning the full component
  if (loading) {
    return <FullPageLoader />;
  }

  // Toggle sidebar
  const toggleSidebar = () => {
    setShowSidebar(!showSidebar);
  };

  // Toggle recent activities panel
  const toggleActivitiesPanel = () => {
    setShowActivities(!showActivities);
  };

  const closeActivitiesPanel = () => {
    setShowActivities(false);
  };

  // Define columns for the DataGrid
  const getColumns = () => {
    // Base columns that always show
    const baseColumns = [
      { 
        field: 'name', 
        headerName: 'Name', 
        flex: 0,
        width: 280,
        renderCell: renderNameCell,
        headerAlign: 'left',
        align: 'left',
        headerClassName: 'name-column-header',
      },
      { 
        field: 'actions', 
        headerName: 'Actions', 
        width: 120, 
        renderCell: renderActionsCell,
        sortable: false,
        filterable: false,
        headerAlign: 'left',
        align: 'left'
      },
    ];
    
    // Additional columns based on screen size
    const additionalColumns = [
      { 
        field: 'sku', 
        headerName: 'SKU', 
        width: 200,
        headerAlign: 'left',
        align: 'left'
      },
      { 
        field: 'description', 
        headerName: 'Description', 
        flex: 1,
        minWidth: 120,
        headerAlign: 'left',
        align: 'left'
      },
      { 
        field: 'stockLevel', // Changed from inStock to stockLevel to match data model
        headerName: 'In Stock', 
        width: 100,
        headerAlign: 'left',
        align: 'left'
      },
      { 
        field: 'costPrice',
        headerName: 'Price', 
        width: 120,
        headerAlign: 'left',
        align: 'left',
        renderCell: (params) => {
          const price = params.value || 0;
          return <span>LKR {price.toFixed(2)}</span>;
        }
      }
    ];
    
    return isMobile 
      ? [baseColumns[0], additionalColumns[0], additionalColumns[2], baseColumns[1]] 
      : [...baseColumns.slice(0, 1), ...additionalColumns, baseColumns[1]];
  };
  
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
  
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };
  
  const handleAddMaterial = () => {
    navigate('/addMaterial');
    notifyDefault('Add Material page coming soon');
  };

  const handleEditMaterial = (id) => {
    navigate(`/editMaterial/${id}`);
    notifyDefault(`Edit Material ID: ${id} page coming soon`);
  };

  const handleDeleteMaterial = (id) => {
    try {
      // Find the material being deleted
      const materialToDelete = materials.find(material => material.materialId === id);
      const materialName = materialToDelete?.name || 'Material';
      
      // Simulate API call for deletion
      // materialService.delete(id);
      notifySuccess(`Material "${materialName}" successfully deleted`);
    } catch (error) {
      notifyError(`Error deleting material: ${error.message || 'Unknown error'}`);
    }
  };

  const handleViewMaterial = (id) => {
    const material = materials.find(material => material.materialId === id);
    if (material) {
      const materialName = material.name;
      notifyDefault(`Viewing details for "${materialName}"`);
    } else {
      notifyWarning('View details functionality coming soon');
    }
  };

  // Custom render components for DataGrid
  // Fixed renderNameCell function
  const renderNameCell = (params) => {
    const material = materials.find(m => m.materialId === params.row.id) || {};
    const isActive = material.materialStatus === 'ACTIVE'; // Changed to check boolean instead of string
    const displayName = params.value; // Direct value is just the name

    return (
      <div className="flex items-center">
        <div className={`w-2 h-2 rounded-full mr-2 ${isActive ? 'bg-green-500' : 'bg-red-500'}`}></div>
        <div className="mr-2">
          {loading ? (
            <ImageLoader />
          ) : (
            <img
              alt={`${material.name} logo`}
              src={`http://localhost:8080/api/synexis/material/image/${material.materialId}`}
              className="size-10 border-2 border-slate-300"
            />
          )}
        </div>
        <div className={isMobile ? "block" : "hidden sm:block"}>
          <span className="text-black px-2 py-1 rounded-md mr-2 text-sm">{displayName}</span>
        </div>
      </div>
    );
  };
  
  // Custom render components for DataGrid
  const renderActionsCell = (params) => {
    return (
      <div className="flex gap-2 md:gap-4 mt-4">
        <div 
          className="text-[#3B50DF] hover:text-blue-900 cursor-pointer"
          onClick={() => handleEditMaterial(params.id)}
          title="Edit Material"
        >
          <FaEdit size={isMobile ? 16 : 18} />
        </div>
        <div 
          className="text-[#3B50DF] hover:text-red-500 cursor-pointer"
          onClick={() => handleDeleteMaterial(params.id)}
          title="Delete Material"
        >
          <MdDelete size={isMobile ? 16 : 18} />
        </div>
        <Link 
          to={`/materialView/${params.id}`} 
          state={{ selectedMaterialId: params.id }}
        >
          <div 
            className="text-[#3B50DF] hover:text-green-500 cursor-pointer"
            title="View Material Details"
            onClick={() => handleViewMaterial(params.id)}
          >
            <FaEye size={isMobile ? 16 : 18} />
          </div>
        </Link>
      </div>
    );
  };

  // Filter materials based on search term
  const filteredMaterials = searchTerm.trim() === '' 
    ? materials 
    : materials.filter(material => 
        material.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        material.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (material.description && material.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );

  // Prepare data for DataGrid - fixed to match actual data structure
  const rows = filteredMaterials.map(material => ({
    id: material.materialId,
    name: material.materialName,
    sku: material.materialSKU,
    description: material.materialDescription || '',
    stockLevel: material.materialStockLevel || 0,
    costPrice: material.materialPurchasePrice || 0,
    actions: material.materialId
  }));

  return (
    <div className="flex w-screen h-screen text-black bg-gray-100 overflow-hidden">
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

        {/* Content Area */}
        <div className="p-2 sm:p-4 md:p-6 flex-1 overflow-auto">
          {/* Toast notifications */}
          <ToastContainer className="mt-[70px]" />

          <h1 className="text-xl md:text-2xl font-semibold mb-2 md:mb-4 pl-2">Materials</h1>

          {/* Materials Table Card */}
          <div className="bg-white rounded-lg shadow">
            {/* Search and Add Material */}
            <div className="p-3 md:p-4 flex flex-col sm:flex-row sm:justify-between gap-3 sm:gap-0">
              <div className="flex items-center w-full sm:w-auto">
                <div 
                  onClick={toggleActivitiesPanel}
                  className="cursor-pointer relative"
                >
                  <LuHistory size={20} className="text-[#3B50DF]" />
                </div>
                <div className="relative ml-2 flex-1 sm:w-64 md:w-80">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search size={16} className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Type to search"
                    className="pl-10 bg-white w-full border-none pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    value={searchTerm}
                    onChange={handleSearchChange}
                  />
                </div>
              </div>
              <button 
                onClick={handleAddMaterial}
                className="bg-[#3C50E0] hover:bg-blue-700 text-white px-3 py-2 text-sm rounded-lg flex items-center justify-center sm:justify-start gap-2"
              >
                <Plus size={16} />
                <span>Add Material</span>
              </button>
            </div>
            <hr />

            {/* DataGrid with ThemeProvider */}
            <div className="w-full p-2 md:p-4 overflow-x-auto">
              <ThemeProvider theme={customTheme}>
                <DataGrid 
                  rows={rows} 
                  columns={getColumns()} 
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
        </div>
      </div>

      {/* Recent Activities Panel */}
      <RecentActivities
        isVisible={showActivities} 
        activities={recentActivities}
        onClose={closeActivitiesPanel}
      />
      
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

export default MaterialPage;