import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { useState, useEffect } from 'react';
import { Menu, Search } from 'lucide-react';
import { FaEdit } from "react-icons/fa";
import { MdDelete, MdOutlineClose } from "react-icons/md";
import { DataGrid } from '@mui/x-data-grid';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import { categoryService } from '../services/categoryService';
import { ToastContainer } from 'react-toastify';
import { useNotification } from '../hooks/useNotification';

const CategoryView = () => {
  const { notifySuccess, notifyError, notifyWarning, notifyDefault } = useNotification();
  const [searchTerm, setSearchTerm] = useState('');
  const [showSidebar, setShowSidebar] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [paginationModel, setPaginationModel] = useState({
    pageSize: 5,
    page: 0,
  });
  const [loading, setLoading] = useState(false);
  const [categoryLoading, setCategoryLoading] = useState(false);
  
  // For accessing route parameters and state
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get the selectedCategoryId from state or from URL parameter
  const selectedCategoryId = location.state?.selectedCategoryId || id;

  // State for categories
  const [categories, setCategories] = useState([]);

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
  
  // Fetch categories list data
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await categoryService.getAll();
        if (response && response.data) {
          setCategories(response.data);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
        notifyError('Failed to load categories');
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Fetch selected category by ID when selectedCategoryId changes
  useEffect(() => {
    const fetchCategoryById = async (id) => {
      if (!id) return;
      
      try {
        setCategoryLoading(true);
        const response = await categoryService.getById(id);
        if (response && response.data) {
          setSelectedCategory(response.data);
        } else {
          notifyWarning('Category not found');
        }
      } catch (error) {
        console.error('Error fetching category details:', error);
        notifyError('Failed to load category details');
      } finally {
        setCategoryLoading(false);
      }
    };

    if (selectedCategoryId) {
      fetchCategoryById(selectedCategoryId);
    } else if (categories.length > 0 && !selectedCategory) {
      // Default to first category if none selected
      handleCategorySelect(categories[0]);
    }
  }, [selectedCategoryId, categories]);

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

  // Handle category selection and update URL
  const handleCategorySelect = (category) => {
    navigate(`/categoryView/${category.categoryId}`, { 
      state: { selectedCategoryId: category.categoryId },
      replace: true 
    });
    // The useEffect hook with selectedCategoryId dependency will trigger
    // the API call to fetch the category details
  };

  // Filter categories based on search term
  const filteredCategories = searchTerm.trim() === '' 
    ? categories 
    : categories.filter(category => 
        category.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        category.mainCategoryName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        category.categoryName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (category.parentName && category.parentName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        category.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );

  // Material columns setup
  const getMaterialColumns = () => {
    // Base columns
    const columns = [
      { 
        field: 'name', 
        headerName: 'Name', 
        flex: 1,
        minWidth: 180,
        renderCell: (params) => (
          <div className="flex items-center mt-2">
            <div className={`w-2 h-2 rounded-full mr-2 ${params.row.isActive ? 'bg-green-500' : 'bg-red-500'}`}></div>
            {params.row.image && (
              <div>
                <img
                  alt={`${params.row.name} logo`}
                  src={params.row.image}
                  className="size-10 border-2 border-slate-300 mr-2"
                />
              </div>
            )}
            <div className="text-sm font-medium text-gray-900">{params.row.name}</div>
          </div>
        ),
        headerAlign: 'left',
        align: 'left',
        headerClassName: 'name-column-header',
      },
      { 
        field: 'sku', 
        headerName: 'SKU', 
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
          field: 'description', 
          headerName: 'Description', 
          flex: 1,
          minWidth: 200,
          headerAlign: 'left',
          align: 'left'
        },
        { 
          field: 'inStock', 
          headerName: 'In Stock', 
          flex: 0.5,
          minWidth: 100,
          headerAlign: 'left',
          align: 'left'
        },
        { 
          field: 'price', 
          headerName: 'Price', 
          flex: 0.5,
          minWidth: 100,
          headerAlign: 'left',
          align: 'left',
          renderCell: (params) => (
            <span>{params.value?.toFixed(2) || '0.00'}</span>
          )
        }
      );
    }
    
    return columns;
  };

  // Handle back to categories
  const handleBackToCategories = () => {
    navigate('/category');
  };

  const handleEditToCategory = () => {
    navigate(`/editCategory/${selectedCategoryId}`);
  };

  const handleDeleteCategory = async () => {
    if (!selectedCategoryId) return;

    try {
      setLoading(true);
      await categoryService.delete(selectedCategoryId);
      notifySuccess(`Category "${selectedCategory.mainCategoryName ? selectedCategory.mainCategoryName : selectedCategory.categoryName}" successfully deleted`);
      
      // After deletion, navigate back to categories list
      navigate('/category');
    } catch (error) {
      notifyError(`Error deleting category: ${error.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  // Determine if category is a subcategory
  const isSubcategory = (category) => {
    return category && category.categoryName && category.mainCategoryName && category.categoryName !== category.mainCategoryName;
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
          {/* Category Name Panel */}
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

            {/* Category List */}
            <div className="flex-1 overflow-y-auto p-2">
              {loading ? (
                <div className="flex justify-center items-center h-32">
                  <p>Loading categories...</p>
                </div>
              ) : filteredCategories.length > 0 ? (
                filteredCategories.map((category) => (
                  <div 
                    key={category.categoryId}
                    onClick={() => handleCategorySelect(category)}
                    className={`p-2 mb-2 rounded-lg cursor-pointer ${selectedCategoryId == category.categoryId ? 'bg-blue-100' : 'hover:bg-gray-100'}`}
                  >
                    {isSubcategory(category) ? (
                      <div className="flex flex-wrap gap-1">
                        <span className="bg-[#3119C3] text-white text-xs px-2 py-1 rounded-md">{category.mainCategoryName}</span>
                        <span className="bg-[#A0B2F9] text-black text-xs px-2 py-1 rounded-md">{category.categoryName}</span>
                      </div>
                    ) : (
                      <span className="bg-[#3119C3] text-white text-xs px-2 py-1 rounded-md">{category.mainCategoryName}</span>
                    )}
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-gray-500">
                  No categories found
                </div>
              )}
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 p-6 overflow-auto">
            {selectedCategory ? (
              <div className="w-full">
                <div className="flex justify-between items-center mb-4">
                  <h1 className="text-xl font-semibold">
                    {selectedCategory.categoryName}
                  </h1>
                  <div className="flex gap-4 text-[#3B50DF]">
                    <div 
                      className="bg-gray-100 rounded cursor-pointer" 
                      title="Edit Category"
                      onClick={handleEditToCategory}
                    >
                      <FaEdit size={18}/>
                    </div>
                    <div 
                      className="bg-gray-100 rounded cursor-pointer" 
                      title="Delete Category"
                      onClick={handleDeleteCategory}
                    >
                      <MdDelete size={18} />
                    </div>
                    <div 
                      className="bg-gray-100 rounded cursor-pointer" 
                      title="Close/Back to Categories"
                      onClick={handleBackToCategories}
                    >
                      <MdOutlineClose size={18} />
                    </div>
                  </div>
                </div>

                {/* Category Content with Loading State */}
                {categoryLoading ? (
                  <div className="flex items-center justify-center h-64 bg-white rounded-lg shadow">
                    <p>Loading category details...</p>
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
                        <div>
                          {/* General Information */}
                          <div className="mb-8">
                            <h2 className="text-lg font-medium mb-4">General Information</h2>
                            <div className="space-y-3">
                              <div className="flex">
                                <span className="w-32 text-gray-400">Name</span>
                                <span>{selectedCategory.categoryName}</span>
                              </div>
                              <div className="flex">
                                <span className="w-32 text-gray-400">Category ID</span>
                                <span>{selectedCategory.categoryId}</span>
                              </div>
                              <div className="flex">
                                <span className="w-32 text-gray-400">Description</span>
                                <span>{selectedCategory.description || 'No description available'}</span>
                              </div>
                              <div className="flex">
                                <span className="w-32 text-gray-400">Status</span>
                                <span>{selectedCategory.categoryStatus?.toLowerCase()}</span>
                              </div>
                            </div>
                          </div>

                          {/* Categorization */}
                          <div className="mb-8">
                            <h2 className="text-lg font-medium mb-4">Categorization</h2>
                            <div className="space-y-3">
                              {isSubcategory(selectedCategory) ? (
                                <div className="flex">
                                  <span className="w-32 text-gray-400">Sub Category</span>
                                  <span className="bg-[#A0B2F9] text-black text-xs px-2 py-1 rounded-md">
                                    {selectedCategory.categoryName}
                                  </span>
                                  
                                </div>
                              ) : (
                                <div className="flex">
                                  <span className="w-32 text-gray-400">Parent Category</span>
                                  <span className="bg-[#3119C3] text-white text-xs px-2 py-1 rounded-md">
                                    {selectedCategory.categoryName}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Materials Section - Only show if materials exist */}
                          {selectedCategory.materials && selectedCategory.materials.length > 0 ? (
                            <div>
                              <div className="flex justify-between items-center mb-4">
                                <h2 className="text-lg font-medium">Materials</h2>
                              </div>
                              
                              {/* DataGrid with ThemeProvider */}
                              <div className="w-full overflow-x-auto">
                                <ThemeProvider theme={customTheme}>
                                  <DataGrid 
                                    rows={selectedCategory.materials} 
                                    columns={getMaterialColumns()} 
                                    pagination
                                    paginationModel={paginationModel}
                                    onPaginationModelChange={setPaginationModel}
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
                          ) : (
                            <div className="text-center py-6 bg-gray-50 rounded-lg">
                              <p className="text-gray-500">No materials associated with this category</p>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div>
                          <h2 className="text-lg font-semibold mb-4">Activity Log</h2>
                          <div className="space-y-4">
                            <div className="border-l-2 border-blue-500 pl-4 py-2">
                              <p className="text-sm text-gray-500">10 April 2025 09:23</p>
                              <p>Category created by Steve Johns</p>
                            </div>
                            <div className="border-l-2 border-blue-500 pl-4 py-2">
                              <p className="text-sm text-gray-500">10 April 2025 09:25</p>
                              <p>Materials added by Steve Johns</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500">
                  {loading ? 'Loading category details...' : 'Select a category to view details'}
                </p>
              </div>
            )}
          </div>
        </div>
        
      </div>

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

export default CategoryView;