import React from "react";
import { Button, Result } from "antd";
import { useNavigate } from "react-router-dom";

const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Result
      status="404"
      title="404"
      subTitle="Halaman yang Anda cari tidak ditemukan."
      extra={
        <Button type="primary" onClick={() => navigate("/")}>
          Kembali ke Beranda
        </Button>
      }
    />
  );
};

export default NotFound;
