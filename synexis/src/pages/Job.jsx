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
import { MdDelete } from "react-icons/md";
import { FaEdit, FaEye } from "react-icons/fa";
import { LuHistory } from "react-icons/lu";
import { Search, Plus, Menu } from 'lucide-react';
import { DataGrid } from '@mui/x-data-grid';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { ToastContainer } from 'react-toastify';
import { useNotification } from '../hooks/useNotification';
import { jobService } from '../services/jobService';
import { recentActivityService } from '../services/recentActivityService';

const JobPage = () => {
  const { notifySuccess, notifyError, notifyWarning, notifyDefault } = useNotification();
  const [jobs, setJobs] = useState([]);
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

  // Fetch recent activities from API
    useEffect(() => {
      const fetchActivities = async () => {
        try {
          setLoading(true);
          const response = await recentActivityService.getAllJobActivity();
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
  
  // Fetch jobs from API
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        const response = await jobService.getAll();
        if (response && response.data) {
          setJobs(response.data);
        }
        setLoading(false);
      } catch (error) {
        if (isInitialLoad.current) {
          console.error('Error fetching jobs:', error);
          notifyError(`Failed to load jobs: ${error.message || 'Unknown error'}`);
          isInitialLoad.current = false;
        }
        setLoading(false);
      }
    };

    // Fetch the jobs
    fetchJobs();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // We need to check loading state before returning the full component
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
  
  const handleCreateJob = () => {
    console.log("Create job clicked");
    navigate('/addJob');
    notifySuccess('Create job form opened');
  };

  const handleEditJob = (id) => {
    navigate(`/editJob/${id}`);
    console.log(`Edit job ${id} clicked`);
    notifyDefault(`Editing job #${id}`);
  };

  const handleDeleteJob = (id) => {
    try {
      console.log(`Delete job ${id} clicked`);
      // Find the job being deleted
      const jobToDelete = jobs.find(job => job.jobId === id);
      const jobNumber = jobToDelete ? jobToDelete.quotationNumber : 'Unknown';
      
      // In a real app, this would call an API
      // jobService.delete(id);
      
      // Update local state to remove the deleted job
      setJobs(jobs.filter(job => job.jobId !== id));
      
      notifySuccess(`Job "${jobNumber}" successfully deleted`);
    } catch (error) {
      notifyError(`Error deleting job: ${error.message || 'Unknown error'}`);
    }
  };
  
  const handleViewJob = () => {
    navigate('/jobDash');
    notifyDefault(`Viewing `);
  };
  
  // Custom render cell for job status
  const renderStatusCell = (params) => {
    const status = params.value;
    let statusColor = '';
    let bgColor = '';
    
    switch(status) {
      case 'PENDING':
        statusColor = 'text-yellow-700';
        bgColor = 'bg-yellow-100';
        break;
      case 'APPROVED_BY_SALESMANAGER':
        statusColor = 'text-emerald-700';
        bgColor = 'bg-emerald-100';
        break;
      case 'APPROVED_BY_ACCOUNTANT':
        statusColor = 'text-green-700';
        bgColor = 'bg-green-100';
        break;
      case 'READY_FOR_PRODUCTION':
        statusColor = 'text-blue-700';
        bgColor = 'bg-blue-100';
        break;
      case 'ONGOING':
        statusColor = 'text-purple-700';
        bgColor = 'bg-purple-100';
        break;
      case 'BLOCKED':
        statusColor = 'text-red-700';
        bgColor = 'bg-red-100';
        break;
      case 'WAITING_FOR_MATERIALS':
        statusColor = 'text-orange-700';
        bgColor = 'bg-orange-100';
        break;
      case 'COMPLETED':
        statusColor = 'text-green-800';
        bgColor = 'bg-green-50';
        break;
      case 'CLOSED':
        statusColor = 'text-gray-700';
        bgColor = 'bg-gray-100';
        break;
      default:
        statusColor = 'text-gray-700';
        bgColor = 'bg-gray-100';
    }
    
    return (
      <div className={`inline-block ml-3 px-2 py-1 rounded-full ${statusColor} ${bgColor} text-xs font-medium`}>
        {status}
      </div>
    );
  };
  
  // Custom render component for actions
  const renderActionsCell = (params) => {
    return (
      <div className="flex mt-2 gap-3 items-center">
        <div 
          className="text-[#3B50DF] hover:text-blue-900 cursor-pointer"
          onClick={() => handleEditJob(params.id)}
          title="Edit Job"
        >
          <FaEdit size={isMobile ? 16 : 18} />
        </div>
        <div 
          className="text-[#3B50DF] hover:text-red-500 cursor-pointer"
          onClick={() => handleDeleteJob(params.id)}
          title="Delete Job"
        >
          <MdDelete size={isMobile ? 16 : 18} />
        </div>
        <div 
          className="text-[#3B50DF] hover:text-green-500 cursor-pointer"
          onClick={() => handleViewJob()}
          title="View Job Details"
        >
          <FaEye size={isMobile ? 16 : 18} />
        </div>
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
        field: 'actions', 
        headerName: 'Actions', 
        width: 120, 
        renderCell: renderActionsCell,
        sortable: false,
        filterable: false,
        headerAlign: 'left',
        align: 'left'
      }
    ];
    
    // Additional columns for larger screens
    const additionalColumns = [
      { 
        field: 'projectName', 
        headerName: 'Project Name', 
        flex: 1,
        minWidth: 150,
        headerAlign: 'left',
        align: 'left'
      },
      { 
        field: 'customerName', 
        headerName: 'Customer', 
        flex: 1,
        minWidth: 160,
        headerAlign: 'left',
        align: 'left'
      },
      {
        field: 'status',
        headerName: 'Job Status',
        width: 120,
        renderCell: renderStatusCell,
        headerAlign: 'center',
        align: 'left'
      },
      { 
        field: 'date', 
        headerName: 'Project Return Date', 
        flex: 1,
        minWidth: 150,
        headerAlign: 'left',
        align: 'left'
      },
    ];
    
    return isMobile ? baseColumns : [...baseColumns.slice(0, 1), ...additionalColumns, baseColumns[1]];
  };
  
  // Filter jobs based on search term
  const filteredJobs = searchTerm.trim() === '' 
    ? jobs 
    : jobs.filter(job => 
        (job.quotationNumber && job.quotationNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (job.projectName && job.projectName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (job.customerName && job.customerName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (job.status && job.status.toLowerCase().includes(searchTerm.toLowerCase()))
      );
  
  // Prepare data for DataGrid
  const rows = filteredJobs.map(job => ({
    id: job.jobId,
    quotationNumber: job.quotationVersion,
    projectName: job.projectName,
    customerName: job.customerName,
    status: job.jobStatus,
    date: job.jobReturnDate
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
          <h1 className="text-xl md:text-2xl font-semibold mb-2 md:mb-4 pl-2">Jobs</h1>

          {/* Job Table Card */}
          <div className="bg-white rounded-lg shadow">
            {/* Search and Create Job */}
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
                onClick={handleCreateJob}
                className="bg-[#3C50E0] hover:bg-blue-700 text-white px-3 py-2 text-sm rounded-lg flex items-center justify-center sm:justify-start gap-2 focus:outline-none"
              >
                <Plus size={16} />
                <span>Create Job</span>
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

export default JobPage;