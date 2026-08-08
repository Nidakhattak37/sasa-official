import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

import { createServer as createViteServer } from 'vite';

// Load environment variables from .env file if present
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const distPath = path.join(__dirname, 'dist');

// Body parser for JSON payloads
app.use(express.json());

// In-memory store for recent email logs (useful for admin verification)
const recentEmailLogs = [];

// Helper to create Nodemailer transporter from Hostinger / SMTP environment variables
function createEmailTransporter() {
  const host = process.env.SMTP_HOST || 'smtp.hostinger.com';
  const port = parseInt(process.env.SMTP_PORT || '465', 10);
  const secure = process.env.SMTP_SECURE === 'true' || port === 465;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass
    },
    // Useful for some shared hosting environments with custom certificates
    tls: {
      rejectUnauthorized: false
    }
  });
}

// Get the official email destination
function getOfficialEmail() {
  return process.env.OFFICIAL_EMAIL || 
         process.env.STORE_OFFICIAL_EMAIL || 
         'info@sasaofficial.com';
}

// Helper to generate Luxury HTML Email for Official Store Owner
function generateStoreOwnerEmailHtml(order) {
  const itemsHtml = (order.items || []).map(item => `
    <tr style="border-bottom: 1px solid #EAE4DC;">
      <td style="padding: 12px 8px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 13px; color: #222;">
        <strong>${item.productName || 'Lawn Suit'}</strong><br/>
        <span style="font-size: 11px; color: #777;">Size: ${item.selectedSize || 'Standard'} | Color: ${item.selectedColor || 'As Shown'}</span>
      </td>
      <td style="padding: 12px 8px; text-align: center; font-size: 13px; color: #444;">${item.quantity}</td>
      <td style="padding: 12px 8px; text-align: right; font-size: 13px; color: #222; font-weight: bold;">
        PKR ${(item.price * item.quantity).toLocaleString()}
      </td>
    </tr>
  `).join('');

  const shippingAddr = order.shippingAddress || {};
  const customerName = order.customerName || shippingAddr.fullName || 'Valued Customer';
  const customerPhone = order.phone || shippingAddr.phone || 'N/A';
  const customerEmail = order.email || shippingAddr.email || 'N/A';
  const fullAddress = `${shippingAddr.street || ''}, ${shippingAddr.city || ''}, ${shippingAddr.state || ''} ${shippingAddr.postalCode || ''}, ${shippingAddr.country || 'Pakistan'}`;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>New Order Alert - #${order.id}</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #F8F6F2; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #F8F6F2; padding: 30px 10px;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #FFFFFF; border-radius: 12px; overflow: hidden; border: 1px solid #EAE4DC; box-shadow: 0 4px 16px rgba(0,0,0,0.06);">
              
              <!-- Header -->
              <tr>
                <td style="background-color: #1E1E24; padding: 25px 30px; text-align: center; border-bottom: 2px solid #D4AF37;">
                  <h1 style="color: #FFFFFF; font-family: 'Georgia', serif; font-size: 26px; margin: 0; letter-spacing: 4px; text-transform: uppercase;">
                    SASA
                  </h1>
                  <p style="color: #D4AF37; font-size: 10px; margin: 4px 0 0 0; letter-spacing: 3px; text-transform: uppercase; font-weight: bold;">
                    Official Store Order Dispatch Engine
                  </p>
                </td>
              </tr>

              <!-- Alert Banner -->
              <tr>
                <td style="background-color: #FAF8F5; padding: 18px 30px; border-bottom: 1px solid #EAE4DC;">
                  <table width="100%">
                    <tr>
                      <td>
                        <span style="display: inline-block; background-color: #10B981; color: #FFFFFF; font-size: 10px; font-weight: bold; padding: 4px 10px; border-radius: 20px; text-transform: uppercase; letter-spacing: 1px;">
                          ✨ NEW ORDER RECEIVED FROM STORE
                        </span>
                        <h2 style="font-size: 20px; color: #1E1E24; margin: 8px 0 2px 0;">Order #${order.id}</h2>
                        <p style="font-size: 12px; color: #777; margin: 0;">Placed on: ${order.createdAt || new Date().toLocaleString()}</p>
                      </td>
                      <td align="right">
                        <span style="font-size: 11px; color: #777; display: block;">Order Total</span>
                        <span style="font-size: 22px; font-weight: bold; color: #9E8055;">PKR ${(order.total || 0).toLocaleString()}</span>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Customer Form Details Box -->
              <tr>
                <td style="padding: 25px 30px;">
                  
                  <div style="background-color: #FAF8F5; border: 1px solid #D5CDBC; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
                    <span style="font-size: 11px; font-weight: bold; color: #9E8055; text-transform: uppercase; letter-spacing: 1px; display: block; margin-bottom: 8px;">
                      👤 Customer Contact & Form Details
                    </span>
                    <table width="100%" style="font-size: 13px; color: #333;">
                      <tr>
                        <td width="35%" style="padding: 5px 0; color: #666;"><strong>Customer Name:</strong></td>
                        <td style="padding: 5px 0; font-weight: bold; color: #1E1E24;">${customerName}</td>
                      </tr>
                      <tr>
                        <td style="padding: 5px 0; color: #666;"><strong>Customer Email (From Form):</strong></td>
                        <td style="padding: 5px 0;">
                          <a href="mailto:${customerEmail}?subject=Regarding Your SASA Order %23${order.id}" style="color: #9E8055; text-decoration: none; font-weight: bold;">
                            ✉️ ${customerEmail} (Click to Reply)
                          </a>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 5px 0; color: #666;"><strong>Customer Phone:</strong></td>
                        <td style="padding: 5px 0;">
                          <a href="tel:${customerPhone}" style="color: #9E8055; text-decoration: none; font-weight: bold;">
                            📞 ${customerPhone}
                          </a>
                        </td>
                      </tr>
                    </table>
                  </div>

                  <h3 style="font-size: 14px; text-transform: uppercase; letter-spacing: 1px; color: #1E1E24; border-bottom: 1px solid #EAE4DC; padding-bottom: 8px; margin-top: 0;">
                    Shipping & Delivery Information
                  </h3>
                  <table width="100%" style="font-size: 13px; color: #333; margin-bottom: 20px;">
                    <tr>
                      <td width="35%" style="padding: 6px 0; color: #777;"><strong>Delivery Address:</strong></td>
                      <td style="padding: 6px 0; line-height: 1.4;">${fullAddress}</td>
                    </tr>
                    <tr>
                      <td style="padding: 6px 0; color: #777;"><strong>City / Destination:</strong></td>
                      <td style="padding: 6px 0; font-weight: bold; color: #1E1E24;">${shippingAddr.city || 'Pakistan'}</td>
                    </tr>
                    <tr>
                      <td style="padding: 6px 0; color: #777;"><strong>Payment Selected:</strong></td>
                      <td style="padding: 6px 0;">
                        <span style="background-color: #FAF0E6; color: #8B5E34; padding: 3px 8px; border-radius: 4px; font-weight: bold; font-size: 11px;">
                          ${order.paymentMethod || 'Cash on Delivery (COD)'}
                        </span>
                      </td>
                    </tr>
                    ${order.customerNotes ? `
                    <tr>
                      <td style="padding: 6px 0; color: #777;"><strong>Special Instructions:</strong></td>
                      <td style="padding: 6px 0; font-style: italic; color: #555;">"${order.customerNotes}"</td>
                    </tr>
                    ` : ''}
                  </table>

                  <!-- Order Items Table -->
                  <h3 style="font-size: 14px; text-transform: uppercase; letter-spacing: 1px; color: #1E1E24; border-bottom: 1px solid #EAE4DC; padding-bottom: 8px; margin-top: 25px;">
                    Purchased Luxury Items
                  </h3>
                  <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 10px; border-collapse: collapse;">
                    <thead>
                      <tr style="background-color: #FAF8F5; text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #666;">
                        <th style="padding: 10px 8px;">Product</th>
                        <th style="padding: 10px 8px; text-align: center;">Qty</th>
                        <th style="padding: 10px 8px; text-align: right;">Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${itemsHtml}
                    </tbody>
                  </table>

                  <!-- Totals Summary -->
                  <table width="100%" style="margin-top: 20px; font-size: 13px; color: #444;">
                    <tr>
                      <td align="right" style="padding: 4px 0;">Subtotal:</td>
                      <td width="120" align="right" style="padding: 4px 0; font-weight: bold;">PKR ${(order.subtotal || 0).toLocaleString()}</td>
                    </tr>
                    ${order.discount ? `
                    <tr>
                      <td align="right" style="padding: 4px 0; color: #10B981;">Discount (${order.couponCode || 'Coupon'}):</td>
                      <td align="right" style="padding: 4px 0; font-weight: bold; color: #10B981;">-PKR ${(order.discount).toLocaleString()}</td>
                    </tr>
                    ` : ''}
                    <tr>
                      <td align="right" style="padding: 4px 0;">Shipping Fee:</td>
                      <td align="right" style="padding: 4px 0; font-weight: bold;">${order.shippingFee === 0 ? 'FREE' : `PKR ${(order.shippingFee || 0).toLocaleString()}`}</td>
                    </tr>
                    <tr style="border-top: 2px solid #EAE4DC;">
                      <td align="right" style="padding: 10px 0; font-size: 16px; font-weight: bold; color: #1E1E24;">Grand Total:</td>
                      <td align="right" style="padding: 10px 0; font-size: 18px; font-weight: bold; color: #9E8055;">PKR ${(order.total || 0).toLocaleString()}</td>
                    </tr>
                  </table>

                  <!-- Quick Action Buttons for Store Admin -->
                  <div style="margin-top: 25px; text-align: center; padding: 15px; background-color: #FAF8F5; border-radius: 8px; border: 1px solid #EAE4DC;">
                    <p style="font-size: 12px; color: #666; margin: 0 0 10px 0;">Quick Actions to Connect with Customer:</p>
                    <div style="display: inline-flex; gap: 10px; flex-wrap: wrap; justify-content: center;">
                      <a href="mailto:${customerEmail}?subject=SASA Order %23${order.id} Confirmation" target="_blank" style="display: inline-block; background-color: #1E1E24; color: #FFFFFF; text-decoration: none; font-size: 12px; font-weight: bold; padding: 10px 18px; border-radius: 6px; text-transform: uppercase; letter-spacing: 0.5px;">
                        ✉️ Email Customer Directly
                      </a>
                      <a href="https://wa.me/${(customerPhone || '').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hello ${customerName}, thank you for placing order #${order.id} at SASA Official! We are processing your delivery.`)}" target="_blank" style="display: inline-block; background-color: #25D366; color: #FFFFFF; text-decoration: none; font-size: 12px; font-weight: bold; padding: 10px 18px; border-radius: 6px; text-transform: uppercase; letter-spacing: 0.5px;">
                        💬 WhatsApp Customer
                      </a>
                    </div>
                  </div>

                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="background-color: #1E1E24; padding: 20px 30px; text-align: center; font-size: 11px; color: #A0A0A0; border-top: 1px solid #333;">
                  <p style="margin: 0;">SASA Official Luxury Pret & Haute Couture</p>
                  <p style="margin: 4px 0 0 0; color: #777;">This email was automatically generated from customer order #${order.id}.</p>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}

// Helper to generate Customer Confirmation Email
function generateCustomerEmailHtml(order) {
  const shippingAddr = order.shippingAddress || {};
  const customerName = order.customerName || shippingAddr.fullName || 'Valued Patron';

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Order Confirmation - SASA Official</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #F8F6F2; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #F8F6F2; padding: 30px 10px;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #FFFFFF; border-radius: 12px; overflow: hidden; border: 1px solid #EAE4DC; box-shadow: 0 4px 16px rgba(0,0,0,0.06);">
              <tr>
                <td style="background-color: #1E1E24; padding: 25px 30px; text-align: center; border-bottom: 2px solid #D4AF37;">
                  <h1 style="color: #FFFFFF; font-family: 'Georgia', serif; font-size: 26px; margin: 0; letter-spacing: 4px; text-transform: uppercase;">
                    SASA
                  </h1>
                  <p style="color: #D4AF37; font-size: 10px; margin: 4px 0 0 0; letter-spacing: 3px; text-transform: uppercase; font-weight: bold;">
                    Luxury Pret & Haute Couture
                  </p>
                </td>
              </tr>
              <tr>
                <td style="padding: 30px;">
                  <h2 style="font-size: 20px; color: #1E1E24; margin-top: 0;">Thank you for your order, ${customerName}!</h2>
                  <p style="font-size: 14px; color: #555; line-height: 1.6;">
                    We are delighted to confirm that your order <strong>#${order.id}</strong> has been received and is now in our artisan atelier queue.
                  </p>
                  <div style="background-color: #FAF8F5; border: 1px solid #EAE4DC; border-radius: 8px; padding: 15px; margin: 20px 0; font-size: 13px;">
                    <p style="margin: 0 0 5px 0;"><strong>Tracking Code:</strong> <span style="color: #9E8055; font-weight: bold;">${order.trackingCode || order.id}</span></p>
                    <p style="margin: 0 0 5px 0;"><strong>Payment Method:</strong> ${order.paymentMethod || 'Cash on Delivery'}</p>
                    <p style="margin: 0;"><strong>Total Amount:</strong> PKR ${(order.total || 0).toLocaleString()}</p>
                  </div>
                  <p style="font-size: 13px; color: #666; line-height: 1.5;">
                    Our courier will contact you prior to delivery. If you have any inquiries, reply to this email or reach us on WhatsApp at <strong>+92 300 1234567</strong>.
                  </p>
                </td>
              </tr>
              <tr>
                <td style="background-color: #1E1E24; padding: 20px 30px; text-align: center; font-size: 11px; color: #A0A0A0;">
                  <p style="margin: 0;">SASA Official • Lahore Flagship • Nationwide Dispatch</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}

// ----------------------
// API ROUTES
// ----------------------

// 1. Health Check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    smtpConfigured: Boolean(process.env.SMTP_USER && process.env.SMTP_PASS),
    officialEmail: getOfficialEmail()
  });
});

