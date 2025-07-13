function calculateCallOptionPrice(S, K, T, r, sigma) {
  const d1 = (Math.log(S / K) + (r + (sigma ** 2) / 2) * T) / (sigma * Math.sqrt(T));
  const d2 = d1 - sigma * Math.sqrt(T);

  const N = (x) => 0.5 * (1 + erf(x / Math.sqrt(2)));

  return S * N(d1) - K * Math.exp(-r * T) * N(d2);
}

function erf(x) {
  const sign = x < 0 ? -1 : 1;
  x = Math.abs(x);
  const a1 = 0.254829592, a2 = -0.284496736;
  const a3 = 1.421413741, a4 = -1.453152027;
  const a5 = 1.061405429, p = 0.3275911;

  const t = 1 / (1 + p * x);
  const y = 1 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
  return sign * y;
}

export default calculateCallOptionPrice;
