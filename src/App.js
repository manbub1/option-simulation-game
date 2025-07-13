import React, { useState, useEffect } from "react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from "recharts";
import AssetCard from "./components/AssetCard";
import startBg from "./images/start-bg.png";

const initialAssets = [
  { name: "쩡욱이의 쩡육점", price: 50000, volatility: 0.4, events: ["경제", "심리"] },
  { name: "쩐윤현의 쏘주", price: 40000, volatility: 0.18, events: ["사회", "경영", "경제", "환경"] },
  { name: "K뿅주", price: 10000, volatility: 0.3, events: ["경제", "법적"] },
  { name: "신씨의고백주", price: 70000, volatility: 0.5, events: ["심리", "사회"] },
  { name: "비트코인", price: 200000, volatility: 0.6, events: ["심리","법적", "경제"] },
  { name: "K쩡주", price: 100000, volatility: 0.2, events: ["사회", "경제", "법적"] },
  { name: "박재형의 알바유지주", price: 120000, volatility: 0.38, events: ["경제", "심리"] },
  { name: "느근영의치킨집", price: 30000, volatility: 0.34, events: ["심리","경제", "경영", "환경", "사회"] },
];

const eventTemplates = [
  { type: "경제", message: "📈 한국 GDP 급등! 투자 기대감 상승!", priceImpact: 0.3, volatilityImpact: -0.03 },
  { type: "경제", message: "📉 글로벌 경기침체 우려 심화", priceImpact: -0.3, volatilityImpact: 0.14 },
  { type: "심리", message: "🧠 투자자 낙관 심리 확산", priceImpact: () => (Math.random() > 0.5 ? 0.2 : -0.2), volatilityImpact: -0.02 },
  { type: "심리", message: "😨 공포지수 급등, 시장 불안", priceImpact: () => (Math.random() > 0.5 ? 0.2 : -0.2), volatilityImpact: 0.12 },
  { type: "경영", message: "🏢 주요 기업 실적 호조 발표", priceImpact: 0.24, volatilityImpact: -0.09 },
  { type: "경영", message: "📉 대규모 구조조정 발표", priceImpact: -0.24, volatilityImpact: 0.18 },
  { type: "법적", message: "⚖️ 규제 완화안 통과", priceImpact: 0.27, volatilityImpact: -0.05 },
  { type: "법적", message: "🧾 반독점 소송 제기", priceImpact: -0.26, volatilityImpact: 0.11 },
  { type: "사회", message: "👥 소비심리 회복 신호", priceImpact: 0.15, volatilityImpact: -0.01},
  { type: "사회", message: "📉 고용지표 부진 발표", priceImpact: -0.15, volatilityImpact: 0.09 },
  { type: "환경", message: "🌱 탄소세 인하 결정", priceImpact: 0.16, volatilityImpact: -0.06 },
  { type: "환경", message: "🔥 자연재해 발생", priceImpact: -0.16, volatilityImpact: 0.2 },
];

