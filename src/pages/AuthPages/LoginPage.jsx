import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useFormik } from "formik";
import * as Yup from "yup";
import { useDispatch } from "react-redux";
import axios from "axios";
import { useGoogleLogin } from "@react-oauth/google";
import { LoaderCircle, Eye, EyeOff } from 'lucide-react';

import apiRequest from "../../utils/apiRequest";
import { setUserInfo } from "../../auth/authSlice";

function LoginPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [showPassword, setShowPassword] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [remember, setRemember] = useState(false);
  const canResetPassword = true;

  const handleAuthSuccess = async (loginResponseData) => {
    if (!loginResponseData?.token || !loginResponseData?.userId) {
      toast.error("Login failed: Invalid response from server.");
      throw new Error("Login failed: No token or userId received.");
    }
    const { token, userId } = loginResponseData;

    try {
      // THE FIX: Pass the userId as a query parameter in the URL
      const profileResponse = await apiRequest("get", `/profile`, null, token);
      const userProfileData = profileResponse.data;
      console.log(userProfileData)

      dispatch(setUserInfo({ token, data: userProfileData }));

      toast.success("Login successful! Redirecting...");
      navigate("/dashboard");
    } catch (profileError) {
      console.error("Failed to fetch user profile:", profileError);
      toast.error(profileError?.response?.data?.message || "Could not fetch user profile after login.");
    }
  };

  const handleGoogleAuth = async (googleProfile) => {
    setIsGoogleLoading(true);
    try {
      const response = await apiRequest("post", "/user/google/callback", {
        email: googleProfile.email,
      });
      await handleAuthSuccess(response.data);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Google login failed.");
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setIsGoogleLoading(true);
      try {
        const googleResponse = await axios.get("https://www.googleapis.com/oauth2/v3/userinfo", {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        });
        await handleGoogleAuth(googleResponse.data);
      } catch (err) {
        toast.error("Failed to fetch Google profile.");
        setIsGoogleLoading(false);
      }
    },
    onError: () => {
      toast.error("Google Login was cancelled or failed.");
      setIsGoogleLoading(false);
    },
  });

  const formik = useFormik({
    initialValues: { email: "", password: "" },
    validationSchema: Yup.object({
      email: Yup.string().email("Invalid email address").required("Email is required"),
      password: Yup.string().min(6, "Password must be at least 6 characters").required("Password is required"),
    }),
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const response = await apiRequest("post", "/auth/login", values);
        await handleAuthSuccess(response.data);
      } catch (error) {
        toast.error(error?.response?.data?.message || "Login failed. Please check your credentials.");
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <>
      <form className="flex flex-col" onSubmit={formik.handleSubmit}>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoFocus
              tabIndex={1}
              autoComplete="email"
              value={formik.values.email}
              className="mt-1 block w-full appearance-none rounded-md border border-gray-300 px-3 py-3 placeholder-gray-400 shadow-sm focus:border-brand-green focus:outline-none focus:ring-brand-green sm:text-sm"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder="you@example.com"
              disabled={formik.isSubmitting}
            />
            {formik.touched.email && formik.errors.email ? (
              <div className="text-xs text-red-500">{formik.errors.email}</div>
            ) : null}
          </div>

          <div className="grid gap-2">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                required
                tabIndex={2}
                autoComplete="current-password"
                value={formik.values.password}
                className="mt-1 block w-full appearance-none rounded-md border border-gray-300 px-3 py-3 placeholder-gray-400 shadow-sm focus:border-brand-green focus:outline-none focus:ring-brand-green sm:text-sm"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="Password"
                disabled={formik.isSubmitting}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {formik.touched.password && formik.errors.password ? (
              <div className="text-xs text-red-500">{formik.errors.password}</div>
            ) : null}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
                <input
                  id="remember"
                  name="remember"
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  tabIndex={3}
                  className="h-4 w-4 rounded border-gray-300 text-brand-green focus:ring-brand-green"
                  disabled={formik.isSubmitting}
                />
                <label htmlFor="remember" className="text-sm font-medium text-gray-700">
                  Remember me
                </label>
            </div>
            {canResetPassword && (
                <Link
                  to="/forgot-password"
                  className="text-sm font-medium text-brand-green hover:text-green-700 hover:underline"
                  tabIndex={5}
                >
                  Forgot password?
                </Link>
            )}
          </div>
          <button
            type="submit"
            className="mt-2 flex w-full justify-center rounded-lg py-3 font-medium text-white bg-brand-green cursor-pointer hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-brand-green focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed"
            tabIndex={4}
            disabled={formik.isSubmitting || !formik.isValid}
          >
            {formik.isSubmitting ? (
              <LoaderCircle className="mr-2 h-5 w-5 animate-spin" />
            ) : null}
            Log in
          </button>
        </div>
      </form>

      <div className="mt-6 text-center text-sm text-gray-600">
        Don't have an account?{' '}
        <Link
            to="/signup"
            className="font-medium text-brand-green hover:text-green-700 hover:underline"
        >
            Sign up
        </Link>
      </div>
    </>
  );
}

