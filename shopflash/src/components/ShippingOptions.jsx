import React from "react";

function formatPrice(price) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(price);
}

/*
  Props:
    options: [{ partner, serviceType, fee, eta }]
    selectedIndex: number
    onChange: function(index)
*/
function ShippingOptions({ options, selectedIndex, onChange }) {
  return (
    <div className="card shipping-options">
      {options.map((opt, idx) => (
        <div key={idx} className="option">
          <div>
            <label>
              <input
                type="radio"
                name="shipping"
                value={idx}
                checked={selectedIndex === idx}
                onChange={() => onChange(idx)}
              />
              <strong>{opt.partner}</strong> - {opt.serviceType}
            </label>
            <div className="text-muted">Dự kiến: {opt.eta}</div>
          </div>
          <div>{formatPrice(opt.fee)}</div>
        </div>
      ))}
    </div>
  );
}

export default ShippingOptions;
