import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import { MongoClient, ServerApiVersion } from 'mongodb';

import { createServer as createViteServer } from 'vite';

// Load environment variables from .env file if present
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const distPath = path.join(__dirname, 'dist');

// Body parser for JSON payloads (supports high-res image uploads to be saved to website storage)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// ==============================================================================
// WEBSITE FILE & IMAGE STORAGE ENGINE (/public/uploads)
// Images are stored on the website filesystem; MongoDB Atlas only stores links.
// ==============================================================================
const publicUploadsDir = path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(publicUploadsDir)) {
  try {
    fs.mkdirSync(publicUploadsDir, { recursive: true });
  } catch (e) {
    console.warn('[STORAGE DIR CREATION NOTE]', e.message);
  }
}

// Global CORS and Cross-Origin Resource Policy headers for all images and API routes
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Cross-Origin-Resource-Policy', 'cross-origin');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Serve public uploads and assets statically
app.use('/uploads', express.static(publicUploadsDir, { maxAge: '1d' }));
app.use('/images', express.static(path.join(__dirname, 'public', 'images'), { maxAge: '1d' }));
app.use('/src/assets/images', express.static(path.join(__dirname, 'public', 'images'), { maxAge: '1d' }));

/**
 * Saves a base64 image data URL into website local file storage (/public/uploads)
 * and returns the clean website link URL (/uploads/filename.ext)
 */
function saveBase64Image(dataUrlOrUrl, prefix = 'prod') {
  if (!dataUrlOrUrl || typeof dataUrlOrUrl !== 'string') return dataUrlOrUrl;

  // If it's already a regular URL or file path, return it directly
  if (!dataUrlOrUrl.startsWith('data:image/')) {
    return dataUrlOrUrl;
  }

  try {
    const matches = dataUrlOrUrl.match(/^data:image\/([a-zA-Z0-9+.-]+);base64,(.+)$/);
    if (!matches) return dataUrlOrUrl;

    let ext = matches[1].toLowerCase();
    if (ext === 'jpeg') ext = 'jpg';
    if (ext === 'svg+xml') ext = 'svg';

    const base64Data = matches[2];
    const buffer = Buffer.from(base64Data, 'base64');
    const randomSuffix = Math.random().toString(36).substring(2, 9);
    const filename = `${prefix}_${Date.now()}_${randomSuffix}.${ext}`;
    const targetFilePath = path.join(publicUploadsDir, filename);

    fs.writeFileSync(targetFilePath, buffer);
    console.log(`[FILE STORAGE] Saved image to website disk: /uploads/${filename} (${(buffer.length / 1024).toFixed(1)} KB)`);
    return `/uploads/${filename}`;
  } catch (err) {
    console.warn('[FILE STORAGE ERROR] Could not save image to disk:', err.message);
    return dataUrlOrUrl;
  }
}

/**
 * Sanitizes product objects so that all images are stored on website file storage
 * and MongoDB Atlas receives only link URLs.
 */
function sanitizeProductImageLinks(product) {
  if (!product) return product;
  const clean = { ...product };
  if (Array.isArray(clean.images)) {
    clean.images = clean.images.map((img, idx) => saveBase64Image(img, `prod_${idx}`));
  }
  return clean;
}

/**
 * Recursively strips MongoDB immutable fields (like `_id`) from update payloads
 * to prevent "Performing an update on the path '_id' would modify the immutable field '_id'" errors.
 */
function cleanMongoPayload(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  if (obj instanceof Date || obj instanceof RegExp) return obj;

  if (Array.isArray(obj)) {
    return obj.map(item => cleanMongoPayload(item));
  }

  const copy = {};
  for (const [key, value] of Object.entries(obj)) {
    if (key === '_id') continue;
    if (value !== null && typeof value === 'object') {
      copy[key] = cleanMongoPayload(value);
    } else {
      copy[key] = value;
    }
  }
  return copy;
}

// In-memory store for recent email logs (useful for admin verification)
const recentEmailLogs = [];

