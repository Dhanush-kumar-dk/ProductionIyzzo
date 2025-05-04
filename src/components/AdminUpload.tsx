import { useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import AdminDashboardSidebar from "./AdminDashboardSidebar";

const AdminUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const navigate = useNavigate();

  const onDrop = async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
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

      setSuccess("Upload Successful");
    } catch (err) {
      setError("Error uploading file");
      console.error("Upload failed:", err);
    } finally {
      setUploading(false);
    }
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
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
    <div className="flex min-h-screen bg-gray-100">
      <AdminDashboardSidebar />
      <div className="flex-1 p-6 md:ml-64">
        <h1 className="text-3xl font-bold mb-6">Upload Orders</h1>
        <div
          {...getRootProps()}
          className="border-2 border-dashed p-6 mb-6 text-center"
        >
          <input {...getInputProps()} />
          <p className="text-gray-600">
            Drag & drop an Excel (.xlsx) file here, or click to select a file
          </p>
        </div>
        {uploading && <p>Uploading...</p>}
        {success && <p className="text-green-600 mt-2">{success}</p>}
        {error && <p className="text-red-600 mt-2">{error}</p>}
      </div>
    </div>
  );
};

export default AdminUpload;
