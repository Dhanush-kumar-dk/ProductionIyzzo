// AdminDashboardSidebar.tsx
import { Link } from "react-router-dom";
import {
  HomeIcon,
  UserIcon,
  ShoppingCartIcon,
  CogIcon,
  ArrowUpTrayIcon,
} from "@heroicons/react/16/solid";

const AdminDashboardSidebar = () => {
  return (
    <aside className="h-screen w-64 bg-white shadow-md fixed md:relative md:w-64">
      <div className="p-4 border-b text-xl font-bold">Admin Panel</div>
      <nav className="p-4">
        <ul className="space-y-4">
          <li className="text-gray-700 hover:text-blue-600 cursor-pointer">
            <Link
              to="/"
              className="flex items-center space-x-2 rounded-md hover:bg-gray-200 transition duration-300"
            >
              <HomeIcon className="w-5 h-5 text-gray-600" />
              <span>Home</span>
            </Link>
          </li>
          <li className="text-gray-700 hover:text-blue-600 cursor-pointer">
            <Link
              to="/admin/upload"
              className="flex items-center space-x-2 rounded-md hover:bg-gray-200 transition duration-300"
            >
              <ArrowUpTrayIcon className="w-5 h-5 text-gray-600" />
              <span>Upload</span>
            </Link>
          </li>

          <li className="text-gray-700 hover:text-blue-600 cursor-pointer">
            <Link
              to="/admin/users"
              className="flex items-center space-x-2 rounded-md hover:bg-gray-200 transition duration-300"
            >
              <UserIcon className="w-5 h-5 text-gray-600" />
              <span>Users</span>
            </Link>
          </li>
          <li className="text-gray-700 hover:text-blue-600 cursor-pointer">
            <Link
              to="/admin/orders"
              className="flex items-center space-x-2 rounded-md hover:bg-gray-200 transition duration-300"
            >
              <ShoppingCartIcon className="w-5 h-5 text-gray-600" />
              <span>Orders</span>
            </Link>
          </li>
          <li className="text-gray-700 hover:text-blue-600 cursor-pointer">
            <Link
              to="/admin/settings"
              className="flex items-center space-x-2 rounded-md hover:bg-gray-200 transition duration-300"
            >
              <CogIcon className="w-5 h-5 text-gray-600" />
              <span>Settings</span>
            </Link>
          </li>
        </ul>
      </nav>
    </aside>
  );
};

export default AdminDashboardSidebar;