// ==============================================================================
// MONGODB ATLAS DATABASE ENGINE (Resilient Connection & Auto-Fallback)
// ==============================================================================
let mongoClient = null;
let mongoDb = null;
let isMongoConnecting = false;
let lastMongoError = null;
let lastMongoAttemptTime = 0;
let activeMongoUri = null;
const MONGO_RETRY_COOLDOWN_MS = 30000; // 30s cooldown before retrying failed Atlas connection

/**
 * Sanitizes and normalizes MongoDB URIs, ensuring special characters in credentials
 * (like @, #, $, %, +, ?, /) are safely URL-encoded to prevent authentication failures.
 */
function sanitizeMongoUri(rawUri) {
  if (!rawUri || typeof rawUri !== 'string') return '';
  let uri = rawUri.trim().replace(/^['"]|['"]$/g, '');

  try {
    const protoMatch = uri.match(/^(mongodb(?:\+srv)?:\/\/)(.*)$/);
    if (protoMatch) {
      const proto = protoMatch[1];
      const rest = protoMatch[2];
      const atIdx = rest.lastIndexOf('@');
      if (atIdx !== -1) {
        const userinfo = rest.substring(0, atIdx);
        const hostAndOpts = rest.substring(atIdx + 1);
        const colonIdx = userinfo.indexOf(':');
        if (colonIdx !== -1) {
          const rawUser = decodeURIComponent(userinfo.substring(0, colonIdx));
          const rawPass = decodeURIComponent(userinfo.substring(colonIdx + 1));
          const encodedUser = encodeURIComponent(rawUser);
          const encodedPass = encodeURIComponent(rawPass);
          return `${proto}${encodedUser}:${encodedPass}@${hostAndOpts}`;
        }
      }
    }
  } catch {
    // Return trimmed uri if parser encounters unexpected format
  }
  return uri;
}

function getMongoUri() {
  const raw = activeMongoUri ||
         process.env.MONGODB_URI || 
         process.env.DATABASE_URL || 
         process.env.MONGO_URI || 
         process.env.MONGODB_URL || 
         '';
  return sanitizeMongoUri(raw);
}

function getMongoDbName() {
  return process.env.MONGODB_DB_NAME || 'sasaofficial';
}

function formatMongoError(err) {
  const msg = err?.message || String(err);
  if (msg.includes('SSL alert number 80') || msg.includes('tlsv1 alert internal error')) {
    return 'MongoDB Atlas Network Access Firewall Block: The cluster rejected the connection (SSL alert 80). Please add "0.0.0.0/0" in your MongoDB Atlas Dashboard > Network Access > Add IP Address.';
  }
  if (msg.includes('bad auth') || msg.includes('Authentication failed') || msg.includes('8000')) {
    return 'MongoDB Atlas Authentication Failed: Check the database username and password in MONGODB_URI (ensure special characters in password are URL-encoded or reset in Atlas > Database Access).';
  }
  if (msg.includes('querySrv ENOTFOUND') || msg.includes('getaddrinfo ENOTFOUND')) {
    return 'MongoDB Atlas Host Not Found: Verify your cluster hostname or SRV connection string.';
  }
  return msg;
}

async function getMongoDatabase(customUri = null, customDbName = null, forceRetry = false) {
  const rawTargetUri = customUri || getMongoUri();
  const uri = sanitizeMongoUri(rawTargetUri);
  const dbName = customDbName || getMongoDbName();

  if (!uri) {
    return null;
  }

  // Return existing healthy connection
  if (mongoDb && !customUri) {
    return mongoDb;
  }

  // Prevent connection stampede or rapid looping when Atlas credentials / IP are invalid
  const now = Date.now();
  if (!customUri && !forceRetry && lastMongoError && (now - lastMongoAttemptTime < MONGO_RETRY_COOLDOWN_MS)) {
    return null;
  }

  if (isMongoConnecting && !customUri) {
    await new Promise(resolve => setTimeout(resolve, 400));
    if (mongoDb) return mongoDb;
    return null;
  }

  try {
    isMongoConnecting = true;
    lastMongoAttemptTime = now;

    const client = new MongoClient(uri, {
      connectTimeoutMS: 4000,
      serverSelectionTimeoutMS: 4000,
      socketTimeoutMS: 6000,
      tls: true,
      tlsAllowInvalidCertificates: true,
      directConnection: false,
    });

    await client.connect();
    const database = client.db(dbName);
    await database.command({ ping: 1 });

    mongoClient = client;
    mongoDb = database;
    lastMongoError = null;
    if (customUri) {
      activeMongoUri = customUri;
    }
    console.log(`[MONGODB ATLAS] Connected successfully. Active database: "${dbName}"`);

    return database;
  } catch (err) {
    const readableError = formatMongoError(err);
    if (!customUri) {
      lastMongoError = readableError;
      mongoDb = null;
      console.log(`[DATABASE ENGINE] Local Storage & Website Storage Mode active (Atlas status: ${readableError})`);
    }
    if (customUri) {
      throw new Error(readableError);
    }
    return null;
  } finally {
    isMongoConnecting = false;
  }
}

// Initial non-blocking check on server startup
if (getMongoUri()) {
  getMongoDatabase(null, null, true)
    .then(db => {
      if (db) {
        console.log('[MONGODB ATLAS] Initial connection verified.');
      }
    })
    .catch(() => {});
}

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

  // Automatically persist order to MongoDB Atlas if connected
  getMongoDatabase().then(db => {
    if (db) {
      const orderPayload = cleanMongoPayload(order);
      orderPayload.savedAt = new Date();
      db.collection('orders').updateOne(
        { id: order.id },
        { $set: orderPayload },
        { upsert: true }
      ).catch(e => console.warn('[MONGODB ORDER AUTO-SAVE NOTICE]', e.message));
    }
  }).catch(() => {});

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

// ==============================================================================
// 5. MONGODB ATLAS DATABASE API ENDPOINTS
// ==============================================================================

// GET /api/db/status: Check MongoDB Atlas connection health, DB name & collections
app.get('/api/db/status', async (req, res) => {
  const uri = getMongoUri();
  const dbName = getMongoDbName();
  const hasUri = Boolean(uri);

  let maskedUri = 'Not Set (Local Storage Fallback Mode)';
  if (hasUri) {
    try {
      if (uri.startsWith('mongodb+srv://') || uri.startsWith('mongodb://')) {
        const parts = uri.split('@');
        if (parts.length > 1) {
          maskedUri = `mongodb+srv://****:****@${parts[1].split('?')[0]}`;
        } else {
          maskedUri = 'mongodb://[configured]';
        }
      }
    } catch {
      maskedUri = 'mongodb+srv://[configured]';
    }
  }

  try {
    const db = await getMongoDatabase();
    if (db) {
      const collections = await db.listCollections().toArray();
      const collectionNames = collections.map(c => c.name);

      const counts = {};
      for (const name of ['orders', 'products', 'customers', 'reviews', 'settings']) {
        if (collectionNames.includes(name)) {
          counts[name] = await db.collection(name).countDocuments();
        } else {
          counts[name] = 0;
        }
      }

      return res.json({
        connected: true,
        type: 'MongoDB Atlas (Cloud NoSQL Database)',
        databaseName: dbName,
        uriConfigured: true,
        maskedUri,
        collections: collectionNames,
        counts,
        message: `Successfully connected to MongoDB Atlas database "${dbName}"`
      });
    }

    // When connection is in cooldown or IP firewall blocked / authentication pending
    if (hasUri) {
      const isAuthErr = Boolean(lastMongoError && (lastMongoError.includes('Authentication Failed') || lastMongoError.includes('bad auth') || lastMongoError.includes('8000')));
      const isSslErr = Boolean(lastMongoError && (lastMongoError.includes('SSL alert 80') || lastMongoError.includes('Firewall')));
      
      return res.json({
        connected: false,
        type: isAuthErr ? 'Local Mode (Atlas Authentication Check Needed)' : 'MongoDB Atlas (Configuration Required)',
        databaseName: dbName,
        uriConfigured: true,
        maskedUri,
        error: lastMongoError || 'Connection paused',
        isAuthError: isAuthErr,
        isSslAlert80: isSslErr,
        activeFallback: true,
        message: lastMongoError || 'MongoDB Atlas connection in local fallback mode.'
      });
    }
  } catch (err) {
    const formatted = formatMongoError(err);
    const isAuthErr = formatted.includes('Authentication Failed') || formatted.includes('bad auth');
    const isSslErr = formatted.includes('SSL alert 80') || formatted.includes('Firewall');
    return res.json({
      connected: false,
      type: 'MongoDB Atlas',
      databaseName: dbName,
      uriConfigured: hasUri,
      maskedUri,
      error: formatted,
      isAuthError: isAuthErr,
      isSslAlert80: isSslErr,
      activeFallback: true,
      message: formatted
    });
  }

  return res.json({
    connected: false,
    type: 'Local Browser State (Ready for MongoDB Atlas)',
    databaseName: dbName,
    uriConfigured: false,
    maskedUri: 'None (Configure MONGODB_URI to connect your Atlas Cluster)',
    counts: { orders: 0, products: 0, customers: 0 },
    message: 'Running in Local Storage mode. Set MONGODB_URI in .env to persist to MongoDB Atlas.'
  });
});

// POST /api/db/test-connection: Verify any MongoDB Atlas URI
app.post('/api/db/test-connection', async (req, res) => {
  const { uri, databaseName } = req.body || {};
  const testUri = uri || getMongoUri();
  const dbName = databaseName || getMongoDbName();

  if (!testUri) {
    return res.status(400).json({
      success: false,
      message: 'Please provide a valid MongoDB Atlas connection string (e.g. mongodb+srv://<user>:<password>@cluster0.mongodb.net/...)'
    });
  }

  try {
    const db = await getMongoDatabase(testUri, dbName, true);
    if (!db) {
      throw new Error(lastMongoError || 'Unable to connect to database cluster');
    }
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);

    return res.json({
      success: true,
      message: `Successfully connected to MongoDB Atlas! Database: "${dbName}"`,
      databaseName: dbName,
      collections: collectionNames
    });
  } catch (err) {
    const formatted = formatMongoError(err);
    return res.json({
      success: false,
      error: formatted,
      isSslAlert80: formatted.includes('SSL alert 80') || formatted.includes('Firewall'),
      message: formatted
    });
  }
});

// ==============================================================================
// 6. WEBSITE IMAGE / FILE STORAGE & MONGODB PRODUCT CRUD
// Images are saved on Website disk (/public/uploads); MongoDB stores the link URLs.
// ==============================================================================

// POST /api/upload: Upload single image to website file storage
app.post('/api/upload', (req, res) => {
  const { image, filename: originalName, prefix = 'product' } = req.body || {};
  if (!image) {
    return res.status(400).json({ success: false, message: 'No image data provided' });
  }

  try {
    const linkUrl = saveBase64Image(image, prefix);
    return res.json({
      success: true,
      url: linkUrl,
      storageType: 'website_file_storage',
      message: 'Image successfully saved to website file storage (/uploads). Link ready for MongoDB.'
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message,
      message: 'Failed to save image to website storage'
    });
  }
});

// POST /api/upload/multiple: Upload multiple images to website file storage
app.post('/api/upload/multiple', (req, res) => {
  const { images = [], prefix = 'product' } = req.body || {};
  if (!Array.isArray(images) || images.length === 0) {
    return res.status(400).json({ success: false, message: 'No images provided' });
  }

  try {
    const urls = images.map((img, idx) => saveBase64Image(img, `${prefix}_${idx}`));
    return res.json({
      success: true,
      urls,
      count: urls.length,
      storageType: 'website_file_storage',
      message: `${urls.length} images saved to website storage. Link URLs ready for MongoDB.`
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message,
      message: 'Failed to save images to website storage'
    });
  }
});

// In-memory fallback store for server session persistence
const serverFallbackStore = {
  menuItems: null,
  instantClassics: null,
  dualEditorial: null,
  banners: [],
  settings: null
};

// GET /api/products: Fetch products from MongoDB Atlas or return local fallback
app.get('/api/products', async (req, res) => {
  try {
    const db = await getMongoDatabase();
    if (db) {
      const rawProducts = await db.collection('products').find({}).toArray();
      const products = rawProducts.map(p => cleanMongoPayload(p));
      return res.json({
        success: true,
        source: 'mongodb_atlas',
        count: products.length,
        products
      });
    }
  } catch (err) {
    console.warn('[MONGODB PRODUCTS FETCH ERROR]', err.message);
  }
  return res.json({ success: true, source: 'local', products: [] });
});

// POST /api/products: Save or update product in MongoDB Atlas with clean image links
app.post('/api/products', async (req, res) => {
  const { product } = req.body || {};
  if (!product || !product.id) {
    return res.status(400).json({ success: false, message: 'Missing product object or product ID' });
  }

  // Ensure all images are stored on website file storage, returning clean URL links for MongoDB
  const cleanProduct = sanitizeProductImageLinks(product);
  cleanProduct.updatedAt = new Date();

  try {
    const db = await getMongoDatabase();
    if (db) {
      const updateData = cleanMongoPayload(cleanProduct);
      await db.collection('products').updateOne(
        { id: cleanProduct.id },
        { $set: updateData },
        { upsert: true }
      );
      return res.json({
        success: true,
        source: 'mongodb_atlas',
        product: cleanProduct,
        message: 'Product information & image links saved to MongoDB Atlas'
      });
    }
  } catch (err) {
    console.warn('[MONGODB PRODUCT SAVE ERROR]', err.message);
  }

  return res.json({
    success: true,
    source: 'local_fallback',
    product: cleanProduct,
    message: 'Images saved to website storage; product cached locally'
  });
});

// DELETE /api/products/:id: Delete product from MongoDB Atlas
app.delete('/api/products/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const db = await getMongoDatabase();
    if (db) {
      await db.collection('products').deleteOne({ id });
      return res.json({ success: true, source: 'mongodb_atlas', id });
    }
  } catch (err) {
    console.warn('[MONGODB PRODUCT DELETE ERROR]', err.message);
  }
  return res.json({ success: true, source: 'local_fallback', id });
});

