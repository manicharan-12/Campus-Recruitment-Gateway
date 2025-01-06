import React from "react";
import { motion } from "framer-motion";
import { useMutation } from "@tanstack/react-query";
import { PiStudentBold } from "react-icons/pi";
import { useForm } from "react-hook-form";
import DecorativeBackground from "./DecorativeBackground";

// Memoized form input component for reuse
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

const StudentLoginForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      studentId: "",
      password: "",
    },
    mode: "onBlur",
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials) => {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        throw new Error("Login failed");
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
      <DecorativeBackground />
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
          className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full mx-auto mb-6 flex items-center justify-center"
        >
          <PiStudentBold className="text-white text-4xl" />
        </motion.div>
        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-3xl font-bold mb-6 text-center text-gray-800"
        >
          Student Login
        </motion.h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <FormInput
            register={register}
            name="studentId"
            type="text"
            label="Student Email"
            error={errors.studentId}
            placeholder="Enter your student Email"
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
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loginMutation.isPending}
          >
            {loginMutation.isPending ? "Logging in..." : "Log In"}
          </motion.button>
        </form>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="mt-6 text-center"
        >
          <p>
            Not a student?{" "}
            <a
              href="/login/faculty"
              className="text-sm text-blue-600 hover:text-blue-500 transition-colors duration-300"
            >
              Login as a faculty
            </a>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default React.memo(StudentLoginForm);
