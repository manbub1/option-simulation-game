import React, { useState } from "react";
import calculateCallOptionPrice from "../utils/blackScholes.js";

export default function AssetCard({ asset, onBuyOption, priceChange, gameStarted, difficulty }) {
  const [quantity, setQuantity] = useState(1);
  const [showTooltip, setShowTooltip] = useState(false);

  const priceStyle = {
    color:
      priceChange === "up"
        ? "red"
        : priceChange === "down"
        ? "blue"
        : "black",
  };

  const volatilityStyle = {
    color: asset.volatility > 0.6 ? "red" : "green",
    fontWeight: "bold"
  };

  const futureTime = 0.1;
  const strikePrice = asset.price * 1.1;
  const interestRate = 0.03;
  const optionPrice = Math.round(
    calculateCallOptionPrice(
      asset.price,
      strikePrice,
      futureTime,
      interestRate,
      asset.volatility
    )
  );
  const totalCost = optionPrice * quantity;

  return (
    <div
      style={{
        border: "1px solid #ccc",
        borderRadius: "12px",
        padding: "16px",
        margin: "12px",
        width: "260px",
        boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
        fontFamily: "Arial, sans-serif",
      }}
    >
      {!gameStarted ? (
        <p style={{ textAlign: "center", fontWeight: "bold" }}>
          🕹️ 시뮬레이션 시작 후 거래 가능
        </p>
      ) : (
        <>
          <div
            style={{
              backgroundColor: "#f1f1f1",
              padding: "8px",
              marginBottom: "12px",
              borderRadius: "6px",
              fontSize: "14px",
            }}
          >
            🧠 옵션 매수는 주식을 직접 사는 것이 아니라 <strong>그 권리</strong>를 사는 것입니다.
          </div>

          <h2>{asset.name}</h2>
          <p style={priceStyle}>📉 현재가: <strong>{asset.price.toLocaleString()}원</strong></p>
          <p>
            🪙 옵션 가격 (1개): <strong>{optionPrice.toLocaleString()}원</strong>
            <button
              onClick={() => setShowTooltip(!showTooltip)}
              style={{ marginLeft: "6px", fontSize: "12px", cursor: "pointer" }}
            >
              ❓ 옵션 가격이 뭔가요?
            </button>
          </p>
          {showTooltip && (
            <div
              style={{
                backgroundColor: "#fefefe",
                padding: "8px",
                border: "1px solid #ccc",
                borderRadius: "6px",
                fontSize: "12px",
                marginBottom: "8px",
              }}
            >
              옵션 가격은 자산을 미래에 살 수 있는 <strong>권리</strong>의 값입니다. 현재가보다 작을 수 있으며, 자산의 변동성과 시간에 따라 결정됩니다.
            </div>
          )}
          <p>💵 총 결제 금액: <strong>{totalCost.toLocaleString()}원</strong></p>
          <p style={volatilityStyle}>📊 변동성: {asset.volatility.toFixed(2)}</p>
          <p>📌 관련 사건: {asset.events.join(", ")}</p>
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            min="1"
            style={{ width: "60px", marginRight: "8px" }}
          />
          <button
            onClick={() => onBuyOption(asset, quantity, optionPrice, strikePrice)}
            style={{
              padding: "6px 12px",
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            옵션 매수
          </button>
        </>
      )}
    </div>
  );
}
