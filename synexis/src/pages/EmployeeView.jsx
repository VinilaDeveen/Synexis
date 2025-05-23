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
import { DataGrid } from '@mui/x-data-grid';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import { employeeService } from '../services/employeeService';
import { ToastContainer } from 'react-toastify';
import { useNotification } from '../hooks/useNotification';

function EmployeeView() {
  const { notifySuccess, notifyError, notifyWarning, notifyDefault } = useNotification();
  const [searchTerm, setSearchTerm] = useState('');
  const [showSidebar, setShowSidebar] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [paginationModel, setPaginationModel] = useState({
    pageSize: 5,
    page: 0,
  });
  const [loading, setLoading] = useState(false);
  const [employeeLoading, setEmployeeLoading] = useState(false);
  const isInitialLoad = useRef(true);
  const isInitialLoad1 = useRef(true);
  
  // For accessing route parameters and state
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  // Get the selectedEmployeeId from state or from URL parameter
  const selectedEmployeeId = location.state?.selectedEmployeeId || id;

  // State for employees
  const [employees, setEmployees] = useState([]);
  
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
      if (!selectedEmployeeId) return;
      
      try {
        setActivityLogLoading(true);
        const response = await employeeService.getEmployeeActivityLogs(selectedEmployeeId);
        
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
    
    // Only fetch logs when activity tab is active and we have an employee selected
    if (activeTab === 'activity' && selectedEmployeeId) {
      fetchActivityLogs();
    }
  }, [selectedEmployeeId, activeTab]);

  // Fetch employee list data
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setLoading(true);
        const response = await employeeService.getSideDrop();
        if (response && response.data) {
          setEmployees(response.data);
        }
      } catch (error) {
        if (isInitialLoad.current) {
          console.error('Error fetching employees:', error);
          notifyError('Failed to load employees');
          isInitialLoad.current = false;
        }
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  // Fetch selected employee by ID when selectedEmployeeId changes
  useEffect(() => {
    const fetchEmployeeById = async (id) => {
      if (!id) return;
          
      try {
        setEmployeeLoading(true);
        const response = await employeeService.getById(id);
        if (response && response.data) {
          setSelectedEmployee(response.data);
        } else {
          notifyWarning('Employee not found');
        }
      } catch (error) {
        if (isInitialLoad1.current) {
          console.error('Error fetching employee details:', error);
          notifyError('Failed to load employee details');
          isInitialLoad1.current = false;
        }
      } finally {
        setEmployeeLoading(false);
      }
    };
    
    if (selectedEmployeeId) {
      fetchEmployeeById(selectedEmployeeId);
    } else if (employees.length > 0 && !selectedEmployee) {
      // Default to first employee if none selected
      handleEmployeeSelect(employees[0]);
    }
  }, [selectedEmployeeId, employees]);

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

  // Handle employee selection and update URL
  const handleEmployeeSelect = (employee) => {
    navigate(`/employeeView/${employee.employeeId}`, { 
      state: { selectedEmployeeId: employee.employeeId },
      replace: true 
    });
    // The useEffect hook with selectedEmployeeId dependency will trigger
    // the API call to fetch the employee details
  };

  // Filter employees based on search term
  const filteredEmployees = searchTerm.trim() === '' 
    ? employees 
    : employees.filter(employee => 
        employee.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.role?.toLowerCase().includes(searchTerm.toLowerCase())
      );

  // Get assignment columns for DataGrid
  const getAssignmentColumns = () => {
    // Base columns
    const columns = [
      { 
        field: 'name', 
        headerName: 'Project Name', 
        flex: 1,
        minWidth: 180,
        renderCell: (params) => (
          <div className="flex items-center mt-2">
            <div className={`w-2 h-2 rounded-full mr-2 ${params.row.isActive ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <div className="text-sm font-medium text-gray-900">{params.row.name}</div>
          </div>
        ),
        headerAlign: 'left',
        align: 'left',
        headerClassName: 'name-column-header',
      },
      { 
        field: 'role', 
        headerName: 'Role', 
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
          field: 'startDate', 
          headerName: 'Start Date', 
          flex: 0.8,
          minWidth: 120,
          headerAlign: 'left',
          align: 'left'
        },
        { 
          field: 'endDate', 
          headerName: 'End Date', 
          flex: 0.8,
          minWidth: 120,
          headerAlign: 'left',
          align: 'left'
        },
        { 
          field: 'status', 
          headerName: 'Status', 
          flex: 0.6,
          minWidth: 100,
          headerAlign: 'left',
          align: 'left'
        }
      );
    }
    return columns;
  };

  // Handle back to employees
  const handleBackToEmployees = () => {
    navigate('/employee');
  };

  const handleEditEmployee = () => {
    navigate(`/editEmployee/${selectedEmployeeId}`);
  };

  const handleDeleteEmployee = async () => {
    if (!selectedEmployeeId) return;

    try {
      setLoading(true);
      await employeeService.delete(selectedEmployeeId);
      notifySuccess(`Employee "${selectedEmployee.firstName} ${selectedEmployee.lastName}" successfully deleted`);
      
      // After deletion, navigate back to employees list
      navigate('/employee');
    } catch (error) {
      notifyError(`Error deleting employee: ${error.message || 'Unknown error'}`);
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
          {/* Employee Name Panel */}
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

            {/* Employee List */}
            <div className="flex-1 overflow-y-auto p-2">
              {loading ? (
                <div className="flex justify-center items-center h-32">
                  <InlineLoader/>
                </div>
              ) : filteredEmployees.length > 0 ? (
                filteredEmployees.map((employee) => (
                  <div 
                    key={employee.employeeId}
                    onClick={() => handleEmployeeSelect(employee)}
                    className={`p-1 mb-2 cursor-pointer ${selectedEmployeeId == employee.employeeId ? 'bg-blue-100' : 'hover:bg-gray-100'}`}
                  >
                    <div className="flex flex-wrap gap-1">
                      {loading ? (
                        <ImageLoader/>
                      ) : (
                        <img
                          alt={`${employee.employeeFirstName} ${employee.employeeLastName} photo`}
                          src={`http://localhost:8080/api/synexis/employee/image/${employee.employeeId}`}
                          className="size-9 my-1 border-2 border-slate-300 rounded-full"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://via.placeholder.com/36?text=NA';
                          }}
                        />
                      )}
                      <span className='text-sm mx-3 my-2'>{employee.employeeName}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-gray-500">
                  No employees found
                </div>
              )}
            </div>
          </div>
          
          {/* Content Area */}
          <div className="flex-1 p-6 overflow-auto">
            {selectedEmployee ? (
              <div className="w-full">
                <div className="flex justify-between items-center mb-4">
                  <h1 className="text-xl font-semibold">
                    {selectedEmployee.prefix} {selectedEmployee.firstName} {selectedEmployee.lastName}
                  </h1>
                  <div className="flex gap-4 text-[#3B50DF]">
                    <div 
                      className="bg-gray-100 rounded cursor-pointer" 
                      title="Edit Employee"
                      onClick={handleEditEmployee}
                    >
                      <FaEdit size={18}/>
                    </div>
                    <div 
                      className="bg-gray-100 rounded cursor-pointer" 
                      title="Delete Employee"
                      onClick={handleDeleteEmployee}
                    >
                      <MdDelete size={18} />
                    </div>
                    <div 
                      className="bg-gray-100 rounded cursor-pointer" 
                      title="Close/Back to employees"
                      onClick={handleBackToEmployees}
                    >
                      <MdOutlineClose size={18} />
                    </div>
                  </div>
                </div>

                {/* Employee Content with Loading State */}
                {employeeLoading ? (
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
                        <div className="max-h-[calc(100vh-260px)] overflow-y-auto" style={{
                          scrollbarWidth: 'thin',
                          scrollbarColor: ' #3B50DF #D9D9D9'
                        }}>
                          {/* Employee Information */}
                          <div className="flex gap-20 mb-8">
                            <div className='w-8/12 pr-8'>
                              {/* Personal Information */}
                              <h2 className="text-lg font-medium mb-4">Personal Information</h2>
                              <div className="space-y-3 mb-8">
                                <div className="flex">
                                  <span className="w-32 text-gray-400">Prefix</span>
                                  <span>{selectedEmployee.employeePrefix}</span>
                                </div>
                                <div className="flex">
                                  <span className="w-32 text-gray-400">First Name</span>
                                  <span>{selectedEmployee.employeeFirstName}</span>
                                </div>
                                <div className="flex">
                                  <span className="w-32 text-gray-400">Last Name</span>
                                  <span>{selectedEmployee.employeeLastName}</span>
                                </div>
                                <div className="flex">
                                  <span className="w-32 text-gray-400">NIC</span>
                                  <span>{selectedEmployee.employeeNIC}</span>
                                </div>
                                <div className="flex">
                                  <span className="w-32 text-gray-400">Date of Birth</span>
                                  <span>{selectedEmployee.employeeDOB}</span>
                                </div>
                                <div className="flex">
                                  <span className="w-32 text-gray-400">Gender</span>
                                  <span>{selectedEmployee.employeeGender}</span>
                                </div>
                              </div>
                              
                              {/* Contact & Residential Details */}
                              <h2 className="text-lg font-medium mb-4">Contact & Residential Details</h2>
                              <div className="space-y-3 mb-8">
                                <div className="flex">
                                  <span className="w-32 text-gray-400">Email</span>
                                  <span>{selectedEmployee.employeeEmail}</span>
                                </div>
                                <div className="flex">
                                  <span className="w-32 text-gray-400">Phone Number</span>
                                  <span>{selectedEmployee.employeePhoneNumber}</span>
                                </div>
                                <div className="flex">
                                  <span className="w-32 text-gray-400">Line 1</span>
                                  <span>{selectedEmployee.addressLine1}</span>
                                </div>
                                <div className="flex">
                                  <span className="w-32 text-gray-400">Line 2</span>
                                  <span>{selectedEmployee.addressLine2}</span>
                                </div>
                                <div className="flex">
                                  <span className="w-32 text-gray-400">City</span>
                                  <span>{selectedEmployee.city}</span>
                                </div>
                                <div className="flex">
                                  <span className="w-32 text-gray-400">Zip Code</span>
                                  <span>{selectedEmployee.zipCode}</span>
                                </div>
                              </div>
                              
                              {/* Employment Details */}
                              <h2 className="text-lg font-medium mb-4">Employment Details</h2>
                              <div className="space-y-3">
                                <div className="flex">
                                  <span className="w-32 text-gray-400">Role</span>
                                  <span>{selectedEmployee.role}</span>
                                </div>
                              </div>
                            </div>

                            {/* Employee image */}
                            <div className='w-4/12'>
                              <div className='bg-blue-50 rounded-md p-4 flex flex-col items-center'>
                                <div className="w-[200px] h-[200px] bg-white flex items-center justify-center mb-3 border border-gray-200">
                                  <img 
                                    src={`http://localhost:8080/api/synexis/employee/image/${selectedEmployee.employeeId}`} 
                                    alt="Employee Photo" 
                                    className="max-h-full max-w-full object-contain"
                                    onError={(e) => {
                                      e.target.onerror = null;
                                      e.target.src = 'https://via.placeholder.com/200?text=No+Image';
                                    }}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="max-h-[calc(100vh-260px)] overflow-y-auto" style={{
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
                    <ContentLoader size={10} borderWidth={3} color="#3C50E0" />
                  </div>
                ) : (
                  <div className="text-gray-500">Select an employee to view details</div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default EmployeeView;