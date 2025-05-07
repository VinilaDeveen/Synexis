import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { NotificationProvider } from './context/NotificationContext';
import Notifications from './components/Notifications';
import CategoryPage from "./pages/Category";
import AddCategoryPage from "./pages/AddCategory";
import CategoryView from "./pages/CategoryView";
import BrandPage from "./pages/Brand";

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
        </Routes>
      </NotificationProvider>
    </Router>
  )
}

export default App
