import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { NotificationProvider } from './context/NotificationContext';
import Notifications from './components/Notifications';
import CategoryPage from "./pages/Category";
import AddCategoryPage from "./pages/AddCategory";
import CategoryView from "./pages/CategoryView";
import BrandPage from "./pages/Brand";
import AddBrandPage from "./pages/AddBrand";
import BrandView from "./pages/BrandView";
import UnitPage from "./pages/Unit";
import AddUnitPage from "./pages/AddUnit";
import UnitView from "./pages/UnitView";
import MaterialPage from "./pages/Material";
import AddMaterialPage from "./pages/AddMaterial";
import MaterialView from "./pages/MaterialView";
import EmployeePage from "./pages/Employee";
import AddEmployeePage from "./pages/AddEmployee";
import EmployeeView from "./pages/EmployeeView";
import CustomerPage from "./pages/Customer";
import CustomerView from "./pages/CustomerView";
import AddCustomerPage from "./pages/AddCustomer";
import InquiryPage from "./pages/Inquiry";
import InquiryViewPage from "./pages/InquiryView";
import AddInquiriesPage from "./pages/AddInquiry";
import CostEstimationPage from "./pages/CostEstimations";
import AddCostEstimationPage from "./pages/AddCostEstimation";

function App() {

  return (
    <Router>
      <NotificationProvider>
        <Notifications />
        <Routes>
          <Route path="/inventory/category" element={<CategoryPage />} />
          <Route path="/inventory/addcategory" element={<AddCategoryPage />} />
          <Route path="/inventory/editCategory/:id" element={<AddCategoryPage />} />
          <Route path="/inventory/categoryView/:id" element={<CategoryView />} />

          <Route path="/inventory/brand" element={<BrandPage />} />
          <Route path="/inventory/addbrand" element={<AddBrandPage />} />
          <Route path="/inventory/editBrand/:id" element={<AddBrandPage />} />
          <Route path="/inventory/brandView/:id" element={<BrandView />} />

          <Route path="/inventory/unit" element={<UnitPage />} />
          <Route path="/inventory/addunit" element={<AddUnitPage />} />
          <Route path="/inventory/editunit/:id" element={<AddUnitPage />} />
          <Route path="/inventory/unitView/:id" element={<UnitView />} />

          <Route path="/inventory/material" element={<MaterialPage />} />
          <Route path="/inventory/addmaterial" element={<AddMaterialPage />} />
          <Route path="/inventory/editmaterial/:id" element={<AddMaterialPage />} />
          <Route path="/inventory/materialView/:id" element={<MaterialView />} />

          <Route path="/people/employee" element={<EmployeePage />} />
          <Route path="/people/addemployee" element={<AddEmployeePage />} />
          <Route path="/people/editemployee/:id" element={<AddEmployeePage />} />
          <Route path="/people/employeeView/:id" element={<EmployeeView />} />

          <Route path="/people/customer" element={<CustomerPage />} />
          <Route path="/people/addcustomer" element={<AddCustomerPage />} />
          <Route path="/people/editcustomer/:id" element={<AddCustomerPage />} />
          <Route path="/people/customerView/:id" element={<CustomerView />} />

          <Route path="/estimation/inquiry" element={<InquiryPage />} />
          <Route path="/estimation/addinquiry" element={<AddInquiriesPage />} />
          <Route path="/estimation/editinquiry/:id" element={<AddInquiriesPage />} />
          <Route path="/estimation/inquiryView/:id" element={<InquiryViewPage />} />

          <Route path="/estimation/addCostEstimation/:inquiryId" element={<AddCostEstimationPage/>} />
          <Route path="/estimation/costEstimation/:inquiryId" element={<CostEstimationPage/>} />
          <Route path="/estimation/editCostEstimation/:inquiryId/:id" element={<AddCostEstimationPage/>} />
        </Routes>
      </NotificationProvider>
    </Router>
  )
}

export default App
