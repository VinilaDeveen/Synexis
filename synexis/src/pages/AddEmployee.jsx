import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { 
  FullPageLoader, 
  InlineLoader, 
  ButtonLoader,
  ContentLoader, 
  ImageLoader
} from '../components/loaders';
import { IoMdImage } from "react-icons/io";
import { MdDelete } from "react-icons/md";
import { IoMdInformationCircle } from "react-icons/io";
import { ToastContainer } from 'react-toastify';
import { useNotification } from '../hooks/useNotification';
import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import useTooltip from '../hooks/useTooltip';
import { employeeService } from '../services/employeeService';

const AddEmployeePage = () => {
  const { notifySuccess, notifyError, notifyWarning, notifyDefault } = useNotification();
  const { id } = useParams(); // Get the employee ID from URL if editing
  const isEditMode = !!id;
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    // Personal Details
    prefix: '',
    firstName: '',
    lastName: '',
    nic: '',
    dob: '',
    gender: '',
    image: null,
    imageUrl: null,
    employeeId: null,
    
    // Contact & Residential Information
    email: '',
    phoneNumber: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    zipCode: '',
    
    // Employment Details
    role: '',
    departmentId: null,
    employmentDate: '',
    salary: 0,
    status: 'ACTIVE'
  });

  const [roles, setRoles] = useState([]);
  const [activeTab, setActiveTab] = useState('personalDetails');
  const [imageChanged, setImageChanged] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const isInitialLoad = useRef(true);
  const isInitialLoad1 = useRef(true);

  // Custom tooltip hooks for info icons
  const nicTooltip = useTooltip(
    () => <div>Enter the National Identity Card number</div>,
    'right'
  );

  const imageTooltip = useTooltip(
    () => <div>Upload a profile image of the employee</div>,
    'right'
  );

  const emailTooltip = useTooltip(
    () => <div>Enter employee's official email address</div>,
    'right'
  );

  const phoneTooltip = useTooltip(
    () => <div>Enter employee's contact number</div>,
    'right'
  );

  // If in edit mode, fetch the employee details
  useEffect(() => {
    if (isEditMode) {
      const fetchEmployeeDetails = async () => {
        setLoading(true);
        try {
          const response = await employeeService.getById(id);
          const employeeData = response.data;
          
          setFormData({
            prefix: employeeData.employeePrefix || '',
            firstName: employeeData.employeeFirstName || '',
            lastName: employeeData.employeeLastName || '',
            nic: employeeData.employeeNIC || '',
            dob: employeeData.employeeDOB || '',
            gender: employeeData.employeeGender || '',
            image: null,
            imageUrl: employeeData.employeeImageUrl || null,
            employeeId: employeeData.employeeId,
            email: employeeData.employeeEmail || '',
            phoneNumber: employeeData.employeePhoneNumber || '',
            addressLine1: employeeData.addressLine1 || '',
            addressLine2: employeeData.addressLine2 || '',
            city: employeeData.city || '',
            zipCode: employeeData.zipCode || '',
            role: employeeData.role,
            departmentId: employeeData.departmentId || null,
            employmentDate: employeeData.employmentDate || '',
            salary: employeeData.salary || 0,
            status: employeeData.status || 'ACTIVE'
          });
          
        } catch (err) {
          if (isInitialLoad.current) {
            notifyError('Failed to load employee details. Please try again.')
          }
        } finally {
          setLoading(false);
        }
      };

      fetchEmployeeDetails();
    }
  }, [id, isEditMode]);
 
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleRoleChange = (e) => {
    const value = e.target.value;
    setFormData(prev => ({
      ...prev,
      roleId: value ? Number(value) : null
    }));
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prevState => ({
        ...prevState,
        image: e.target.files[0]
      }));
      setImageChanged(true);
    }
  };

  // Drag and Drop handlers
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFormData(prevState => ({
        ...prevState,
        image: e.dataTransfer.files[0]
      }));
      setImageChanged(true);
    }
  };

  const handleBrowseClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleDeleteImage = () => {
    setFormData(prev => ({...prev, image: null, imageUrl: null}));
    setImageChanged(true);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    
    // Create FormData object to handle file upload
    const formDataToSend = new FormData();
    formDataToSend.append('employeePrefix', formData.prefix);
    formDataToSend.append('employeeFirstName', formData.firstName);
    formDataToSend.append('employeeLastName', formData.lastName);
    formDataToSend.append('employeeNIC', formData.nic);
    formDataToSend.append('employeeDOB', formData.dob);
    formDataToSend.append('employeeGender', formData.gender);
    formDataToSend.append('employeeEmail', formData.email);
    formDataToSend.append('employeePhoneNumber', formData.phoneNumber);
    formDataToSend.append('addressLine1', formData.addressLine1);
    formDataToSend.append('addressLine2', formData.addressLine2 || '');
    formDataToSend.append('city', formData.city);
    formDataToSend.append('zipCode', formData.zipCode);
    formDataToSend.append('Role', formData.role);

    // Add the image if one is selected
    if (formData.image instanceof File) {
      formDataToSend.append('employeeImage', formData.image);
    }
  
    try {
      if (isEditMode) {
        await employeeService.update(id, formDataToSend);
        notifySuccess('Employee updated successfully');
      } else {
        await employeeService.create(formDataToSend);
        notifySuccess('Employee added successfully');
      }
      // Redirect to employees list page after successful operation
      navigate('/employee');
    } catch (err) {
      console.error('Error saving employee:', err);
      isEditMode
        ? notifyError('Failed to update employee. Please try again.')
        : notifyError('Failed to create employee. Please try again.') 
    } finally {
      setSubmitting(false);
    }
  };
  
  const handleCancel = () => {
    navigate('/employee');
  };

  if (loading && isEditMode) {
    return <FullPageLoader />;
  }

  return (
    <div className="flex w-screen h-screen text-black bg-gray-100" style={{
      scrollbarWidth: 'thin',
      scrollbarColor: ' #3B50DF #D9D9D9'}}>
      {/* Sidebar */}
      <div className="">
        <div className=""><Sidebar/></div>
      </div>

      {/* Main Content */}
      <div className="flex w-screen flex-col">
        {/* Header */}
        <div>
          <Navbar/>
        </div>

        {/* Content Area */}
        <div className="p-6 flex-1 overflow-hidden">

          {/* Toast notifications */}
          <ToastContainer className="mt-[70px]" />

          <h1 className="text-2xl font-semibold mb-4">
            {isEditMode ? 'Update Employee' : 'Employee Registration'}
          </h1>

          {/* Error message */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {/* Add/Edit Employee Form */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            {/* Tabs */}
            <div className="flex">
              <button 
                className={`px-6 py-3 font-medium text-sm bg-white hover:border-white ${activeTab === 'personalDetails' ? 'border-b-2 rounded-none border-b-[#3119C3]' : 'text-gray-500'} focus:outline-none`}
                onClick={() => handleTabChange('personalDetails')}
              >
                Personal Details
              </button>
              <button 
                className={`px-6 py-3 font-medium text-sm bg-white hover:border-white ${activeTab === 'contactInfo' ? 'border-b-2 rounded-none border-b-[#3119C3]' : 'text-gray-500'} focus:outline-none`}
                onClick={() => handleTabChange('contactInfo')}
              >
                Contact & Residential Information
              </button>
              <button 
                className={`px-6 py-3 font-medium text-sm bg-white hover:border-white ${activeTab === 'employmentDetails' ? 'border-b-2 rounded-none border-b-[#3119C3]' : 'text-gray-500'} focus:outline-none`}
                onClick={() => handleTabChange('employmentDetails')}
              >
                Employment Details
              </button>
            </div>
            <hr className='mt-2 mb-5'/>
            
            {/* Tab Content - Personal Details */}
            {activeTab === 'personalDetails' && (
              <div className="max-h-[calc(100vh-360px)] overflow-y-auto" style={{
                scrollbarWidth: 'thin',
                scrollbarColor: ' #3B50DF #D9D9D9'
              }}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left Column */}
                  <div className="space-y-6">
                    <div className="flex space-x-10 mb-4">
                      {/* Prefix Field */}
                      <div>
                        <label htmlFor="prefix" className="block mb-1">
                          Employee Prefix
                        </label>
                        <select
                        id="prefix"
                        required
                        value={formData.prefix}
                        onChange={handleChange}
                        className="w-64 bg-blue-50 border border-transparent rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select Prefix</option>
                        <option value="Mr">Mr.</option>
                        <option value="Ms">Ms.</option>
                        <option value="Miss">Miss.</option>
                        <option value="Mrs">Mrs.</option> 
                        <option value="Mx">Mx.</option> 
                        <option value="Dr">Dr.</option>
                        <option value="Prof">Prof.</option>             
                      </select>
                      </div>
                    </div>

                    <div className="flex space-x-10 mb-4">
                      {/* First Name Field */}
                      <div>
                        <label htmlFor="firstName" className="block mb-1">
                          First Name<span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          id="firstName"
                          required
                          value={formData.firstName}
                          onChange={handleChange}
                          className="w-full bg-blue-50 border border-transparent rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      {/* Last Name Field */}
                      <div>
                        <label htmlFor="lastName" className="block mb-1">
                          Last Name<span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          id="lastName"
                          required
                          value={formData.lastName}
                          onChange={handleChange}
                          className="w-full bg-blue-50 border border-transparent rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>

                    <div className="flex space-x-10 mb-4">
                      {/* NIC Field */}
                      <div>
                        <div className="flex items-center mb-1">
                          <label htmlFor="nic">
                            Employee NIC<span className="text-red-500">*</span>
                          </label>
                          <div className="ml-2">
                            <nicTooltip.Tooltip {...nicTooltip.tooltipProps}>
                              <div className="text-slate-700 cursor-help">
                                <IoMdInformationCircle size={18} />
                              </div>
                            </nicTooltip.Tooltip>
                          </div>
                        </div>
                        <input
                          type="text"
                          id="nic"
                          required
                          value={formData.nic}
                          onChange={handleChange}
                          className="w-full bg-blue-50 border border-transparent rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      {/* DOB Field */}
                      <div>
                        <label htmlFor="dob" className="block mb-1">
                          Date of Birth<span className="text-red-500">*</span>
                        </label>
                        <input
                          type="date"
                          id="dob"
                          required
                          value={formData.dob}
                          onChange={handleChange}
                          className="w-[200px] bg-blue-50 border border-transparent rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>

                    <div className="flex space-x-10 mb-4">
                      {/* Gender Field */}
                      <div>
                        <label htmlFor="gender" className="block mb-1">
                          Gender<span className="text-red-500">*</span>
                        </label>
                        <select
                          id="gender"
                          required
                          value={formData.gender}
                          onChange={handleChange}
                          className="w-[500px] bg-blue-50 border border-transparent rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">Select Gender</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Right Column - Image Upload */}
                  <div>
                    <div className="flex items-center mb-1">
                      <label htmlFor="image">Image/Logo</label>
                      <div className="ml-2">
                        <imageTooltip.Tooltip {...imageTooltip.tooltipProps}>
                          <div className="text-slate-700 cursor-help">
                            <IoMdInformationCircle size={18} />
                          </div>
                        </imageTooltip.Tooltip>
                      </div>
                    </div>

                    {/* Hidden file input */}
                    <input 
                      ref={fileInputRef}
                      id="file-upload" 
                      name="file-upload" 
                      type="file" 
                      className="sr-only"
                      accept="image/*" 
                      onChange={handleImageChange}
                    />
                    
                    {/* Display image preview or placeholder */}
                    {formData.image instanceof File || formData.imageUrl ? (
                      <div className="bg-blue-50 rounded-md p-3 flex flex-col items-center">
                        <div className="bg-black flex items-center justify-center mb-3">
                          {formData.image instanceof File ? (
                            <img 
                              src={URL.createObjectURL(formData.image)} 
                              alt="Preview" 
                              className="max-h-full max-w-full object-contain"
                            />
                          ) : (
                            <img 
                              src={`http://localhost:8080/api/synexis/employee/image/${formData.employeeId}`} 
                              alt="Preview" 
                              className="max-h-full max-w-full object-contain"
                            />
                          )}
                        </div>
                        
                        <div className="flex justify-between items-center w-full">
                          <button 
                            type="button"
                            onClick={handleBrowseClick}
                            className="flex bg-blue-50 items-center text-sm font-medium hover:border-blue-50 hover:text-[#3B50DF] focus:outline-none"
                          >
                            <span>Change Image</span>
                          </button>
                          
                          <button
                            type="button"
                            onClick={handleDeleteImage}
                            className="text-[#3B50DF] bg-blue-50 hover:text-red-500 hover:border-blue-50 focus:outline-none"
                          >
                            <MdDelete size={25}/>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div 
                        className={`flex flex-col items-center justify-center px-6 pt-5 pb-6 bg-blue-50 border-2 border-dashed rounded-md h-48 transition-colors ${dragActive ? 'border-blue-500 bg-blue-100' : 'border-transparent'}`}
                        onDragEnter={handleDrag}
                        onDragOver={handleDrag}
                        onDragLeave={handleDrag}
                        onDrop={handleDrop}
                      >
                        <div className="space-y-2 text-center">
                          <div className="mx-auto flex items-center rounded-md justify-center">
                            <IoMdImage className="" size={80}/>
                          </div>
                          <div className="flex flex-col text-sm text-gray-600">
                            <span>Drag image here or</span>
                            <button
                              type="button"
                              onClick={handleBrowseClick}
                              className="text-blue-600 bg-blue-50 hover:border-blue-50 hover:text-blue-500 focus:outline-none"
                            >
                              Browse image
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
            
            {/* Tab Content - Contact & Residential Information */}
            {activeTab === 'contactInfo' && (
              <div className="max-h-[calc(100vh-340px)] overflow-y-auto" style={{
                scrollbarWidth: 'thin',
                scrollbarColor: ' #3B50DF #D9D9D9'
              }}>
                <div className="space-y-6">
                  <div className="flex space-x-10">
                    {/* Email Field */}
                    <div>
                      <div className="flex items-center mb-1">
                        <label htmlFor="email">
                          Email<span className="text-red-500">*</span>
                        </label>
                        <div className="ml-2">
                          <emailTooltip.Tooltip {...emailTooltip.tooltipProps}>
                            <div className="text-slate-700 cursor-help">
                              <IoMdInformationCircle size={18} />
                            </div>
                          </emailTooltip.Tooltip>
                        </div>
                      </div>
                      <input
                        type="email"
                        id="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        className="w-64 bg-blue-50 border border-transparent rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    {/* Phone Number Field */}
                    <div>
                      <div className="flex items-center mb-1">
                        <label htmlFor="phoneNumber">
                          Phone Number<span className="text-red-500">*</span>
                        </label>
                        <div className="ml-2">
                          <phoneTooltip.Tooltip {...phoneTooltip.tooltipProps}>
                            <div className="text-slate-700 cursor-help">
                              <IoMdInformationCircle size={18} />
                            </div>
                          </phoneTooltip.Tooltip>
                        </div>
                      </div>
                      <input
                        type="tel"
                        id="phoneNumber"
                        required
                        value={formData.phoneNumber}
                        onChange={handleChange}
                        className="w-64 bg-blue-50 border border-transparent rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div className="flex space-x-10">
                    {/* Address Line 1 Field */}
                    <div>
                      <label htmlFor="addressLine1" className="block mb-1">
                        Address: Line 1<span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="addressLine1"
                        required
                        value={formData.addressLine1}
                        onChange={handleChange}
                        className="w-64 bg-blue-50 border border-transparent rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    {/* City Field */}
                    <div>
                      <label htmlFor="city" className="block mb-1">
                        City<span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="city"
                        required
                        value={formData.city}
                        onChange={handleChange}
                        className="w-64 bg-blue-50 border border-transparent rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div className="flex space-x-10">
                    {/* Address Line 2 Field */}
                    <div>
                      <label htmlFor="addressLine2" className="block mb-1">
                        Address: Line 2
                      </label>
                      <input
                        type="text"
                        id="addressLine2"
                        value={formData.addressLine2}
                        onChange={handleChange}
                        className="w-64 bg-blue-50 border border-transparent rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    {/* Zip Code Field */}
                    <div>
                      <label htmlFor="zipCode" className="block mb-1">
                        Zip Code<span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="zipCode"
                        required
                        value={formData.zipCode}
                        onChange={handleChange}
                        className="w-64 bg-blue-50 border border-transparent rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Tab Content - Employment Details */}
            {activeTab === 'employmentDetails' && (
              <div className="max-h-[calc(100vh-340px)] overflow-y-auto" style={{
                scrollbarWidth: 'thin',
                scrollbarColor: ' #3B50DF #D9D9D9'
              }}>
                <div className="space-y-6">
                  <div className="flex space-x-10">
                    {/* Role Field */}
                    <div>
                      <label htmlFor="employeeRole" className="block mb-1">
                        Role<span className="text-red-500">*</span>
                      </label>
                      <select
                        id="employeeRole"
                        required
                        value={formData.role}
                        className="w-64 bg-blue-50 border border-transparent rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select Role</option>
                        <option value="ESTIMATOR">Estimator</option>
                        <option value="SALES_PERSON">Seles Person</option>
                        <option value="SALES_MANAGER">Seles Manager</option>
                        <option value="ACCOUNTANT">Accountant</option>
                        <option value="DRAFTMAN">Draftman</option>
                        <option value="INVENTORY_MANGER">Inventory Manager</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            
          </div>
          {/* Form Actions */}
            <div className="flex justify-end space-x-3 mt-8">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className={`px-6 py-2 bg-[#3C50E0] text-white font-medium rounded-md hover:bg-blue-800 focus:outline-none flex items-center ${submitting ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {submitting ? (
                  <>
                    <ButtonLoader /> 
                    <span className="ml-2">{isEditMode ? 'Updating...' : 'Saving...'}</span>
                  </>
                ) : (
                  <>{isEditMode ? 'Update' : 'Save'}</>
                )}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="px-6 py-2 bg-gray-200 text-gray-800 font-medium rounded-md hover:bg-gray-300 focus:outline-none"
              >
                Cancel
              </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default AddEmployeePage;
               
              