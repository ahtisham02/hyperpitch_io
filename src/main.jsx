import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import MainRoutes from "./routes/MainRoutes";
import { BrowserRouter } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { persistor, store } from "./store/store";
import { PersistGate } from "redux-persist/integration/react";
import { Provider } from "react-redux";
import "react-toastify/dist/ReactToastify.css";
import { GoogleOAuthProvider } from "@react-oauth/google";

const root = ReactDOM.createRoot(document.getElementById("root"));
const googleAppId = import.meta.env.VITE_APP_GOOGLE_CLIENTID;


root.render(
  // <React.StrictMode>
  <>
    <ToastContainer
      position="top-right"
      autoClose={3000}
      hideProgressBar={false}
      newestOnTop={false}
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
    />
    <GoogleOAuthProvider clientId={googleAppId}>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <BrowserRouter>
            <MainRoutes />
          </BrowserRouter>
        </PersistGate>
      </Provider>
    </GoogleOAuthProvider>
  </>
  // </React.StrictMode>
);