export default function App() {
  const [assets, setAssets] = useState(initialAssets);
  const [previousPrices, setPreviousPrices] = useState(() =>
    Object.fromEntries(initialAssets.map(a => [a.name, a.price]))
  );
  const [capital, setCapital] = useState(1000000);
  const [holdings, setHoldings] = useState([]);
  const [screen, setScreen] = useState("start");
  const [countdown, setCountdown] = useState(3);
  const [timeLeft, setTimeLeft] = useState(180);
  const [difficulty, setDifficulty] = useState("중");
  const [priceChanges, setPriceChanges] = useState({});
  const [eventLog, setEventLog] = useState([]);
  const [flash, setFlash] = useState(false);
  const [now, setNow] = useState(new Date());

  const newsAudio = new Audio(process.env.PUBLIC_URL + "/sounds/news.m4a");

  const handleBuyOption = (asset, quantity, optionPrice, strikePrice) => {
    const totalCost = optionPrice * quantity;
    if (totalCost > capital) {
      alert("자산이 부족합니다");
      return;
    }
    const newHolding = { name: asset.name, quantity, optionPrice, totalCost, strikePrice, executed: false };
    setCapital(prev => prev - totalCost);
    setHoldings(prev => [...prev, newHolding]);
  };

  const handleExecuteOption = (holding) => {
    const currentAsset = assets.find((a) => a.name === holding.name);
    const currentPrice = currentAsset?.price || 0;
    const profitPerUnit = currentPrice - holding.strikePrice;
    const grossProfit = profitPerUnit * holding.quantity;
    const netProfit = grossProfit - holding.totalCost;
    const recommend = netProfit > 0;

    const confirm = window.confirm(
      `${holding.name}\n현재가: ${currentPrice.toLocaleString()}원\n행사가: ${holding.strikePrice.toLocaleString()}원\n` +
      `예상 수익: ${grossProfit.toLocaleString()}원\n` +
      `옵션 매수 비용: ${holding.totalCost.toLocaleString()}원\n` +
      `▶️ 최종 ${(netProfit >= 0 ? "순이익" : "순손실")}: ${Math.abs(netProfit).toLocaleString()}원\n` +
      `${recommend ? "[추천] 행사 권장" : "[주의] 행사 비추천"}\n옵션을 행사하시겠습니까?`
    );

    if (confirm) {
      setCapital((prev) => prev + netProfit + holding.totalCost);
      setHoldings((prev) =>
        prev.map((h) => h === holding ? { ...h, executed: true, profit: netProfit } : h)
      );
    }
  };

  const resetGame = () => {
    setAssets(initialAssets);
    setPreviousPrices(Object.fromEntries(initialAssets.map(a => [a.name, a.price])));
    setCapital(1000000);
    setHoldings([]);
    setScreen("start");
    setCountdown(3);
    setTimeLeft(180);
    setPriceChanges({});
    setEventLog([]);
    setFlash(false);
    setNow(new Date());
  };

useEffect(() => {
    if (screen === "countdown") {
      if (countdown > 0) {
        const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
        return () => clearTimeout(timer);
      } else {
        setScreen("game");
      }
    }
  }, [screen, countdown]);

  useEffect(() => {
    if (screen === "game") {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setScreen("result");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [screen]);

  useEffect(() => {
    if (screen !== "game") return;
    const timeInterval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timeInterval);
  }, [screen]);

  useEffect(() => {
    if (screen !== "game") return;

    const interval = setInterval(() => {
      let changes = {};
      let newPriceMap = {};

      const updatedAssets = assets.map((a) => {
        const changeRate = 1 + (Math.random() - 0.5) * 0.1;
        const newPrice = Math.max(1, Math.round(a.price * changeRate));
        const prevPrice = previousPrices[a.name] ?? a.price;

        changes[a.name] = newPrice > prevPrice ? "up" : newPrice < prevPrice ? "down" : "same";
        newPriceMap[a.name] = newPrice;

        return { ...a, price: newPrice };
      });

      setAssets(updatedAssets);
      setPreviousPrices(newPriceMap);
      setPriceChanges(changes);
    }, difficulty === "상" ? 1000 : difficulty === "중" ? 3000 : 5000);

    return () => clearInterval(interval);
  }, [screen, difficulty, assets, previousPrices]);

  useEffect(() => {
    if (screen !== "game") return;

    const intervalTime = difficulty === "상" ? 3000 : difficulty === "중" ? 5000 : 10000;

    const interval = setInterval(() => {
      const isPositive = Math.random() < 0.6;
      const candidates = eventTemplates.filter(e => {
        const impact = typeof e.priceImpact === "function" ? e.priceImpact() : e.priceImpact;
        return (impact > 0) === isPositive;
      });
      const selected = candidates[Math.floor(Math.random() * candidates.length)];
      const priceImpact = typeof selected.priceImpact === "function" ? selected.priceImpact() : selected.priceImpact;

      setAssets(prev => prev.map(asset => {
        if (!asset.events.includes(selected.type)) return asset;
        const newPrice = Math.max(1, Math.round(asset.price * (1 + priceImpact)));
        const newVolatility = Math.min(1, asset.volatility + selected.volatilityImpact);
        return { ...asset, price: newPrice, volatility: newVolatility };
      }));

      try {
        if (!newsAudio.current.paused) newsAudio.current.currentTime = 0;
        newsAudio.current.play();
      } catch (e) {
        console.warn("오디오 재생 실패:", e);
      }

      setFlash(true);
      setTimeout(() => setFlash(false), 1000);

      setEventLog(prev => [
        { time: new Date().toLocaleTimeString(), message: selected.message },
        ...prev.slice(0, 4)
      ]);
    }, intervalTime);

    return () => clearInterval(interval);
  }, [screen, difficulty]);

   if (screen === "start") {
    return (
      <div style={{
        textAlign: "center",
        paddingTop: "100px",
        backgroundImage: `url(${startBg})`,
        backgroundSize: "cover",
        height: "100vh",
        color: "white"
      }}>
        <h1>📊 옵션 투자 시뮬레이션</h1>
        <p>난이도를 선택하세요:</p>
        <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} style={{ fontSize: "16px", marginBottom: "20px" }}>
          <option value="상">상 (1초 변동)</option>
          <option value="중">중 (3초 변동)</option>
          <option value="하">하 (5초 변동)</option>
        </select>
        <br />
        <button onClick={() => setScreen("countdown")} style={{ fontSize: "20px", padding: "10px 20px", cursor: "pointer" }}>
          시뮬레이션 시작
        </button>
      </div>
    );
  }

  if (screen === "countdown") {
    return (
      <div style={{ textAlign: "center", fontSize: "100px", marginTop: "200px" }}>
        {countdown}
      </div>
    );
  }

  if (screen === "result") {
  const totalInvested = holdings.reduce((sum, h) => sum + h.totalCost, 0);
  const totalProfit = holdings.filter(h => h.executed).reduce((sum, h) => sum + h.profit, 0);
  const roi = totalInvested > 0 ? ((totalProfit / totalInvested) * 100).toFixed(2) : 0;

  const executedCount = holdings.filter(h => h.executed).length;
  const unexecutedCount = holdings.length - executedCount;
  const profitOptions = holdings.filter(h => h.executed && h.profit > 0).length;
  const lossOptions = holdings.filter(h => h.executed && h.profit < 0).length;

  const maxProfit = holdings.filter(h => h.executed).reduce((max, h) => h.profit > (max?.profit || -Infinity) ? h : max, null);
  const maxLoss = holdings.filter(h => h.executed).reduce((min, h) => h.profit < (min?.profit || Infinity) ? h : min, null);

  const pieData = [
    { name: "행사", value: executedCount },
    { name: "미행사", value: unexecutedCount }
  ];

  const barData = [
    { name: "수익 옵션", 개수: profitOptions },
    { name: "손실 옵션", 개수: lossOptions }
  ];

  const COLORS = ["#00C49F", "#FF8042"];

  // 🧠 AI 가상 실행
  const aiHoldings = holdings.map(h => {
    const currentAsset = assets.find(a => a.name === h.name);
    const currentPrice = currentAsset?.price || 0;
    const profitPerUnit = currentPrice - h.strikePrice;
    const grossProfit = profitPerUnit * h.quantity;
    const netProfit = grossProfit - h.totalCost;
    const aiExecuted = currentPrice > h.strikePrice; // AI는 수익이면 무조건 행사
    return { ...h, aiExecuted, aiProfit: aiExecuted ? netProfit : 0 };
  });

  const aiProfit = aiHoldings.filter(h => h.aiExecuted).reduce((sum, h) => sum + h.aiProfit, 0);
  const aiROI = totalInvested > 0 ? ((aiProfit / totalInvested) * 100).toFixed(2) : 0;
  const aiExecutedCount = aiHoldings.filter(h => h.aiExecuted).length;

  return (
    <div style={{ padding: "40px", display: "flex", justifyContent: "space-between" }}>
      {/* 🧑 플레이어 결과 */}
      <div>
        <h2>⏱️ 시뮬레이션 종료</h2>
        <p>최종 자산: {capital.toLocaleString()}원</p>
        <p>총 옵션 매수 금액: {totalInvested.toLocaleString()}원</p>
        <p>총 순이익: {totalProfit >= 0 ? "+" : "-"}{Math.abs(totalProfit).toLocaleString()}원</p>
        <p>ROI (수익률): {roi}%</p>

        <PieChart width={300} height={200}>
          <Pie data={pieData} cx="50%" cy="50%" outerRadius={60} fill="#8884d8" dataKey="value">
            {pieData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>

        <BarChart width={300} height={200} data={barData}>
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="개수" fill="#82ca9d" />
        </BarChart>

        <h4>최대 수익 옵션</h4>
        {maxProfit ? `${maxProfit.name} (${maxProfit.profit.toLocaleString()}원)` : "없음"}

        <h4>최대 손실 옵션</h4>
        {maxLoss ? `${maxLoss.name} (${maxLoss.profit.toLocaleString()}원)` : "없음"}

        <button onClick={resetGame} style={{ marginTop: "20px", padding: "10px 20px", fontSize: "16px" }}>
          다시 시작하기
        </button>
      </div>

      {/* 🤖 AI 결과 */}
      <div style={{ paddingLeft: "40px", borderLeft: "2px solid #ccc" }}>
        <h3>🤖 AI 가상 플레이어 비교</h3>
        <p>AI 행사 횟수: {aiExecutedCount}회</p>
        <p>AI 수익: {aiProfit >= 0 ? "+" : "-"}{Math.abs(aiProfit).toLocaleString()}원</p>
        <p>AI ROI (수익률): {aiROI}%</p>

        <p style={{ marginTop: "20px", fontWeight: "bold" }}>
          {parseFloat(roi) > parseFloat(aiROI) ? "🎉 플레이어 승리!" : parseFloat(roi) < parseFloat(aiROI) ? "🤖 AI 승리!" : "🤝 무승부!"}
        </p>
      </div>
    </div>
  );
}

  return (
    <div style={{ padding: "20px", backgroundColor: "#f9f9f9" }}>
      <h2>💰 현재 자산: {capital.toLocaleString()}원</h2>
      <h3>⏳ 남은 시간: {timeLeft}초</h3>
      <p style={{ color: "#555", marginBottom: "10px" }}>🕒 현재 시각: {now.toLocaleTimeString()}</p>

      <div style={{ display: "flex", flexWrap: "wrap" }}>
        {assets.map((a, i) => (
          <AssetCard
            key={i}
            asset={a}
            onBuyOption={handleBuyOption}
            priceChange={priceChanges[a.name] || "same"}
            gameStarted={screen === "game"}
            difficulty={difficulty}
          />
        ))}
      </div>

      <div style={{ marginTop: "40px" }}>
        <h3>📦 보유 중인 옵션</h3>
        <ul>
          {holdings.map((h, i) => {
            const currentAsset = assets.find((a) => a.name === h.name);
            const currentPrice = currentAsset?.price || 0;
            const trendColor =
              currentPrice > h.strikePrice
                ? "red"
                : currentPrice < h.strikePrice
                ? "blue"
                : "black";
            return (
              <li key={i}>
                <span style={{ color: h.profit > 0 ? "green" : h.profit < 0 ? "red" : "black" }}>
                  {h.name} - {h.quantity}개 - {h.totalCost.toLocaleString()}원 매수
                </span>
                {!h.executed ? (
                  <button onClick={() => handleExecuteOption(h)} style={{ marginLeft: "10px" }}>
                    옵션 실행
                  </button>
                ) : (
                  <span style={{ marginLeft: "10px" }}>
                    ✅ 실행됨 ({h.profit >= 0 ? "+" : "-"}{Math.abs(h.profit).toLocaleString()}원)
                  </span>
                )}
                <span style={{ marginLeft: "10px", fontStyle: "italic", color: trendColor }}>
                  현재가: {currentPrice.toLocaleString()}원
                </span>
              </li>
            );
          })}
        </ul>
      </div>

      {screen === "game" && (
        <div style={{
          position: "fixed",
          top: "20px",
          right: "20px",
          width: "320px",
          backgroundColor: flash ? "#fff8c6" : "#ffffff",
          border: "2px solid #444",
          borderRadius: "10px",
          padding: "12px",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
          fontSize: "13px",
          transition: "background-color 0.3s ease"
        }}>
          <strong>📰 뉴스 피드</strong>
          <ul style={{ margin: 0, padding: "5px", listStyleType: "square" }}>
            {eventLog.map((log, i) => (
              <li key={i}>[{log.time}] {log.message}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
