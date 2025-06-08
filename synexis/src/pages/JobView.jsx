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
import { Menu, Search, FileText, Download, Eye } from 'lucide-react';
import { FaEdit } from "react-icons/fa";
import { MdDelete, MdOutlineClose } from "react-icons/md";
import { HiOutlineWrenchScrewdriver, HiOutlineBolt, HiOutlineCog6Tooth } from 'react-icons/hi2';
import { MdMiscellaneousServices } from "react-icons/md";
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import { createTheme } from '@mui/material/styles';
import { jobService } from '../services/jobService';
import { ToastContainer } from 'react-toastify';
import { useNotification } from '../hooks/useNotification';

function JobView() {
  const { notifySuccess, notifyError, notifyWarning, notifyDefault } = useNotification();
  const [searchTerm, setSearchTerm] = useState('');
  const [showSidebar, setShowSidebar] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [jobLoading, setJobLoading] = useState(false);
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

  // Get the selectedJobId from state or from URL parameter
  const selectedJobId = location.state?.selectedJobId || id;

  // State for jobs
  const [jobs, setJobs] = useState([]);

  const [activityLogs, setActivityLogs] = useState([]);
  const [activityLogLoading, setActivityLogLoading] = useState(false);

  // Add this useEffect to fetch activity logs
  useEffect(() => {
    const fetchActivityLogs = async () => {
      if (!selectedJobId) return;
      
      try {
        setActivityLogLoading(true);
        const response = await jobService.getJobActivityLogs(selectedJobId);
        
        if (response && response.data) {
          setActivityLogs(response.data);
        }
      } catch (error) {
        console.error('Error fetching activity logs:', error);
        notifyError('Failed to load activity logs');
      } finally {
        setActivityLogLoading(false);
      }
    };
    
    // Only fetch logs when activity tab is active and we have a job selected
    if (activeTab === 'activity') {
      fetchActivityLogs();
    }
  }, [selectedJobId, activeTab]);
  
  // Fetch job list data
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        const response = await jobService.getSideDrop();
        if (response && response.data) {
          setJobs(response.data);
        }
      } catch (error) {
        if (isInitialLoad.current) {
          console.error('Error fetching jobs:', error);
          notifyError('Failed to load jobs');
          isInitialLoad.current = false;
        }
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  // Fetch selected job by ID when selectedJobId changes
  useEffect(() => {
    const fetchJobById = async (id) => {
      if (!id) return;
          
      try {
        setJobLoading(true);
        const response = await jobService.getById(id);
        if (response && response.data) {
          setSelectedJob(response.data);
          console.log(response.data);
        } else {
          notifyWarning('Job not found');
        }
      } catch (error) {
        if (isInitialLoad1.current) {
          console.error('Error fetching job details:', error);
          notifyError('Failed to load job details');
          isInitialLoad1.current = false;
        }
      } finally {
        setJobLoading(false);
      }
    };
    
    if (selectedJobId) {
      fetchJobById(selectedJobId);
    } else if (jobs.length > 0 && !selectedJob) {
      // Default to first job if none selected
      handleJobSelect(jobs[0]);
    }
  }, [selectedJobId, jobs]);

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

  // Handle job selection and update URL
  const handleJobSelect = (job) => {
    navigate(`/project/job/jobView/${job.jobId}`, { 
      state: { selectedJobId: job.jobId },
      replace: true 
    });
    // The useEffect hook with selectedJobId dependency will trigger
    // the API call to fetch the job details
  };
  

  // Filter jobs based on search term
  const filteredJobs = searchTerm.trim() === '' 
    ? jobs 
    : jobs.filter(job => 
        job.jobName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.jobNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.jobDescription?.toLowerCase().includes(searchTerm.toLowerCase())
      );

  // Handle back to jobs
  const handleBackToJobs = () => {
    navigate('/project/job');
  };

  const handleEditJob = () => {
    navigate(`/project/job/editjobRegistration/${selectedJobId}`);
  };

  const handleDeleteJob = async () => {
    if (!selectedJobId) return;

    try {
      setLoading(true);
      await jobService.delete(selectedJobId);
      notifySuccess(`Job "${selectedJob.jobName}" successfully deleted`);
      
      // After deletion, navigate back to jobs list
      navigate('/project/job');
    } catch (error) {
      notifyError(`Error deleting job: ${error.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  // Get inquiry status color
  const getProjectTypeColor = (projectType) => {
    switch(projectType) {
      case 'ELECTROMECHANICAL':
        return 'bg-blue-100 text-blue-700';
      case 'MECHANICAL':
        return 'bg-slate-100 text-slate-700';
      case 'SERVICE':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const toSentenceCase = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };

  const toPascalCase = (str) => {
  return str
    .toLowerCase()
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

  // Handle document view/download
  const handleDocumentAction = (url, fileName, action = 'view') => {
    if (!url) {
      notifyWarning(`${fileName} not available`);
      return;
    }

    if (action === 'view') {
      // Open the document in a new tab
      window.open(url, '_blank');
    } else if (action === 'download') {
      // Trigger a download
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      link.target = '_blank'; // Add this for better browser compatibility
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const CustomCheckbox = ({ checked, label, disabled = true }) => {
    return (
      <div className="relative flex items-center mr-4">
        <input
          type="checkbox"
          checked={checked}
          disabled={disabled}
          className="absolute opacity-0 w-4 h-4 cursor-pointer"
        />
        <div className={`w-4 h-4 mr-2 border ${
          checked 
            ? 'bg-[#3C50E0] border-blue-500' 
            : 'bg-slate-200 border-slate-300'
        } flex items-center justify-center`}>
          {checked && (
            <svg 
              className="w-3 h-3 text-white" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth="3" 
                d="M5 13l4 4L19 7"
              ></path>
            </svg>
          )}
        </div>
        <label className="text-black cursor-pointer">
          {label}
        </label>
      </div>
    );
  };

  const ProjectTypeIcon = ({ projectType, size = 20 }) => {
    const getIcon = () => {
      switch (projectType) {
        case 'ELECTROMECHANICAL':
          return <HiOutlineBolt size={size} />;
        case 'MECHANICAL':
          return <HiOutlineWrenchScrewdriver size={size} />;
        case 'SERVICE':
          return <MdMiscellaneousServices size={size} />;
        default:
          return <HiOutlineCog6Tooth size={size} />;
      }
    };

    return getIcon();
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
          {/* Job Name Panel */}
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

            {/* Job List */}
            <div className="flex-1 overflow-y-auto p-2">
              {loading ? (
                <div className="flex justify-center items-center h-32">
                  <InlineLoader/>
                </div>
              ) : filteredJobs.length > 0 ? (
                filteredJobs.map((job) => (
                  <div 
                    key={job.jobId}
                    onClick={() => handleJobSelect(job)}
                    className={`p-3 mb-2 cursor-pointer ${selectedJobId == job.jobId ? 'bg-blue-100' : 'hover:bg-gray-100'}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className='w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-medium mr-3 bg-[#3C50E0]'>
                          <ProjectTypeIcon projectType={job.projectType} size={20} />
                        </div>
                        <div>
                          <div className="font-medium text-sm text-gray-900">{job.projectName}</div>
                          <div className="text-xs text-gray-500">[{job.quotationVersion}]</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-gray-500">
                  No jobs found
                </div>
              )}
            </div>
          </div>
          
          {/* Content Area */}
          <div className="flex-1 p-6 overflow-hidden">
            {selectedJob ? (
              <div className="w-full">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <div><h1 className="text-xl font-semibold">{selectedJob.projectName}</h1></div>
                    <div className='text-sm text-gray-500'><span>[{selectedJob.quotationVersion}]</span></div>
                  </div>
                  <div className="flex gap-4 text-[#3B50DF]">
                    <div 
                      className="rounded cursor-pointer" 
                      title="Edit Job"
                      onClick={handleEditJob}
                    >
                      <FaEdit size={18}/>
                    </div>
                    <div 
                      className="rounded cursor-pointer" 
                      title="Delete Job"
                      onClick={handleDeleteJob}
                    >
                      <MdDelete size={18} />
                    </div>
                    <div 
                      className="rounded cursor-pointer" 
                      title="Close/Back to jobs"
                      onClick={handleBackToJobs}
                    >
                      <MdOutlineClose size={18} />
                    </div>
                  </div>
                </div>

                {/* Job Content with Loading State */}
                {jobLoading ? (
                  <div className="flex items-center justify-center h-40">
                    <ContentLoader />
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
                        className={`px-6 py-3 font-medium text-sm bg-white hover:border-white ${activeTab === 'jobInfo' ? 'border-b-2 rounded-none border-b-[#3119C3]' : 'text-gray-500'} focus:outline-none`}
                        onClick={() => setActiveTab('jobInfo')}
                      >
                        Job Information
                      </button>
                      <button 
                        className={`px-6 py-3 font-medium text-sm bg-white hover:border-white ${activeTab === 'payment' ? 'border-b-2 rounded-none border-b-[#3119C3]' : 'text-gray-500'} focus:outline-none`}
                        onClick={() => setActiveTab('payment')}
                      >
                        Payment Details
                      </button>
                      <button 
                        className={`px-6 py-3 font-medium text-sm bg-white hover:border-white ${activeTab === 'technical' ? 'border-b-2 rounded-none border-b-[#3119C3]' : 'text-gray-500'} focus:outline-none`}
                        onClick={() => setActiveTab('technical')}
                      >
                        Technical Specs
                      </button>
                      <button 
                        className={`px-6 py-3 font-medium text-sm bg-white hover:border-white ${activeTab === 'activity' ? 'border-b-2 rounded-none border-b-[#3119C3]' : 'text-gray-500'} focus:outline-none`}
                        onClick={() => setActiveTab('activity')}
                      >
                        Activity Log
                      </button>
                    </div>
                    
                    {/* Tab Content */}
                    <div className="">
                      {activeTab === 'overview' ? (
                        <div className='max-h-[calc(100vh-270px)] overflow-y-auto p-6' style={{
                            scrollbarWidth: 'thin',
                            scrollbarColor: ' #3B50DF #D9D9D9'
                        }}>
                          {/* Job Overview */}
                          <div className="mb-8">
                            <h2 className="text-lg font-medium mb-4">Job Overview</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div className="space-y-3">
                                <div className="flex">
                                  <span className="w-32 text-gray-400">Sales Person</span>
                                  <span>{selectedJob.salesPersonName || 'Not provided'}</span>
                                </div>
                                <div className="flex">
                                  <span className="w-32 text-gray-400">Estimator</span>
                                  <span>{selectedJob.estimatorName}</span>
                                </div>
                                <div className="flex">
                                  <span className="w-32 text-gray-400">Customer</span>
                                  <span>{selectedJob.customerName || 'Not provided'}</span>
                                </div>
                                <div className="flex">
                                  <span className="w-32 text-gray-400">Customer Address</span>
                                  <span>{selectedJob.customerAddress}</span>
                                </div>
                                <div className="flex">
                                  <span className="w-32 text-gray-400">Project Type</span>
                                  <span className={`px-2 py-1 rounded-md text-xs ${getProjectTypeColor(selectedJob.projectType)}`}>
                                    {toSentenceCase(selectedJob.projectType)}
                                  </span>
                              </div>
                              </div>
                            </div>
                          </div> 
                        </div>
                      ) : activeTab === 'jobInfo' ? (
                        <div className='max-h-[calc(100vh-270px)] overflow-y-auto p-6' style={{
                            scrollbarWidth: 'thin',
                            scrollbarColor: ' #3B50DF #D9D9D9'
                        }}>
                          {/* Job Overview */}
                          <div className="mb-8">
                            <h2 className="text-lg font-medium mb-4">Job Information</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div className="space-y-3">
                                <div className="flex">
                                  <span className="w-32 text-gray-400">Job No</span>
                                  <span>{selectedJob.jobNumber || 'Not provided'}</span>
                                </div>
                                <div className="flex">
                                  <span className="w-32 text-gray-400">Delivery Point</span>
                                  <span>{selectedJob.jobDeliveryPoint}</span>
                                </div>
                                <div className='flex gap-[100px]'>
                                  <div className="flex">
                                    <span className="w-32 text-gray-400">Delivery Date</span>
                                    <span>{selectedJob.jobDeliveryDate || 'Not provided'}</span>
                                  </div>
                                  <div className="flex">
                                    <span className="w-32 text-gray-400">Delivery Time</span>
                                    <span>{selectedJob.jobDeliveryTime}</span>
                                  </div>
                                </div>
                                <div className="flex">
                                  <span className="w-32 text-gray-400">Consultant</span>
                                  <span>{selectedJob.consultant || 'Not provided'}</span>
                                </div>
                                <div className="flex gap-[100px]">
                                  <div className="flex">
                                    <span className="w-32 text-gray-400">Contractor</span>
                                    <span>{selectedJob.contractor || 'Not provided'}</span>
                                  </div>
                                  <div className="flex">
                                    <span className="w-32 text-gray-400">Sub Consultant</span>
                                    <span>{selectedJob.subContractor || 'Not provided'}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div> 
                        </div>
                      ) : activeTab === 'payment' ? (
                        // Payment Details Tab Content
                        <div className='max-h-[calc(100vh-270px)] overflow-y-auto p-6' style={{
                            scrollbarWidth: 'thin',
                            scrollbarColor: ' #3B50DF #D9D9D9'
                        }}>
                          {/* Payment Information */}
                          <div className="mb-4">
                            <h2 className="text-lg font-medium mb-4">Payment Information</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div className="space-y-3">
                                <div className="flex">
                                  <span className="w-64 text-gray-400">Payment Type</span>
                                  <span>{selectedJob.paymentType || 'Not specified'}</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="flex mb-4">
                            <span className="w-64 text-gray-400">Total Value (Without NTB & VAT)</span>
                            <span>{selectedJob.totalValue}</span>
                          </div>

                          <div className="flex mb-4">
                            <span className="w-64 text-gray-400">Gross Profit (GP)</span>
                            <span>{selectedJob.grossProfit}%</span>
                          </div>

                          {/* Invoice Types */}
                          <div className="flex mb-4">
                            <span className="w-64 text-gray-400">Invoice Type</span>
                            <div className="flex flex-wrap gap-2">
                              {selectedJob.invoiceType && selectedJob.invoiceType.length > 0 ? (
                                selectedJob.invoiceType.map((type, index) => (
                                  <span 
                                    key={index}
                                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                                      type === 'VAT' 
                                        ? 'bg-blue-100 text-blue-800 border border-blue-200' 
                                        : type === 'SVAT'
                                        ? 'bg-green-100 text-green-800 border border-green-200'
                                        : 'bg-purple-100 text-purple-800 border border-purple-200'
                                    }`}
                                  >
                                    {type}
                                  </span>
                                ))
                              ) : (
                                <span className="text-gray-500 text-sm">No invoice types specified</span>
                              )}
                            </div>
                          </div>

                          {/* Attachments */}
                          <div>
                            <h2 className="text-lg font-medium mb-4">Attachments</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              {selectedJob.attachmentDtoList && selectedJob.attachmentDtoList.length > 0 ? (
                                selectedJob.attachmentDtoList.map((attachment, index) => (
                                  <div key={index} className="border rounded-lg p-4">
                                    <div className="flex items-center justify-between mb-2">
                                      <div className="flex items-center">
                                        <FileText className="w-5 h-5 text-blue-500 mr-2" />
                                        <span className="font-medium text-sm truncate" title={attachment.attachmentName}>
                                          {attachment.attachmentName}
                                        </span>
                                      </div>
                                    </div>
                                    {attachment.attachmentUrl ? (
                                      <div className="flex gap-2 mt-3">
                                        <button
                                          onClick={() => handleDocumentAction(attachment.attachmentUrl, attachment.attachmentName, 'view')}
                                          className="flex items-center px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                                        >
                                          <Eye className="w-4 h-4 mr-1" />
                                          View
                                        </button>
                                        <button
                                          onClick={() => handleDocumentAction(attachment.attachmentUrl, attachment.attachmentName, 'download')}
                                          className="flex items-center px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                                        >
                                          <Download className="w-4 h-4 mr-1" />
                                          Download
                                        </button>
                                      </div>
                                    ) : (
                                      <span className="text-sm text-gray-500">File not available</span>
                                    )}
                                  </div>
                                ))
                              ) : (
                                <div className="col-span-full border rounded-lg p-8 text-center">
                                  <FileText className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                                  <span className="text-gray-500">No attachments available</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ) : activeTab === 'technical' ? (
                        <div className='max-h-[calc(100vh-270px)] overflow-y-auto p-6' style={{
                            scrollbarWidth: 'thin',
                            scrollbarColor: ' #3B50DF #D9D9D9'
                        }}>
                          {selectedJob.specificationDto ? (
                            <div className="space-y-8">
                              {/* Enclosure Type Section */}
                              <div className='flex gap-4'>
                                <div className='mt-1'><span className="w-64 text-gray-400">Enclosure Type</span></div>
                                <div className="flex gap-4">
                                  <div className={`px-3 py-1 rounded-full ${selectedJob.specificationDto.floorMounting ? 'bg-blue-800 text-white' : 'border-2 border-white text-white'}`}>
                                    <span className='text-sm'>Floor Mounting</span>
                                  </div>
                                  <div className={`px-3 py-1 rounded-full ${selectedJob.specificationDto.wallMounting ? 'bg-indigo-800 text-white' : 'border-2 border-white text-white'}`}>
                                    <span className="text-sm">Wall Mounting</span>
                                  </div>
                                </div>
                              </div>

                              {/* Floor Mounting Dimensions - Show only if floor mounting is selected */}
                              {selectedJob.specificationDto.floorMounting && selectedJob.specificationDto.floorDimensionDto && (
                                <div>
                                  <h3 className="text-lg font-medium mb-4">Floor Mounting Dimensions</h3>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-[100px]">
                                    <div className="">
                                      <div className="flex justify-between items-center border-b border-gray-200">
                                        <span className="text-gray-600">Frame Work</span>
                                        <span className="font-medium">{selectedJob.specificationDto.floorDimensionDto.floorFramework} mm</span>
                                      </div>
                                      <div className="flex justify-between items-center border-b border-gray-200">
                                        <span className="text-gray-600">Base Frame</span>
                                        <span className="font-medium">{selectedJob.specificationDto.floorDimensionDto.floorBaseFrame} mm</span>
                                      </div>
                                      <div className="flex justify-between items-center border-b border-gray-200">
                                        <span className="text-gray-600">Escutcheon</span>
                                        <span className="font-medium">{selectedJob.specificationDto.floorDimensionDto.floorEscutcheon} mm</span>
                                      </div>
                                      <div className="flex justify-between items-center border-b border-gray-200">
                                        <span className="text-gray-600">Covering Panel</span>
                                        <span className="font-medium">{selectedJob.specificationDto.floorDimensionDto.floorCoveringPanels} mm</span>
                                      </div>
                                      <div className="flex justify-between items-center border-b border-gray-200">
                                        <span className="text-gray-600">Partition</span>
                                        <span className="font-medium">{selectedJob.specificationDto.floorDimensionDto.floorPartition} mm</span>
                                      </div>
                                      <div className="flex justify-between items-center border-b border-gray-200">
                                        <span className="text-gray-600">Door</span>
                                        <span className="font-medium">{selectedJob.specificationDto.floorDimensionDto.floorDoor} mm</span>
                                      </div>
                                    </div>
                                    <div className="">
                                      <div className="flex justify-between items-center border-b border-gray-200">
                                        <span className="text-gray-600">Top Cover</span>
                                        <span className="font-medium">{selectedJob.specificationDto.floorDimensionDto.floorTopCover} mm</span>
                                      </div>
                                      <div className="flex justify-between items-center border-b border-gray-200">
                                        <span className="text-gray-600">Top Cover Material</span>
                                        <span className="font-medium">{toSentenceCase(selectedJob.specificationDto.floorDimensionDto.floorTopCoverMaterial)}</span>
                                      </div>
                                      <div className="flex justify-between items-center border-b border-gray-200">
                                        <span className="text-gray-600">Bottom Plate</span>
                                        <span className="font-medium">{selectedJob.specificationDto.floorDimensionDto.floorBottomPlate} mm</span>
                                      </div>
                                      <div className="flex justify-between items-center border-b border-gray-200">
                                        <span className="text-gray-600">Bottom Plate Material</span>
                                        <span className="font-medium">{toSentenceCase(selectedJob.specificationDto.floorDimensionDto.floorBottomPlateMaterial)}</span>
                                      </div>
                                      <div className="flex justify-between items-center border-b border-gray-200">
                                        <span className="text-gray-600">Mounting Plate</span>
                                        <span className="font-medium">{selectedJob.specificationDto.floorDimensionDto.floorMountingPlate} mm</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* Wall Mounting Dimensions - Show only if wall mounting is selected */}
                              {selectedJob.specificationDto.wallMounting && selectedJob.specificationDto.wallDimensionDto && (
                                <div>
                                  <h3 className="text-lg font-medium mb-4">Wall Mounting Dimensions</h3>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-[100px]">
                                    <div className="">
                                      <div className="flex justify-between items-center border-b border-gray-200">
                                        <span className="text-gray-600">Lid</span>
                                        <span className="font-medium">{selectedJob.specificationDto.wallDimensionDto.wallLid} mm</span>
                                      </div>
                                      <div className="flex justify-between items-center border-b border-gray-200">
                                        <span className="text-gray-600">Mounting Plate</span>
                                        <span className="font-medium">{selectedJob.specificationDto.wallDimensionDto.wallMountingPlate} mm</span>
                                      </div>
                                      <div className="flex justify-between items-center border-b border-gray-200">
                                        <span className="text-gray-600">Shelf</span>
                                        <span className="font-medium">{selectedJob.specificationDto.wallDimensionDto.wallShelf} mm</span>
                                      </div>
                                      <div className="flex justify-between items-center border-b border-gray-200">
                                        <span className="text-gray-600">Door</span>
                                        <span className="font-medium">{selectedJob.specificationDto.wallDimensionDto.wallDoor} mm</span>
                                      </div>
                                      <div className="flex justify-between items-center border-b border-gray-200">
                                        <span className="text-gray-600">Cover Plate</span>
                                        <span className="font-medium">{selectedJob.specificationDto.wallDimensionDto.wallCoverPlate} mm</span>
                                      </div>
                                    </div>
                                    <div className="">
                                      <div className="space-y-2">
                                        <div className="flex justify-between items-center border-b border-gray-200">
                                          <span className="text-gray-600">Top Gland Plate</span>
                                          <span className="font-medium">{selectedJob.specificationDto.wallDimensionDto.wallTopGlandPlate} mm</span>
                                        </div>
                                        <div className="flex justify-between items-center border-b border-gray-200">
                                          <span className="text-gray-600">Top Gland Material</span>
                                          <span className="font-medium">{toSentenceCase(selectedJob.specificationDto.wallDimensionDto.wallTopGlandPlateMaterial)}</span>
                                        </div>
                                        <div className="flex justify-between items-center border-b border-gray-200">
                                          <span className="text-gray-600">Bottom Gland Plate</span>
                                          <span className="font-medium">{selectedJob.specificationDto.wallDimensionDto.wallBottomGlandPlate} mm</span>
                                        </div>
                                        <div className="flex justify-between items-center border-b border-gray-200">
                                          <span className="text-gray-600">Bottom Gland Material</span>
                                          <span className="font-medium">{toSentenceCase(selectedJob.specificationDto.wallDimensionDto.wallBottomGlandPlateMaterial)}</span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* Enclosure Types Section */}
                              {selectedJob.specificationDto.enclosureDto && (
                                <div>
                                  <h3 className="text-lg font-medium mb-4">Enclosure Types</h3>
                                  <div className="space-y-4">
                                    {/* Surface Type */}
                                    <div className='flex'>
                                      <div className='w-64'><span className="text-gray-600">Surface Type Enclosure</span></div>
                                      <div className="flex gap-4">
                                        <CustomCheckbox 
                                          checked={selectedJob.specificationDto.enclosureDto.surfaceTypeOutdoor}
                                          label="Outdoor"
                                        />
                                        <CustomCheckbox 
                                          checked={selectedJob.specificationDto.enclosureDto.surfaceTypeIndoor}
                                          label="Indoor"
                                        />
                                      </div>
                                    </div>

                                    {/* Flush Type */}
                                    <div className='flex'>
                                      <div className="w-64"><span className="text-gray-600">Flush Type Enclosure</span></div>
                                      <div className="flex gap-4">
                                        <CustomCheckbox 
                                          checked={selectedJob.specificationDto.enclosureDto.flushTypeOutdoor}
                                          label="Outdoor"
                                        />
                                        <CustomCheckbox 
                                          checked={selectedJob.specificationDto.enclosureDto.flushTypeIndoor}
                                          label="Indoor"
                                        />
                                      </div>
                                    </div>

                                    {/* Freestanding Type */}
                                    <div className='flex'>
                                      <div className="w-64"><span className="text-gray-600">Freestanding Type Panel</span></div>
                                      <div className="flex gap-4">
                                        <CustomCheckbox 
                                          checked={selectedJob.specificationDto.enclosureDto.freestandingTypeOutdoor}
                                          label="Outdoor"
                                        />
                                        <CustomCheckbox 
                                          checked={selectedJob.specificationDto.enclosureDto.freestandingTypeIndoor}
                                          label="Indoor"
                                        />
                                      </div>
                                    </div>

                                    {/* Lid Type */}
                                    <div className='flex'>
                                      <div className="w-64"><span className="text-gray-600">Lid Type Enclosure</span></div>
                                      <div className="flex gap-4">
                                        <CustomCheckbox 
                                          checked={selectedJob.specificationDto.enclosureDto.lidTypeOutdoor}
                                          label="Outdoor"
                                        />
                                        <CustomCheckbox 
                                          checked={selectedJob.specificationDto.enclosureDto.lidTypeIndoor}
                                          label="Indoor"
                                        />
                                      </div>
                                    </div>

                                    {/* Outdoor Wall Mounting */}
                                    <div className='flex'>
                                      <div className="w-64"><span className="text-gray-600">Outdoor Wall Mounting</span></div>
                                      <div className="flex gap-4">
                                        <CustomCheckbox 
                                          checked={selectedJob.specificationDto.enclosureDto.outdoorWallOutdoor}
                                          label="Outdoor"
                                        />
                                        <CustomCheckbox 
                                          checked={selectedJob.specificationDto.enclosureDto.outdoorWallIndoor}
                                          label="Indoor"
                                        />
                                      </div>
                                    </div>

                                    {/* Feeder Pillar */}
                                    <div className='flex'>
                                      <div className="w-64"><span className="text-gray-600">Feeder Pillar</span></div>
                                      <div className="flex gap-4">
                                        <CustomCheckbox 
                                          checked={selectedJob.specificationDto.enclosureDto.feederPillarOutdoor}
                                          label="Outdoor"
                                        />
                                        <CustomCheckbox 
                                          checked={selectedJob.specificationDto.enclosureDto.feederPillarIndoor}
                                          label="Indoor"
                                        />
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* Cable/Busbar Section */}
                              {selectedJob.specificationDto.cableBusbarDto && (
                                <div>
                                  <h3 className="text-lg font-medium mb-4">Cable/Busbar</h3>
                                  <div className="space-y-4">
                                    {/* Busbar */}
                                    <div className='flex'>
                                      <div className='w-64'><span className="text-gray-600">Busbar</span></div>
                                      <div className="flex gap-4">
                                        <CustomCheckbox 
                                          checked={selectedJob.specificationDto.cableBusbarDto.busbarIncoming}
                                          label="Incoming"
                                        />
                                        <CustomCheckbox 
                                          checked={selectedJob.specificationDto.cableBusbarDto.busbarOutgoing}
                                          label="Outgoing"
                                        />
                                      </div>
                                    </div>

                                    {/* Top */}
                                    <div className='flex'>
                                      <div className="w-64"><span className="text-gray-600">Top</span></div>
                                      <div className="flex gap-4">
                                        <CustomCheckbox 
                                          checked={selectedJob.specificationDto.cableBusbarDto.topIncoming}
                                          label="Incoming"
                                        />
                                        <CustomCheckbox 
                                          checked={selectedJob.specificationDto.cableBusbarDto.topOutgoing}
                                          label="Outgoing"
                                        />
                                      </div>
                                    </div>

                                    {/* Bottom */}
                                    <div className='flex'>
                                      <div className="w-64"><span className="text-gray-600">Bottom</span></div>
                                      <div className="flex gap-4">
                                        <CustomCheckbox 
                                          checked={selectedJob.specificationDto.cableBusbarDto.bottomIncoming}
                                          label="Incoming"
                                        />
                                        <CustomCheckbox 
                                          checked={selectedJob.specificationDto.cableBusbarDto.bottomOutgoing}
                                          label="Outgoing"
                                        />
                                      </div>
                                    </div>

                                    {/* Left */}
                                    <div className='flex'>
                                      <div className="w-64"><span className="text-gray-600">Left</span></div>
                                      <div className="flex gap-4">
                                        <CustomCheckbox 
                                          checked={selectedJob.specificationDto.cableBusbarDto.leftIncoming}
                                          label="Incoming"
                                        />
                                        <CustomCheckbox 
                                          checked={selectedJob.specificationDto.cableBusbarDto.leftOutgoing}
                                          label="Outgoing"
                                        />
                                      </div>
                                    </div>

                                    {/* Right */}
                                    <div className='flex'>
                                      <div className="w-64"><span className="text-gray-600">Right</span></div>
                                      <div className="flex gap-4">
                                        <CustomCheckbox 
                                          checked={selectedJob.specificationDto.cableBusbarDto.rightIncoming}
                                          label="Incoming"
                                        />
                                        <CustomCheckbox 
                                          checked={selectedJob.specificationDto.cableBusbarDto.rightOutgoing}
                                          label="Outgoing"
                                        />
                                      </div>
                                    </div>

                                    {/* Rear Top */}
                                    <div className='flex'>
                                      <div className="w-64"><span className="text-gray-600">Rear Top</span></div>
                                      <div className="flex gap-4">
                                        <CustomCheckbox 
                                          checked={selectedJob.specificationDto.cableBusbarDto.rearTopIncoming}
                                          label="Incoming"
                                        />
                                        <CustomCheckbox 
                                          checked={selectedJob.specificationDto.cableBusbarDto.rearTopOutgoing}
                                          label="Outgoing"
                                        />
                                      </div>
                                    </div>

                                    {/* Rear Bottom */}
                                    <div className='flex'>
                                      <div className="w-64"><span className="text-gray-600">Rear Bottom</span></div>
                                      <div className="flex gap-4">
                                        <CustomCheckbox 
                                          checked={selectedJob.specificationDto.cableBusbarDto.rearBottomIncoming}
                                          label="Incoming"
                                        />
                                        <CustomCheckbox 
                                          checked={selectedJob.specificationDto.cableBusbarDto.rearBottomOutgoing}
                                          label="Outgoing"
                                        />
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* Materials & Finishing */}
                              <div className="mb-4">
                                <h2 className="text-lg font-medium mb-4">Materials & Finishing</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                  <div className="space-y-3">
                                    <div className="flex">
                                      <span className="w-64 text-gray-400">Sheet Material</span>
                                      <span>{toPascalCase(selectedJob.specificationDto.materialFinishDto.sheetMaterial) || 'Not specified'}</span>
                                    </div>

                                    <div className="flex">
                                      <span className="w-64 text-gray-400">Powder Coating</span>
                                      <span>{selectedJob.specificationDto.materialFinishDto.powderCoating || 'Not specified'}</span>
                                    </div>

                                    <div className="flex">
                                      <span className="w-64 text-gray-400">Paint Thickness</span>
                                      <span>{toSentenceCase(selectedJob.specificationDto.materialFinishDto.paintingThickness) || 'Not specified'}</span>
                                    </div>

                                    <div className="flex">
                                      <span className="w-64 text-gray-400">Surface Type</span>
                                      <span>{toSentenceCase(selectedJob.specificationDto.materialFinishDto.surfaceType) || 'Not specified'}</span>
                                    </div>

                                    <div className="flex">
                                      <span className="w-64 text-gray-400">Colour</span>
                                      <span>{toSentenceCase(selectedJob.specificationDto.materialFinishDto.color) || 'Not specified'}</span>
                                    </div>

                                    <div className="flex gap-8">
                                        <div className='flex-1'>
                                          <CustomCheckbox 
                                            checked={selectedJob.specificationDto.materialFinishDto.primer}
                                            label="Primer"
                                          />
                                        </div>
                                        <div className=''>
                                          <CustomCheckbox 
                                            checked={selectedJob.specificationDto.materialFinishDto.hdg}
                                            label="Hot-Dip Galvernizing (HDG)"
                                          />
                                        </div>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Remarks Section */}
                              {selectedJob.specificationDto.remarks && (
                                <div>
                                  <h3 className="text-lg font-medium mb-4">Remarks</h3>
                                  <div className="bg-gray-50 p-4 rounded-lg">
                                    <p className="text-gray-700">{selectedJob.specificationDto.remarks}</p>
                                  </div>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="text-center text-gray-500 py-8">
                              No technical specifications available
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="max-h-[calc(100vh-260px)] overflow-y-auto p-6" style={{
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
                  <div className="text-gray-500">Select a job to view details</div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default JobView;