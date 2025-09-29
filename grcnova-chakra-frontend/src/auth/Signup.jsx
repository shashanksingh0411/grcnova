// components/ClientOnboarding.jsx
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { supabase } from "../supabase";

// Reusable form field component
const FormField = ({ label, name, type = "text", register, rules, errors, placeholder }) => (
  <div>
    <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
      {label}
    </label>
    <input
      id={name}
      type={type}
      placeholder={placeholder}
      {...register(name, rules)}
      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
    {errors[name] && (
      <p className="mt-1 text-sm text-red-600">{errors[name].message}</p>
    )}
  </div>
);

const ClientOnboarding = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm();

  const onSubmit = async (formData) => {
    setLoading(true);
    setMessage(null);

    try {
      // 1. Create user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            first_name: formData.firstName,
            last_name: formData.lastName,
            company_name: formData.companyName,
            phone: formData.phone,
            role: "client_admin"
          }
        }
      });

      if (authError) throw authError;

      // 2. Insert into users table
      const { error: profileError } = await supabase.from("users").insert([
        {
          id: authData.user.id,
          email: formData.email,
          first_name: formData.firstName,
          last_name: formData.lastName,
          company_name: formData.companyName,
          phone: formData.phone,
          role: "client_admin",
          status: "active",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ]);

      if (profileError) throw profileError;

      // 3. Insert into clients table
      const { error: clientError } = await supabase.from("clients").insert([
        {
          company_name: formData.companyName,
          contact_email: formData.email,
          contact_phone: formData.phone,
          contact_name: `${formData.firstName} ${formData.lastName}`,
          status: "pending",
          created_by: "super_admin", // replace with logged-in admin ID if available
          created_at: new Date().toISOString()
        }
      ]);

      if (clientError) throw clientError;

      // ✅ Success
      setMessage({ type: "success", text: "Client onboarded successfully! Login credentials have been sent." });
      reset();
    } catch (error) {
      console.error("Onboarding error:", error);
      setMessage({ type: "error", text: error.message || "Failed to onboard client. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Onboard New Client</h2>

      {message && (
        <div
          className={`p-3 mb-4 rounded ${
            message.type === "success"
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          label="Company Name *"
          name="companyName"
          register={register}
          rules={{ required: "Company name is required" }}
          errors={errors}
          placeholder="Enter company name"
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            label="First Name *"
            name="firstName"
            register={register}
            rules={{ required: "First name is required" }}
            errors={errors}
            placeholder="First name"
          />
          <FormField
            label="Last Name *"
            name="lastName"
            register={register}
            rules={{ required: "Last name is required" }}
            errors={errors}
            placeholder="Last name"
          />
        </div>

        <FormField
          label="Email Address *"
          name="email"
          type="email"
          register={register}
          rules={{
            required: "Email is required",
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: "Invalid email address"
            }
          }}
          errors={errors}
          placeholder="Enter email address"
        />

        <FormField
          label="Phone Number"
          name="phone"
          type="tel"
          register={register}
          errors={errors}
          placeholder="Enter phone number"
        />

        <FormField
          label="Temporary Password *"
          name="password"
          type="password"
          register={register}
          rules={{
            required: "Password is required",
            minLength: {
              value: 6,
              message: "Password must be at least 6 characters"
            }
          }}
          errors={errors}
          placeholder="Set temporary password"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 
                     disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Onboarding Client..." : "Onboard Client"}
        </button>
      </form>
    </div>
  );
};

export default ClientOnboarding;
