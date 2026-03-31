import React, { useEffect, useState } from "react";
import { Button, Card, Form, Input, List, Typography, message, Divider, Select, Space, Radio } from "antd";
import { CreditCardOutlined, PhoneOutlined, UserOutlined, SearchOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import CartContext from "../contexts/AppCartContext";
import UserContext from "../contexts/AppUserContext";
import { UserInfo, DestinationItem, ShippingOption } from "../types";
import { apiClient } from "../api";
import PurchaseFooter from "../components/layout/PurchaseFooter";
import { getUserInfoFromCookie, saveUserInfoToCookie } from "../utils/cookies";
import BackButton from "../components/BackButton";

const { Text } = Typography;

const PurchasePage: React.FC = () => {
  const { cart, clearCart } = React.useContext(CartContext);
  const { user, setUser } = React.useContext(UserContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [destinationQuery, setDestinationQuery] = useState("");
  const [destinationOptions, setDestinationOptions] = useState<DestinationItem[]>([]);
  const [selectedDestination, setSelectedDestination] = useState<DestinationItem | null>(null);
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);
  const [selectedShipping, setSelectedShipping] = useState<ShippingOption | null>(null);
  const [calculating, setCalculating] = useState(false);
  const [searching, setSearching] = useState(false);
  const [formValues, setFormValues] = useState<any>({});
  const [deliveryType, setDeliveryType] = useState<'pickup' | 'delivery'>('pickup');

  useEffect(() => {
    if (user) {
      form.setFieldsValue(user);
      setFormValues(user); // Update form values state when auto-filled
    } else {
      const savedUserInfo = getUserInfoFromCookie();
      if (savedUserInfo) {
        form.setFieldsValue(savedUserInfo);
        setUser(savedUserInfo);
        setFormValues(savedUserInfo); // Update form values state when auto-filled from cookies
      } else {
        setFormValues({}); // Clear form values state
      }
    }
  }, [user, form, setUser]);

  // Ensure address is loaded into formValues when switching to delivery
  useEffect(() => {
    if (deliveryType === 'delivery') {
      const currentAddress = form.getFieldValue('address');
      if (currentAddress && currentAddress !== 'pick up') {
        setFormValues((prev: any) => ({ ...prev, address: currentAddress }));
      }
    }
  }, [deliveryType, form]);

  // Keep address field value even when hidden (for pickup default)
  useEffect(() => {
    if (user && user.address && user.address !== 'pick up') {
      form.setFieldValue('address', user.address);
      setFormValues((prev: any) => ({ ...prev, address: user.address }));
    } else {
      const savedUserInfo = getUserInfoFromCookie();
      if (savedUserInfo && savedUserInfo.address && savedUserInfo.address !== 'pick up') {
        form.setFieldValue('address', savedUserInfo.address);
        setFormValues((prev: any) => ({ ...prev, address: savedUserInfo.address }));
      }
    }
  }, [user, form]);

  useEffect(() => {
    if (cart.length === 0) {
      navigate("/");
    }
  }, [cart.length, navigate]);

  const itemsSubtotal = cart.reduce(
    (sum, item) => sum + item.item.price * item.quantity,
    0,
  );
  const totalDiscount = cart.reduce(
    (sum, item) => sum + (item.item.price_cut * item.quantity),
    0,
  );
  const itemsTotalAfterDiscount = itemsSubtotal - totalDiscount;
  const totalWeight = cart.reduce(
    (sum, item) => sum + (item.item.weight * item.quantity) / 1000, // Convert grams to kg
    0,
  );
  const shippingCost = deliveryType === 'pickup' ? 0 : (selectedShipping?.cost || 0);
  const totalPrice = itemsTotalAfterDiscount + shippingCost;

  // Check if all required fields are completed
  // Also check form.getFieldsValue() as fallback in case formValues state is not updated
  const currentFormValues = form.getFieldsValue();
  const isFormComplete = deliveryType === 'pickup' ? 
    ((formValues.name || currentFormValues.name) && (formValues.phone || currentFormValues.phone)) :
    (selectedDestination && selectedShipping && 
      (formValues.name || currentFormValues.name) && 
      (formValues.phone || currentFormValues.phone) && 
      (formValues.address || currentFormValues.address));

  const handleSubmit = async (values: UserInfo) => {
    setLoading(true);
    try {
      setUser(values);
      saveUserInfoToCookie(values);

      const purchaseRequest = {
        items: cart.map((item) => ({
          item_id: item.item.id,
          quantity: item.quantity,
        })),
        user: {
          ...values,
          address: deliveryType === 'pickup' ? 'pick up' : values.address,
        },
        shipping_cost: deliveryType === 'pickup' ? 0 : (selectedShipping?.cost || 0),
        shipping_destination: deliveryType === 'pickup' ? null : (selectedDestination?.label || null),
        shipping_expedition: deliveryType === 'pickup' ? null : (selectedShipping ? `${selectedShipping.name} - ${selectedShipping.service}` : null),
      };

      const response = await apiClient.createPurchase(purchaseRequest);
      clearCart();
      message.success("Pembelian berhasil dibuat!");

      const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:8080';
      const purchaseUrl = `${API_BASE_URL}/order/${response.code}`;
      window.location.href = purchaseUrl;
    } catch (error) {
      console.error("Error creating purchase:", error);
      message.error("Gagal membuat pembelian. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  const handleCheckout = () => {
    // Validate all required fields before proceeding
    if (deliveryType === 'delivery') {
      if (!selectedDestination) {
        message.error("Silakan pilih tujuan pengiriman terlebih dahulu");
        return;
      }
      
      if (!selectedShipping) {
        message.error("Silakan pilih opsi pengiriman terlebih dahulu");
        return;
      }
    }

    // Validate form fields
    form.validateFields()
      .then(() => {
        const formEl = document.querySelector(".shipping-card form");
        if (formEl) {
          (formEl as HTMLFormElement).requestSubmit();
        }
      })
      .catch((errorInfo) => {
        message.error("Silakan lengkapi semua informasi yang diperlukan");
      });
  };

  return (
    <div className="purchase-page">
      <BackButton onBackClick={() => navigate("/cart")} title="Pembayaran" />
      <div className="purchase-spacer"></div>
      <div className="purchase-content">
        <div>
          <Card title="Informasi Pengiriman" className="shipping-card">
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              onValuesChange={(changedValues, allValues) => setFormValues(allValues)}
              requiredMark={false}
            >
              <Form.Item
                name="name"
                label="Nama Lengkap"
                rules={[{ required: true, message: "Silakan masukkan nama lengkap Anda" }]}
              >
                <Input prefix={<UserOutlined />} placeholder="Masukkan nama lengkap Anda" size="large" />
              </Form.Item>

              <Form.Item
                name="phone"
                label="Nomor Telepon"
                rules={[{ required: true, message: "Silakan masukkan nomor telepon Anda" }, { pattern: /^[\d\s\-\+\(\)]+$/, message: "Silakan masukkan nomor telepon yang valid" }]}
              >
                <Input prefix={<PhoneOutlined />} placeholder="Masukkan nomor telepon Anda" size="large" />
              </Form.Item>

              <Form.Item label="Tipe Pengiriman">
                <Radio.Group 
                  value={deliveryType} 
                  onChange={(e) => {
                    setDeliveryType(e.target.value);
                    if (e.target.value === 'pickup') {
                      setSelectedDestination(null);
                      setSelectedShipping(null);
                      setShippingOptions([]);
                      setDestinationQuery('');
                    } else if (e.target.value === 'delivery') {
                      // Ensure address field is populated if it exists in form
                      const currentAddress = form.getFieldValue('address');
                      if (currentAddress && currentAddress !== 'pick up') {
                        setFormValues((prev: any) => ({ ...prev, address: currentAddress }));
                      }
                    }
                  }}
                  style={{ width: '100%' }}
                >
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Radio value="pickup" style={{ width: '100%' }}>
                      <div>
                        <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>Pickup (Jemput Sendiri)</div>
                        <div style={{ fontSize: '12px', color: '#666', marginLeft: '24px' }}>
                          Setelah Berhasil Checkout, Mitra dapat mengambil orderan ke kantor pemasaran. (Hubungi Customer Service via <b>BANTUAN</b> untuk Info lebih lanjut).
                        </div>
                      </div>
                    </Radio>
                    <Radio value="delivery" style={{ width: '100%' }}>
                      <div>
                        <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>Delivery (Kirim Ke Alamat)</div>
                        <div style={{ fontSize: '12px', color: '#666', marginLeft: '24px' }}>
                          Ketik dan Cari Kelurahan sesuai dengan alamat Mitra, untuk mendapatkan estimasi biaya ongkir sesuai dengan ekspedisi yang tersedia. Orderan akan dikirim ke Alamat.
                        </div>
                      </div>
                    </Radio>
                  </Space>
                </Radio.Group>
              </Form.Item>

              {deliveryType === 'delivery' && (
                <Form.Item label="Tujuan Pengiriman">
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Input.Search
                    placeholder="Cari kecamatan/kelurahan/kota"
                    value={destinationQuery}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      setDestinationQuery(e.target.value);
                      setSelectedDestination(null);
                      setSelectedShipping(null);
                      setShippingOptions([]);
                    }}
                    onSearch={async () => {
                      if (!destinationQuery || destinationQuery.length < 3) { setDestinationOptions([]); return; }
                      setSearching(true);
                      try {
                        const res = await apiClient.searchDestinations(destinationQuery, 10, 0);
                        setDestinationOptions(res);
                      } catch (e) {
                        setDestinationOptions([]);
                      } finally {
                        setSearching(false);
                      }
                    }}
                    enterButton={<SearchOutlined />}
                    loading={searching}
                    size="large"
                    allowClear
                    className="modern-search"
                  />

                  {destinationOptions.length > 0 && !selectedDestination && (
                    <List
                      size="small"
                      bordered
                      dataSource={destinationOptions}
                      renderItem={(d) => (
                        <List.Item
                          style={{ 
                            cursor: 'pointer',
                            backgroundColor: '#fafafa',
                            transition: 'background-color 0.2s'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#f0f0f0';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = '#fafafa';
                          }}
                          onClick={async () => {
                            setSelectedDestination(d);
                            setDestinationQuery(d.label);
                            setSelectedShipping(null);
                            setDestinationOptions([]); // Hide dropdown
                            
                            // Automatically fetch shipping costs
                            setCalculating(true);
                            try {
                              const totalWeightInGrams = cart.reduce((sum, ci) => sum + ci.item.weight * ci.quantity, 0);
                              const options = await apiClient.calculateShippingCost(d.id, totalWeightInGrams);
                              setShippingOptions(options);
                              if (options.length > 0) {
                                message.success(`Ditemukan ${options.length} opsi pengiriman`);
                              } else {
                                message.warning('Tidak ada opsi pengiriman tersedia untuk tujuan ini');
                              }
                            } catch (e) {
                              message.error('Gagal menghitung ongkos kirim');
                              setShippingOptions([]);
                            } finally {
                              setCalculating(false);
                            }
                          }}
                        >
                          <div style={{ width: '100%' }}>
                            <Text>{d.label}</Text>
                          </div>
                        </List.Item>
                      )}
                      style={{ maxHeight: 240, overflow: 'auto' }}
                    />
                  )}

                  {selectedDestination && (
                    <div style={{ 
                      padding: '12px', 
                      background: '#f6ffed', 
                      border: '1px solid #b7eb8f', 
                      borderRadius: '6px',
                      marginBottom: '12px'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <Text strong style={{ color: '#52c41a' }}>✓ Tujuan Dipilih:</Text>
                          <br />
                          <Text>{selectedDestination.label}</Text>
                        </div>
                        <Button 
                          size="small" 
                          type="link" 
                          onClick={() => {
                            setSelectedDestination(null);
                            setSelectedShipping(null);
                            setShippingOptions([]);
                            setDestinationQuery('');
                          }}
                        >
                          Ubah
                        </Button>
                      </div>
                    </div>
                  )}

                  {calculating && (
                    <div style={{ textAlign: 'center', padding: '20px' }}>
                      <Text type="secondary">Menghitung ongkos kirim...</Text>
                    </div>
                  )}

                  {shippingOptions.length > 0 && (
                    <div>
                      <Divider style={{ margin: '12px 0' }} />
                      <div style={{ marginBottom: 12 }}>
                        <Text strong>Pilih Ekspedisi Pengiriman:</Text>
                        {!selectedShipping && <Text type="danger" style={{ marginLeft: 8 }}>*Wajib dipilih</Text>}
                      </div>
                      <Select
                        placeholder="Pilih ekspedisi pengiriman"
                        value={selectedShipping ? shippingOptions.findIndex(o => o === selectedShipping) : undefined}
                        onChange={(value) => setSelectedShipping(shippingOptions[value])}
                        style={{ width: '100%' }}
                        size="large"
                        showSearch
                        optionLabelProp="label"
                        filterOption={(input, option) => {
                          const text = option?.label || option?.children;
                          return String(text).toLowerCase().includes(input.toLowerCase());
                        }}
                        dropdownStyle={{
                          maxHeight: 300,
                          overflow: 'auto'
                        }}
                        onDropdownVisibleChange={(open) => {
                          if (open) {
                            document.body.style.overflow = 'hidden';
                          } else {
                            document.body.style.overflow = 'unset';
                          }
                        }}
                        optionRender={(option) => (
                          <div style={{ 
                            whiteSpace: 'normal', 
                            wordWrap: 'break-word',
                            lineHeight: '1.4',
                            padding: '4px 0'
                          }}>
                            {option.label}
                          </div>
                        )}
                      >
                        {shippingOptions.map((opt, idx) => (
                          <Select.Option 
                            key={`${opt.code}-${opt.service}-${idx}`} 
                            value={idx}
                            label={`${opt.name} - Rp ${opt.cost.toLocaleString('id-ID')}`}
                          >
                            {opt.name} - {opt.service} ({opt.description}) • Rp {opt.cost.toLocaleString('id-ID')}{opt.etd ? ` • ${opt.etd}` : ''}
                          </Select.Option>
                        ))}
                      </Select>
                    </div>
                  )}
                </Space>
                </Form.Item>
              )}

              {deliveryType === 'delivery' && (
                <Form.Item
                  name="address"
                  label="Alamat Lengkap"
                  rules={[{ required: true, message: "Silakan masukkan alamat Anda" }]}
                >
                  <Input.TextArea placeholder="Masukkan alamat lengkap Anda" rows={4} />
                </Form.Item>
              )}
            </Form>
          </Card>
        </div>

        <div>
          <Card title="Ringkasan Pesanan" className="order-summary-card">
            <List
              dataSource={cart}
              renderItem={(cartItem) => {
                const itemTotal = cartItem.item.price * cartItem.quantity;
                const itemDiscount = cartItem.item.price_cut * cartItem.quantity;
                const itemTotalAfterDiscount = itemTotal - itemDiscount;
                
                return (
                  <List.Item>
                    <List.Item.Meta
                      avatar={
                        <img
                          src={cartItem.item.image_url}
                          alt={cartItem.item.name}
                          style={{ width: 40, height: 40, objectFit: "cover", borderRadius: 4 }}
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = "none";
                            (
                              e.target as HTMLImageElement
                            ).parentElement!.innerHTML =
                              '<div style="width: 40px; height: 40px; background: #f0f0f0; border-radius: 4px; display: flex; align-items: center; justify-content: center; font-size: 16px;">📦</div>';
                          }}
                        />
                      }
                      title={cartItem.item.name}
                      description={`Jml: ${cartItem.quantity} • Berat: ${((cartItem.item.weight * cartItem.quantity) / 1000).toFixed(1)} kg`}
                    />
                    <div style={{ textAlign: 'right' }}>
                      {itemDiscount > 0 && (
                        <div style={{ fontSize: '12px', color: '#52c41a', marginBottom: '2px' }}>
                          Diskon: -Rp {itemDiscount.toLocaleString('id-ID')}
                        </div>
                      )}
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                        {itemDiscount > 0 && (
                          <Text style={{ fontSize: '12px', color: '#999', textDecoration: 'line-through' }}>
                            Rp {itemTotal.toLocaleString('id-ID')}
                          </Text>
                        )}
                        <Text strong style={{ color: itemDiscount > 0 ? '#52c41a' : 'inherit' }}>
                          Rp {itemTotalAfterDiscount.toLocaleString('id-ID')}
                        </Text>
                      </div>
                    </div>
                  </List.Item>
                );
              }}
            />
            <Divider />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <Text>Subtotal</Text>
              <Text>Rp {itemsSubtotal.toLocaleString('id-ID')}</Text>
            </div>
            {totalDiscount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <Text style={{ color: '#52c41a' }}>Total Diskon</Text>
                <Text style={{ color: '#52c41a' }}>-Rp {totalDiscount.toLocaleString('id-ID')}</Text>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <Text>Subtotal Setelah Diskon</Text>
              <Text>Rp {itemsTotalAfterDiscount.toLocaleString('id-ID')}</Text>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <Text>Total Berat</Text>
              <Text>{totalWeight.toFixed(1)} kg</Text>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <Text>Ongkos Kirim</Text>
              <Text>{selectedShipping ? `Rp ${shippingCost.toLocaleString('id-ID')}` : '-'}</Text>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Text strong>Total</Text>
              <Text strong>Rp {totalPrice.toLocaleString('id-ID')}</Text>
            </div>
            
            {/* Completion Status */}
            <Divider />
            <div style={{ padding: '12px', background: isFormComplete ? '#f6ffed' : '#fff2e8', border: `1px solid ${isFormComplete ? '#b7eb8f' : '#ffd591'}`, borderRadius: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                <Text strong style={{ color: isFormComplete ? '#52c41a' : '#fa8c16' }}>
                  {isFormComplete ? '✓ Semua informasi lengkap' : '⚠ Informasi belum lengkap'}
                </Text>
              </div>
              <div style={{ fontSize: '12px', color: '#666' }}>
                {deliveryType === 'delivery' && !selectedDestination && <div>• Pilih tujuan pengiriman</div>}
                {deliveryType === 'delivery' && selectedDestination && !selectedShipping && <div>• Pilih opsi pengiriman</div>}
                {!(formValues.name || currentFormValues.name) && <div>• Isi nama lengkap</div>}
                {!(formValues.phone || currentFormValues.phone) && <div>• Isi nomor telepon</div>}
                {deliveryType === 'delivery' && !(formValues.address || currentFormValues.address) && <div>• Isi alamat lengkap</div>}
                {isFormComplete && <div>• Siap untuk menyelesaikan pembelian</div>}
              </div>
            </div>
          </Card>
        </div>
      </div>

      <PurchaseFooter 
        totalPrice={totalPrice} 
        onCheckout={handleCheckout} 
        loading={loading} 
        disabled={!isFormComplete}
      />
    </div>
  );
};

export default PurchasePage;


