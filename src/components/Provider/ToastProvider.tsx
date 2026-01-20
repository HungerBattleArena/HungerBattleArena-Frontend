import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export function ToastNotifier() {
  return (
    <ToastContainer
      autoClose={5000}
      newestOnTop={true}
      position="top-right"
      hideProgressBar={false}
      closeOnClick
      pauseOnHover
      draggable
      theme="dark"
      style={{ width: 'auto', maxWidth: '90%', minWidth: '280px' }}
      toastStyle={{
        background: 'rgba(10, 10, 25, 0.92)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(0, 243, 255, 0.3)',
        boxShadow: '0 10px 50px rgba(0, 0, 0, 0.7), 0 0 20px rgba(0, 243, 255, 0.2)',
        color: 'white',
        fontFamily: "'Rajdhani', sans-serif",
        borderRadius: '8px',
      }}
      progressClassName="toast-progress"
    />
  );
}
