import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { 
  FullPageLoader, 
  InlineLoader, 
  ButtonLoader,
  ContentLoader, 
  ImageLoader
} from '../components/loaders';
import { IoMdAttach } from "react-icons/io";
import { MdDelete } from "react-icons/md";
import { IoMdInformationCircle } from "react-icons/io";
import { ToastContainer } from 'react-toastify';
import { useNotification } from '../hooks/useNotification';
import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import useTooltip from '../hooks/useTooltip';
import { customerService } from '../services/customerService';

const AddCustomerPage = () => {
  const { notifySuccess, notifyError, notifyWarning, notifyDefault } = useNotification();
  const { id } = useParams(); // Get the customer ID from URL if editing
  const isEditMode = !!id;
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    // Personal Details
    prefix: '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
    email: '',
    
    // Address Information
    addressLine1: '',
    addressLine2: '',
    city: '',
    zipCode: '',
    
    // Business Details
    brcFile: null,
    vatFile: null,
    svatFile: null,
    brcUrl: null,
    vatUrl: null,
    svatUrl: null,
    customerId: null
  });

  const [activeTab, setActiveTab] = useState('personalDetails');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const isInitialLoad = useRef(true);

  // File input refs
  const brcFileRef = useRef(null);
  const vatFileRef = useRef(null);
  const svatFileRef = useRef(null);

  // Custom tooltip hooks for info icons
  const emailTooltip = useTooltip(
    () => <div>Enter customer's official email address</div>,
    'right'
  );

  const phoneTooltip = useTooltip(
    () => <div>Enter customer's contact number</div>,
    'right'
  );

  const brcTooltip = useTooltip(
    () => <div>Upload Business Registration Certificate</div>,
    'right'
  );

  const vatTooltip = useTooltip(
    () => <div>Upload VAT Registration document</div>,
    'right'
  );

  const svatTooltip = useTooltip(
    () => <div>Upload SVAT Registration document</div>,
    'right'
  );

  // If in edit mode, fetch the customer details
  useEffect(() => {
    if (isEditMode) {
      const fetchCustomerDetails = async () => {
        setLoading(true);
        try {
          const response = await customerService.getById(id);
          const customerData = response.data;
          
          setFormData({
            prefix: customerData.customerPrefix || '',
            firstName: customerData.customerFirstName || '',
            lastName: customerData.customerLastName || '',
            phoneNumber: customerData.customerPhoneNumber || '',
            email: customerData.customerEmail || '',
            addressLine1: customerData.addressLine1 || '',
            addressLine2: customerData.addressLine2 || '',
            city: customerData.city || '',
            zipCode: customerData.zipCode || '',
            brcFile: null,
            vatFile: null,
            svatFile: null,
            brcUrl: customerData.brcdocUrl || null,
            vatUrl: customerData.vatdocUrl || null,
            svatUrl: customerData.svatdocUrl || null,
            customerId: customerData.customerId
          });
          
        } catch (err) {
          if (isInitialLoad.current) {
            notifyError('Failed to load customer details. Please try again.')
          }
        } finally {
          setLoading(false);
        }
      };

      fetchCustomerDetails();
    }
  }, [id, isEditMode]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleFileChange = (fileType) => (e) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prevState => ({
        ...prevState,
        [fileType]: e.target.files[0]
      }));
    }
  };

  const handleFileDelete = (fileType) => {
    const urlType = fileType.replace('File', 'Url');
    setFormData(prev => ({
      ...prev, 
      [fileType]: null,
      [urlType]: null
    }));
  };

  const handleFileBrowseClick = (fileRef) => {
    if (fileRef.current) {
      fileRef.current.click();
    }
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
    formDataToSend.append('customerPrefix', formData.prefix);
    formDataToSend.append('customerFirstName', formData.firstName);
    formDataToSend.append('customerLastName', formData.lastName);
    formDataToSend.append('customerPhoneNumber', formData.phoneNumber);
    formDataToSend.append('customerEmail', formData.email);
    formDataToSend.append('addressLine1', formData.addressLine1);
    formDataToSend.append('addressLine2', formData.addressLine2 || '');
    formDataToSend.append('city', formData.city);
    formDataToSend.append('zipCode', formData.zipCode);

    // Add files if they are selected
    if (formData.brcFile instanceof File) {
      formDataToSend.append('BRC', formData.brcFile);
    }
    if (formData.vatFile instanceof File) {
      formDataToSend.append('VAT', formData.vatFile);
    }
    if (formData.svatFile instanceof File) {
      formDataToSend.append('SVAT', formData.svatFile);
    }
  
    try {
      if (isEditMode) {
        await customerService.update(id, formDataToSend);
        notifySuccess('Customer updated successfully');
      } else {
        await customerService.create(formDataToSend);
        notifySuccess('Customer added successfully');
      }
      // Redirect to customers list page after successful operation
      navigate('/customer');
    } catch (err) {
      console.error('Error saving customer:', err);
      isEditMode
        ? notifyError('Failed to update customer. Please try again.')
        : notifyError('Failed to create customer. Please try again.') 
    } finally {
      setSubmitting(false);
    }
  };
  
  const handleCancel = () => {
    navigate('/customer');
  };

  if (loading && isEditMode) {
    return <FullPageLoader />;
  }

  const renderFileUpload = (fileType, label, tooltip, fileRef) => {
    const file = formData[fileType];
    const fileUrl = formData[fileType.replace('File', 'Url')];
    
    return (
      <div className="mb-6">
        <div className="flex items-center mb-2">
          <label className="block font-medium">
            {label}:
          </label>
          <div className="ml-2">
            <tooltip.Tooltip {...tooltip.tooltipProps}>
              <div className="text-slate-700 cursor-help">
                <IoMdInformationCircle size={18} />
              </div>
            </tooltip.Tooltip>
          </div>
        </div>

        {/* Hidden file input */}
        <input 
          ref={fileRef}
          type="file" 
          className="sr-only"
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
          onChange={handleFileChange(fileType)}
        />

        {file instanceof File || fileUrl ? (
          <div className="w-[500px] bg-blue-50 rounded-md p-2 flex items-center justify-between">
            <div className="flex items-center">
              <IoMdAttach size={20} className="text-blue-600 mr-2" />
              <span className="text-sm text-gray-700">
                {file instanceof File ? file.name : 'Uploaded file'}
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              <button 
                type="button"
                onClick={() => handleFileBrowseClick(fileRef)}
                className="text-sm bg-blue-50 text-blue-600 hover:text-blue-800 focus:outline-none"
              >
                Change File
              </button>
              
              <button
                type="button"
                onClick={() => handleFileDelete(fileType)}
                className="text-[#3C50E0] bg-blue-50 hover:text-red-700 focus:outline-none"
              >
                <MdDelete size={20}/>
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => handleFileBrowseClick(fileRef)}
            className="w-[400px] bg-blue-50 border-2 border-dashed border-blue-200 rounded-md p-2 text-center hover:border-blue-300 hover:bg-blue-100 focus:outline-none transition-colors"
          >
            <div className="flex items-center">
              <IoMdAttach size={20} className="text-blue-600" />
              <span className="text-sm text-blue-600 font-medium">Add File</span>
            </div>
          </button>
        )}
      </div>
    );
  };

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
            {isEditMode ? 'Update Customer' : 'Customer Registration'}
          </h1>

          {/* Error message */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {/* Add/Edit Customer Form */}
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
                className={`px-6 py-3 font-medium text-sm bg-white hover:border-white ${activeTab === 'addressInfo' ? 'border-b-2 rounded-none border-b-[#3119C3]' : 'text-gray-500'} focus:outline-none`}
                onClick={() => handleTabChange('addressInfo')}
              >
                Address Information
              </button>
              <button 
                className={`px-6 py-3 font-medium text-sm bg-white hover:border-white ${activeTab === 'businessDetails' ? 'border-b-2 rounded-none border-b-[#3119C3]' : 'text-gray-500'} focus:outline-none`}
                onClick={() => handleTabChange('businessDetails')}
              >
                Business Details
              </button>
            </div>
            <hr className='mt-2 mb-5'/>
            
            {/* Tab Content - Personal Details */}
            {activeTab === 'personalDetails' && (
              <div className="max-h-[calc(100vh-360px)] overflow-y-auto" style={{
                scrollbarWidth: 'thin',
                scrollbarColor: ' #3B50DF #D9D9D9'
              }}>
                <div className="space-y-6">
                  <div className="flex space-x-10 mb-4">
                    {/* Prefix Field */}
                    <div>
                      <label htmlFor="prefix" className="block mb-1">
                        Employee Prefix
                      </label>
                      <select
                        id="prefix"
                        value={formData.prefix}
                        onChange={handleChange}
                        className="w-64 bg-blue-50 border border-transparent rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select Prefix</option>
                        <option value="Mr.">Mr</option>
                        <option value="Ms.">Ms</option>
                        <option value="Mrs.">Mrs</option>             
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
                        className="w-full bg-blue-50 border border-transparent rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

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
                        className="w-full bg-blue-50 border border-transparent rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Tab Content - Address Information */}
            {activeTab === 'addressInfo' && (
              <div className="max-h-[calc(100vh-340px)] overflow-y-auto" style={{
                scrollbarWidth: 'thin',
                scrollbarColor: ' #3B50DF #D9D9D9'
              }}>
                <div className="space-y-6">
                  <div className="flex space-x-10">
                    {/* Address Line 1 Field */}
                    <div>
                      <label htmlFor="addressLine1" className="block mb-1">
                        Address: <br/>Line 1<span className="text-red-500">*</span>
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
                        Line 2
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
            
            {/* Tab Content - Business Details */}
            {activeTab === 'businessDetails' && (
              <div className="max-h-[calc(100vh-380px)] overflow-y-auto" style={{
                scrollbarWidth: 'thin',
                scrollbarColor: ' #3B50DF #D9D9D9'
              }}>
                <div className="space-y-6">
                  {/* BRC File Upload */}
                  {renderFileUpload('brcFile', 'Business Registration Certificate (BRC)', brcTooltip, brcFileRef)}
                  
                  {/* VAT File Upload */}
                  {renderFileUpload('vatFile', 'VAT Registration', vatTooltip, vatFileRef)}
                  
                  {/* SVAT File Upload */}
                  {renderFileUpload('svatFile', 'SVAT Registration', svatTooltip, svatFileRef)}
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
              {submitting ? <ButtonLoader text={isEditMode ? "Updating..." : "Saving..."} /> : isEditMode ? 'Update' : 'Save'}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className='bg-gray-100 text-black border border-[#3B50DF] px-4 py-2 rounded hover:bg-gray-100 disabled:opacity-50'
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddCustomerPage;