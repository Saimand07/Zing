"use client";

import React, { useEffect, useRef, useState } from "react";
import { createChart, ColorType, IChartApi, ISeriesApi, CandlestickSeries } from "lightweight-charts";

export function TradingChart({ symbol }: { symbol: string }) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Create Chart
    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: "#A1A1AA",
      },
      grid: {
        vertLines: { color: "rgba(39, 39, 42, 0.5)" },
        horzLines: { color: "rgba(39, 39, 42, 0.5)" },
      },
      width: chartContainerRef.current.clientWidth,
      height: 400,
      autoSize: true,
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
      },
      crosshair: {
        mode: 0,
      }
    });

    const candlestickSeries = chart.addSeries(CandlestickSeries, {
      upColor: "#10B981",
      downColor: "#EF4444",
      borderVisible: false,
      wickUpColor: "#10B981",
      wickDownColor: "#EF4444"
    });

    chartRef.current = chart;
    seriesRef.current = candlestickSeries;

    return () => {
      chart.remove();
    };
  }, []);

  useEffect(() => {
    if (!seriesRef.current) return;
    
    setLoading(true);
    
    // In a production app, we would fetch historical OHLCV data from Stellar Expert or Horizon Trade Aggregations.
    // For this demonstration, we'll fetch real market data from Binance API as a proxy for the chart visuals, 
    // since testnet DEX volume is often zero.
    const fetchMarketData = async () => {
      try {
        // Attempt to fetch the real asset against USDT
        let binanceSymbol = `${symbol.toUpperCase()}USDT`;
        if (symbol.toUpperCase() === "USDC") binanceSymbol = "USDCUSDT";
        
        let res = await fetch(`https://api.binance.com/api/v3/klines?symbol=${binanceSymbol}&interval=1h&limit=100`);
        
        // If Binance doesn't support this specific coin pair (returns 400), fallback to XLM so chart doesn't break
        if (!res.ok) {
          binanceSymbol = "XLMUSDT";
          res = await fetch(`https://api.binance.com/api/v3/klines?symbol=${binanceSymbol}&interval=1h&limit=100`);
        }
        const data = await res.json();
        
        const chartData = data.map((d: any) => ({
          time: d[0] / 1000,
          open: parseFloat(d[1]),
          high: parseFloat(d[2]),
          low: parseFloat(d[3]),
          close: parseFloat(d[4])
        }));
        
        seriesRef.current?.setData(chartData);
      } catch (err) {
        console.error("Failed to load chart data", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMarketData();
  }, [symbol]);

  return (
    <div style={{ position: "relative", width: "100%", height: "400px" }}>
      {loading && (
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(17, 17, 19, 0.8)", zIndex: 10 }}>
          <span style={{ color: "#F4F4F5", fontSize: "14px", fontWeight: 600 }}>Loading Chart Data...</span>
        </div>
      )}
      <div ref={chartContainerRef} style={{ width: "100%", height: "100%" }} />
    </div>
  );
}
