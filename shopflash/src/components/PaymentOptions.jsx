import React from "react";

/*
  Props:
    methods: [{ id, name }]          // Danh sách phương thức thanh toán (mảng object: id & tên)
    selectedId: number               // id phương thức đang chọn
    onChange: function(id)           // Hàm thay đổi phương thức thanh toán (truyền id mới)
*/
function PaymentOptions({ methods, selectedId, onChange }) {
  return (
    <div className="card payment-options">
      {methods.map((m) => (
        <div key={m.id} className="option">
          <label>
            <input
              type="radio"
              name="payment"
              value={m.id}
              checked={selectedId === m.id}
              onChange={() => onChange(m.id)}
            />
            {m.name}
          </label>
        </div>
      ))}
    </div>
  );
}

export default PaymentOptions;
