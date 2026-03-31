import React, { useEffect, useState } from "react";
import { Badge, Button, Card, Col, Empty, Input, Row, Select, Spin, Tabs, Tag as AntTag, Typography, message, Image } from "antd";
import { SearchOutlined, StarOutlined, EditOutlined, CopyOutlined, DeleteOutlined } from "@ant-design/icons";
import { Admin, Item, PurchaseSummary, Category } from "../../types";
import { apiClient } from "../../api";
import AddItemModal from "./modals/AddItemModal.tsx";
import EditItemModal from "./modals/EditItemModal.tsx";
import PurchaseTable from "./purchases/PurchaseTable.tsx";
import PurchaseDetailsModal from "./purchases/PurchaseDetailsModal.tsx";
import CategoryManagement from "./categories/CategoryManagement.tsx";
import SiteConfigPage from "./SiteConfigPage.tsx";

const { Title, Text } = Typography;

const AdminPanel: React.FC<{
  admin: Admin | null;
  onLogin: (username: string, password: string) => Promise<void>;
  onRegister: (username: string, password: string) => Promise<void>;
  onLogout: () => void;
  onShowLogin: () => void;
}> = ({ admin, onLogin, onRegister, onLogout, onShowLogin }) => {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [duplicateItem, setDuplicateItem] = useState<Item | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);

  const [selectedPurchase, setSelectedPurchase] = useState<PurchaseSummary | null>(null);
  const [purchaseDetailsVisible, setPurchaseDetailsVisible] = useState(false);
  const [activeTab, setActiveTab] = useState("items");

  const fetchItems = async (searchTerm?: string) => {
    setLoading(true);
    try {
      const data = await apiClient.getAdminItems(currentPage, 20, searchTerm);
      setItems(data.items);
      setTotalItems(data.total);
      setHasMore(data.hasMore);
    } catch (error) {
      message.error("Gagal memuat item");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesData = await apiClient.getCategories();
        setCategories(categoriesData);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    if (admin) {
      fetchItems();
    }
  }, [admin, currentPage]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchItems(searchQuery);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleCreateItem = async (values: any) => {
    try {
      await apiClient.createAdminItem(values);
      await fetchItems();
      setAddModalVisible(false);
      message.success("Item berhasil dibuat");
    } catch (error) {
      message.error("Gagal membuat item");
      throw error;
    }
  };

  const handleUpdateItem = async (id: number, values: any) => {
    try {
      await apiClient.updateAdminItem(id, values);
      await fetchItems();
      setEditingItem(null);
      setEditModalVisible(false);
      message.success("Item berhasil diperbarui");
    } catch (error) {
      message.error("Gagal memperbarui item");
      throw error;
    }
  };

  const handleDeleteItem = async (id: number) => {
    try {
      await apiClient.deleteAdminItem(id);
      message.success("Item berhasil dihapus");
      fetchItems();
    } catch (error) {
      message.error("Gagal menghapus item");
    }
  };

  const handleEdit = (item: Item) => {
    setEditingItem(item);
    setEditModalVisible(true);
  };

  const handleDuplicate = (item: Item) => {
    setDuplicateItem(item);
    setAddModalVisible(true);
  };

  const handleViewPurchaseDetails = (purchase: PurchaseSummary) => {
    setSelectedPurchase(purchase);
    setPurchaseDetailsVisible(true);
  };

  if (!admin) {
    return (
      <>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", flexDirection: "column" }}>
          <Title level={2}>Panel Admin</Title>
          <Text>Silakan login untuk mengakses panel admin</Text>
          <Button type="primary" onClick={onShowLogin} style={{ marginTop: "16px" }}>
            Ke Halaman Login Admin
          </Button>
        </div>
      </>
    );
  }

  return (
    <>
      <style>
        {`
          @media (max-width: 768px) {
            .admin-table-container {
              font-size: 10px;
            }
            .admin-table-container th,
            .admin-table-container td {
              padding: 2px 4px !important;
            }
            .admin-table-container .ant-btn {
              font-size: 9px;
              padding: 1px 3px;
              height: 20px;
              min-width: 28px;
            }
            .admin-table-container .ant-tag {
              font-size: 7px;
              padding: 0px 2px;
              margin: 0px;
            }
          }
        `}
      </style>
      <div style={{ padding: "16px", width: "100%", margin: "0 auto" }}>
      <div style={{ marginBottom: "24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <div>
            <Title level={2}>Manajemen Produk</Title>
            <Text>Kelola produk di sini</Text>
          </div>
          <div>
            <Button onClick={onLogout}>
              Keluar
            </Button>
          </div>
        </div>
      </div>

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={[
          {
            key: "items",
            label: "Manajemen Item",
            children: (
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                  <Input
                    placeholder="Cari item berdasarkan nama atau tag..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                    onPressEnter={handleKeyPress as any}
                    size="large"
                    prefix={<SearchOutlined />}
                    onBlur={handleSearch as any}
                    style={{ maxWidth: "400px" }}
                  />
                  <Button
                    type="primary"
                    onClick={() => {
                      setDuplicateItem(null);
                      setAddModalVisible(true);
                    }}
                  >
                    Tambah Item Baru
                  </Button>
                </div>

                <Card style={{ marginTop: "16px" }}>
                  <Spin spinning={loading}>
                    <div className="admin-table-container" style={{ 
                      width: "100%",
                      overflowX: "hidden"
                    }}>
                      <table style={{ 
                        width: "100%", 
                        borderCollapse: "collapse", 
                        tableLayout: "auto"
                      }}>
                        <thead>
                          <tr style={{ backgroundColor: "#fafafa", borderBottom: "1px solid #f0f0f0" }}>
                            <th style={{ padding: "6px 8px", textAlign: "left", fontWeight: "600", width: "5%", fontSize: "12px" }}>
                              Gambar
                            </th>
                            <th style={{ padding: "6px 8px", textAlign: "left", fontWeight: "600", width: "25%", fontSize: "12px" }}>
                              Nama
                            </th>
                            <th style={{ padding: "6px 8px", textAlign: "left", fontWeight: "600", width: "8%", fontSize: "12px" }}>
                              Kode
                            </th>
                            <th style={{ padding: "6px 8px", textAlign: "right", fontWeight: "600", width: "12%", fontSize: "12px" }}>
                              Harga
                            </th>
                            <th style={{ padding: "6px 8px", textAlign: "right", fontWeight: "600", width: "12%", fontSize: "12px" }}>
                              Potongan Harga
                            </th>
                            <th style={{ padding: "6px 8px", textAlign: "center", fontWeight: "600", width: "8%", fontSize: "12px" }}>
                              Rating
                            </th>
                            <th style={{ padding: "6px 8px", textAlign: "left", fontWeight: "600", width: "12%", fontSize: "12px" }}>
                              Kategori
                            </th>
                            <th style={{ padding: "6px 8px", textAlign: "left", fontWeight: "600", width: "14%", fontSize: "12px" }}>
                              Tag
                            </th>
                            <th style={{ padding: "6px 8px", textAlign: "center", fontWeight: "600", width: "12%", fontSize: "12px" }}>
                              Aksi
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {items.map((item) => (
                            <tr key={item.id} style={{ borderBottom: "1px solid #f0f0f0" }}>
                              <td style={{ padding: "4px 6px" }}>
                                <Image
                                  src={item.image_url}
                                  alt=""
                                  width={32}
                                  height={32}
                                  style={{ objectFit: "cover", borderRadius: "3px", border: "1px solid #f0f0f0", cursor: "pointer" }}
                                  preview={{
                                    mask: false
                                  }}
                                  onError={(e) => {
                                    (e.currentTarget as HTMLImageElement).style.display = "none";
                                  }}
                                />
                              </td>
                              <td style={{ 
                                padding: "4px 6px", 
                                whiteSpace: "nowrap", 
                                overflow: "hidden", 
                                textOverflow: "ellipsis",
                                maxWidth: "0"
                              }}>
                                <Text strong style={{ fontSize: "12px" }} title={item.name}>
                                  {item.name}
                                </Text>
                              </td>
                              <td style={{ 
                                padding: "4px 6px", 
                                whiteSpace: "nowrap", 
                                overflow: "hidden", 
                                textOverflow: "ellipsis",
                                maxWidth: "0"
                              }}>
                                <Text type="secondary" style={{ fontSize: "11px" }} title={item.code}>
                                  {item.code}
                                </Text>
                              </td>
                              <td style={{ 
                                padding: "4px 6px", 
                                textAlign: "right", 
                                whiteSpace: "nowrap", 
                                overflow: "hidden", 
                                textOverflow: "ellipsis",
                                maxWidth: "0"
                              }}>
                                <Text strong style={{ fontSize: "12px", color: "#1890ff" }} title={`Rp ${item.price.toLocaleString("id-ID")}`}>
                                  Rp {item.price.toLocaleString("id-ID")}
                                </Text>
                              </td>
                              <td style={{ 
                                padding: "4px 6px", 
                                textAlign: "right", 
                                whiteSpace: "nowrap", 
                                overflow: "hidden", 
                                textOverflow: "ellipsis",
                                maxWidth: "0"
                              }}>
                                {item.price_cut > 0 ? (
                                  <div>
                                    <Text strong style={{ fontSize: "12px", color: "#ff4757" }}>
                                      Rp {item.price_cut.toLocaleString("id-ID")}
                                    </Text>
                                    <div style={{ fontSize: "9px", color: "#52c41a", marginTop: "1px" }}>
                                      -{Math.round((item.price_cut / item.price) * 100)}%
                                    </div>
                                  </div>
                                ) : (
                                  <Text type="secondary" style={{ fontSize: "10px" }}>
                                    Tidak ada diskon
                                  </Text>
                                )}
                              </td>
                              <td style={{ 
                                padding: "4px 6px", 
                                textAlign: "center", 
                                whiteSpace: "nowrap",
                                maxWidth: "0"
                              }}>
                                <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                                  <div style={{ display: "flex", gap: "1px" }}>
                                    {[1, 2, 3, 4, 5].map((star) => (
                                      <StarOutlined key={star} style={{ fontSize: "10px", color: star <= Math.round(item.rating) ? "#faad14" : "#d9d9d9" }} />
                                    ))}
                                  </div>
                                </div>
                              </td>
                              <td style={{ 
                                padding: "4px 6px", 
                                whiteSpace: "nowrap", 
                                overflow: "hidden", 
                                textOverflow: "ellipsis",
                                maxWidth: "0"
                              }}>
                                {item.category_id ? (
                                  <Text type="secondary" style={{ fontSize: "11px" }}>
                                    {categories.find(c => c.id === item.category_id)?.name || `ID: ${item.category_id}`}
                                  </Text>
                                ) : (
                                  <Text type="secondary" style={{ fontSize: "10px", fontStyle: "italic" }}>
                                    Tanpa kategori
                                  </Text>
                                )}
                              </td>
                              <td style={{ 
                                padding: "4px 6px", 
                                whiteSpace: "nowrap",
                                maxWidth: "0"
                              }}>
                                <div style={{ display: "flex", flexWrap: "nowrap", gap: "1px", overflow: "hidden" }}>
                                  {(Array.isArray(item.tags) ? item.tags : [])
                                    .slice(0, 3)
                                    .map((tag, index) => (
                                      <AntTag key={index} style={{ background: "#f0f0f0", border: "1px solid #d9d9d9", borderRadius: "2px", padding: "0px 3px", fontSize: "9px", margin: "0px" }}>
                                        {tag}
                                      </AntTag>
                                    ))}
                                  {(Array.isArray(item.tags) ? item.tags : []).length > 3 && (
                                    <AntTag style={{ fontSize: "9px", margin: "0px" }}>
                                      +{(Array.isArray(item.tags) ? item.tags : []).length - 3}
                                    </AntTag>
                                  )}
                                </div>
                              </td>
                              <td style={{ 
                                padding: "4px 6px", 
                                textAlign: "center"
                              }}>
                                <div style={{ 
                                  display: "flex", 
                                  gap: "4px", 
                                  justifyContent: "center", 
                                  alignItems: "center"
                                }}>
                                  <Button type="primary" size="small" icon={<EditOutlined />} onClick={() => handleEdit(item)} title="Edit" />
                                  <Button type="default" size="small" icon={<CopyOutlined />} onClick={() => handleDuplicate(item)} title="Duplikat" />
                                  <Button danger size="small" icon={<DeleteOutlined />} onClick={() => handleDeleteItem(item.id)} title="Hapus" />
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </Spin>

                  {items.length > 0 && (
                    <div style={{ marginTop: "16px", display: "flex", justifyContent: "center", padding: "16px" }}>
                      <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                        <Button disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)}>
                          Sebelumnya
                        </Button>
                        <span style={{ padding: "0 16px", fontSize: "14px" }}>
                          Halaman {currentPage} dari {Math.ceil(totalItems / 20)}
                        </span>
                        <Button disabled={!hasMore} onClick={() => setCurrentPage(currentPage + 1)}>
                          Selanjutnya
                        </Button>
                      </div>
                    </div>
                  )}
                </Card>
              </div>
            ),
          },
          {
            key: "categories",
            label: "Manajemen Kategori",
            children: (
              <CategoryManagement />
            ),
          },
          {
            key: "purchases",
            label: "Manajemen Pembelian",
            children: (
              <PurchaseTable
                admin={admin}
                onViewDetails={handleViewPurchaseDetails}
              />
            ),
          },
          {
            key: "config",
            label: "Konfigurasi Halaman",
            children: (
              <SiteConfigPage />
            ),
          },
        ]}
      />

      <AddItemModal
        visible={addModalVisible}
        onClose={() => {
          setAddModalVisible(false);
          setDuplicateItem(null);
        }}
        onAdd={handleCreateItem}
        initialValues={duplicateItem}
        categories={categories}
      />
      <EditItemModal
        visible={editModalVisible}
        item={editingItem}
        onClose={() => {
          setEditModalVisible(false);
          setEditingItem(null);
        }}
        onUpdate={handleUpdateItem}
        categories={categories}
      />
      <PurchaseDetailsModal
        visible={purchaseDetailsVisible}
        purchase={selectedPurchase}
        admin={admin}
        onClose={() => {
          setPurchaseDetailsVisible(false);
          setSelectedPurchase(null);
        }}
      />
      </div>
    </>
  );
};

export default AdminPanel;


