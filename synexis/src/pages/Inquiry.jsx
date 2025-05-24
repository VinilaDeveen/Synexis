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
import { inquiryService } from '../services/inquiryService';
import { recentActivityService } from '../services/recentActivityService';

const InquiryPage = () => {
  const { notifySuccess, notifyError, notifyWarning, notifyDefault } = useNotification();
  const [inquiries, setInquiries] = useState([]);
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
          const response = await recentActivityService.getAllInquiryActivity();
          if (response && response.data) {
            setRecentActivities(response.data);
          }
        } catch (error) {
          if (isInitialLoad.current){
            console.error('Error fetching activities:', error);
            notifyError(`Failed to load recent activities: ${error.message || 'Unknown error'}`);
            isInitialLoad.current = false;
          }
        } finally {
          setLoading(false);
        }
      };
  
      // Fetch the activities
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
  
  // Fetch inquiries from API
  useEffect(() => {
    const fetchInquiries = async () => {
      try {
        setLoading(true);
        const response = await inquiryService.getAll();
        if (response && response.data) {
           setInquiries(response.data);
           setLoading(false);
        }
      } catch (error) {
        if (isInitialLoad.current) {
          console.error('Error fetching inquiries:', error);
          notifyError(`Failed to load inquiries: ${error.message || 'Unknown error'}`);
          isInitialLoad.current = false;
        }
        setLoading(false);
      }
    };

    // Fetch the inquiries
    fetchInquiries();
  }, []); 
 
  if (loading) {
    return <FullPageLoader />;
  }

  // Toggle sidebar
  const toggleSidebar = () => {
    setShowSidebar(!showSidebar);
    notifyDefault(showSidebar ? "Sidebar hidden" : "Sidebar visible");
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

  const handleEditInquiry = (id) => {
    navigate(`/editinquiry/${id}`);
    notifyDefault(`Editing inquiry #${id}`);
  };

  const handleDeleteInquiry = (id) => {
    try {
      // Find the inquiry being deleted
      const inquiryToDelete = inquiries.find(inq => inq.inquiryId === id);
      const inquiryNumber = inquiryToDelete ? inquiryToDelete.quotationNumber : 'Unknown';
      
      // In a real app, this would call an API
      inquiryService.delete(id);
      
      // Update local state to remove the deleted inquiry
      setInquiries(inquiries.filter(inq => inq.inquiryId !== id));
      
      notifySuccess(`Inquiry "${inquiryNumber}" successfully deleted`);
    } catch (error) {
      notifyError(`Error deleting inquiry: ${error.message || 'Unknown error'}`);
    }
  };
  
  const handleViewInquiry = (id) => {
    notifyDefault(`Viewing inquiry #${id}`);
  };

  const handleCostEstimation = (id) => {
    navigate(`/costEstimation/${id}`);
    notifyDefault(`Preparing cost estimation for inquiry #${id}`);
  };

  // Custom render component for quotation number with status
  const renderQuotationNumberCell = (params) => {
    const inquiry = inquiries.find(inq => inq.inquiryId === params.row.id) || {};
    const status = inquiry.inquiryStatus;
    const quotationNumber = params.value;

    // Determine status color based on inquiry status
    const getStatusColor = (status) => {
      switch (status?.toUpperCase()) {
        case 'ACTIVE':
        case 'APPROVED':
        case 'COMPLETED':
          return 'bg-green-500';
        case 'PENDING':
        case 'IN_PROGRESS':
          return 'bg-yellow-500';
        case 'REJECTED':
        case 'CANCELLED':
          return 'bg-red-500';
        case 'DRAFT':
          return 'bg-gray-500';
        default:
          return 'bg-blue-500';
      }
    };

    return (
      <div className="flex items-center mt-4">
        <div className={`w-2 h-2 rounded-full mr-2 ${getStatusColor(status)}`}></div>
        <span className="text-black text-sm">{quotationNumber}</span>
      </div>
    );
  };
  
  // Custom render component for actions
  const renderActionsCell = (params) => {
    return (
      <div className="flex mt-2 gap-2 items-center">
        <div 
          className="text-[#3B50DF] hover:text-blue-900 cursor-pointer"
          onClick={() => handleEditInquiry(params.id)}
          title="Edit Inquiry"
        >
          <FaEdit size={isMobile ? 16 : 18} />
        </div>
        <div 
          className="text-[#3B50DF] hover:text-red-500 cursor-pointer"
          onClick={() => handleDeleteInquiry(params.id)}
          title="Delete Inquiry"
        >
          <MdDelete size={isMobile ? 16 : 18} />
        </div>
        <Link 
          to={`/inquiryView/${params.id}`} 
          state={{ selectedInquiryId: params.id }}
        >
          <div 
            className="text-[#3B50DF] hover:text-green-500 cursor-pointer"
            title="View Inquiry Details"
            onClick={() => handleViewInquiry(params.id)}
          >
            <FaEye size={isMobile ? 16 : 18} />
          </div>
        </Link>
        <button
          onClick={() => handleCostEstimation(params.id)}
          className="ml-2 bg-[#3C50E0] hover:bg-blue-600 text-white text-xs px-2 py-1 rounded-lg text-center"
          title="Generate Cost Estimation"
        >
          Cost Estimation
        </button>
      </div>
    );
  };
  
  // Responsive columns setup
  const getColumns = () => {
    // Base columns that always show
    const baseColumns = [
      { 
        field: 'quotationNumber', 
        headerName: 'Quotation Number', 
        flex: 1,
        minWidth: 180,
        headerAlign: 'left',
        align: 'left',
        renderCell: renderQuotationNumberCell,
        headerClassName: 'quotation-column-header',
      },
      { 
        field: 'projectName', 
        headerName: 'Project Name', 
        flex: 1,
        minWidth: 200,
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
        field: 'customerName', 
        headerName: 'Customer', 
        flex: 1,
        minWidth: 180,
        headerAlign: 'left',
        align: 'left'
      }
    ];
    
    return isMobile ? baseColumns : [...baseColumns.slice(0, 1), ...additionalColumns, baseColumns[1], baseColumns[2]];
  };
  
  // Filter inquiries based on search term
  const filteredInquiries = searchTerm.trim() === '' 
    ? inquiries 
    : inquiries.filter(inquiry => 
        (inquiry.quotationNumber && inquiry.quotationNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (inquiry.projectName && inquiry.projectName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (inquiry.customerName && inquiry.customerName.toLowerCase().includes(searchTerm.toLowerCase()))
      );
  
  // Prepare data for DataGrid
  const rows = filteredInquiries.map(inquiry => ({
    id: inquiry.inquiryId,
    quotationNumber: inquiry.quotationNumber,
    projectName: inquiry.projectName,
    customerName: inquiry.customerName,
    status: inquiry.inquiryStatus,
    date: inquiry.projectReturnDate
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
          <h1 className="text-xl md:text-2xl font-semibold mb-2 md:mb-4 pl-2">Inquiries</h1>

          {/* Inquiry Table Card */}
          <div className="bg-white rounded-lg shadow">
            {/* Search and Add Inquiry */}
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
              <Link to="/addInquiry">
                <button 
                  className="bg-[#3C50E0] hover:bg-blue-700 text-white px-3 py-2 text-sm rounded-lg flex items-center justify-center sm:justify-start gap-2 focus:outline-none"
                >
                  <Plus size={16} />
                  <span>Add Inquiry</span>
                </button>
              </Link>
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
                    notifyDefault(`Page ${model.page + 1} loaded`);
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
                    '& .quotation-column-header .MuiDataGrid-columnHeaderTitleContainer': {
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

export default InquiryPage;