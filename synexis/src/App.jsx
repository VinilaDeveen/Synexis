import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { NotificationProvider } from './context/NotificationContext';
import Notifications from './components/Notifications';
import CategoryPage from "./pages/Category";
import AddCategoryPage from "./pages/AddCategory";

function App() {

  return (
    <Router>
      <NotificationProvider>
        <Notifications />
        <Routes>
          <Route path="/category" element={<CategoryPage />} />
          <Route path="/addcategory" element={<AddCategoryPage />} />
          <Route path="/editCategory/:id" element={<AddCategoryPage />} />
        </Routes>
      </NotificationProvider>
    </Router>
  )
}

export default App
