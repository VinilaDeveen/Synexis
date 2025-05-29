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
import { useParams, useNavigate } from 'react-router-dom';
import { FaEdit, FaEye, FaFilePdf } from "react-icons/fa";
import { BiSolidDuplicate } from "react-icons/bi";
import { LuHistory } from "react-icons/lu";
import { Search, Plus, Menu, ArrowLeft, File } from 'lucide-react';
import { DataGrid } from '@mui/x-data-grid';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { ToastContainer } from 'react-toastify';
import { useNotification } from '../hooks/useNotification';
import { costEstimationService } from '../services/costEstimationService';
import { recentActivityService } from '../services/recentActivityService';

const CostEstimationPage = () => {
  const { notifySuccess, notifyError, notifyWarning, notifyDefault } = useNotification();
  const [costEstimations, setCostEstimations] = useState({
    inquiryId: null,
    quotationNumber: '',
    estimations: []
  });

  const [quotationDetails, setQuotationDetails] = useState(null);
  const { inquiryId } = useParams();
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
          const response = await recentActivityService.getAllCostEstimationActivity();
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
  
  // Fetch cost estimations for this inquiry from API
  useEffect(() => {
    const fetchCostEstimations = async () => {
      try {
        setLoading(true);
        
        // In a real implementation, this would be:
        /*const quotationResponse = await costEstimationService.getQuotationDetails(inquiryId);
        if (quotationResponse && quotationResponse.data) {
          setQuotationDetails(quotationResponse.data);
        }*/
        
        const costEstimationsResponse = await costEstimationService.getAllByInquiryId(inquiryId);
        if (costEstimationsResponse && costEstimationsResponse.data) {
         setCostEstimations(costEstimationsResponse.data);
        }
        setLoading(false);
      } catch (error) {
        if (isInitialLoad.current) {
          console.error('Error fetching cost estimations:', error);
          notifyError(`Failed to load cost estimations: ${error.message || 'Unknown error'}`);
          isInitialLoad.current = false;
        }
        setLoading(false);
      }
    };

    // Fetch the cost estimations
    fetchCostEstimations();
  }, [inquiryId]); // eslint-disable-line react-hooks/exhaustive-deps

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

 //complete handleAddVersion logic edit view

  const handleAddVersion = (id) => {
    console.log("Add version clicked");
    navigate(`/estimation/createCostEstimation/${inquiryId}/${id}`);
    notifySuccess('Creating new cost estimation version');
  };

  const handleAddQuotation = () => {
    console.log("Add quotation clicked");
    navigate(`/estimation/addCostEstimation/${inquiryId}`);
    notifySuccess('Creating new cost estimation version');
  };

  const handleEditEstimation = (id) => {
    navigate(`/estimation/editCostEstimation/${inquiryId}/${id}`);
    console.log(`Edit cost estimation ${id} clicked`);
  };
  
  const handleViewEstimation = (id) => {
    console.log(`View cost estimation ${id} clicked`);
    navigate(`/estimation/costEstimationView/${inquiryId}/${id}`);
  };

  const handleExportPDF = (id) => {
    console.log(`Export PDF for cost estimation ${id} clicked`);
    notifySuccess(`Exporting cost estimation #${id} as PDF`);
  };

  const handleJobRegistration = (id) => {
    console.log(`Job registration for cost estimation ${id} clicked`);
    navigate(`/jobRegistration/${id}`);
    notifySuccess(`Proceeding to job registration for accepted quotation #${id}`);
  };
  
  // Custom render cell for estimation status
  const renderStatusCell = (params) => {
    const status = params.value;
    let statusColor = '';
    let bgColor = '';
    
    switch(status) {
      case 'ACCEPTED':
        statusColor = 'text-green-700';
        bgColor = 'bg-green-100';
        break;
      case 'SUBMITTED':
        statusColor = 'text-blue-700';
        bgColor = 'bg-blue-100';
        break;
      case 'DRAFT':
        statusColor = 'text-yellow-700';
        bgColor = 'bg-yellow-100';
        break;
      case 'REJECTED':
        statusColor = 'text-red-700';
        bgColor = 'bg-red-100';
        break;
      default:
        statusColor = 'text-gray-700';
        bgColor = 'bg-gray-100';
    }
    
    return (
      <div className={`inline-block ml-12 px-2 py-1 rounded-full ${statusColor} ${bgColor} text-xs font-medium`}>
        {status}
      </div>
    );
  };
  
  // Custom render component for actions
  const renderActionsCell = (params) => {
    return (
      <div className="flex mt-2 gap-2 items-center">
        
        {/* View button - shown for all statuses */}
        <div 
          className="text-[#3B50DF] hover:text-green-500 cursor-pointer"
          onClick={() => handleViewEstimation(params.id)}
          title="View Cost Estimation Details"
        >
          <FaEye size={isMobile ? 16 : 18} />
        </div>
        
        {/* Export PDF button - shown for all statuses */}
        <div 
          className="text-[#3B50DF] hover:text-orange-500 cursor-pointer"
          onClick={() => handleAddVersion(params.id)}
          title="Duplicate New Vesion"
        >
          <BiSolidDuplicate size={isMobile ? 16 : 18} />
        </div>

        {/* Edit button - only shown for Draft status */}
        {params.row.status === 'DRAFT' && (
          <div 
            className="text-[#3B50DF] hover:text-blue-900 cursor-pointer"
            onClick={() => handleEditEstimation(params.id)}
            title="Edit Cost Estimation"
          >
            <FaEdit size={isMobile ? 16 : 18} />
          </div>
        )}
        
        {/* Job Registration button - only shown for Accepted status */}
        {params.row.status === 'ACCEPTED' && (
          <button
            onClick={() => handleJobRegistration(params.id)}
            className="ml-2 bg-[#3C50E0] hover:bg-green-600 text-white text-xs px-2 py-1 rounded-lg text-center"
            title="Register as Job"
          >
            Job Registration
          </button>
        )}
      </div>
    );
  };
  
  // Responsive columns setup
  const getColumns = () => {
    // Base columns that always show
    const baseColumns = [
      { 
        field: 'quotationNumber', 
        headerName: 'Quotation Version', 
        flex: 1,
        minWidth: 180,
        headerAlign: 'left',
        align: 'left',
      },
      { 
        field: 'date', 
        headerName: 'Date', 
        width: 180,
        headerAlign: 'left',
        align: 'left'
      },
      { 
        field: 'actions', 
        headerName: 'Actions', 
        width: 220, 
        renderCell: renderActionsCell,
        sortable: false,
        filterable: false,
        headerAlign: 'left',
        align: 'left'
      },
    ];
    
    // Additional columns for larger screens
    const additionalColumns = [
      { 
        field: 'status', 
        headerName: 'Status', 
        width: 180,
        renderCell: renderStatusCell,
        headerAlign: 'center',
        align: 'left'
      }
    ];
    
    return isMobile ? baseColumns : [...baseColumns.slice(0, 1), ...additionalColumns, baseColumns[1], baseColumns[2]];
  };
  
  // Filter cost estimations based on search term
  const filteredEstimations = searchTerm.trim() === '' 
    ? costEstimations 
    : costEstimations.filter(est => 
        (est.quotationNumber && est.quotationNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (est.status && est.status.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (est.date && est.date.toLowerCase().includes(searchTerm.toLowerCase()))
      );
  
  // Prepare data for DataGrid with ID as is from data
  const rows = filteredEstimations.estimations.map(est => ({
    id: est.estimationId, 
    quotationNumber: est.quotationVersion,
    status: est.estimationStatus,
    date: est.lastModifiedDate,
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
          
          {/* Header with Back Button */}
          <div className="flex items-center mb-4 pl-2">
            <h1 className="text-xl md:text-2xl font-semibold">
              Cost Estimation {quotationDetails && 
                <span className="text-gray-600 text-sm font-normal">
                  [{quotationDetails.quotationNumber}]
                </span>
              }
            </h1>
          </div>

          {/* Cost Estimation Versions Table Card */}
          <div className="bg-white rounded-lg shadow">
            {/* Search and Add Version */}
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
                onClick={handleAddQuotation}
                className="bg-[#3C50E0] hover:bg-blue-700 text-white px-3 py-2 text-sm rounded-lg flex items-center justify-center sm:justify-start gap-2 focus:outline-none"
              >
                <Plus size={16} />
                <span>Add Quotation</span>
              </button>
            </div>
            <hr />

            {/* DataGrid with ThemeProvider */}
            <div className="w-full p-2 md:p-4 overflow-x-auto">
              <ThemeProvider theme={customTheme}>
                <DataGrid 
                  rows={rows} 
                  columns={getColumns()} 
                  getRowId={(row) => row.id || row.estimationId }
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

      {/* Recent Activities Panel - Always render but control visibility with prop */}
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

export default CostEstimationPage;