export default LoginPage;

// import React, { useState } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import { toast } from 'react-toastify';
// import { useFormik } from "formik";
// import * as Yup from "yup";
// import { useDispatch } from "react-redux";
// import axios from "axios";
// import { useGoogleLogin } from "@react-oauth/google";
// import { LoaderCircle, Eye, EyeOff } from 'lucide-react';

// import apiRequest from "../../utils/apiRequest";
// import { setUserInfo } from "../../auth/authSlice";

// function LoginPage() {
//   const navigate = useNavigate();
//   const dispatch = useDispatch();
//   const [showPassword, setShowPassword] = useState(false);
//   const [isGoogleLoading, setIsGoogleLoading] = useState(false);
//   const [remember, setRemember] = useState(false);
//   const canResetPassword = true;

//   // --- UPDATED FUNCTION ---
//   const handleAuthSuccess = async (loginResponseData) => {
//     if (!loginResponseData?.token || !loginResponseData?.userId) {
//       toast.error("Login failed: Invalid response from server.");
//       throw new Error("Login failed: No token or userId received.");
//     }
//     const { token, userId } = loginResponseData;

//     try {
//       const profileResponse = await apiRequest("get", `/user/profile/${userId}`, null, token);
//       const userProfileData = profileResponse.data;

//       // ---- START: The new logic is here ----
//       // Based on your provided JSON, the profile data is nested.
//       // We check if the 'isVerified' flag is true.
//       if (userProfileData?.profile?.isVerified === true) {
//         // If verified, proceed with login
//         // Note: Dispatching userProfileData.profile which contains the actual user details
//         dispatch(setUserInfo({ token, data: userProfileData.profile })); 
//         toast.success("Login successful! Redirecting...");
//         navigate("/dashboard");
//       } else {
//         // If not verified, show an error and do not log in
//         toast.error("Your account is not verified. Please check your email to complete the setup.");
//       }
//       // ---- END: The new logic ----

//     } catch (profileError) {
//       console.error("Failed to fetch user profile:", profileError);
//       toast.error(profileError?.response?.data?.message || "Could not fetch user profile after login.");
//     }
//   };
//   // --- END OF UPDATED FUNCTION ---


//   const handleGoogleAuth = async (googleProfile) => {
//     setIsGoogleLoading(true);
//     try {
//       const response = await apiRequest("post", "/user/google/callback", {
//         email: googleProfile.email,
//       });
//       await handleAuthSuccess(response.data);
//     } catch (error) {
//       toast.error(error?.response?.data?.message || "Google login failed.");
//     } finally {
//       setIsGoogleLoading(false);
//     }
//   };

//   const handleGoogleLogin = useGoogleLogin({
//     onSuccess: async (tokenResponse) => {
//       setIsGoogleLoading(true);
//       try {
//         const googleResponse = await axios.get("https://www.googleapis.com/oauth2/v3/userinfo", {
//           headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
//         });
//         await handleGoogleAuth(googleResponse.data);
//       } catch (err) {
//         toast.error("Failed to fetch Google profile.");
//         setIsGoogleLoading(false);
//       }
//     },
//     onError: () => {
//       toast.error("Google Login was cancelled or failed.");
//       setIsGoogleLoading(false);
//     },
//   });

