import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import RecentActivities from '../components/RecentActivity';
import { 
  FullPageLoader, 
  InlineLoader, 
  ButtonLoader,
  ContentLoader 
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
import { unitService } from '../services/unitService';
import { recentActivityService } from '../services/recentActivityService';

const UnitPage = () => {
  const { notifySuccess, notifyError, notifyWarning, notifyDefault } = useNotification();
  const [units, setUnits] = useState([]);
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
  const [loading, setLoading] = useState(true); // Start with loading true
  const isInitialLoad = useRef(true);

  // Fetch recent activities from API
  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setLoading(true);
        const response = await recentActivityService.getAllUnitActivity();
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
  
  // Fetch units from API
  useEffect(() => {
    const fetchUnits = async () => {
      try {
        setLoading(true);
        const response = await unitService.getAll();
        if (response && response.data) {
          setUnits(response.data);
        }
      } catch (error) {
        if (isInitialLoad.current) {
          console.error('Error fetching units:', error);
          notifyError(`Failed to load units: ${error.message || 'Unknown error'}`);
          isInitialLoad.current = false;
        }
      } finally {
        setLoading(false);
      }
    };

    // Fetch the units
    fetchUnits();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
  
  // Close recent activities panel
  const closeActivitiesPanel = () => {
    setShowActivities(false);
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
              padding: '8px 16px',
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
  
  const handleAddUnit = () => {
    notifySuccess('Add unit dialog opened');
    // Navigate to add unit page
    navigate('/addunit');
  };

  const handleEditUnit = (id) => {
    navigate(`/editunit/${id}`);
  };

  const handleViewUnit = (id) => {
    navigate(`/unitView/${id}`, { state: { selectedUnitId: id } });
  };

  const handleDeleteUnit = async (id) => {
    try {
      // Find the unit being deleted
      const unitToDelete = units.find(unit => unit.unitId === id);
      const unitName = unitToDelete ? unitToDelete.unitName : 'Unknown';
      
      // Call API service for deletion
      const response = await unitService.delete(id);
      
      if (response && response.success) {
        notifySuccess(`Unit "${unitName}" successfully deleted`);
        // Update local state to reflect the deletion
        setUnits(units.filter(unit => unit.unitId !== id));
      } else {
        notifyError('Failed to delete unit');
      }
    } catch (error) {
      notifyError(`Error deleting unit: ${error.message || 'Unknown error'}`);
    }
  };
  
  // Render status indicator for unit name cell
  const renderNameCell = (params) => {
    const isActive = params.row.status === 'ACTIVE';
    
    return (
      <div className="flex items-center">
        <div className={`w-2 h-2 rounded-full mr-2 ${isActive ? 'bg-green-500' : 'bg-red-500'}`}></div>
        <div>
          {params.value}
        </div>
      </div>
    );
  };
  
  // Render actions cell
  const renderActionsCell = (params) => {
    return (
      <div className="flex gap-2 md:gap-4 mt-2">
        <div 
          className="text-[#3B50DF] hover:text-blue-900 cursor-pointer"
          onClick={() => handleEditUnit(params.id)}
          title="Edit Unit"
        >
          <FaEdit size={isMobile ? 16 : 18} />
        </div>
        <div 
          className="text-[#3B50DF] hover:text-red-500 cursor-pointer"
          onClick={() => handleDeleteUnit(params.id)}
          title="Delete Unit"
        >
          <MdDelete size={isMobile ? 16 : 18} />
        </div>
        <div 
          className="text-[#3B50DF] hover:text-green-500 cursor-pointer"
          title="View Unit Details"
          onClick={() => handleViewUnit(params.id)}
        >
          <FaEye size={isMobile ? 16 : 18} />
        </div>
      </div>
    );
  };
  
  // Render boolean values as Yes/No
  const renderBooleanCell = (params) => {
    return params.value ? 'Yes' : 'No';
  };
  
  // Responsive columns setup
  const getColumns = () => {
    // Base columns for all screen sizes
    const baseColumns = [
      { 
        field: 'unitName', 
        headerName: 'Unit Name', 
        flex: 1,
        minWidth: 150,
        renderCell: renderNameCell,
      },
      { 
        field: 'shortName', 
        headerName: 'Short Name', 
        flex: 1,
        minWidth: 120,
      },
      { 
        field: 'allowDecimal', 
        headerName: 'Allow Decimal', 
        flex: 1,
        minWidth: 120,
        renderCell: renderBooleanCell,
      },
    ];
    
    // Additional columns for larger screens
    const additionalColumns = [
      { 
        field: 'materials', 
        headerName: 'Materials', 
        flex: 0.5,
        minWidth: 100,
        align: 'center',
        headerAlign: 'center',
      }
    ];
    
    // Actions column
    const actionsColumn = [
      { 
        field: 'actions', 
        headerName: 'Actions', 
        width: 140, 
        renderCell: renderActionsCell,
        sortable: false,
        filterable: false,
      }
    ];
    
    // Return different columns based on screen size
    return isMobile 
      ? [...baseColumns, ...actionsColumn] 
      : [...baseColumns, ...additionalColumns, ...actionsColumn];
  };
  
  // Filter units based on search term
  const filteredUnits = searchTerm.trim() === '' 
    ? units 
    : units.filter(unit => 
        (unit.unitName && unit.unitName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (unit.unitShortName && unit.unitShortName.toLowerCase().includes(searchTerm.toLowerCase()))
      );
  
  // Prepare data for DataGrid
  const rows = filteredUnits.map(unit => ({
    id: unit.unitId,
    unitName: unit.unitName,
    shortName: unit.unitShortName,
    allowDecimal: unit.unitAllowDecimal,
    status: unit.unitStatus,
    materials: unit.materialCount,
    actions: unit.unitId
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
          <h1 className="text-xl md:text-2xl font-semibold mb-2 md:mb-4 pl-2">Unit of Measurement</h1>

          {/* Unit Table Card */}
          <div className="bg-white rounded-lg shadow">
            {/* Search and Add Unit */}
            <div className="p-3 md:p-4 flex flex-col sm:flex-row sm:justify-between gap-3 sm:gap-0">
              <div className="flex items-center w-full sm:w-auto">
                <div 
                  onClick={toggleActivitiesPanel}
                  className="cursor-pointer relative"
                  title="Recent Activities"
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
                onClick={handleAddUnit}
                className="bg-[#3C50E0] hover:bg-blue-700 text-white px-3 py-2 text-sm rounded-lg flex items-center justify-center sm:justify-start gap-2 focus:outline-none"
              >
                <Plus size={16} />
                <span>Add Unit</span>
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
                  onPaginationModelChange={(model) => {
                    setPaginationModel(model);
                  }}
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

export default UnitPage;