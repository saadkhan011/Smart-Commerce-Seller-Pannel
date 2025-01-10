"use client";
import React, { useState, useEffect } from "react";
import { FaTimer } from "react-icons/fa";
import { useCreateMutation } from "../query";
import { useRouter } from "next/navigation";
import { ToastContainer, toast } from "react-toastify";
import signin from "../assets/images/signin.jpg";
import logo from "../assets/images/logo.png";
import Link from "next/link";
import Image from "next/image";

const OTPVerification = () => {
  const [otp, setOtp] = useState(new Array(6).fill(""));
  const [timeLeft, setTimeLeft] = useState(10 * 60); // 10 minutes in seconds

  // Handle input change for OTP fields
  const handleChange = (element, index) => {
    const value = element.value;

    if (/^[0-9]$/.test(value)) {
      let newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      // Automatically focus the next input
      if (element.nextSibling && value) {
        element.nextSibling.focus();
      }
    } else if (value === "") {
      let newOtp = [...otp];
      newOtp[index] = "";
      setOtp(newOtp);
    }
  };

  const createMutation = useCreateMutation();

  useEffect(() => {
    if (timeLeft === 0) return;

    const interval = setInterval(() => {
      setTimeLeft((prevTime) => prevTime - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLeft]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? `0${secs}` : secs}`;
  };

  const router = useRouter();
  const handleSubmit = async (e) => {
    e.preventDefault();
    let email = localStorage.getItem("meatmeSupplierEmail");
    console.log(email);
    const otpCode = otp.join("");
    console.log("Submitted OTP:", otpCode);
    createMutation.mutate(
      {
        data: { email: email, otp:otpCode },
        url: "supplier/verify-otp",
      },
      {
        onSuccess: () => {
          router.push("/");
        },
        onError: (error) => {
          console.error("Error updating supplier:", error);
        },
      }
    );
    // Handle OTP submission logic here
  };
  const resendOtp = () => {
    let email = localStorage.getItem("meatmeSupplierEmail");
    createMutation.mutate(
      {
        data: { email: email },
        url: "supplier/resend-otp",
      })
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <ToastContainer />
      <div className="hidden md:flex w-1/2 items-center justify-center">
        <Image
          src={signin}
          alt="Wedding Illustration"
          className="w-full h-full"
        />
      </div>
      <div className="w-1/2 p-10 flex flex-col justify-center">
        {/* Logo */}
        <div className="text-center">
          <Image
            src={logo}
            alt="SoulWatch Logo"
            style={{ width: "130px" }}
            className="mx-auto"
          />
          {/* OTP Verification Heading */}
          <h2 className="text-center text-2xl font-semibold text-gray-800 mb-2">
            OTP Verification
          </h2>
          <p className="text-center text-gray-500 mb-8">
            Enter the OTP sent to your email
            <span className="font-bold"></span>
          </p>
        </div>

        {/* OTP Input Fields */}
        <form
          onSubmit={handleSubmit}
          className="flex flex-col items-center space-y-8 w-full"
        >
          <div className="grid grid-cols-6 gap-2 w-full max-w-md">
            {otp.map((data, index) => (
              <input
                key={index}
                type="text"
                name="otp"
                maxLength="1"
                value={data}
                onChange={(e) => handleChange(e.target, index)}
                className="w-full h-14 text-center border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#5a46cf] text-black"
                onFocus={(e) => e.target.select()} // Select text on focus
              />
            ))}
          </div>

          {/* Submit Button */}
          <div className="w-full max-w-md">
            <button
              onClick={handleSubmit}
              className="flex items-center justify-center py-3 rounded-lg w-full bg-[#[#5a46cf]] text-white"
            >
              Submit
            </button>
          </div>
        </form>

        {/* Timer */}
        <p className="text-center text-gray-500 mt-4">
          Time Left:{" "}
          <span className="font-semibold">{formatTime(timeLeft)}</span>
        </p>
        <p
          onClick={resendOtp}
          className={`text-center text-gray-500 mt-4 hover:text-[#5a46cf] cursor-pointer ${
            timeLeft > 0 ? "cursor-not-allowed" : ""
          }`}
        >
          Resend OTP
        </p>
      </div>
    </div>

    
  );
};

export default OTPVerification;
