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
import CostEstimationViewPage from "./pages/CostEstimationView";
import AddCostEstimationNewVersionPage from "./pages/AddCostEstimationNewVersion";
import AppFlow from "./pages/AppFlow";
import AddJobPage from "./pages/AddJob";
import JobPage from "./pages/Job";
import JobView from "./pages/JobView";
import JobApprovalPage from "./pages/JobApproval";
//import BillofQuantityPage from "./pages/BillofQuantity";
//import BOQPage from "./pages/BOQ";

function App() {

  return (
    <Router>
      <NotificationProvider>
        <Notifications />
        <Routes>
          <Route path="/" element={<AppFlow />} />

          <Route path="/inventory/category" element={<CategoryPage />} />
          <Route path="/inventory/category/addcategory" element={<AddCategoryPage />} />
          <Route path="/inventory/category/editCategory/:id" element={<AddCategoryPage />} />
          <Route path="/inventory/category/categoryView/:id" element={<CategoryView />} />

          <Route path="/inventory/brand" element={<BrandPage />} />
          <Route path="/inventory/brand/addbrand" element={<AddBrandPage />} />
          <Route path="/inventory/brand/editBrand/:id" element={<AddBrandPage />} />
          <Route path="/inventory/brand/brandView/:id" element={<BrandView />} />

          <Route path="/inventory/unit" element={<UnitPage />} />
          <Route path="/inventory/unit/addunit" element={<AddUnitPage />} />
          <Route path="/inventory/unit/editunit/:id" element={<AddUnitPage />} />
          <Route path="/inventory/unit/unitView/:id" element={<UnitView />} />

          <Route path="/inventory/material" element={<MaterialPage />} />
          <Route path="/inventory/material/addmaterial" element={<AddMaterialPage />} />
          <Route path="/inventory/material/editmaterial/:id" element={<AddMaterialPage />} />
          <Route path="/inventory/material/materialView/:id" element={<MaterialView />} />

          <Route path="/people/employee" element={<EmployeePage />} />
          <Route path="/people/employee/addemployee" element={<AddEmployeePage />} />
          <Route path="/people/employee/editemployee/:id" element={<AddEmployeePage />} />
          <Route path="/people/employee/employeeView/:id" element={<EmployeeView />} />

          <Route path="/people/customer" element={<CustomerPage />} />
          <Route path="/people/customer/addcustomer" element={<AddCustomerPage />} />
          <Route path="/people/customer/editcustomer/:id" element={<AddCustomerPage />} />
          <Route path="/people/customer/customerView/:id" element={<CustomerView />} />

          <Route path="/estimation/inquiry" element={<InquiryPage />} />
          <Route path="/estimation/inquiry/addinquiry" element={<AddInquiriesPage />} />
          <Route path="/estimation/inquiry/editinquiry/:id" element={<AddInquiriesPage />} />
          <Route path="/estimation/inquiry/inquiryView/:id" element={<InquiryViewPage />} />

          <Route path="/estimation/costEst/addCostEstimation/:inquiryId" element={<AddCostEstimationPage/>} />
          <Route path="/estimation/costEst/costEstimation/:inquiryId" element={<CostEstimationPage/>} />
          <Route path="/estimation/costEst/editCostEstimation/:inquiryId/:id" element={<AddCostEstimationPage/>} />
          <Route path="/estimation/costEst/costEstimationView/:inquiryId/:id" element={<CostEstimationViewPage/>} />
          <Route path="/estimation/costEst/createCostEstimation/:inquiryId/:id" element={<AddCostEstimationNewVersionPage/>} />

          <Route path="/project/job" element={<JobPage />} />
          <Route path="/project/approvalJob" element={<JobApprovalPage />} />
          <Route path="/project/job/jobRegistration/:estimationId" element={<AddJobPage/>} />
          <Route path="/project/job/editjobRegistration/:id" element={<AddJobPage/>} />
          <Route path="/project/job/jobView/:id" element={<JobView />} />

          {/*<Route path="/project/boq1" element={<BillofQuantityPage />} />
          <Route path="/project/boq" element={<BOQPage />} />*/}
        </Routes>
      </NotificationProvider>
    </Router>
  )
}

export default App
