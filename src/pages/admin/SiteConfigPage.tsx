import { useState, useEffect } from 'react';
import { Form, Input, Button, Card, message, Space, Typography, ColorPicker, Table, Divider } from 'antd';
import type { Color } from 'antd/es/color-picker';
import { apiClient } from '../../api';
import type { SiteConfig, UpdateSiteConfigRequest } from '../../types';

const { Title, Text } = Typography;

interface ColorConfig {
  key: string;
  label: string;
  name: string;
  description: string;
  value: string;
}

export default function SiteConfigPage() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [config, setConfig] = useState<SiteConfig | null>(null);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const data = await apiClient.getSiteConfig();
      setConfig(data);
      form.setFieldsValue({
        primary_color: data.primary_color,
        secondary_color: data.secondary_color,
        accent_color: data.accent_color,
        promo_color: data.promo_color,
        success_color: data.success_color,
        warning_color: data.warning_color,
        error_color: data.error_color,
        text_primary: data.text_primary,
        text_secondary: data.text_secondary,
        background_color: data.background_color,
        surface_color: data.surface_color,
        border_color: data.border_color,
        favicon_url: data.favicon_url,
      });
    } catch (error) {
      message.error('Gagal memuat konfigurasi');
      console.error(error);
    }
  };

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      const sessionToken = localStorage.getItem('admin_session_token');
      if (!sessionToken) {
        message.error('Anda harus login sebagai admin untuk memperbarui konfigurasi');
        setLoading(false);
        return;
      }

      const updateData: UpdateSiteConfigRequest = {};
      
      Object.keys(values).forEach(key => {
        const value = values[key];
        if (value && typeof value === 'object' && 'toHexString' in value) {
          updateData[key as keyof UpdateSiteConfigRequest] = value.toHexString();
        } else if (value) {
          updateData[key as keyof UpdateSiteConfigRequest] = value;
        }
      });

      await apiClient.updateAdminSiteConfig(updateData);
      message.success('Konfigurasi berhasil diperbarui! Refresh halaman untuk melihat perubahan.');
      loadConfig();
    } catch (error: any) {
      if (error?.response?.status === 401) {
        message.error('Sesi berakhir. Silakan login kembali.');
      } else {
        message.error('Gagal memperbarui konfigurasi');
      }
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const brandColors: ColorConfig[] = [
    { key: '1', label: 'Warna Primer', name: 'primary_color', description: 'Warna brand utama untuk tombol dan highlight', value: form.getFieldValue('primary_color') || '#0ea5e9' },
    { key: '2', label: 'Warna Sekunder', name: 'secondary_color', description: 'Warna brand pendukung', value: form.getFieldValue('secondary_color') || '#06b6d4' },
    { key: '3', label: 'Warna Aksen', name: 'accent_color', description: 'Warna aksen untuk elemen khusus', value: form.getFieldValue('accent_color') || '#8b5cf6' },
  ];

  const semanticColors: ColorConfig[] = [
    { key: '4', label: 'Warna Promo', name: 'promo_color', description: 'Digunakan untuk badge promosi dan penawaran', value: form.getFieldValue('promo_color') || '#ff4757' },
    { key: '5', label: 'Warna Sukses', name: 'success_color', description: 'Menunjukkan aksi yang berhasil', value: form.getFieldValue('success_color') || '#52c41a' },
    { key: '6', label: 'Warna Peringatan', name: 'warning_color', description: 'Menunjukkan peringatan atau hati-hati', value: form.getFieldValue('warning_color') || '#faad14' },
    { key: '7', label: 'Warna Error', name: 'error_color', description: 'Menunjukkan error atau masalah', value: form.getFieldValue('error_color') || '#ff4d4f' },
  ];

  const textBackgroundColors: ColorConfig[] = [
    { key: '8', label: 'Teks Primer', name: 'text_primary', description: 'Warna teks utama', value: form.getFieldValue('text_primary') || '#1a1a1a' },
    { key: '9', label: 'Teks Sekunder', name: 'text_secondary', description: 'Warna teks sekunder', value: form.getFieldValue('text_secondary') || '#64748b' },
    { key: '10', label: 'Warna Background', name: 'background_color', description: 'Warna background halaman', value: form.getFieldValue('background_color') || '#fafbfc' },
    { key: '11', label: 'Warna Surface', name: 'surface_color', description: 'Background card dan surface', value: form.getFieldValue('surface_color') || '#ffffff' },
    { key: '12', label: 'Warna Border', name: 'border_color', description: 'Warna border dan divider', value: form.getFieldValue('border_color') || '#e1e8ed' },
  ];

  const columns = [
    {
      title: 'Nama',
      dataIndex: 'label',
      key: 'label',
      width: '20%',
      render: (text: string) => <Text strong>{text}</Text>,
    },
    {
      title: 'Deskripsi',
      dataIndex: 'description',
      key: 'description',
      width: '40%',
      render: (text: string) => <Text type="secondary">{text}</Text>,
    },
    {
      title: 'Warna',
      dataIndex: 'name',
      key: 'color',
      width: '40%',
      render: (_: any, record: ColorConfig) => (
        <Form.Item
          name={record.name}
          style={{ marginBottom: 0 }}
          getValueFromEvent={(color: Color) => color?.toHexString()}
          getValueProps={(value) => ({ value })}
        >
          <ColorPicker
            showText
            format="hex"
            size="large"
            presets={[
              {
                label: 'Rekomendasi',
                colors: [
                  '#0ea5e9', '#06b6d4', '#8b5cf6', '#f59e0b',
                  '#10b981', '#ef4444', '#f97316', '#84cc16',
                  '#ec4899', '#6366f1', '#14b8a6', '#f43f5e',
                  '#1a1a1a', '#64748b', '#fafbfc', '#ffffff',
                ],
              },
            ]}
          />
        </Form.Item>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      <Title level={2}>🎨 Konfigurasi Halaman</Title>
      <Text type="secondary">
        Sesuaikan warna tema dan favicon halaman Anda. Perubahan akan diterapkan setelah refresh halaman.
      </Text>

      <Card style={{ marginTop: '24px' }}>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Title level={4}>🎯 Warna Brand</Title>
          <Text type="secondary" style={{ display: 'block', marginBottom: '16px' }}>
            Warna utama yang mendefinisikan identitas brand Anda
          </Text>
          <Table
            columns={columns}
            dataSource={brandColors}
            pagination={false}
            size="small"
            bordered
            style={{ marginBottom: '32px' }}
          />

          <Title level={4}>✨ Warna Semantik</Title>
          <Text type="secondary" style={{ display: 'block', marginBottom: '16px' }}>
            Warna yang menyampaikan makna dan status
          </Text>
          <Table
            columns={columns}
            dataSource={semanticColors}
            pagination={false}
            size="small"
            bordered
            style={{ marginBottom: '32px' }}
          />

          <Title level={4}>📝 Warna Teks & Background</Title>
          <Text type="secondary" style={{ display: 'block', marginBottom: '16px' }}>
            Warna untuk elemen teks dan background
          </Text>
          <Table
            columns={columns}
            dataSource={textBackgroundColors}
            pagination={false}
            size="small"
            bordered
            style={{ marginBottom: '32px' }}
          />

          <Divider />
          <Title level={4}>🔖 Favicon</Title>
          <Form.Item
            label="URL Favicon"
            name="favicon_url"
            rules={[{ required: true, message: 'URL favicon wajib diisi' }]}
            extra="Masukkan path relatif (contoh: /favicon.svg) atau URL lengkap (contoh: https://example.com/favicon.ico)"
          >
            <Input 
              placeholder="/favicon.svg atau https://example.com/favicon.ico" 
              size="large"
            />
          </Form.Item>

          <Form.Item style={{ marginTop: '32px' }}>
            <Space size="large">
              <Button type="primary" htmlType="submit" loading={loading} size="large">
                💾 Simpan Konfigurasi
              </Button>
              <Button onClick={loadConfig} size="large">
                🔄 Reset ke Saat Ini
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