// 2. Send Order Email (Store Owner + Customer)
app.post('/api/send-order-email', async (req, res) => {
  const { order, officialEmail: customOfficialEmail } = req.body || {};

  if (!order || !order.id) {
    return res.status(400).json({ error: 'Invalid order payload' });
  }

  const targetOfficialEmail = customOfficialEmail || getOfficialEmail();
  const customerEmail = order.email || (order.shippingAddress && order.shippingAddress.email);
  const fromEmail = process.env.SMTP_USER || 'info@sasaofficial.com';

  const logEntry = {
    id: `email-log-${Date.now()}`,
    orderId: order.id,
    customerName: order.customerName,
    total: order.total,
    officialEmail: targetOfficialEmail,
    customerEmail: customerEmail || 'N/A',
    timestamp: new Date().toISOString(),
    status: 'pending',
    mode: 'unknown'
  };

  const transporter = createEmailTransporter();

  if (transporter) {
    try {
      // 1. Send alert to official company email with customer's reply-to from order received form
      const customerDisplayName = order.customerName || (order.shippingAddress && order.shippingAddress.fullName) || 'Customer';
      const storeOwnerMailOptions = {
        from: `"${customerDisplayName} (SASA Store Order)" <${fromEmail}>`,
        replyTo: customerEmail ? `"${customerDisplayName}" <${customerEmail}>` : undefined,
        to: targetOfficialEmail,
        subject: `✨ [NEW ORDER #${order.id}] from ${customerDisplayName} <${customerEmail || 'No Email'}> (PKR ${(order.total || 0).toLocaleString()})`,
        html: generateStoreOwnerEmailHtml(order)
      };

      const ownerInfo = await transporter.sendMail(storeOwnerMailOptions);

      // 2. Send confirmation to customer if email is provided
      let customerMailSent = false;
      if (customerEmail && customerEmail.includes('@')) {
        try {
          const customerMailOptions = {
            from: `"SASA Official" <${fromEmail}>`,
            replyTo: targetOfficialEmail,
            to: customerEmail,
            subject: `Order Confirmation #${order.id} - SASA Official`,
            html: generateCustomerEmailHtml(order)
          };
          await transporter.sendMail(customerMailOptions);
          customerMailSent = true;
        } catch (custErr) {
          console.warn('Customer confirmation email error:', custErr.message);
        }
      }

      logEntry.status = 'sent_smtp';
      logEntry.mode = 'Hostinger SMTP';
      logEntry.messageId = ownerInfo.messageId;
      recentEmailLogs.unshift(logEntry);
      if (recentEmailLogs.length > 50) recentEmailLogs.pop();

      console.log(`[SMTP SUCCESS] Order email sent to official email: ${targetOfficialEmail}`);
      return res.json({
        success: true,
        mode: 'smtp',
        message: `Order notification email successfully sent to ${targetOfficialEmail}`,
        messageId: ownerInfo.messageId,
        customerMailSent
      });

    } catch (err) {
      console.error('[SMTP ERROR] Failed to send email via SMTP:', err);
      logEntry.status = 'failed_smtp';
      logEntry.error = err.message;
      recentEmailLogs.unshift(logEntry);

      return res.status(500).json({
        success: false,
        mode: 'smtp_error',
        error: `SMTP dispatch failed: ${err.message}. Please check Hostinger SMTP settings in .env`,
        simulatedFallback: true
      });
    }
  } else {
    // Simulated mode (when SMTP env vars are not yet populated on dev or preview)
    logEntry.status = 'simulated_ready_for_hostinger';
    logEntry.mode = 'Simulated (SMTP Credentials Pending in .env)';
    recentEmailLogs.unshift(logEntry);
    if (recentEmailLogs.length > 50) recentEmailLogs.pop();

    console.log(`[SIMULATED DISPATCH] Order #${order.id} received. Ready to email ${targetOfficialEmail}.`);
    console.log(`[HOSTINGER SMTP INFO] To send live emails, set SMTP_HOST=smtp.hostinger.com, SMTP_USER, SMTP_PASS in your Hostinger environment variables.`);

    return res.json({
      success: true,
      mode: 'simulated',
      message: `Order email logged for ${targetOfficialEmail}. Add Hostinger SMTP credentials in .env to dispatch live emails.`,
      targetOfficialEmail,
      orderSummary: {
        id: order.id,
        customer: order.customerName,
        total: order.total
      }
    });
  }
});

