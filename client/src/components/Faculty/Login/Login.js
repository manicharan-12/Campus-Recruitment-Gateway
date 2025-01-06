import React from "react";
import { motion } from "framer-motion";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import FacultyBackground from "./DecorativeBackground";

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
          ...(name === "studentId" && {
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: "Invalid email address",
            },
          }),
        })}
        type={type}
        id={name}
        className={`mt-1 block w-full px-3 py-2 bg-gray-50 border ${
          error ? "border-red-500" : "border-gray-300"
        } rounded-md text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors duration-300`}
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
const FacultyLogin = () => {
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
      const response = await fetch("/api/faculty/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Login failed");
      }

      return response.json();
    },
    onSuccess: (data) => {
      console.log("Login successful:", data);
      reset();
    },
  });

  const onSubmit = (data) => {
    loginMutation.mutate(data);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white relative overflow-hidden p-4">
      <FacultyBackground />
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md z-10 relative"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mx-auto mb-6 flex items-center justify-center"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-12 w-12 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M12 14l9-5-9-5-9 5 9 5z" />
            <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222"
            />
          </svg>
        </motion.div>
        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-3xl font-bold mb-6 text-center text-gray-800"
        >
          Faculty Login
        </motion.h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <FormInput
            register={register}
            name="email"
            type="email"
            label="Email"
            error={errors.email}
            placeholder="Enter your email"
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
          {loginMutation.error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-red-500 text-sm"
            >
              {loginMutation.error.message}
            </motion.p>
          )}
          <motion.button
            type="submit"
            whileHover={{ scale: loginMutation.isPending ? 1 : 1.05 }}
            whileTap={{ scale: loginMutation.isPending ? 1 : 0.95 }}
            className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-300 ${
              loginMutation.isPending ? "opacity-75 cursor-not-allowed" : ""
            }`}
            disabled={loginMutation.isPending}
          >
            {loginMutation.isPending ? "Signing in..." : "Sign In"}
          </motion.button>
        </form>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="mt-6 text-center"
        >
          <p>
            Not a faculty?{" "}
            <a
              href="/login/student"
              className="text-sm text-blue-600 hover:text-blue-500 transition-colors duration-300"
            >
              Login as a student
            </a>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default React.memo(FacultyLogin);
