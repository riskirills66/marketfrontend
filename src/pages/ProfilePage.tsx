import React, { useEffect, useState } from "react";
import { Button, Card, Form, Input, Typography, message } from "antd";
import { PhoneOutlined, UserOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import UserContext from "../contexts/AppUserContext";
import { UserInfo } from "../types";
import { getUserInfoFromCookie, saveUserInfoToCookie } from "../utils/cookies";
import BackButton from "../components/BackButton";

const { Title } = Typography;

const ProfilePage: React.FC = () => {
  const { user, setUser } = React.useContext(UserContext);
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      form.setFieldsValue(user);
    } else {
      const savedUserInfo = getUserInfoFromCookie();
      if (savedUserInfo) {
        form.setFieldsValue(savedUserInfo);
        setUser(savedUserInfo);
      }
    }
  }, [user, form, setUser]);

  const handleSubmit = async (values: UserInfo) => {
    setLoading(true);
    try {
      setUser(values);
      saveUserInfoToCookie(values);
      message.success("Profil berhasil disimpan!");
    } catch (error) {
      message.error("Gagal menyimpan profil. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-page">
      <BackButton onBackClick={() => navigate("/")} title="Profil Saya" />
      <div className="profile-content">
        <Card title="Profil Saya" className="profile-card">
          <Form form={form} layout="vertical" onFinish={handleSubmit} requiredMark={false}>
            <Form.Item name="name" label="Nama Lengkap" rules={[{ required: true, message: "Silakan masukkan nama lengkap Anda" }]}>
              <Input prefix={<UserOutlined />} placeholder="Masukkan nama lengkap Anda" size="large" />
            </Form.Item>

            <Form.Item name="phone" label="Nomor Telepon" rules={[{ required: true, message: "Silakan masukkan nomor telepon Anda" }, { pattern: /^[\d\s\-\+\(\)]+$/, message: "Silakan masukkan nomor telepon yang valid" }]}>
              <Input prefix={<PhoneOutlined />} placeholder="Masukkan nomor telepon Anda" size="large" />
            </Form.Item>

            <Form.Item name="address" label="Alamat" rules={[{ required: true, message: "Silakan masukkan alamat Anda" }]}>
              <Input.TextArea placeholder="Masukkan alamat lengkap Anda" rows={4} />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading} size="large" style={{ width: "100%", background: "linear-gradient(135deg, #0ea5e9 0%, #06b6d4 50%, #8b5cf6 100%)", border: "none", borderRadius: "12px", fontWeight: "600", height: "48px", fontSize: "16px" }}>
                Simpan Profil
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </div>
  );
};

export default ProfilePage;


