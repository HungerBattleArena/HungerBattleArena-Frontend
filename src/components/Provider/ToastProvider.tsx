import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export function ToastNotifier() {
  return (
    <ToastContainer
      autoClose={5000}
      newestOnTop={true}
      style={{ width: "auto", maxWidth: "90%", minWidth: "280px" }}
    />
  );
}
