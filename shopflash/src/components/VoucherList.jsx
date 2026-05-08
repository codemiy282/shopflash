import React from "react";

function formatPrice(price) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(price);
}

function VoucherList({ vouchers = [], onCopy }) {
  if (!vouchers.length) {
    return <p>Hiện chưa có voucher nào khả dụng.</p>;
  }

  return (
    <div className="voucher-list">
      {vouchers.map((v) => {
        const minOrder = v.minOrder ? formatPrice(v.minOrder) : "Không giới hạn";
        const discount =
          v.type === "FREESHIP"
            ? "Freeship"
            : formatPrice(v.discountAmount || 0);
        return (
          <div key={v.id} className="voucher-item">
            <div className="voucher-main">
              <div className="voucher-code">{v.code}</div>
              <div className="voucher-desc">{v.description}</div>
              <div className="voucher-meta">
                <span>Đơn tối thiểu: {minOrder}</span>
                <span>Hết hạn: {v.expiresAt || "-"}</span>
              </div>
            </div>
            <div className="voucher-side">
              <div className="voucher-discount">{discount}</div>
              <button
                className="btn btn-outline btn-sm voucher-copy"
                onClick={() => onCopy(v.code)}
              >
                Sao chép
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default VoucherList;
