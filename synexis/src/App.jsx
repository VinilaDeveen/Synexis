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

function App() {

  return (
    <Router>
      <NotificationProvider>
        <Notifications />
        <Routes>
          <Route path="/category" element={<CategoryPage />} />
          <Route path="/addcategory" element={<AddCategoryPage />} />
          <Route path="/editCategory/:id" element={<AddCategoryPage />} />
          <Route path="/categoryView/:id" element={<CategoryView />} />

          <Route path="/brand" element={<BrandPage />} />
          <Route path="/addbrand" element={<AddBrandPage />} />
          <Route path="/editBrand/:id" element={<AddBrandPage />} />
          <Route path="/brandView/:id" element={<BrandView />} />

          <Route path="/unit" element={<UnitPage />} />
          <Route path="/addunit" element={<AddUnitPage />} />
          <Route path="/editunit/:id" element={<AddUnitPage />} />
          <Route path="/unitView/:id" element={<UnitView />} />

          <Route path="/material" element={<MaterialPage />} />
          <Route path="/addmaterial" element={<AddMaterialPage />} />
          <Route path="/editmaterial/:id" element={<AddMaterialPage />} />
          <Route path="/materialView/:id" element={<MaterialView />} />

          <Route path="/employee" element={<EmployeePage />} />
          <Route path="/addemployee" element={<AddEmployeePage />} />
          <Route path="/editemployee/:id" element={<AddEmployeePage />} />
          <Route path="/employeeView/:id" element={<EmployeeView />} />

          <Route path="/customer" element={<CustomerPage />} />
          <Route path="/addcustomer" element={<AddCustomerPage />} />
          <Route path="/editcustomer/:id" element={<AddCustomerPage />} />
          <Route path="/customerView/:id" element={<CustomerView />} />

          <Route path="/inquiry" element={<InquiryPage />} />
        </Routes>
      </NotificationProvider>
    </Router>
  )
}

export default App
