"use client";
import { useState } from "react";
import Image from "next/image";
import signin from "../assets/images/signin.jpg";
import logo from "../assets/images/logo.png";
import { useMutation } from "react-query";
import { createRequest } from "../api";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaEye, FaEyeSlash } from "react-icons/fa"; // Import eye icons from react-icons
import { useRouter } from "next/navigation";
import {
  GoogleMap,
  Marker,
  LoadScript,
  Autocomplete,
} from "@react-google-maps/api";
import Link from "next/link";

export default function Page() {
  // State to manage form data
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    phone: "",
  });
  const [coordinates, setCoordinates] = useState({
    lat: 43.65107,
    lng: -79.347015,
  }); // Default coordinates (e.g., Toronto)
  const [autocomplete, setAutocomplete] = useState(null);
  const [address, setAddress] = useState("");
  // State to manage password visibility
  const [showPassword, setShowPassword] = useState(false);

  const createMutation = useMutation({
    mutationFn: (data) => createRequest(data, "supplier"),
    onSuccess: (response) => {
      if (response.data.success) {
        toast.success(response?.data?.message);
        localStorage.setItem("meatmeSupplierEmail", formData?.email);
        router.push("/otpverification");
      } else {
        toast.error("Wrong Email and password");
      }
    },
    onError: (error) => {
      toast.error(error.response.data.message || "An error occurred");
    },
  });
  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Handle form submission
  const handleSave = (e) => {
    e.preventDefault();
    if (!formData?.phone || !formData?.name) {
      toast.error("All fields are required");
      return;
    }

    // Create operation
    createMutation.mutate({...formData, address});

    // Handle form data (e.g., submit to an API or process it)
    console.log("Form Data:", formData);
  };
  
  const handleAddressChange = async (address) => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
          address
        )}&key=AIzaSyBFZW8emYS3DQLTWsd0IIFw6TM87CKD4pA`
      );
      const data = await response.json();
      if (data.results && data.results[0]) {
        const location = data.results[0].geometry.location;
        setCoordinates({ lat: location.lat, lng: location.lng });
      }
    } catch (error) {
      console.error("Error fetching geocode:", error);
    }
  };

  const onLoad = (autocompleteInstance) => {
    setAutocomplete(autocompleteInstance);
  };

  const onPlaceChanged = () => {
    if (autocomplete !== null) {
      const place = autocomplete.getPlace();
      const location = place.geometry?.location;
      const formattedAddress = place.formatted_address;

      if (location) {
        setCoordinates({
          lat: location.lat(),
          lng: location.lng(),
        });
      }

      if (formattedAddress) {
        setAddress(formattedAddress); // Set the input value with the selected address
      }
    } else {
      console.log("Autocomplete is not loaded yet!");
    }
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
      <div className="w-full md:w-1/2 flex flex-col justify-center items-center px-5 pb-4">
        <div className="max-w-md w-full flex flex-col space-y-8">
          <div className="text-center">
            <Image
              src={logo}
              alt="SoulWatch Logo"
              style={{ width: "130px" }}
              className="mx-auto"
            />
            <h2 className="mt-6 pb-5 text-3xl font-extrabold text-gray-900">
             Supplier Register
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Please enter your information to continue.
            </p>
          </div>
          <form
            onSubmit={handleSave}
            className="flex-grow flex flex-col justify-center"
          >
            <div className="mb-6">
              <label className="text-base text-gray-500">Supplier Name</label>
              <input
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="appearance-none border rounded-lg w-full mt-3 py-4 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                type="text"
                placeholder="Name"
                style={{ backgroundColor: "#5B48BB08" }}
              />
            </div>

            <div className="mb-6">
              <label className="text-base text-gray-500">Email</label>
              <input
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="appearance-none border rounded-lg w-full mt-3 py-4 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                type="email"
                placeholder="Email"
                style={{ backgroundColor: "#5B48BB08" }}
              />
            </div>
            <div className="mb-6">
              <label className="text-base text-gray-500">Phone</label>
              <input
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="appearance-none border rounded-lg w-full mt-3 py-4 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                type="tel"
                placeholder="Phone"
                style={{ backgroundColor: "#5B48BB08" }}
              />
            </div>
            <div className="">
              <LoadScript
                googleMapsApiKey="AIzaSyBFZW8emYS3DQLTWsd0IIFw6TM87CKD4pA"
                libraries={["places"]}
              >

                <Autocomplete
                  className="mt-4"
                  onLoad={onLoad}
                  onPlaceChanged={onPlaceChanged}
                >
                  <div className="mb-6">
                    <label className="text-base text-gray-500">
                      Shipping Address
                    </label>
                    <input
                      name="address"
                      className="appearance-none border rounded-lg w-full mt-3 py-4 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      type="text"
                      placeholder="Enter your shipping address"
                      value={address} // Bind the input to the address state
                      onChange={(e) => {
                        setAddress(e.target.value); // Update the state on user input
                        handleAddressChange(e.target.value); // Update the map with the address input
                      }}
                      style={{ backgroundColor: "#5B48BB08" }}
                    />
                  </div>
                </Autocomplete>
              </LoadScript>
            </div>
            <div className=" relative">
              <label className="text-base text-gray-500">Password</label>
              <input
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="appearance-none border rounded-lg w-full mt-3 py-4 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                style={{ backgroundColor: "#5B48BB08" }}
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <button
                  type="button"
                  className="text-gray-600 focus:outline-none pt-7"
                  onClick={togglePasswordVisibility}
                >
                  {showPassword ? (
                    <FaEyeSlash size={22} />
                  ) : (
                    <FaEye size={22} />
                  )}
                </button>
              </div>
            </div>

            <div className="flex justify-end mt-4">
              <button
                type="submit"
                className="flex items-center justify-center py-3 px-4 rounded-lg w-full bg-[#5a46cf] text-white"
              >
                Register
              </button>
            </div>
            <p className="mt-3 text-center tracking-wider text-black">
              Back to{" "}
              <Link className="text-[#5a46cf] underline" href="/login">
                Login
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
