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
import { customerService } from '../services/customerService';

const CustomerPage = () => {
  const { notifySuccess, notifyError, notifyWarning, notifyDefault } = useNotification();
  const [customers, setCustomers] = useState([]);
  const navigate = useNavigate();
  
  // State for recent activities panel and sidebar visibility
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
  
  // Check screen size and set mobile state - moved up to run first
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
  
  // Fetch customers from API
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setLoading(true);
        const response = await customerService.getAll();
        if (response && response.data) {
          setCustomers(response.data);
        }
      } catch (error) {
        if (isInitialLoad.current){
          console.error('Error fetching customers:', error);
          notifyError(`Failed to load customers: ${error.message || 'Unknown error'}`);
          isInitialLoad.current = false;
        }
      } finally {
        setLoading(false);
      }
    };

    // Fetch the customers
    fetchCustomers();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // We need to check loading state before returning the full component
  if (loading) {
    return <FullPageLoader />;
  }

  // Toggle sidebar
  const toggleSidebar = () => {
    setShowSidebar(!showSidebar);
  };
  
  // Recent activities data
  const recentActivities = [
    { item: "Mr. Perera", action: "created by", user: "Steve Johns", date: "10 April 2025 09:23" },
    { item: "Mr. Silva", action: "updated by", user: "Jane Doe", date: "10 April 2025 08:15" },
  ];
  
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

  const handleEditCustomer = (id) => {
    navigate(`/editCustomer/${id}`);
  };

  const handleViewCustomer = (id) => {
    navigate(`/customerView/${id}`);
  };

  const handleDeleteCustomer = (id) => {
    try {
      // Find the customer being deleted
      const customerToDelete = customers.find(customer => customer.customerId === id);
      const customerName = customerToDelete ? customerToDelete.name || customerToDelete.customerName : 'Unknown';
      
      // Simulate API call for deletion
      customerService.delete(id);
      notifySuccess(`Customer "${customerName}" successfully deleted`);
    } catch (error) {
      notifyError(`Error deleting customer: ${error.message || 'Unknown error'}`);
    }
  };
  
  // Custom render components for DataGrid - moved up before they're used
  const renderNameCell = (params) => {
    const customer = params.value;
    const customerStatus = params.row.status;
    const isActive = customerStatus === 'ACTIVE';
    
    return (
      <div className="flex items-center">
        <div className={`w-2 h-2 rounded-full mr-2 ${isActive ? 'bg-green-500' : 'bg-red-500'}`}></div>
        <div>
          <span className="font-medium text-gray-900">
            {customer}
          </span>
        </div>
      </div>
    );
  };

  const renderPhoneCell = (params) => {
    return (
      <div className="text-gray-700">
        {params.value || 'N/A'}
      </div>
    );
  };

  const renderEmailCell = (params) => {
    return (
      <div className="text-gray-700">
        {params.value || 'N/A'}
      </div>
    );
  };
  
  const renderActionsCell = (params) => {
    return (
      <div className="flex gap-2 md:gap-6 mt-4">
        <div 
          className="text-[#3B50DF] hover:text-blue-900 cursor-pointer"
          onClick={() => handleEditCustomer(params.id)}
          title="Edit Customer"
        >
          <FaEdit size={isMobile ? 16 : 18} />
        </div>
        <div 
          className="text-[#3B50DF] hover:text-red-500 cursor-pointer"
          onClick={() => handleDeleteCustomer(params.id)}
          title="Delete Customer"
        >
          <MdDelete size={isMobile ? 16 : 18} />
        </div>
        <Link 
          to={`/customerView/${params.id}`} 
          state={{ selectedCustomerId: params.id }}
        >
          <div 
            className="text-[#3B50DF] hover:text-green-500 cursor-pointer"
            title="View Customer Details"
            onClick={() => handleViewCustomer(params.id)}
          >
            <FaEye size={isMobile ? 16 : 18} />
          </div>
        </Link>
      </div>
    );
  };
  
  // Responsive columns setup
  const getColumns = () => {
    // Base columns that always show
    const baseColumns = [
      { 
        field: 'name', 
        headerName: 'Name', 
        flex: 1,
        minWidth: 150,
        renderCell: renderNameCell,
        headerAlign: 'left',
        align: 'left',
        headerClassName: 'name-column-header',
      },
      { 
        field: 'actions', 
        headerName: 'Actions', 
        width: 150, 
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
        field: 'phone', 
        headerName: 'Phone Number', 
        flex: 0.8,
        minWidth: 120,
        renderCell: renderPhoneCell,
        headerAlign: 'left',
        align: 'left'
      },
      { 
        field: 'email', 
        headerName: 'Email', 
        flex: 1,
        minWidth: 180,
        renderCell: renderEmailCell,
        headerAlign: 'left',
        align: 'left'
      }
    ];
    
    return isMobile ? baseColumns : [...baseColumns.slice(0, 1), ...additionalColumns, baseColumns[1]];
  };
  
  // Filter customers based on search term
  const filteredCustomers = searchTerm.trim() === '' 
    ? customers 
    : customers.filter(customer => 
        (customer.name && customer.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (customer.customerName && customer.customerName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (customer.fullName && customer.fullName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (customer.email && customer.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (customer.phone && customer.phone.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (customer.phoneNumber && customer.phoneNumber.toLowerCase().includes(searchTerm.toLowerCase()))
      );
  
  // Prepare data for DataGrid
  const rows = filteredCustomers.map(customer => ({
    id: customer.customerId,
    name: customer.customerName,
    phone: customer.customerPhoneNumber,
    email: customer.customerEmail,
    status: customer.customerStatus,
    actions: customer.customerId
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
          <h1 className="text-xl md:text-2xl font-semibold mb-2 md:mb-4 pl-2">Customers</h1>

          {/* Customer Table Card */}
          <div className="bg-white rounded-lg shadow">
            {/* Search and Add Customer */}
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
              <Link to="/addCustomer">
                <button 
                  className="bg-[#3C50E0] hover:bg-blue-700 text-white px-3 py-2 text-sm rounded-lg flex items-center justify-center sm:justify-start gap-2 focus:outline-none"
                >
                  <Plus size={16} />
                  <span>Add Customer</span>
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

export default CustomerPage;