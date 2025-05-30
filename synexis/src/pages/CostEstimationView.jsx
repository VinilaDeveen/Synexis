import React from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import RecentActivities from '../components/RecentActivity';
import { 
  FullPageLoader, 
  InlineLoader, 
  ButtonLoader 
} from '../components/loaders';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Search, Menu, ChevronDown, ChevronRight } from 'lucide-react';
import { IoChevronBackOutline } from "react-icons/io5";
import { LuHistory } from "react-icons/lu";
import { ToastContainer } from 'react-toastify';
import { useNotification } from '../hooks/useNotification';
import { costEstimationService } from '../services/costEstimationService';
import { recentActivityService } from '../services/recentActivityService';

const CostEstimationViewPage = () => {
  const { notifySuccess, notifyError, notifyWarning, notifyDefault } = useNotification();
  const { inquiryId } = useParams(); 
  const { id } = useParams(); // Get the estimation ID from URL if editing
  const isEditMode = !!id;
  const navigate = useNavigate();

  // Add loading state for edit mode
  
  const [recentActivities, setRecentActivities] = useState([]);
  const [showActivities, setShowActivities] = useState(false);
  const [loading, setLoading] = useState(true); // Start loading if in edit mode
  const isInitialLoad = useRef(true);
  
  // State for sidebar visibility
  const [showSidebar, setShowSidebar] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  const [quotationNumber, setQuotationNumber] = useState("");
  
  // State for items (columns)
  const [items, setItems] = useState([
  ]);
  
  // Sections state with expansion status
  const [sections, setSections] = useState([
  { 
    id: 1, 
    name: 'Switch Gear Components', 
    expanded: true,
    materials: []
  },
  { 
    id: 2, 
    name: 'Control Accessories', 
    expanded: true,
    materials: []
  },
  { 
    id: 3, 
    name: 'Bus Bar', 
    expanded: true,
    materials: []
  },
  { 
    id: 4, 
    name: 'Wiring', 
    expanded: true,
    materials: []
  },
  { 
    id: 5, 
    name: 'Other Accessories', 
    expanded: true,
    materials: []
  },
  { 
    id: 6, 
    name: 'Electrical Labor', 
    expanded: true,
    materials: [

    ]
  },
  { 
    id: 7, 
    name: 'Transport', 
    expanded: true,
    materials: []
  },
  { 
    id: 8, 
    name: 'Enclosure', 
    expanded: true,
    materials: []
  }
]);

  

  // Item quantities (for the first row)
  const [itemQuantities, setItemQuantities] = useState({
  });



  const [searchTerm, setSearchTerm] = useState('');

  // Add state for electrical and mechanical costs
  const [electricalCost, setElectricalCost] = useState({
    total: 0,
    byItem: {}
  });

  const [mechanicalCost, setMechanicalCost] = useState({
    total: 0,
    byItem: {}
  });

//////////////////////////////

  const [showBeforeMarkup, setShowBeforeMarkup] = useState(true);

  const [sectionTotals, setSectionTotals] = useState({
    "Switch Gear Components": { 
      total: 0, 
      byItem: {},
      afterMarkup: {
        total: 0,
        byItem: {}
      }
    },
    "Control Accessories": { 
      total: 0, 
      byItem: {},
      afterMarkup: {
        total: 0,
        byItem: {}
      }
    },
    "Bus Bar": { 
      total: 0, 
      byItem: {},
      afterMarkup: {
        total: 0,
        byItem: {}
      }
    },
    "Wiring": { 
      total: 0, 
      byItem: {},
      afterMarkup: {
        total: 0,
        byItem: {}
      }
    },
    "Other Accessories": { 
      total: 0, 
      byItem: {},
      afterMarkup: {
        total: 0,
        byItem: {}
      }
    },
    "Electrical Labor": { 
      total: 0, 
      byItem: {},
      afterMarkup: {
        total: 0,
        byItem: {}
      }
    },
    "Transport": { 
      total: 0, 
      byItem: {},
      afterMarkup: {
        total: 0,
        byItem: {}
      }
    },
    "Enclosure": { 
      total: 0, 
      byItem: {},
      afterMarkup: {
        total: 0,
        byItem: {}
      }
    }
  });



  const [showMarkup, setShowMarkup] = useState(true);
  const [showAfterMarkup, setShowAfterMarkup] = useState(true);

  // Fetch recent activities from API
  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setLoading(true);
        const response = await recentActivityService.getAllCategoryActivity();
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

  useEffect(() => {
  // Initialize markups when materials are added/removed
  setMarkupPercentages(prev => {
    const newMarkups = { ...prev };
    let needsUpdate = false;
    
    // Add missing items
    items.forEach(item => {
      if (!newMarkups[item.id]) {
        newMarkups[item.id] = {
          switchGearComponentMarkup: 0,
          controlAccessoryMarkup: 0,
          busBarMarkup: 0,
          wiringMarkup: 0,
          otherAccessoryMarkup: 0,
          electricalLabourMarkup: 0,
          transportMarkup: 0,
          enclosureMarkup: 0
        };
        needsUpdate = true;
      }
    });
    
    // Remove deleted items
    Object.keys(newMarkups).forEach(itemId => {
      if (!items.some(m => m.id === itemId)) {
        delete newMarkups[itemId];
        needsUpdate = true;
      }
    });
    
    return needsUpdate ? newMarkups : prev;
  });
}, [items]);


  // Fetch estimation data if in edit mode
  // In the useEffect for fetching estimation data, update the data transformation:

  useEffect(() => {
      const fetchEstimationData = async () => {
        try {
          const response = await costEstimationService.getById(id);
          const estimationData = response.data;
          
          // Transform the backend data to match our frontend state structure
          setQuotationNumber(estimationData.quotationVersion);
          
          // Process items from the backend data
          const backendItems = estimationData.items || [];
          const frontendItems = backendItems.map(item => ({
            id: item.itemId.toString(),
            name: item.itemName
          }));
          setItems(frontendItems);
          
          // Process item quantities
          const quantities = {};
          backendItems.forEach(item => {
            quantities[item.itemId.toString()] = item.itemQuantity;
          });
          setItemQuantities(quantities);
          
          // Process sections and materials
          const sectionMap = {
            'Switch Gear Components': 1,
            'Control Accessories': 2,
            'Bus Bar': 3,
            'Wiring': 4,
            'Other Accessories': 5,
            'Electrical Labor': 6,
            'Transport': 7,
            'Enclosure': 8
          };

          // Initialize sections with materials from backend
          const frontendSections = sections.map(section => {
            const sectionMaterials = [];
            
            // Find all materials that belong to this section
            backendItems.forEach(item => {
              item.itemMaterials.forEach(material => {
                if (material.sectionId === sectionMap[section.name]) {
                  // Create quantities array that matches items order
                  const quantities = new Array(frontendItems.length).fill(0);
                  const itemIndex = frontendItems.findIndex(i => i.id === item.itemId.toString());
                
                  if (itemIndex !== -1) {
                    quantities[itemIndex] = material.materialQuantity || 0;
                  }
                  
                  sectionMaterials.push({
                    id: material.materialId,
                    name: material.materialName,
                    marketPrice: material.materialMarketPrice || 0,
                    unitPrice: material.unitPrice || 0,
                    discount: material.discount || 0,
                    discountedPrice: (material.unitPrice || 0) * (1 - (material.discount || 0) / 100),
                    material: material.material || '-',
                    materialDescription: material.materialDescription || '-',
                    materialPartNumber: material.materialPartNumber || '-',
                    materialMake: material.materialMake || '-',
                    countryOfOrigin: material.materialCountry || '-',
                    quantities: quantities
                  });
                }
              });
            });
            
            return {
              ...section,
              materials: sectionMaterials  
            };
          });
          
          setSections(frontendSections);

          // Process markups
          const markups = {};
          backendItems.forEach(item => {
            const stringId = item.itemId.toString();
            markups[stringId] = {
              switchGearComponentMarkup: item.switchGearComponentMarkup || 0,
              controlAccessoryMarkup: item.controlAccessoryMarkup || 0,
              busBarMarkup: item.busBarMarkup || 0,
              wiringMarkup: item.wiringMarkup || 0,
              otherAccessoryMarkup: item.otherAccessoryMarkup || 0,
              electricalLabourMarkup: item.electricalLabourMarkup || 0,
              transportMarkup: item.transportMarkup || 0,
              enclosureMarkup: item.enclosureMarkup || 0,
            };
          });

          setMarkupPercentages(markups);
          
          // Process labor rate and other rates
          setLaborRate(estimationData.labourRate || 0);
          setOtherCostRate(estimationData.otherCostRate || 0);
          
        } catch (err) {
          notifyError('Failed to load estimation data. Please try again.');
          console.error('Error loading estimation:', err);
        } finally {
          setLoading(false);
          isInitialLoad.current = false;
        }
      };
      
      fetchEstimationData();
    
  }, [id]);

  // Add markup percentage state
  const [markupPercentages, setMarkupPercentages] = useState(() => {
    const defaultMarkup = {
      switchGearComponentMarkup: 0,
      controlAccessoryMarkup: 0,
      busBarMarkup: 0,
      wiringMarkup: 0,
      otherAccessoryMarkup: 0,
      electricalLabourMarkup: 0,
      transportMarkup: 0,
      enclosureMarkup: 0
    };
    
    const initialMarkups = {};
    items.forEach(item => {
      initialMarkups[item.id] = { ...defaultMarkup };
    });
    
    return initialMarkups;
  });


const [markupsInitialized, setMarkupsInitialized] = useState(false);

  useEffect(() => {
  if (!markupsInitialized && !loading && isInitialLoad.current === false) {
    setMarkupPercentages(prev => {
      const newMarkups = { ...prev };
      let needsUpdate = false;
      items.forEach(item => {
        if (!newMarkups[item.id]) {
          newMarkups[item.id] = {
            switchGearComponentMarkup: 0,
            controlAccessoryMarkup: 0,
            busBarMarkup: 0,
            wiringMarkup: 0,
            otherAccessoryMarkup: 0,
            electricalLabourMarkup: 0,
            transportMarkup: 0,
            enclosureMarkup: 0
          };
          needsUpdate = true;
        }
      });
      return needsUpdate ? newMarkups : prev;
    });
    setMarkupsInitialized(true);
  }
}, [items, loading, markupsInitialized]);

  const [laborRate, setLaborRate] = useState(0); // Default 5%
  const [normalLaborPrice, setNormalLaborPrice] = useState(0);

  const [electricalPriceCost, setElectricalPriceCost] = useState({
    total: 0,
    byItem: {}
  });


  const [laborCosts, setLaborCosts] = useState({
    total: 0,
    byItem: {}
  });

  const [finalLaborHours, setFinalLaborHours] = useState({
    total: 0,
    byItem: {}
  });  

  const handleCancel = () => {
    navigate(`/estimation/costEstimation/${inquiryId}`);
  };

// Find the normal labor hour price in useEffect
  useEffect(() => {
    const electricalLaborSection = sections.find(s => s.name === 'Electrical Labor');
    if (electricalLaborSection) {
      const normalLaborItem = electricalLaborSection.materials.find(
        material => material.name === "Electrical Labour - Normal"
      );

      if (normalLaborItem) {
        setNormalLaborPrice(normalLaborItem.discountedPrice);
      }
    }
  }, [sections]);


//////////////////////////////
  const [totalPriceAfterMarkup, setTotalPriceAfterMarkup] = useState({
    total: 0,
    byItem: {}
  });

  const [finalPrice, setFinalPrice] = useState({
    total: 0,
    byItem: {}
  });

/////////////////////////////

  const [gpPercentages, setGpPercentages] = useState({
    total: 0,
    byItem: {}
  });

/////////////////////////////

  const [otherCostRate, setOtherCostRate] = useState(0); // Default 5%
  const [otherCosts, setOtherCosts] = useState({
    total: 0,
    byItem: {}
  });

/////////////////////////////

  const [electricalGpPercentages, setElectricalGpPercentages] = useState({
    total: 0,
    byItem: {}
  });

  const [electricalCostAfterMarkup, setElectricalCostAfterMarkup] = useState({
    total: 0,
    byItem: {}
  });

/////////////////////////////

  // Function to calculate electrical and mechanical costs
  const calculateCosts = useCallback(() => {
  // Initialize section totals
  const updatedSectionTotals = {};
  sections.forEach(section => {
    updatedSectionTotals[section.name] = {
      total: 0,
      byItem: {},
      afterMarkup: {
        total: 0,
        byItem: {}
      }
    };
  });

  // Initialize all cost objects
  const electricalCost = { total: 0, byItem: {} };
  const mechanicalCost = { total: 0, byItem: {} };
  const totalAfterMarkup = { total: 0, byItem: {} };
  const finalPrice = { total: 0, byItem: {} };
  const laborCosts = { total: 0, byItem: {} };
  const finalLaborHours = { total: 0, byItem: {} };
  const otherCosts = { total: 0, byItem: {} };
  const electricalCostAfterMarkup = { total: 0, byItem: {} };
  const electricalGpPercentages = { total: 0, byItem: {} };
  const gpPercentages = { total: 0, byItem: {} };

  // Initialize material totals
  items.forEach(item => {
    const itemId = item.id;
    electricalCost.byItem[itemId] = 0;
    mechanicalCost.byItem[itemId] = 0;
    totalAfterMarkup.byItem[itemId] = 0;
    finalPrice.byItem[itemId] = 0;
    laborCosts.byItem[itemId] = 0;
    finalLaborHours.byItem[itemId] = 0;
    otherCosts.byItem[itemId] = 0;
    electricalCostAfterMarkup.byItem[itemId] = 0;
    electricalGpPercentages.byItem[itemId] = 0;
    gpPercentages.byItem[itemId] = 0;

    sections.forEach(section => {
      updatedSectionTotals[section.name].byItem[itemId] = 0;
      updatedSectionTotals[section.name].afterMarkup.byItem[itemId] = 0;
    });
  });

  // Calculate costs for each section and item
  sections.forEach(section => {
    const isElectrical = section.name !== 'Enclosure';
    const sectionMarkupField = `${section.name.replace(/\s+/g, '').toLowerCase()}Markup`;
    
    section.materials.forEach(material => {
      material.quantities.forEach((quantity, itemIndex) => {
        const itemId = items[itemIndex]?.id;
        if (!itemId) return;
        
        const itemQty = itemQuantities[itemId] || 0;
        const materialCost = material.discountedPrice * quantity * itemQty;
        const markup = markupPercentages[itemId]?.[sectionMarkupField] || 0;
        const afterMarkupCost = materialCost * (1 + markup / 100);
        
        // Update section totals
        updatedSectionTotals[section.name].byItem[itemId] += materialCost;
        updatedSectionTotals[section.name].total += materialCost;
        updatedSectionTotals[section.name].afterMarkup.byItem[itemId] += afterMarkupCost;
        updatedSectionTotals[section.name].afterMarkup.total += afterMarkupCost;
        
        // Add to electrical or mechanical costs
        if (isElectrical) {
          electricalCost.byItem[itemId] += materialCost;
          electricalCost.total += materialCost;
          electricalCostAfterMarkup.byItem[itemId] += afterMarkupCost;
          electricalCostAfterMarkup.total += afterMarkupCost;
        } else {
          mechanicalCost.byItem[itemId] += materialCost;
          mechanicalCost.total += materialCost;
        }
      });
    });
  });

  // Calculate all derived values
  items.forEach(item => {
    const itemId = item.id;
    
    // Sum all section after markup costs for total price
    Object.values(updatedSectionTotals).forEach(sectionData => {
      totalAfterMarkup.byItem[itemId] += sectionData.afterMarkup?.byItem[itemId] || 0;
    });
    totalAfterMarkup.total += totalAfterMarkup.byItem[itemId];
    
    // Final price (rounded up)
    finalPrice.byItem[itemId] = Math.ceil(totalAfterMarkup.byItem[itemId]);
    finalPrice.total += finalPrice.byItem[itemId];
    
    // Labor costs (based on electrical cost after markup)
    laborCosts.byItem[itemId] = electricalCostAfterMarkup.byItem[itemId] * laborRate / 100;
    laborCosts.total += laborCosts.byItem[itemId];
    
    // Final labor hours
    if (normalLaborPrice > 0) {
      finalLaborHours.byItem[itemId] = laborCosts.byItem[itemId] / normalLaborPrice;
      finalLaborHours.total += finalLaborHours.byItem[itemId];
    }
    
    // Other costs (based on final price)
    otherCosts.byItem[itemId] = (finalPrice.byItem[itemId] * otherCostRate) / 100;
    otherCosts.total += otherCosts.byItem[itemId];
    
    // Electrical GP percentage
    if (electricalCostAfterMarkup.byItem[itemId] > 0) {
      electricalGpPercentages.byItem[itemId] = 
        ((electricalCostAfterMarkup.byItem[itemId] - electricalCost.byItem[itemId]) / 
        electricalCostAfterMarkup.byItem[itemId]) * 100;
    } else {
      electricalGpPercentages.byItem[itemId] = 0;
    }
    
    // Overall GP percentage (correct formula)
    if (totalAfterMarkup.byItem[itemId] > 0) {
      gpPercentages.byItem[itemId] = 
        ((totalAfterMarkup.byItem[itemId] - (electricalCost.byItem[itemId] + mechanicalCost.byItem[itemId])) / totalAfterMarkup.byItem[itemId])*100;
    } else {
      gpPercentages.byItem[itemId] = 0;
    }
  });

  // Calculate total percentages
  if (electricalCostAfterMarkup.total > 0) {
    electricalGpPercentages.total = 
      ((electricalCostAfterMarkup.total - electricalCost.total) / 
       electricalCostAfterMarkup.total) * 100;
  } else {
    electricalGpPercentages.total = 0;
  }

  if (totalAfterMarkup.total > 0) {
    gpPercentages.total = 
      ((totalAfterMarkup.total - 
        (electricalCost.total + mechanicalCost.total)) / 
       totalAfterMarkup.total * 100);
  } else {
    gpPercentages.total = 0;
  }

  // Update all states
  setElectricalPriceCost(electricalCost);
  setTotalPriceAfterMarkup(totalAfterMarkup);
  setFinalPrice(finalPrice);
  setElectricalCost(electricalCost);
  setMechanicalCost(mechanicalCost);
  setSectionTotals(updatedSectionTotals);
  setLaborCosts(laborCosts);
  setFinalLaborHours(finalLaborHours);
  setOtherCosts(otherCosts);
  setElectricalCostAfterMarkup(electricalCostAfterMarkup);
  setElectricalGpPercentages(electricalGpPercentages);
  setGpPercentages(gpPercentages);

}, [sections, items, itemQuantities, markupPercentages, laborRate, normalLaborPrice, otherCostRate]);

  // Call the calculation function when relevant state changes
  useEffect(() => {
    calculateCosts();
  }, [sections, items, itemQuantities,normalLaborPrice, laborRate, calculateCosts]);
  
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
  
  // Simulated data loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
      isInitialLoad.current = false;
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);


  // Update the page header to show edit mode
  const renderPageHeader = () => (
    <div className="mb-4">
      <h1 className="text-xl md:text-2xl font-semibold mb-2">
        { 'Cost Estimation' }
      </h1>
      <p className="text-gray-600 text-sm">
        Quotation Version: {quotationNumber || '[New Estimation]'}
      </p>
    </div>
  );

  const renderElectricalCostAfterMarkupRow = () => (
    <tr className="bg-blue-100">
      <td colSpan={9} className="px-3 py-2 text-sm font-semibold text-gray-700">
        Electrical Cost
      </td>
      {items.map((item) => (
        <td key={item.id} className="px-3 py-2 text-center font-semibold">
          {electricalCostAfterMarkup.byItem[item.id]?.toFixed(2) || "0.00"}
        </td>
      ))}
      <td className="px-3 py-2 text-center font-semibold">
        {electricalCostAfterMarkup.total.toFixed(2)}
      </td>
    </tr>
  );

  const renderElectricalGpRow = () => (
    <tr className="bg-blue-100">
      <td colSpan={9} className="px-3 py-2 text-sm font-semibold text-gray-700">
        GP
      </td>
      {items.map((item) => (
        <td key={item.id} className="px-3 py-2 text-center font-semibold">
          {electricalGpPercentages.byItem[item.id]?.toFixed(2) || "0.00"}%
        </td>
      ))}
      <td className="px-3 py-2 text-center font-semibold">
        {electricalGpPercentages.total.toFixed(2)}%
      </td>
    </tr>
  );

  const renderOtherCostsRow = () => (
    <tr className="bg-blue-100">
      <td colSpan={8} className="px-3 py-2 text-sm font-semibold text-gray-700">
        Other Costs
      </td>
      <td className="px-3 py-2 text-center">
        <div className="flex items-center justify-center">
            {otherCostRate}
          <span className="ml-1">%</span>
        </div>
      </td>
      {items.map((item) => (
        <td key={item.id} className="px-3 py-2 text-center font-semibold">
          {otherCosts.byItem[item.id]?.toFixed(2) || "0.00"}
        </td>
      ))}
      <td className="px-3 py-2 text-center font-semibold">
        {otherCosts.total.toFixed(2)}
      </td>
    </tr>
  );

  const renderGpRow = () => (
    <tr className="bg-blue-100">
      <td colSpan={9} className="px-3 py-2 text-sm font-semibold text-gray-700">
        GP
      </td>
      {items.map((item) => (
        <td key={item.id} className="px-3 py-2 text-center font-semibold">
          {gpPercentages.byItem[item.id]?.toFixed(2) || "0.00"}%
        </td>
      ))}
      <td className="px-3 py-2 text-center font-semibold">
        {gpPercentages.total.toFixed(2)}%
      </td>
    </tr>
  );


  const renderTotalPriceAfterMarkupRow = () => (
    <tr className="bg-blue-100">
      <td colSpan={9} className="px-3 py-2 text-sm font-semibold text-gray-700">
        Total Price After Markup
      </td>
      {items.map((item) => (
        <td key={item.id} className="px-3 py-2 text-center font-semibold">
          {totalPriceAfterMarkup.byItem[item.id]?.toFixed(2) || "0.00"}
        </td>
      ))}
      <td className="px-3 py-2 text-center font-semibold">
        {totalPriceAfterMarkup.total.toFixed(2)}
      </td>
    </tr>
  );

  const renderFinalPriceRow = () => (
    <tr className="bg-blue-100">
      <td colSpan={9} className="px-3 py-2 text-sm font-semibold text-gray-700">
        Final Price
      </td>
      {items.map((item) => (
        <td key={item.id} className="px-3 py-2 text-center font-semibold">
          {finalPrice.byItem[item.id]?.toFixed(0) || "0"}
        </td>
      ))}
      <td className="px-3 py-2 text-center font-semibold">
        {finalPrice.total.toFixed(0)}
      </td>
    </tr>
  );

  const renderElectricalPriceCostRow = () => (
    <tr className="bg-blue-100">
      <td colSpan={9} className="px-3 py-2 text-sm font-semibold text-gray-700">
        Electrical Price Cost (without Enclosure)
      </td>
      {items.map((item) => (
        <td key={item.id} className="px-3 py-2 text-center font-semibold">
          {electricalPriceCost.byItem[item.id]?.toFixed(2) || "0.00"}
        </td>
      ))}
      <td className="px-3 py-2 text-center font-semibold">
        {electricalPriceCost.total.toFixed(2)}
      </td>
    </tr>
  );

