import React, { useState } from "react";
import { Button, Form, Input, Modal, message } from "antd";

const AdminLoginModal: React.FC<{
  visible: boolean;
  onClose: () => void;
  onLogin: (username: string, password: string) => Promise<void>;
}> = ({ visible, onClose, onLogin }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: {
    username: string;
    password: string;
  }) => {
    setLoading(true);
    try {
      await onLogin(values.username, values.password);
      form.resetFields();
      onClose();
    } catch (error) {
      message.error("Login gagal. Periksa username dan password Anda.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Login Admin"
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
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} block>
            Login
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AdminLoginModal;


