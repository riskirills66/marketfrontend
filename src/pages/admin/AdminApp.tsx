import React, { useEffect, useState } from "react";
import { Typography, Button, message } from "antd";
import { apiClient } from "../../api";
import { Admin, Item, PurchaseDetails, PurchaseSummary } from "../../types";
import AdminLoginModal from "./AdminLoginModal";
import AdminRegisterModal from "./AdminRegisterModal";
import AdminPanel from "./AdminPanel.tsx";

const { Title, Text } = Typography;

const AdminApp: React.FC = () => {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [adminLoginVisible, setAdminLoginVisible] = useState(false);
  const [adminRegisterVisible, setAdminRegisterVisible] = useState(false);

  useEffect(() => {
    const checkAdminExists = async () => {
      try {
        const result = await apiClient.checkAdminExists();
        if (!result.exists) {
          setAdminRegisterVisible(true);
        }
      } catch (err) {
        console.error("Error checking admin existence:", err);
      }
    };

    const savedAdmin = localStorage.getItem("admin");
    if (savedAdmin) {
      try {
        setAdmin(JSON.parse(savedAdmin));
      } catch (err) {
        console.error("Error parsing saved admin:", err);
        localStorage.removeItem("admin");
      }
    }

    checkAdminExists();
  }, []);

  const handleAdminLogin = async (username: string, password: string) => {
    try {
      const result = await apiClient.adminLogin({ username, password });
      setAdmin(result.admin);
      localStorage.setItem("admin", JSON.stringify(result.admin));
      localStorage.setItem("admin_session_token", result.session_token);
      message.success("Admin login successful!");
    } catch (error) {
      message.error("Login failed. Please check your credentials.");
      throw error;
    }
  };

  const handleAdminRegister = async (username: string, password: string) => {
    try {
      await apiClient.adminRegister({ username, password });
      message.success("Admin account created successfully!");
    } catch (error) {
      message.error("Registration failed. Please try again.");
      throw error;
    }
  };

  const handleAdminLogout = () => {
    setAdmin(null);
    localStorage.removeItem("admin");
    localStorage.removeItem("admin_session_token");
    message.success("Admin logged out successfully!");
  };

  return (
    <div>
      <AdminPanel
        admin={admin}
        onLogin={handleAdminLogin}
        onRegister={handleAdminRegister}
        onLogout={handleAdminLogout}
        onShowLogin={() => setAdminLoginVisible(true)}
      />
      <AdminLoginModal
        visible={adminLoginVisible}
        onClose={() => setAdminLoginVisible(false)}
        onLogin={handleAdminLogin}
      />
      <AdminRegisterModal
        visible={adminRegisterVisible}
        onClose={() => setAdminRegisterVisible(false)}
        onRegister={handleAdminRegister}
      />
    </div>
  );
};

export default AdminApp;