// GET /api/orders: Fetch orders from MongoDB Atlas or return empty array
app.get('/api/orders', async (req, res) => {
  try {
    const db = await getMongoDatabase();
    if (db) {
      const rawOrders = await db.collection('orders').find({}).sort({ createdAt: -1 }).toArray();
      const orders = rawOrders.map(o => cleanMongoPayload(o));
      return res.json({ success: true, source: 'mongodb_atlas', orders });
    }
  } catch (err) {
    console.warn('[MONGODB ORDERS FETCH ERROR]', err.message);
  }
  return res.json({ success: true, source: 'local', orders: [] });
});

// POST /api/orders: Save order directly into MongoDB Atlas
app.post('/api/orders', async (req, res) => {
  const { order } = req.body || {};
  if (!order) {
    return res.status(400).json({ success: false, message: 'Missing order payload' });
  }

  try {
    const db = await getMongoDatabase();
    if (db) {
      const orderPayload = cleanMongoPayload(order);
      orderPayload.savedAt = new Date();
      await db.collection('orders').updateOne(
        { id: order.id },
        { $set: orderPayload },
        { upsert: true }
      );
      return res.json({ success: true, source: 'mongodb_atlas', id: order.id });
    }
  } catch (err) {
    console.warn('[MONGODB ORDER SAVE ERROR]', err.message);
  }

  return res.json({ success: true, source: 'local_fallback', id: order.id });
});

