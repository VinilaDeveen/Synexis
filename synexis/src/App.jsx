import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { NotificationProvider } from './context/NotificationContext';
import Notifications from './components/Notifications';
import SynexisPages from "./pages/SynexisPages";

function App() {

  return (
    <Router>
      <NotificationProvider>
        <Notifications />
        <Routes>
          <Route path="/" element={<SynexisPages />} />
        </Routes>
      </NotificationProvider>
    </Router>
  )
}

export default App
