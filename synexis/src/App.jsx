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
        </Routes>
      </NotificationProvider>
    </Router>
  )
}

export default App
