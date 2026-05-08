import React from "react";

function FlashSaleModal({ show, onClose }) {
  if (!show) return null;
  return (
    <div className="modal-overlay is-open" tabIndex={-1} aria-modal="true" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        <div className="modal-badge">⚡ Flash Sale hôm nay</div>
        <h2 className="modal-title">Deal sốc đến 80%</h2>
        <p className="modal-text">
          Săn nhanh các sản phẩm hot với giá chỉ từ 9.000đ, freeship toàn quốc, số lượng có hạn.
        </p>
        <ul className="modal-list">
          <li>Ưu tiên các mặt hàng điện tử, gia dụng, thời trang</li>
          <li>Áp dụng khung giờ 0h – 2h mỗi ngày</li>
          <li>Có thể kết hợp với voucher freeship + giảm giá</li>
        </ul>
        <button className="btn btn-accent btn-full" onClick={onClose}>Săn Flash Sale ngay</button>
        <button className="btn btn-ghost btn-full" onClick={onClose}>Để sau</button>
      </div>
    </div>
  );
}

export default FlashSaleModal;
