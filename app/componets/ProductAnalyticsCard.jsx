import React from "react";
const ProductAnalyticsCard = ({ productName, scheduleEmailCount, dispatchEmailCount, orderSource }) => {
    const htmlTemplate=`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Product Analytics Card</title>
  <link rel="stylesheet" href="https://unpkg.com/@shopify/polaris-icons@6.0.0/dist/styles.css">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif;
      background: #f9fafb;
      margin: 20px;
    }

    .analytics-card {
      max-width: 420px;
      margin: auto;
      background: #fff;
      border: 1px solid #dcdfe3;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.05);
      padding: 24px 20px;
    }

    .card-header {
      margin-bottom: 18px;
    }

    .product-name {
      font-size: 18px;
      font-weight: 600;
      margin-bottom: 4px;
      color: #212b36;
    }

    .subtitle {
      font-size: 13px;
      color: #6b7177;
    }

    .metric {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-top: 1px solid #f0f1f2;
      padding: 12px 0;
    }

    .metric-left {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .metric-icon {
      width: 20px;
      height: 20px;
      color: #3c4e61;
    }

    .metric-label {
      font-size: 15px;
      color: #333;
    }

    .metric-value {
      font-weight: 600;
      font-size: 15px;
      color: #111;
    }
  </style>
</head>
<body>
  <div class="analytics-card">
    <div class="card-header">
      <div class="product-name">${productName}</div>
      <div class="subtitle">Performance via ReOrder Reminder Pro</div>
    </div>

    <div class="metric">
      <div class="metric-left">
        <span class="polaris-icon metric-icon">
          <svg viewBox="0 0 20 20" class="Polaris-Icon__Svg" focusable="false" aria-hidden="true">
            <path fill="currentColor" d="M3 4a1 1 0 0 1 1-1h3v2H5v10h2v2H4a1 1 0 0 1-1-1V4Zm14 12a1 1 0 0 1-1 1h-3v-2h2V5h-2V3h3a1 1 0 0 1 1 1v12Z"/>
          </svg>
        </span>
        <span class="metric-label">Emails Scheduled</span>
      </div>
      <span class="metric-value">${scheduleEmailCount}</span>
    </div>

    <div class="metric">
      <div class="metric-left">
        <span class="polaris-icon metric-icon">
          <svg viewBox="0 0 20 20" class="Polaris-Icon__Svg" focusable="false" aria-hidden="true">
            <path fill="currentColor" d="M10 3a7 7 0 1 1 0 14 7 7 0 0 1 0-14Zm0 2a1 1 0 0 0-1 1v3.586l2.707 2.707 1.414-1.414L11 8.586V6a1 1 0 0 0-1-1Z"/>
          </svg>
        </span>
        <span class="metric-label">Emails Sent</span>
      </div>
      <span class="metric-value">${dispatchEmailCount}</span>
    </div>

    <div class="metric">
      <div class="metric-left">
        <span class="polaris-icon metric-icon">
          <svg viewBox="0 0 20 20" class="Polaris-Icon__Svg" focusable="false" aria-hidden="true">
            <path fill="currentColor" d="M4 5h12v2H4V5Zm0 4h8v2H4V9Zm0 4h6v2H4v-2Zm12.5-3.5c.276 0 .5.224.5.5v5a.5.5 0 0 1-.5.5H14v1l-2-1h-2a.5.5 0 0 1-.5-.5V10a.5.5 0 0 1 .5-.5h6Z"/>
          </svg>
        </span>
        <span class="metric-label">Orders via App</span>
      </div>
      <span class="metric-value">${orderSource}</span>
    </div>
  </div>
</body>
</html>
`
  return htmlTemplate;
};

export default ProductAnalyticsCard;