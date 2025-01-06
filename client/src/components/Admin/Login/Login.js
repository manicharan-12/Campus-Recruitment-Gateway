import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import CompanyBackground from "./DecorativeBackground";
import Cookies from "js-cookie";
import { toast, Bounce } from "react-toastify";
import { useAuth } from "../../../contexts/AuthContext";
import axios from "axios";

const FormInput = React.memo(
  ({
    register,
    name,
    type,
    label,
    error,
    disabled,
    placeholder,
    initialAnimation,
  }) => (
    <motion.div
      initial={initialAnimation}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay: 0.4, duration: 0.5 }}
    >
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <input
        {...register(name, {
          required: `${label} is required`,
          ...(name === "email" && {
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: "Invalid email address",
            },
          }),
        })}
        type={type}
        id={name}
        className={`mt-1 block w-full px-3 py-2 bg-white bg-opacity-50 border ${
          error ? "border-red-500" : "border-gray-300"
        } rounded-md text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors duration-300`}
        placeholder={placeholder}
        disabled={disabled}
      />
      {error && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-1 text-sm text-red-500"
        >
          {error.message}
        </motion.p>
      )}
    </motion.div>
  )
);

const AdminLogin = () => {
  const navigate = useNavigate();
  const cookie = Cookies.get("userCookie");
  const { login } = useAuth();

  useEffect(() => {
    if (cookie !== undefined) {
      navigate("/admin/dashboard");
    }
  }, [cookie, navigate]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    mode: "onBlur",
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials) => {
      try {
        const response = await axios.post(
          `${process.env.REACT_APP_SERVER_API_URL}/admin/login`,
          credentials,
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        // Return the response data
        return response.data; // This makes the response data available in onSuccess
      } catch (error) {
        if (error.response) {
          console.error(error.response.data);
          throw new Error(error.response.data.message || "Login failed");
        } else if (error.request) {
          console.error(error.request);
          throw new Error("No response from server");
        } else {
          console.error(error.message);
          throw new Error("Login failed");
        }
      }
    },
    onSuccess: async (data) => {
      if (data) {
        Cookies.set("userCookie", data.token);
        login(data.token);
        console.log(JSON.stringify(data));

        await toast.success(`${data.message}`, {
          position: "bottom-center",
          autoClose: 5000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
          transition: Bounce,
        });

        navigate("/admin/dashboard");
        reset();
      } else {
        console.error("No data received in onSuccess");
      }
    },
    onError: async (error) => {
      console.error(error);
      await toast.error(`${error.message}`, {
        position: "bottom-center",
        autoClose: 5000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
        transition: Bounce,
      });
    },
  });

  const onSubmit = (data) => {
    loginMutation.mutate(data);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white relative overflow-hidden p-4">
      <CompanyBackground />
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white bg-opacity-80 backdrop-filter backdrop-blur-lg p-8 rounded-lg shadow-xl w-full max-w-md z-10 relative"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="w-24 h-24 bg-gradient-to-br from-green-400 to-blue-500 rounded-lg mx-auto mb-6 flex items-center justify-center transform rotate-45"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-12 w-12 text-white transform -rotate-45"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
            />
          </svg>
        </motion.div>
        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-3xl font-bold mb-6 text-center text-gray-800"
        >
          Admin Login
        </motion.h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <FormInput
            register={register}
            name="email"
            type="text"
            label="Email"
            error={errors.email}
            placeholder="Enter your email id"
            disabled={loginMutation.isPending}
            initialAnimation={{ x: -50, opacity: 0 }}
          />
          <FormInput
            register={register}
            name="password"
            type="password"
            label="Password"
            error={errors.password}
            placeholder="Enter your password"
            disabled={loginMutation.isPending}
            initialAnimation={{ x: 50, opacity: 0 }}
          />
          <motion.button
            type="submit"
            whileHover={{ scale: loginMutation.isPending ? 1 : 1.05 }}
            whileTap={{ scale: loginMutation.isPending ? 1 : 0.95 }}
            className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-300 ${
              loginMutation.isPending ? "opacity-75 cursor-not-allowed" : ""
            }`}
            disabled={loginMutation.isPending}
          >
            {loginMutation.isPending ? "Signing in..." : "Sign In"}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
};

export default React.memo(AdminLogin);
