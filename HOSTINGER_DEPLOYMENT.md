# SASA Official - Hostinger Deployment & Environment Variables Guide

This guide walks you through deploying the **SASA Official** full-stack luxury pret application on **Hostinger** (Hostinger Node.js Application Manager, Hostinger VPS, or Hostinger Cloud Hosting) and setting up automated email notifications to your official email.

---

## 1. Environment Variables Configuration

In your Hostinger control panel (hPanel > Node.js Application > Environment Variables) or in your `.env` file in the root of the project, add the following environment variables:

```env
# ==============================================================================
# SERVER PORT
# ==============================================================================
PORT=3000

# ==============================================================================
# OFFICIAL STORE EMAIL (WHERE ORDERS ARE DELIVERED)
# ==============================================================================
OFFICIAL_EMAIL=info@sasaofficial.com

# ==============================================================================
# HOSTINGER SMTP EMAIL CONFIGURATION
# ==============================================================================
# Hostinger SMTP Host
SMTP_HOST=smtp.hostinger.com

# SMTP Port: 465 (SSL) or 587 (TLS)
SMTP_PORT=465

# SMTP Security: true for port 465, false for 587
SMTP_SECURE=true

# Your Hostinger Webmail or Titan Email address
SMTP_USER=info@sasaofficial.com

# Password for your Hostinger email account
SMTP_PASS=your_hostinger_email_password
```

---

## 2. Hostinger hPanel Node.js Application Setup

1. **Log in to Hostinger hPanel** and navigate to **Websites** > **Node.js** (or VPS / Cloud Server).
2. Click **Create Application**:
   - **Node.js Version**: `20.x` or `22.x` (or `18.x`+).
   - **Application Root**: `/public_html` (or your subdomain directory).
   - **Application Startup File**: `server.js`
   - **Environment**: `Production`
3. Under **Environment Variables**, click **Add Variable** and input the variables listed above.
4. Upload your project files or connect via Git.
5. In the terminal or Hostinger NPM scripts manager, run:
   ```bash
   npm install
   npm run build
   npm start
   ```

---

## 3. How Order Emails Work

1. When a customer places an order on your storefront (COD or Card):
   - The backend automatically extracts the **customer's email, name, phone, address, and purchased items** from the order received checkout form.
   - An alert is sent immediately to **`OFFICIAL_EMAIL`** (`info@sasaofficial.com`) containing:
     - **Customer's Form Email** configured as the `Reply-To` (allowing you to click "Reply" in your email client to talk directly to the customer).
     - **Order ID & Tracking Code**
     - **Customer Name, Phone Number, & Email**
     - **Complete Shipping Address & City**
     - **Purchased Luxury Lawn Suits / Pret items** (with size, color, quantity, unit price)
     - **Subtotal, Discount Code, Shipping Fee, and Grand Total**
     - **Payment Method Selected (COD / Card)**
     - **Customer Special Instructions**
     - **One-click Email Customer Button** (`mailto:...`)
     - **One-click Direct WhatsApp Button** to message the customer
   - A luxury confirmation invoice is also dispatched to the customer's email address.

---

## 4. Testing Your Email in the Admin Panel

1. Log into your SASA Admin Panel (`/admin` or via the top header switcher).
2. Go to **Store Settings**.
3. Under **Official Email & Hostinger Order Notifications**, enter your Hostinger credentials or click **Send Test Email**.
4. You will receive an instant test email confirming that Hostinger SMTP is active and ready to process live customer orders.
