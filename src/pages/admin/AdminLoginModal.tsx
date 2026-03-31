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
      message.error("Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Admin Login"
      open={visible}
      onCancel={onClose}
      footer={null}
      width={400}
    >
      <Form form={form} onFinish={handleSubmit} layout="vertical">
        <Form.Item
          name="username"
          label="Username"
          rules={[{ required: true, message: "Please enter username" }]}
        >
          <Input placeholder="Enter username" />
        </Form.Item>
        <Form.Item
          name="password"
          label="Password"
          rules={[{ required: true, message: "Please enter password" }]}
        >
          <Input.Password placeholder="Enter password" />
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