const renderLaborRateRow = () => (
  <tr className="bg-blue-100">
    <td colSpan={8} className="px-3 py-2 text-sm font-semibold text-gray-700">
      Labour Rate
    </td>
    <td className="px-3 py-2 text-center">
      <div className="flex items-center justify-center">
          {laborRate}
        <span className="ml-1">%</span>
      </div>
    </td>
    {items.map((item) => (
      <td key={item.id} className="px-3 py-2 text-center font-semibold">
        {laborCosts.byItem[item.id]?.toFixed(2) || "0.00"}
      </td>
    ))}
    <td className="px-3 py-2 text-center font-semibold">
      {laborCosts.total.toFixed(2)}
    </td>
  </tr>
);

  const renderFinalLaborHoursRow = () => (
    <tr className="bg-blue-100">
      <td colSpan={9} className="px-3 py-2 text-sm font-semibold text-gray-700">
        Final Labour Hours
      </td>
      {items.map((item) => (
        <td key={item.id} className="px-3 py-2 text-center font-semibold">
          {finalLaborHours.byItem[item.id]?.toFixed(2) || "0.00"}
        </td>
      ))}
      <td className="px-3 py-2 text-center font-semibold">
        {finalLaborHours.total.toFixed(2)}
      </td>
    </tr>
  );

  const renderExpandableHeader = (title, isExpanded, toggleFunction) => (
    <tr 
      className="bg-gray-100 text-sm font-medium cursor-pointer text-gray-700 hover:bg-gray-200" 
      onClick={toggleFunction}
    >
      <td colSpan={10 + items.length} className="px-3 py-2">
        <div className="flex">
          {isExpanded ? (
            <ChevronDown size={16} className="mr-1" />
          ) : (
            <ChevronRight size={16} className="mr-1" />
          )}
          {title}
        </div>
      </td>
    </tr>
  );

  // Render function for Before Markup section total rows
  const renderSectionTotalRow = (sectionName, sectionData) => (
    <tr key={`before-${sectionName}`} className="bg-gray-50">
      <td colSpan={9} className="px-3 py-2 text-sm font-semibold text-gray-700">
        {sectionName}
      </td>
      {items.map((item) => (
        <td key={item.id} className="px-3 py-2 text-center font-semibold">
          {sectionData.byItem[item.id]?.toFixed(2) || "0.00"}
        </td>
      ))}
      <td className="px-3 py-2 text-center font-semibold">
        {sectionData.total.toFixed(2)}
      </td>
    </tr>
  );

  // Render function for Markup percentage input rows
  const renderMarkupRow = (sectionName) => {
  const markupFieldName = {
    'Switch Gear Components': 'switchGearComponentMarkup',
    'Control Accessories': 'controlAccessoryMarkup',
    'Bus Bar': 'busBarMarkup',
    'Wiring': 'wiringMarkup',
    'Other Accessories': 'otherAccessoryMarkup',
    'Electrical Labor': 'electricalLabourMarkup',
    'Transport': 'transportMarkup',
    'Enclosure': 'enclosureMarkup'
  }[sectionName];

  return (
    <tr key={`markup-${sectionName}`} className="bg-gray-50">
      <td colSpan={9} className="px-3 py-2 text-sm font-semibold text-gray-700">
        {sectionName}
      </td>
      {items.map((item) => {
  const value = markupPercentages[String(item.id)]?.[markupFieldName];

  return (
    <td key={item.id} className="px-3 py-2 text-center">
      <div className="flex items-center justify-center">
          {typeof value === 'number' ? value : 0}
        <span className="ml-1">%</span>
      </div>
    </td>
  );
})}
      <td className="px-3 py-2 text-center">
        {/* Placeholder for total column */}
      </td>
    </tr>
  );
};

  // Render function for After Markup section total rows
  const renderAfterMarkupRow = (sectionName, sectionData) => (
    <tr key={`after-${sectionName}`} className="bg-gray-50">
      <td colSpan={9} className="px-3 py-2 text-sm font-semibold text-gray-700">
        {sectionName}
      </td>
      {items.map((item) => (
        <td key={item.id} className="px-3 py-2 text-center font-semibold">
          {sectionData.afterMarkup.byItem[item.id]?.toFixed(2) || "0.00"}
        </td>
      ))}
      <td className="px-3 py-2 text-center font-semibold">
        {sectionData.afterMarkup.total.toFixed(2)}
      </td>
    </tr>
  );
  //////////////////////
  
  // Calculate total item quantities
  const calculateTotalItemQuantity = () => {
    return Object.values(itemQuantities).reduce((acc, qty) => acc + qty, 0);
  };
  
  if (loading) {
    return <FullPageLoader />;
  }

  // Toggle sidebar
  const toggleSidebar = () => {
    setShowSidebar(!showSidebar);
  };
  
  // Toggle section expansion
  const toggleSection = (sectionId) => {
    setSections(sections.map(section => 
      section.id === sectionId 
        ? { ...section, expanded: !section.expanded } 
        : section
    ));
  };
  
  
  // Calculate total for each row
  const calculateRowTotal = (quantities) => {
    return quantities.reduce((acc, qty, index) => {
      // Get the corresponding material ID
      const itemId = items[index]?.id;
      // Multiply item quantity by material quantity (if material exists)
      const itemQty = itemId ? (itemQuantities[itemId] || 0) : 0;
      return acc + (qty * itemQty);
    }, 0);
  };
  

  // Render function for cost summary rows
  const renderCostSummaryRow = (label, costData) => (
    <tr className="bg-blue-100">
      <td colSpan={9} className="px-3 py-2 text-sm font-semibold text-gray-700">
        {label}
      </td>
      {items.map((item) => (
        <td key={item.id} className="px-3 py-2 text-center font-semibold">
          {costData.byItem[item.id]?.toFixed(2) || "0.00"}
        </td>
      ))}
      <td className="px-3 py-2 text-center font-semibold">
        {costData.total.toFixed(2)}
      </td>
    </tr>
  );

  // Toggle recent activities panel
  const toggleActivitiesPanel = () => {
    setShowActivities(!showActivities);
  };
  
  // Close recent activities panel
  const closeActivitiesPanel = () => {
    setShowActivities(false);
  };

  return (
    <div className="flex w-screen h-screen text-black bg-gray-100 overflow-hidden" style={{
      scrollbarWidth: 'thin',
      scrollbarColor: ' #3B50DF #D9D9D9'
    }}>
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

          {/* Updated page header */}
          {renderPageHeader()}

          {/* Search Bar and Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center mb-4 gap-3">
            <div className="flex items-center w-full sm:w-auto">
              <div 
                onClick={toggleActivitiesPanel}
                className="cursor-pointer relative"
                title="Recent Activities"
              >
                <LuHistory size={20} className="text-[#3B50DF]" />
              </div>
              <div className="relative w-full sm:w-64 md:w-80">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search size={16} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Type to search"
                  className="pl-10 bg-gray-100 w-full border-none pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className='absolute mt-[85px] mr-[25px] top-0 right-0'>
              <button
                onClick={handleCancel}
                className= "bg-[#3C50E0] hover:bg-blue-700 text-white pl-1 pr-3 py-2 text-sm rounded-lg flex items-center justify-center gap-1 focus:outline-none"
              >
                <IoChevronBackOutline size={18} className='' />
                Back
              </button>
            </div>
          </div>

          {/* Cost Estimation Table Card */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {/* Table Container with fixed header */}
            <div className="overflow-x-auto" style={{ maxHeight: "calc(100vh - 250px)" }}>
              <table className="min-w-full divide-y divide-gray-200">
                {/* Sticky Header */}
                <thead className="bg-blue-200 sticky top-0 z-9">
                  <tr>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Material</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Material Description</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Material Part Number</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Material Make</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Country of Origin</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Market Price</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit Price</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Discount</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Discounted Price</th>
                    
                    {/* Item Columns with Delete Button */}
                    {items.map((item) => (
                      <th key={item.id} className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <div className="flex items-center justify-center gap-2">
                          {item.name}
                        </div>
                      </th>
                    ))}
                    
                    <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Total Quantity</th>
                  </tr>
                </thead>
                
                <tbody className="bg-white divide-y divide-gray-200">
                  {/* Item Quantities Row */}
                  <tr className="bg-gray-50">
                    <td colSpan={9} className="px-3 py-2 text-sm font-medium text-gray-700">
                      Item Quantity
                    </td>
                    {items.map((item) => (
                      <td key={item.id} className="px-3 py-2 text-center">
                          {itemQuantities[item.id] || 0}
                      </td>
                    ))}
                    <td className="px-3 py-2 text-center font-medium">
                      {calculateTotalItemQuantity()} 
                    </td>
                  </tr>
                  
                  {/* Sections and Items */}
                  {sections.map((section) => (
                    <React.Fragment key={section.id}>
                      {/* Section Header */}
                      <tr className="bg-gray-100 cursor-pointer hover:bg-gray-200" onClick={() => toggleSection(section.id)}>
                        <td colSpan={10 + items.length} className="px-3 py-2 text-sm font-medium text-gray-700">
                          <div className="flex items-center">
                            {section.expanded ? (
                              <ChevronDown size={16} className="mr-1" />
                            ) : (
                              <ChevronRight size={16} className="mr-1" />
                            )}
                            {section.name}
                          </div>
                        </td>
                      </tr>
                      
                      {/* Section Items */}
                      {section.expanded && section.materials
                        .filter(material => {
                          // Check if item exists and has a name property that's a string
                          if (!material || typeof material.name !== 'string') return false;
                          return material.name.toLowerCase().includes(searchTerm.toLowerCase());
                        })
                        .map((material) => (
                        <tr key={`${section.id}-${material.id}`} className="hover:bg-gray-50">
                          <td className="px-3 py-2 text-sm text-gray-500">
                            <div className="flex items-center">
                              {material.name}
                            </div>
                          </td>
                          <td className="px-3 py-2 text-sm text-gray-500">
                            <div>{material.materialDescription}</div>            
                          </td>
                          <td className="px-3 py-2 text-sm text-gray-500">
                            {material.materialPartNumber}
                          </td>
                          <td className="px-3 py-2 text-sm text-gray-500">
                            {material.materialMake}
                          </td>
                          <td className="px-3 py-2 text-sm text-gray-500">
                            {material.countryOfOrigin}
                          </td>
                          <td className="px-3 py-2 text-sm text-gray-500">
                            {material.marketPrice}
                          </td>
                          <td className="px-3 py-2 text-sm text-gray-500">
                              {material.unitPrice}
                          </td>
                          <td className="px-3 py-2 text-sm text-gray-500">
                            <div className="flex items-center">
                                {material.discount}
                              <span className="ml-1">%</span>
                            </div>
                          </td>
                          <td className="px-3 py-2 text-sm text-gray-500">{material.discountedPrice.toFixed(2)}</td>
                          
                          {/* Quantity inputs for each material */}
                          {items.map((item, idx) => (
                            <td key={idx} className="px-3 py-2 text-center">
                                {material.quantities[idx] || 0}
                            </td>
                          ))}
                          
                          {/* Total quantity */}
                          <td className="px-3 py-2 text-center font-medium">
                            {calculateRowTotal(material.quantities)} 
                          </td>
                        </tr>
                      ))}
                      {/* THIS IS WHERE YOU ADD THE COST SUMMARY ROWS */}
                      {section.name === 'Transport' && (
                        renderCostSummaryRow("Electrical Cost", electricalCost)
                      )}
                      

                      {section.name === 'Enclosure' && (
                        <>
                          {renderCostSummaryRow("Mechanical Cost", mechanicalCost)}
                          
                          {/* Before Markup Section */}
                          {renderExpandableHeader("Before Markup", showBeforeMarkup, () => setShowBeforeMarkup(!showBeforeMarkup))}
                          
                          {showBeforeMarkup && Object.entries(sectionTotals).map(([sectionName, sectionData]) => (
                            renderSectionTotalRow(sectionName, sectionData)
                          ))}
                          
                          {/* Markup Section */}
                          {renderExpandableHeader("Markup", showMarkup, () => setShowMarkup(!showMarkup))}
                          
                          {showMarkup && Object.keys(sectionTotals).map(sectionName => (
                            renderMarkupRow(sectionName)
                          ))}
                          
                          {/* After Markup Section */}
                          {renderExpandableHeader("After Markup", showAfterMarkup, () => setShowAfterMarkup(!showAfterMarkup))}
                          
                          {showAfterMarkup && Object.entries(sectionTotals).map(([sectionName, sectionData]) => (
                            renderAfterMarkupRow(sectionName, sectionData)
                          ))}
                          
                          {/* Additional Cost Rows */}
                          {renderElectricalPriceCostRow()}
                          {renderLaborRateRow()}
                          {renderFinalLaborHoursRow()}
                          
                          {/* New Summary Rows */}
                          {renderTotalPriceAfterMarkupRow()}
                          {renderFinalPriceRow()}

                          {renderCostSummaryRow("Mechanical Cost", mechanicalCost)}
                          {renderGpRow()}
                          {renderOtherCostsRow()}

                          {/* Add the new rows */}
                          {renderElectricalCostAfterMarkupRow()}
                          {renderElectricalGpRow()}
                        </>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>

              </table>
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

export default CostEstimationViewPage;