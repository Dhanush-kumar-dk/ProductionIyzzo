import { useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { ArrowUpTrayIcon } from "@heroicons/react/16/solid";

const AdminUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const navigate = useNavigate();

  const onDrop = async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    setUploading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(
        "https://affiliate-server-8irx.onrender.com/sendorderdata",
        {
          method: "POST",
          body: formData,
          credentials: "include",
        }
      );

      const data = await response.json();
      if (!response.ok || data.message !== "Upload successful") {
        throw new Error(data.error || "Failed to upload file");
      }

      setSuccess("Upload successful 🎉");
    } catch (err) {
      setError("Error uploading file. Please try again.");
      console.error("Upload failed:", err);
    } finally {
      setUploading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    accept: {
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
        ".xlsx",
      ],
    },
  });

  useEffect(() => {
    const checkAdminStatus = async (user: any) => {
      if (!user) {
        setIsAdmin(false);
        navigate("/");
        return;
      }

      try {
        const token = await user.getIdToken();
        const response = await fetch(
          "https://affiliate-server-8irx.onrender.com/check-admin",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            credentials: "include",
          }
        );

        const data = await response.json();
        if (data.isAdmin) {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
          navigate("/");
        }
      } catch {
        setIsAdmin(false);
        navigate("/");
      }
    };

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      checkAdminStatus(user);
    });

    return () => unsubscribe();
  }, [navigate]);

  if (isAdmin === null)
    return <p className="text-center mt-10">Checking access...</p>;
  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-md sm:shadow-lg p-5 sm:p-8 mt-4 sm:mt-10">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
            Upload Orders
          </h1>
          <p className="text-sm sm:text-base text-gray-500 mt-1">
            Upload your Amazon orders Excel file (.xlsx) to sync data into your
            admin dashboard.
          </p>
        </div>

        {/* Dropzone */}
        <div
          {...getRootProps()}
          className={`
            group relative border-2 border-dashed rounded-2xl 
            p-6 sm:p-8 text-center cursor-pointer
            transition-all duration-300 ease-out
            ${
              isDragActive
                ? "border-blue-500 bg-blue-50 shadow-lg scale-[1.01]"
                : "border-blue-200 bg-blue-50/40 hover:bg-blue-50 hover:border-blue-400 hover:shadow-md"
            }
            ${uploading ? "opacity-70 pointer-events-none" : ""}
          `}
        >
          <input {...getInputProps()} />

          <div className="flex flex-col items-center gap-2">
            <div className="rounded-full bg-white/80 p-3 shadow-sm mb-1 group-hover:shadow-md transition-shadow duration-300">
              <ArrowUpTrayIcon className="w-8 h-8 text-blue-600 group-hover:scale-110 transition-transform duration-300" />
            </div>
            <p className="text-sm sm:text-base font-medium text-gray-800">
              {isDragActive
                ? "Drop the file here..."
                : "Drag & drop an Excel (.xlsx) file here"}
            </p>
            <p className="text-xs sm:text-sm text-gray-500">
              or <span className="font-semibold text-blue-600">click</span> to
              browse from your device
            </p>
            <p className="text-[11px] sm:text-xs text-gray-400 mt-1">
              Only .xlsx files are supported.
            </p>
          </div>

          {/* Uploading overlay */}
          {uploading && (
            <div className="absolute inset-0 bg-white/60 rounded-2xl flex flex-col items-center justify-center">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-2" />
              <p className="text-sm text-gray-700 font-medium">Uploading...</p>
            </div>
          )}
        </div>

        {/* Status messages */}
        <div className="mt-4 min-h-[1.5rem] space-y-1">
          {success && (
            <p className="text-sm text-green-600 animate-fade-in">{success}</p>
          )}
          {error && (
            <p className="text-sm text-red-600 animate-fade-in">{error}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminUpload;