// 3. Test Email Endpoint for Admin Settings & Verification
app.post('/api/test-email', async (req, res) => {
  const { recipientEmail, host, port, user, pass, secure } = req.body || {};
  const targetEmail = recipientEmail || getOfficialEmail();

  // If custom credentials are provided from the test form, try those, else use environment variables
  let testTransporter;
  if (user && pass) {
    testTransporter = nodemailer.createTransport({
      host: host || process.env.SMTP_HOST || 'smtp.hostinger.com',
      port: parseInt(port || process.env.SMTP_PORT || '465', 10),
      secure: secure !== undefined ? secure : (parseInt(port || '465', 10) === 465),
      auth: { user, pass },
      tls: { rejectUnauthorized: false }
    });
  } else {
    testTransporter = createEmailTransporter();
  }

  if (!testTransporter) {
    return res.status(400).json({
      success: false,
      message: 'SMTP credentials not configured. Please supply SMTP_USER and SMTP_PASS or configure Hostinger email settings.'
    });
  }

  try {
    const fromEmail = user || process.env.SMTP_USER || 'info@sasaofficial.com';

    const testInfo = await testTransporter.sendMail({
      from: `"SASA Official" <${fromEmail}>`,
      replyTo: targetEmail,
      to: targetEmail,
      subject: '✨ SASA Official - Hostinger SMTP Test Email',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 25px; background: #F8F6F2; border-radius: 8px;">
          <h2 style="color: #1E1E24; margin-top: 0;">SASA Official SMTP Test Succeeded!</h2>
          <p style="color: #444; font-size: 14px;">Your Hostinger email configuration is working properly.</p>
          <div style="background: #FFF; padding: 15px; border-radius: 6px; border: 1px solid #EAE4DC; font-size: 12px; color: #666;">
            <p><strong>Timestamp:</strong> ${new Date().toLocaleString()}</p>
            <p><strong>Recipient:</strong> ${targetEmail}</p>
            <p><strong>Status:</strong> Ready to receive instant customer order notifications.</p>
          </div>
        </div>
      `
    });

    return res.json({
      success: true,
      message: `Test email successfully delivered to ${targetEmail}`,
      messageId: testInfo.messageId
    });
  } catch (error) {
    console.error('[SMTP TEST FAILED]', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to send test email. Check your SMTP host, port, and credentials.'
    });
  }
});

// 4. Retrieve Email Configuration & Logs for Admin Panel
app.get('/api/email-status', (req, res) => {
  res.json({
    officialEmail: getOfficialEmail(),
    smtpConfigured: Boolean(process.env.SMTP_USER && process.env.SMTP_PASS),
    smtpHost: process.env.SMTP_HOST || 'smtp.hostinger.com',
    smtpPort: process.env.SMTP_PORT || '465',
    smtpUser: process.env.SMTP_USER ? `${process.env.SMTP_USER.slice(0, 3)}***` : 'Not Set',
    recentLogs: recentEmailLogs.slice(0, 15)
  });
});

// ----------------------
// ASSET SERVING & VITE INTEGRATION
// ----------------------
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    try {
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: 'spa',
      });
      app.use(vite.middlewares);
    } catch (err) {
      console.warn('Vite dev middleware initialization notice:', err);
      app.use(express.static(distPath));
      app.get('*', (req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    }
  } else {
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`SASA Official server running on http://0.0.0.0:${PORT}`);
    console.log(`Official Order Email Recipient: ${getOfficialEmail()}`);
  });
}

startServer();