//   const formik = useFormik({
//     initialValues: { email: "", password: "" },
//     validationSchema: Yup.object({
//       email: Yup.string().email("Invalid email address").required("Email is required"),
//       password: Yup.string().min(6, "Password must be at least 6 characters").required("Password is required"),
//     }),
//     onSubmit: async (values, { setSubmitting }) => {
//       try {
//         const response = await apiRequest("post", "/auth/login", values);
//         await handleAuthSuccess(response.data);
//       } catch (error) {
//         toast.error(error?.response?.data?.message || "Login failed. Please check your credentials.");
//       } finally {
//         setSubmitting(false);
//       }
//     },
//   });

//   return (
//     <>
//       <form className="flex flex-col" onSubmit={formik.handleSubmit}>
//         <div className="grid gap-4">
//           <div className="grid gap-2">
//             <label htmlFor="email" className="block text-sm font-medium text-gray-700">
//               Email
//             </label>
//             <input
//               id="email"
//               name="email"
//               type="email"
//               required
//               autoFocus
//               tabIndex={1}
//               autoComplete="email"
//               value={formik.values.email}
//               className="mt-1 block w-full appearance-none rounded-md border border-gray-300 px-3 py-3 placeholder-gray-400 shadow-sm focus:border-brand-green focus:outline-none focus:ring-brand-green sm:text-sm"
//               onChange={formik.handleChange}
//               onBlur={formik.handleBlur}
//               placeholder="you@example.com"
//               disabled={formik.isSubmitting}
//             />
//             {formik.touched.email && formik.errors.email ? (
//               <div className="text-xs text-red-500">{formik.errors.email}</div>
//             ) : null}
//           </div>

//           <div className="grid gap-2">
//             <label htmlFor="password" className="block text-sm font-medium text-gray-700">
//                 Password
//             </label>
//             <div className="relative">
//               <input
//                 id="password"
//                 name="password"
//                 type={showPassword ? "text" : "password"}
//                 required
//                 tabIndex={2}
//                 autoComplete="current-password"
//                 value={formik.values.password}
//                 className="mt-1 block w-full appearance-none rounded-md border border-gray-300 px-3 py-3 placeholder-gray-400 shadow-sm focus:border-brand-green focus:outline-none focus:ring-brand-green sm:text-sm"
//                 onChange={formik.handleChange}
//                 onBlur={formik.handleBlur}
//                 placeholder="Password"
//                 disabled={formik.isSubmitting}
//               />
//               <button
//                 type="button"
//                 onClick={() => setShowPassword(!showPassword)}
//                 className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
//               >
//                 {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
//               </button>
//             </div>
//             {formik.touched.password && formik.errors.password ? (
//               <div className="text-xs text-red-500">{formik.errors.password}</div>
//             ) : null}
//           </div>

//           <div className="flex items-center justify-between">
//             <div className="flex items-center space-x-2">
//                 <input
//                   id="remember"
//                   name="remember"
//                   type="checkbox"
//                   checked={remember}
//                   onChange={(e) => setRemember(e.target.checked)}
//                   tabIndex={3}
//                   className="h-4 w-4 rounded border-gray-300 text-brand-green focus:ring-brand-green"
//                   disabled={formik.isSubmitting}
//                 />
//                 <label htmlFor="remember" className="text-sm font-medium text-gray-700">
//                   Remember me
//                 </label>
//             </div>
//             {canResetPassword && (
//                 <Link
//                   to="/forgot-password"
//                   className="text-sm font-medium text-brand-green hover:text-green-700 hover:underline"
//                   tabIndex={5}
//                 >
//                   Forgot password?
//                 </Link>
//             )}
//           </div>
//           <button
//             type="submit"
//             className="mt-2 flex w-full justify-center rounded-lg py-3 font-medium text-white bg-brand-green cursor-pointer hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-brand-green focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed"
//             tabIndex={4}
//             disabled={formik.isSubmitting || !formik.isValid}
//           >
//             {formik.isSubmitting ? (
//               <LoaderCircle className="mr-2 h-5 w-5 animate-spin" />
//             ) : null}
//             Log in
//           </button>
//         </div>
//       </form>

//       <div className="mt-6 text-center text-sm text-gray-600">
//         Don't have an account?{' '}
//         <Link
//             to="/signup"
//             className="font-medium text-brand-green hover:text-green-700 hover:underline"
//         >
//             Sign up
//         </Link>
//       </div>
//     </>
//   );
// }

// export default LoginPage;