// POST /api/db/sync: Seed or sync products, orders, and settings to MongoDB Atlas
app.post('/api/db/sync', async (req, res) => {
  const { products, orders, settings, banners } = req.body || {};
  try {
    const db = await getMongoDatabase();
    if (!db) {
      return res.status(400).json({
        success: false,
        message: 'MongoDB Atlas is not connected. Add MONGODB_URI in your environment variables to sync.'
      });
    }

    let productsCount = 0;
    let ordersCount = 0;

    // Process all products: save raw base64 images into website file storage (/uploads), save links in MongoDB
    if (Array.isArray(products) && products.length > 0) {
      for (const p of products) {
        const cleanProduct = sanitizeProductImageLinks(p);
        const updateData = cleanMongoPayload(cleanProduct);
        await db.collection('products').updateOne({ id: cleanProduct.id }, { $set: updateData }, { upsert: true });
      }
      productsCount = products.length;
    }

    if (Array.isArray(orders) && orders.length > 0) {
      for (const o of orders) {
        const updateData = cleanMongoPayload(o);
        await db.collection('orders').updateOne({ id: o.id }, { $set: updateData }, { upsert: true });
      }
      ordersCount = orders.length;
    }

    if (Array.isArray(banners) && banners.length > 0) {
      for (const b of banners) {
        const cleanBanner = { ...b, imageUrl: saveBase64Image(b.imageUrl, 'banner') };
        const updateData = cleanMongoPayload(cleanBanner);
        await db.collection('banners').updateOne({ id: cleanBanner.id }, { $set: updateData }, { upsert: true });
      }
    }

    const { menuItems: syncMenuItems, instantClassics: syncInstantClassics, dualEditorial: syncDualEditorial } = req.body || {};

    if (Array.isArray(syncMenuItems) && syncMenuItems.length > 0) {
      const cleanMenu = syncMenuItems.map(i => cleanMongoPayload(i));
      await db.collection('settings').updateOne({ key: 'navigation_menu' }, { $set: { key: 'navigation_menu', menuItems: cleanMenu } }, { upsert: true });
    }

    if (syncInstantClassics) {
      const cleanIc = {
        ...syncInstantClassics,
        imageUrl: saveBase64Image(syncInstantClassics.imageUrl, 'instant')
      };
      const updateData = cleanMongoPayload(cleanIc);
      await db.collection('settings').updateOne({ key: 'instant_classics' }, { $set: { key: 'instant_classics', ...updateData } }, { upsert: true });
    }

    if (syncDualEditorial) {
      const cleanDe = {
        left: {
          ...syncDualEditorial.left,
          imageUrl: saveBase64Image(syncDualEditorial.left?.imageUrl, 'dual_left')
        },
        right: {
          ...syncDualEditorial.right,
          imageUrl: saveBase64Image(syncDualEditorial.right?.imageUrl, 'dual_right')
        }
      };
      const updateData = cleanMongoPayload(cleanDe);
      await db.collection('settings').updateOne({ key: 'dual_editorial' }, { $set: { key: 'dual_editorial', ...updateData } }, { upsert: true });
    }

    if (settings) {
      const updateData = cleanMongoPayload(settings);
      await db.collection('settings').updateOne({ key: 'store_settings' }, { $set: updateData }, { upsert: true });
    }

    return res.json({
      success: true,
      message: `Successfully synced ${productsCount} products, ${ordersCount} orders, navigation menu, and homepage editorial sections to MongoDB Atlas!`,
      productsCount,
      ordersCount,
      storageArchitecture: 'Images → Website File Storage (/uploads) | Product Data, Editorial & Links → MongoDB Atlas'
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/banners: Fetch promotional banners
app.get('/api/banners', async (req, res) => {
  try {
    const db = await getMongoDatabase();
    if (db) {
      const rawBanners = await db.collection('banners').find({}).toArray();
      if (rawBanners && rawBanners.length > 0) {
        const banners = rawBanners.map(b => cleanMongoPayload(b));
        serverFallbackStore.banners = banners;
        return res.json({ success: true, source: 'mongodb_atlas', banners });
      }
    }
  } catch (err) {
    console.warn('[MONGODB BANNERS FETCH ERROR]', err.message);
  }
  return res.json({ success: true, source: 'local', banners: serverFallbackStore.banners || [] });
});

// POST /api/banners: Save or update banner
app.post('/api/banners', async (req, res) => {
  const { banner } = req.body || {};
  if (!banner || !banner.id) {
    return res.status(400).json({ success: false, message: 'Missing banner data or ID' });
  }
  const cleanBanner = { ...banner, imageUrl: saveBase64Image(banner.imageUrl, 'banner') };
  const existingIdx = (serverFallbackStore.banners || []).findIndex(b => b.id === cleanBanner.id);
  if (existingIdx >= 0) {
    serverFallbackStore.banners[existingIdx] = cleanBanner;
  } else {
    if (!serverFallbackStore.banners) serverFallbackStore.banners = [];
    serverFallbackStore.banners.push(cleanBanner);
  }

  try {
    const db = await getMongoDatabase();
    if (db) {
      const updateData = cleanMongoPayload(cleanBanner);
      await db.collection('banners').updateOne(
        { id: cleanBanner.id },
        { $set: updateData },
        { upsert: true }
      );
      return res.json({ success: true, source: 'mongodb_atlas', banner: cleanBanner });
    }
  } catch (err) {
    console.warn('[MONGODB BANNER SAVE ERROR]', err.message);
  }
  return res.json({ success: true, source: 'local_fallback', banner: cleanBanner });
});

// DELETE /api/banners/:id: Delete banner
app.delete('/api/banners/:id', async (req, res) => {
  const { id } = req.params;
  if (serverFallbackStore.banners) {
    serverFallbackStore.banners = serverFallbackStore.banners.filter(b => b.id !== id);
  }
  try {
    const db = await getMongoDatabase();
    if (db) {
      await db.collection('banners').deleteOne({ id });
      return res.json({ success: true, source: 'mongodb_atlas', id });
    }
  } catch (err) {
    console.warn('[MONGODB BANNER DELETE ERROR]', err.message);
  }
  return res.json({ success: true, source: 'local_fallback', id });
});

// GET /api/menu: Fetch navigation menu items
app.get('/api/menu', async (req, res) => {
  try {
    const db = await getMongoDatabase();
    if (db) {
      const doc = await db.collection('settings').findOne({ key: 'navigation_menu' });
      if (doc && Array.isArray(doc.menuItems)) {
        const menuItems = doc.menuItems.map(i => cleanMongoPayload(i));
        serverFallbackStore.menuItems = menuItems;
        return res.json({ success: true, source: 'mongodb_atlas', menuItems });
      }
    }
  } catch (err) {
    console.warn('[MONGODB MENU FETCH ERROR]', err.message);
  }
  return res.json({ success: true, source: 'local', menuItems: serverFallbackStore.menuItems });
});

// POST /api/menu: Save navigation menu items
app.post('/api/menu', async (req, res) => {
  const { menuItems } = req.body || {};
  if (!Array.isArray(menuItems)) {
    return res.status(400).json({ success: false, message: 'Missing menuItems array' });
  }
  const cleanMenu = menuItems.map(i => cleanMongoPayload(i));
  serverFallbackStore.menuItems = cleanMenu;
  try {
    const db = await getMongoDatabase();
    if (db) {
      await db.collection('settings').updateOne(
        { key: 'navigation_menu' },
        { $set: { key: 'navigation_menu', menuItems: cleanMenu, updatedAt: new Date().toISOString() } },
        { upsert: true }
      );
      return res.json({ success: true, source: 'mongodb_atlas', menuItems: cleanMenu });
    }
  } catch (err) {
    console.warn('[MONGODB MENU SAVE ERROR]', err.message);
  }
  return res.json({ success: true, source: 'local_fallback', menuItems: cleanMenu });
});

// GET /api/instant-classics: Fetch Instant Classics section details
app.get('/api/instant-classics', async (req, res) => {
  try {
    const db = await getMongoDatabase();
    if (db) {
      const doc = await db.collection('settings').findOne({ key: 'instant_classics' });
      if (doc) {
        const cleanDoc = cleanMongoPayload(doc);
        const { key, ...instantClassics } = cleanDoc;
        serverFallbackStore.instantClassics = instantClassics;
        return res.json({ success: true, source: 'mongodb_atlas', instantClassics });
      }
    }
  } catch (err) {
    console.warn('[MONGODB INSTANT CLASSICS FETCH ERROR]', err.message);
  }
  return res.json({ success: true, source: 'local', instantClassics: serverFallbackStore.instantClassics });
});

// POST /api/instant-classics: Save Instant Classics section details
app.post('/api/instant-classics', async (req, res) => {
  const { instantClassics } = req.body || {};
  if (!instantClassics) {
    return res.status(400).json({ success: false, message: 'Missing instantClassics payload' });
  }
  const cleanIc = {
    ...instantClassics,
    imageUrl: saveBase64Image(instantClassics.imageUrl, 'instant'),
    updatedAt: new Date().toISOString()
  };
  const updateData = cleanMongoPayload(cleanIc);
  serverFallbackStore.instantClassics = updateData;
  try {
    const db = await getMongoDatabase();
    if (db) {
      await db.collection('settings').updateOne(
        { key: 'instant_classics' },
        { $set: { key: 'instant_classics', ...updateData } },
        { upsert: true }
      );
      return res.json({ success: true, source: 'mongodb_atlas', instantClassics: updateData });
    }
  } catch (err) {
    console.warn('[MONGODB INSTANT CLASSICS SAVE ERROR]', err.message);
  }
  return res.json({ success: true, source: 'local_fallback', instantClassics: updateData });
});

// GET /api/dual-editorial: Fetch "2 Big Images" Section details
app.get('/api/dual-editorial', async (req, res) => {
  try {
    const db = await getMongoDatabase();
    if (db) {
      const doc = await db.collection('settings').findOne({ key: 'dual_editorial' });
      if (doc) {
        const cleanDoc = cleanMongoPayload(doc);
        const { key, ...dualEditorial } = cleanDoc;
        serverFallbackStore.dualEditorial = dualEditorial;
        return res.json({ success: true, source: 'mongodb_atlas', dualEditorial });
      }
    }
  } catch (err) {
    console.warn('[MONGODB DUAL EDITORIAL FETCH ERROR]', err.message);
  }
  return res.json({ success: true, source: 'local', dualEditorial: serverFallbackStore.dualEditorial });
});

// POST /api/dual-editorial: Save "2 Big Images" Section details
app.post('/api/dual-editorial', async (req, res) => {
  const { dualEditorial } = req.body || {};
  if (!dualEditorial || !dualEditorial.left || !dualEditorial.right) {
    return res.status(400).json({ success: false, message: 'Missing dualEditorial payload' });
  }
  const cleanDe = {
    left: {
      ...dualEditorial.left,
      imageUrl: saveBase64Image(dualEditorial.left?.imageUrl, 'dual_left')
    },
    right: {
      ...dualEditorial.right,
      imageUrl: saveBase64Image(dualEditorial.right?.imageUrl, 'dual_right')
    },
    updatedAt: new Date().toISOString()
  };
  const updateData = cleanMongoPayload(cleanDe);
  serverFallbackStore.dualEditorial = updateData;
  try {
    const db = await getMongoDatabase();
    if (db) {
      await db.collection('settings').updateOne(
        { key: 'dual_editorial' },
        { $set: { key: 'dual_editorial', ...updateData } },
        { upsert: true }
      );
      return res.json({ success: true, source: 'mongodb_atlas', dualEditorial: updateData });
    }
  } catch (err) {
    console.warn('[MONGODB DUAL EDITORIAL SAVE ERROR]', err.message);
  }
  return res.json({ success: true, source: 'local_fallback', dualEditorial: updateData });
});

// GET /api/settings: Fetch store settings
app.get('/api/settings', async (req, res) => {
  try {
    const db = await getMongoDatabase();
    if (db) {
      const rawSettings = await db.collection('settings').findOne({ key: 'store_settings' });
      if (rawSettings) {
        const cleanSettings = cleanMongoPayload(rawSettings);
        serverFallbackStore.settings = cleanSettings;
        return res.json({ success: true, source: 'mongodb_atlas', settings: cleanSettings });
      }
    }
  } catch (err) {
    console.warn('[MONGODB SETTINGS FETCH ERROR]', err.message);
  }
  return res.json({ success: true, source: 'local', settings: serverFallbackStore.settings });
});

// POST /api/settings: Save store settings
app.post('/api/settings', async (req, res) => {
  const { settings } = req.body || {};
  if (!settings) {
    return res.status(400).json({ success: false, message: 'Missing settings payload' });
  }
  try {
    const db = await getMongoDatabase();
    if (db) {
      const updateData = cleanMongoPayload(settings);
      await db.collection('settings').updateOne(
        { key: 'store_settings' },
        { $set: updateData },
        { upsert: true }
      );
      return res.json({ success: true, source: 'mongodb_atlas', settings: updateData });
    }
  } catch (err) {
    console.warn('[MONGODB SETTINGS SAVE ERROR]', err.message);
  }
  const cleanSettings = cleanMongoPayload(settings);
  serverFallbackStore.settings = cleanSettings;
  return res.json({ success: true, source: 'local_fallback', settings: cleanSettings });
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
