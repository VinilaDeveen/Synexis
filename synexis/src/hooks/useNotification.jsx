// src/hooks/useNotification.jsx
import { toast, Bounce } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export const useNotification = () => {
  const notifyDefault = (message = "Wow so easy!") => toast(message);
  
  const notifySuccess = (message = "Success") => {
    toast.success(message, {
      position: "top-right",
      style: { backgroundColor: '#c0d8c1', fontSize:'13px',borderLeft: '5px solid #09B909', color: '#0a0a0a' },
      autoClose: 10000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "light",
      transition: Bounce,
    });
  };

  const notifyError = (message = "Error occurred") => {
    toast.error(message, {
      position: "top-right",
      style: { backgroundColor: '#e3d1d1', fontSize:'13px',borderLeft: '5px solid rgb(240, 69, 69)', color: '#0a0a0a' },
      autoClose: 10000,
      hideProgressBar: false,
      closeOnClick: false,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "light",
      transition: Bounce,
    });
  };

  const notifyWarning = (message = "Warning") => {
    toast.warn(message, {
      position: "top-right",
      style: { backgroundColor: '#ece7bb', fontSize:'13px',borderLeft: '5px solid rgb(249, 200, 53)', color: '#0a0a0a' },
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: false,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "light",
      transition: Bounce,
    });
  };

  return {
    notifyDefault,
    notifySuccess,
    notifyError,
    notifyWarning
  };
};