import React, { useState } from "react";
import { Button, Form, Input, Modal, message } from "antd";

const AdminRegisterModal: React.FC<{
  visible: boolean;
  onClose: () => void;
  onRegister: (username: string, password: string) => Promise<void>;
}> = ({ visible, onClose, onRegister }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: {
    username: string;
    password: string;
    confirmPassword: string;
  }) => {
    if (values.password !== values.confirmPassword) {
      message.error("Password tidak cocok");
      return;
    }

    setLoading(true);
    try {
      await onRegister(values.username, values.password);
      form.resetFields();
      onClose();
      message.success("Akun admin berhasil dibuat!");
    } catch (error) {
      message.error("Registrasi gagal. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Buat Akun Admin"
      open={visible}
      onCancel={onClose}
      footer={null}
      width={400}
    >
      <Form form={form} onFinish={handleSubmit} layout="vertical">
        <Form.Item
          name="username"
          label="Username"
          rules={[{ required: true, message: "Masukkan username" }]}
        >
          <Input placeholder="Masukkan username" />
        </Form.Item>
        <Form.Item
          name="password"
          label="Password"
          rules={[{ required: true, message: "Masukkan password" }]}
        >
          <Input.Password placeholder="Masukkan password" />
        </Form.Item>
        <Form.Item
          name="confirmPassword"
          label="Konfirmasi Password"
          rules={[{ required: true, message: "Konfirmasi password" }]}
        >
          <Input.Password placeholder="Konfirmasi password" />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} block>
            Buat Akun Admin
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AdminRegisterModal;


