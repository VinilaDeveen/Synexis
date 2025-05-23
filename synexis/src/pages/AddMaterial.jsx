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
import { unitService } from '../services/unitService';
import { materialService } from '../services/materialService';
import { brandService } from '../services/brandService';
import { categoryService } from '../services/categoryService';

const AddMaterialPage = () => {
  const { notifySuccess, notifyError, notifyWarning, notifyDefault } = useNotification();
  const { id } = useParams(); // Get the material ID from URL if editing
  const isEditMode = !!id;
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
  sku: '',
  description: '',
  partNumber: '',
  image: null,
  materialId: null,
  imageUrl: null,
  inventoryType: '',
  materialType: '',
  brandId: '', 
  parentCategoryId: '', 
  make: '',
  purchasePrice: 0.00,
  marketPrice: 0.00,
  alertQuantity: 0.00,
  baseUnitId: '', 
  otherUnitId: '',
  materialForUse: false 
  });

  const [brands, setBrands] = useState([]);
  const [Categories, setCategories] = useState([]);
  const [SubCategories, setSubCategories] = useState([]);
  const [BaseUnits, setBaseUnits] = useState([]);
  const [OtherUnits, setOtherUnits] = useState([]);
  const [activeTab, setActiveTab] = useState('generalInfo');
  const [imageChanged, setImageChanged] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const isInitialLoad = useRef(true);
  const isInitialLoad1 = useRef(true);
  const isInitialLoad2 = useRef(true);

  // Custom tooltip hooks for info icons
  const skuTooltip = useTooltip(
    () => <div>Enter a unique identifier for this material</div>,
    'right'
  );

  const imageTooltip = useTooltip(
    () => <div>Upload an image of the material</div>,
    'right'
  );

  const descriptionTooltip = useTooltip(
    () => <div>Provide details about the material's properties and uses</div>,
    'right'
  );

  const purchasepriceTooltip = useTooltip(
    () => <div>Provide details about the material's properties and uses</div>,
    'right'
  );

  const marketpriceTooltip = useTooltip(
    () => <div>Provide details about the material's properties and uses</div>,
    'right'
  );

    // Fetch brands for dropdown
    useEffect(() => {
      const fetchBrands = async () => {
        try {
          const response = await brandService.getAll();
          setBrands(response.data);
        } catch (err) {
          if (isInitialLoad1.current) {
            notifyError('Failed to load brands. Please try again.')
            isInitialLoad1.current = false;
          }
          
        }
      };
  
      fetchBrands();
    }, []);

    // Fetch parent categories for dropdown
    useEffect(() => {
        const fetchCategories = async () => {
          try {
            const response = await categoryService.getAllCategories();
            setCategories(response.data);
          } catch (err) {
            if (isInitialLoad2.current) {
              notifyError('Failed to load categories. Please try again.')
              isInitialLoad2.current = false;
            }
            
          }
        };
      fetchCategories();
    }, []);

    // Fetch sub category for dropdown
    useEffect(() => {
    const fetchSubCategories = async () => {
      // Only fetch subcategories if a parent category is selected
      if (formData.parentCategoryId) {
        try {
          const response = await categoryService.getAllSubCategories(formData.parentCategoryId);
          setSubCategories(response.data);
        } catch (err) {
          if (isInitialLoad2.current) {
            notifyError('Failed to load subcategories. Please try again.')
            isInitialLoad2.current = false;
          }
        }
      } else {
        // Clear subcategories if no parent category is selected
        setSubCategories([]);
      }
    };

    fetchSubCategories();
  }, [formData.parentCategoryId]);

  // Fetch base unit for dropdown
    useEffect(() => {
        const fetchBaseUnits = async () => {
          try {
            const response = await unitService.getAllBaseUnits();
            setBaseUnits(response.data);
          } catch (err) {
            if (isInitialLoad2.current) {
              notifyError('Failed to load categories. Please try again.')
              isInitialLoad2.current = false;
            }
            
          }
        };
      fetchBaseUnits();
    }, []);

    // Fetch other unit for dropdown
    useEffect(() => {
        const fetchOtherUnits = async () => {
          if (formData.baseUnitId) {
            try {
                const response = await unitService.getAllOtherUnits(formData.baseUnitId);
                setOtherUnits(response.data);
              } catch (err) {
                if (isInitialLoad2.current) {
                  notifyError('Failed to load categories. Please try again.')
                  isInitialLoad2.current = false;
                }
                
              }
      } else {
        // Clear subcategories if no parent category is selected
        setOtherUnits([]);
      }
        };
      fetchOtherUnits();
    }, [formData.baseUnitId]);


  // If in edit mode, fetch the material details
  useEffect(() => {
    if (isEditMode) {
      const fetchMaterialDetails = async () => {
        setLoading(true);
        try {
          const response = await materialService.getById(id);
          const materialData = response.data;
          console.log(materialData);
          
          setFormData({
            name: materialData.materialName,
            sku: materialData.materialSKU,
            description: materialData.materialDescription,
            partNumber: materialData.materialPartNumber,
            image: null,
            materialId: materialData.materialId,
            imageUrl: materialData.materialImageUrl,
            inventoryType: materialData.materialInventoryType,
            materialType: materialData.materialType,
            brandId: materialData.brandId,
            parentCategoryId: materialData.categoryId,
            subCategoryId: materialData.subCategoryId,
            make: materialData.materialMake,
            purchasePrice: materialData.materialPurchasePrice,
            marketPrice: materialData.materialMarketPrice,
            alertQuantity: materialData.alertQuantity,
            baseUnitId: materialData.baseUnitId,
            otherUnitId: materialData.otherUnitId,
            materialForUse: materialData.materialForUse
          });
          
        } catch (err) {
          if (isInitialLoad.current) {
            notifyError('Failed to load material details. Please try again.')
          }
        } finally {
          setLoading(false);
        }
      };

      fetchMaterialDetails();
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

  const handleBrandChange = (e) => {
  const value = e.target.value;
  setFormData(prev => ({
    ...prev,
    brandId: value || ''
  }));
};

const handleCategoryChange = (e) => {
  const value = e.target.value;
  setFormData(prev => ({
    ...prev,
    parentCategoryId: value || '' 
  }));
};

const handleSubCategoryChange = (e) => {
  const value = e.target.value;
  setFormData(prev => ({
    ...prev,
    subCategoryId: value || '' 
  }));
};

const handleBaseUnitChange = (e) => {
  const value = e.target.value;
  setFormData(prev => ({
    ...prev,
    baseUnitId: value || '' 
  }));
};

const handleOtherUnitChange = (e) => {
  const value = e.target.value;
  setFormData(prev => ({
    ...prev,
    otherUnitId: value || '' 
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
    setFormData(prev => ({...prev, image: null}));
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
    formDataToSend.append('materialName', formData.name);
    formDataToSend.append('materialSKU', formData.sku); 
    formDataToSend.append('materialDescription', formData.description || '');
    formDataToSend.append('materialPartNumber', formData.partNumber || '');
    formDataToSend.append('materialInventoryType', formData.inventoryType || ''); 
    formDataToSend.append('materialType', formData.materialType || '');
    formDataToSend.append('brandId', formData.brandId); 
    formDataToSend.append('categoryId', formData.parentCategoryId); 
    formDataToSend.append('subCategoryId', formData.subCategoryId || null);
    formDataToSend.append('materialMake', formData.make || ''); 
    formDataToSend.append('materialPurchasePrice', Number(formData.purchasePrice) || 0);
    formDataToSend.append('materialMarketPrice', Number(formData.marketPrice) || 0); 
    formDataToSend.append('alertQuantity', Number(formData.alertQuantity) || 0); 
    formDataToSend.append('baseUnitId', formData.baseUnitId || null); 
    formDataToSend.append('otherUnitId', formData.otherUnitId || null);
    formDataToSend.append('materialForUse', formData.materialForUse || false);

    // Add the image if one is selected
    if (formData.image instanceof File) {
      formDataToSend.append('materialImage', formData.image);
    }
  
    try {
      if (isEditMode) {
        await materialService.update(id, formDataToSend);
      } else {
        await materialService.create(formDataToSend);
        console.log(formDataToSend);
      }
      // Redirect to materials list page after successful operation
      navigate('/material');
    } catch (err) {
      console.log(formData);
      console.error('Error saving material:', err);
      isEditMode
        ? notifyError('Failed to update material. Please try again.')
        : notifyError('Failed to create material. Please try again.') 
    } finally {
      setSubmitting(false);
    }
  };
  
  const handleCancel = () => {
    navigate('/material');
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
            {isEditMode ? 'Update Material' : 'New Material'}
          </h1>

          {/* Error message */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {/* Add/Edit Material Form */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            {/* Tabs */}
            <div className="flex">
              <button 
                className={`px-6 py-3 font-medium text-sm bg-white hover:border-white ${activeTab === 'generalInfo' ? 'border-b-2 rounded-none border-b-[#3119C3]' : 'text-gray-500'} focus:outline-none`}
                onClick={() => handleTabChange('generalInfo')}
              >
                General Information
              </button>
              <button 
                className={`px-6 py-3 font-medium text-sm bg-white hover:border-white ${activeTab === 'classification' ? 'border-b-2 rounded-none border-b-[#3119C3]' : 'text-gray-500'} focus:outline-none`}
                onClick={() => handleTabChange('classification')}
              >
                Classification
              </button>
              <button 
                className={`px-6 py-3 font-medium text-sm bg-white hover:border-white ${activeTab === 'pricing' ? 'border-b-2 rounded-none border-b-[#3119C3]' : 'text-gray-500'} focus:outline-none`}
                onClick={() => handleTabChange('pricing')}
              >
                Pricing
              </button>
              <button 
                className={`px-6 py-3 font-medium text-sm bg-white hover:border-white ${activeTab === 'stockControl' ? 'border-b-2 rounded-none border-b-[#3119C3]' : 'text-gray-500'} focus:outline-none`}
                onClick={() => handleTabChange('stockControl')}
              >
                Stock Control
              </button>
            </div>
            <hr className='mt-2 mb-5'/>
            {/* Tab Content - General Information */}
            {activeTab === 'generalInfo' && (
              <div className="max-h-[calc(100vh-340px)] overflow-y-auto" style={{
                          scrollbarWidth: 'thin',
                          scrollbarColor: ' #3B50DF #D9D9D9'
                        }}>
                <form className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left Column */}
                    <div className="space-y-6">
                      <div className='flex space-x-10'>
                        {/* Name Field */}
                        <div>
                            <label htmlFor="name" className="flex items-center">
                            Name<span className="text-red-500">*</span>
                            </label>
                            <input
                            type="text"
                            id="name"
                            name="name"
                            required
                            value={formData.name}
                            onChange={handleChange}
                            className="mt-1 block w-full bg-blue-50 border border-transparent rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>

                        {/* SKU Field */}
                        <div>
                            <div className="flex items-center">
                            <label htmlFor="sku">
                                SKU<span className="text-red-500">*</span>
                            </label>
                            <div className="ml-2">
                                <skuTooltip.Tooltip {...skuTooltip.tooltipProps}>
                                <div className="text-slate-700 cursor-help">
                                    <IoMdInformationCircle size={18} />
                                </div>
                                </skuTooltip.Tooltip>
                            </div>
                            </div>
                            <input
                            type="text"
                            id="sku"
                            name="sku"
                            required
                            value={formData.sku}
                            onChange={handleChange}
                            className="mt-1 block w-full bg-blue-50 border border-transparent rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                      </div>

                      {/* Description Field */}
                      <div>
                        <div className="flex items-center">
                          <label htmlFor="description">Description</label>
                          <div className="ml-2">
                            <descriptionTooltip.Tooltip {...descriptionTooltip.tooltipProps}>
                              <div className="text-slate-700 cursor-help">
                                <IoMdInformationCircle size={18} />
                              </div>
                            </descriptionTooltip.Tooltip>
                          </div>
                        </div>
                        <textarea
                          id="description"
                          rows={4}
                          value={formData.description}
                          onChange={handleChange}
                          className="mt-1 block w-full bg-blue-50 border border-transparent rounded-md shadow-sm p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      {/* Part Number */}
                      <div>
                        <label htmlFor="partNumber">Part Number</label>
                        <input
                          type="text"
                          id="partNumber"
                          name="partNumber"
                          value={formData.partNumber}
                          onChange={handleChange}
                          className="mt-1 block w-full bg-blue-50 border border-transparent rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-6">
                      {/* Image Upload */}
                      <div>
                        <div className="flex items-center">
                          <label htmlFor="image">Image</label>
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
                                  src={`http://localhost:8080/api/synexis/material/image/${formData.materialId}`} 
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
                </form>
              </div>
            )}
            
            {/* Tab Content - Classification */}
            {activeTab === 'classification' && (
              <div className="p-4 text-center text-gray-500">
                <form className="space-y-6">
                    <div className="flex space-x-36">
                        {/* Inventory Type Field */}
                        <div className='space-y-1'>
                            <label htmlFor="inventoryType" className="flex text-black items-center">
                            Inventory Type<span className="text-red-500">*</span>
                            </label>
                            <select
                              id="inventoryType" // Changed from "inventoryType" to match state property
                              value={formData.inventoryType} // Changed from "invetoryType" to "inventoryType"
                              onChange={handleChange}
                              className="py-2 bg-[#E3F0FF] w-[250px] rounded focus:outline-none"
                              required
                            >
                              <option value="">Select Inventory Type</option>
                              <option value="ELECTRICAL">Electrical</option>
                              <option value="MECHANICAL">Mechanical</option>
                            </select>
                        </div>
                        {/* Material Type Field */}
                        <div className='space-y-1'>
                            <label htmlFor="materialType" className="flex text-black items-center">
                            Material Type<span className="text-red-500">*</span>
                            </label>
                            <select
                                id='materialType'
                                value={formData.materialType}
                                onChange={handleChange} //Should be check in backend integration
                                className="py-2 bg-[#E3F0FF] w-[250px] rounded focus:outline-none"
                                required
                            >
                                <option value="">Select Material Type</option>
                                <option value="SWITCH_GEAR_COMPONENTS">Switch Gear Component</option>
                                <option value="CONTROL_ACCESSORIES">Control Accessories</option>
                                <option value="BUSBAR">Bus Bar</option>
                                <option value="WIRING">Wiring</option>
                                <option value="OTHER_ACCESSORIES">Other Accessories</option>
                                <option value="ENCLOSURE">Enclosure</option>
                            </select>
                        </div>
                        {/* Brand Field */}
                        <div className='space-y-1'>
                            <label htmlFor="materialBrand" className="flex text-black items-center">
                            Brand<span className="text-red-500">*</span>
                            </label>
                            <select
                                id='materialBrand'
                                value={formData.brandId}
                                onChange={handleBrandChange} //Should be check in backend integration
                                className="py-2 bg-[#E3F0FF] w-[250px] rounded focus:outline-none"
                                required
                            >
                                <option value="">Select Brand</option>
                                {brands
                                    .filter(brand => brand && brand.brandId && brand.brandName) // Filter out null/undefined brands
                                    .map(brand => (
                                        <option key={brand.brandId} value={brand.brandId}>
                                            {brand.brandName}
                                        </option>
                                    ))
                                }
                            </select>
                        </div>
                    </div>
                    <div className="flex space-x-36">
                        {/* Category Field */}
                        <div className='space-y-1'>
                            <label htmlFor="materialCategory" className="flex text-black items-center">
                            Category<span className="text-red-500">*</span>
                            </label>
                            <select
                                id='materialCategory'
                                value={formData.parentCategoryId}
                                onChange={handleCategoryChange} //Should be check in backend integration
                                className="py-2 bg-[#E3F0FF] w-[250px] rounded focus:outline-none"
                                required
                            >
                                <option value="">Select Category</option>
                                {Categories
                                    .filter(category => category && category.categoryId && category.categoryName)
                                    .map(category => (
                                        <option key={category.categoryId} value={category.categoryId}>
                                            {category.categoryName}
                                        </option>
                                    ))
                                }
                            </select>
                        </div>
                        {/* Sub Category Field */}
                        <div className='space-y-1'>
                            <label htmlFor="materialSubCategory" className="flex text-black items-center">
                            Sub Category<span className="text-red-500">*</span>
                            </label>
                            <select
                                id='materialSuCategory'
                                value={formData.subCategoryId}
                                onChange={handleSubCategoryChange} //Should be check in backend integration
                                className="py-2 bg-[#E3F0FF] w-[250px] rounded focus:outline-none"
                                required
                            >
                                <option value="">Select Category</option>
                                {SubCategories                            
                                    .map(subCategory => (
                                        <option key={subCategory.categoryId} value={subCategory.categoryId}>
                                            {subCategory.categoryName}
                                        </option>
                                    ))
                                }
                            </select>
                        </div>
                        {/* Make Field */}
                        <div>
                            <div className="flex items-center">
                            <label htmlFor="materialmake">
                                Make<span className="text-red-500">*</span>
                            </label>
                            </div>
                            <input
                              type="text"
                              id="make"
                              name="make"
                              required
                              value={formData.make}
                              onChange={handleChange}
                              className="mt-1 block w-[250px] bg-[#E3F0FF] border border-transparent rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                    </div>
                </form>
              </div>
            )}
            
            {activeTab === 'pricing' && (
              <div className="p-4 text-center text-gray-500">
               <form  className="space-y-6">
                <div className='flex space-x-36'>
                    {/* Purchase Price Field */}
                    <div>
                        <div className="flex items-center">
                        <label htmlFor="purchasePrice">
                            Purchase Price<span className="text-red-500">*</span>
                        </label>
                        <div className="ml-2">
                            <purchasepriceTooltip.Tooltip {...purchasepriceTooltip.tooltipProps}>
                            <div className="text-slate-700 cursor-help">
                                <IoMdInformationCircle size={18} />
                            </div>
                            </purchasepriceTooltip.Tooltip>
                        </div>
                        </div>
                        <input
                          type="number"
                          id="purchasePrice"
                          name="purchasePrice"
                          required
                          value={formData.purchasePrice}
                          onChange={handleChange}
                          className="mt-1 block w-full bg-blue-50 border border-transparent rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    {/* Purchase Price Field */}
                    <div>
                        <div className="flex items-center">
                        <label htmlFor="marketPrice">
                            Market Price<span className="text-red-500">*</span>
                        </label>
                        <div className="ml-2">
                            <marketpriceTooltip.Tooltip {...marketpriceTooltip.tooltipProps}>
                            <div className="text-slate-700 cursor-help">
                                <IoMdInformationCircle size={18} />
                            </div>
                            </marketpriceTooltip.Tooltip>
                        </div>
                        </div>
                        <input
                          type="number"
                          id="marketPrice"
                          name="marketPrice"
                          required
                          value={formData.marketPrice}
                          onChange={handleChange}
                          className="mt-1 block w-full bg-blue-50 border border-transparent rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                </div>
               </form>
              </div>
            )}
            
            {activeTab === 'stockControl' && (
              <div className="p-4 text-center text-gray-500">
               <form  className="space-y-6">
                <div className='flex space-x-36'>
                    {/* Alert Quantity Field */}
                    <div>
                        <div className="flex items-center">
                        <label htmlFor="purchasePrice">
                            Alert Quantity<span className="text-red-500">*</span>
                        </label>
                        <div className="ml-2">
                            <purchasepriceTooltip.Tooltip {...purchasepriceTooltip.tooltipProps}>
                            <div className="text-slate-700 cursor-help">
                                <IoMdInformationCircle size={18} />
                            </div>
                            </purchasepriceTooltip.Tooltip>
                        </div>
                        </div>
                        <input
                          type="number"
                          id="alertQuantity"
                          name="alertQuantity"
                          required
                          value={formData.alertQuantity}
                          onChange={handleChange}
                          className="mt-1 block w-full bg-blue-50 border border-transparent rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    {/* Base Unit Field */}
                    <div>
                      <label htmlFor="materialBaseUnit" className="flex text-black items-center">
                        Base Unit<span className="text-red-500">*</span>
                      </label>
                        <select
                          id='materialBaseUnit'
                          value={formData.baseUnitId}
                          onChange={handleBaseUnitChange} //Should be check in backend integration
                          className="py-2 bg-[#E3F0FF] w-[250px] rounded focus:outline-none"
                          required
                        >
                          <option value="">Select Base Unit</option>
                            {BaseUnits
                              .filter(baseUnit => baseUnit.baseUnitId && baseUnit.baseUnitName)
                              .map(baseUnit => (
                                <option key={baseUnit.baseUnitId} value={baseUnit.baseUnitId}>
                                  {baseUnit.baseUnitName}
                                </option>
                              ))
                            }
                        </select>
                    </div>
                    {/* Other Unit Field */}
                    <div>
                      <label htmlFor="materialOtherUnit" className="flex text-black items-center">
                        Other Unit<span className="text-red-500">*</span>
                      </label>
                        <select
                          id='materialOtherUnit'
                          value={formData.otherUnitId}
                          onChange={handleOtherUnitChange} 
                          className="py-2 bg-[#E3F0FF] w-[250px] rounded focus:outline-none"
                          
                        >
                          <option value="">Select Other Unit</option>
                            {OtherUnits
                              .filter(otherUnit => otherUnit.otherUnitId && otherUnit.otherUnitName)
                              .map(otherUnit => (
                                <option key={otherUnit.otherUnitId} value={otherUnit.otherUnitId}>
                                  {otherUnit.otherUnitName}
                                </option>
                              ))
                            }
                        </select>
                    </div>
                </div>
                <div>
                {/*Eligible for production */}
                <div className="flex items-center mt-4">
                  <input
                    type="checkbox"
                    id="materialForUse"
                    name="materialForUse"
                    checked={formData.materialForUse}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      materialForUse: e.target.checked
                    }))}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 cursor-pointer"
                  />
                  <label className="text-black cursor-pointer ml-2" htmlFor="materialForUse">
                    Eligible for production use
                  </label>
                </div>
              </div>
               </form>
              </div>
            )}
          </div>
          {/* Action Buttons */}
          <div className='flex justify-end mt-4 mb-8 mr-8'>
            <button 
              onClick={handleSubmit}
              disabled={submitting}
              className='bg-[#3C50E0] text-white px-6 py-2 rounded mr-4 hover:bg-blue-700 disabled:bg-[#3C50E0]'
            >
              {submitting ? <ButtonLoader text={isEditMode ? "Updating..." : "Saving..."} /> : isEditMode ? 'Update' : 'Save'}
            </button>
            <button 
              type='button'
              onClick={handleCancel}
              disabled={submitting}
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

export default AddMaterialPage;