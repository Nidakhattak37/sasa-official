# SASA Official - MongoDB Atlas & Database Architecture Guide

This document outlines the database credentials, cluster configuration, collection names, and schemas for **SASA Official Luxury Pret & Haute Couture**.

---

## 1. Database Architecture Summary

| Property | Details |
| :--- | :--- |
| **Database Engine** | **MongoDB Atlas** (Cloud NoSQL Document Database) |
| **Official Database Name** | `sasaofficial` |
| **Node.js Driver** | Official `mongodb` npm package v6.x (with ServerApiVersion.v1) |
| **Fallback Engine** | Client-side reactive local persistence with automatic cloud synchronization |
| **Live Store Connection** | Automatic connection via `MONGODB_URI` environment variable |

---

## 2. MongoDB Atlas Connection URI & Credentials Format

To connect your own MongoDB Atlas cluster, set the following variables in your `.env` or server environment:

```env
# MONGODB_URI: Full connection string with your username and password
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/sasaofficial?retryWrites=true&w=majority

# MONGODB_DB_NAME: Active database name
MONGODB_DB_NAME=sasaofficial
```

### Example Real Connection String:
```env
MONGODB_URI=mongodb+srv://sasa_admin:LuxuryPass2026@sasa-cluster.mongodb.net/sasaofficial?retryWrites=true&w=majority
```

---

## 3. Database Collections & Schema

The `sasaofficial` database stores the following document collections:

### A. `orders` Collection
Stores every customer purchase placed via the storefront checkout.
- `id` (String): e.g. `SASA-2026-9041`
- `customerName` (String): e.g. `Zainab Mir`
- `email` (String): Customer email for dispatch notifications
- `phone` (String): Customer phone / WhatsApp
- `items` (Array of Objects):
  - `productName` (String): e.g. `Gulzar Embroidered 3-Piece Lawn`
  - `selectedSize` (String): `XS`, `S`, `M`, `L`, `XL`, `Custom`
  - `selectedColor` (String): e.g. `Royal Sapphire`
  - `quantity` (Number): e.g. `1`
  - `price` (Number): e.g. `18500`
- `subtotal` (Number): e.g. `18500`
- `shippingFee` (Number): `0` (Free) or PKR standard fee
- `total` (Number): e.g. `18500`
- `paymentMethod` (String): `COD` (Cash on Delivery), `Bank Transfer`, `Card`
- `paymentStatus` (String): `pending`, `confirmed`, `paid`
- `orderStatus` (String): `pending`, `processing`, `dispatched`, `delivered`
- `trackingNumber` (String): e.g. `SASA-TRK-77492`
- `shippingAddress` (Object):
  - `fullName`, `email`, `phone`, `street`, `city`, `state`, `postalCode`, `country`
- `createdAt` (ISO Date String)
- `savedAt` (Date)

---

### B. `products` Collection
Stores the complete luxury pret and unstitched lawn product catalog.
- `id` (String): Unique SKU (e.g. `p1`, `p2`, `lawn-gulzar-01`)
- `name` (String): e.g. `Gulzar Embroidered 3-Piece Lawn`
- `category` (String): `lawn`, `pret`, `luxury_formal`, `unstitched`
- `price` (Number): Base PKR price
- `compareAtPrice` (Number, optional): Original PKR price before discount
- `stock` (Number): Units available
- `isNewArrival` (Boolean)
- `isBestSeller` (Boolean)
- `description` (String): Fabric composition & artisan embroidery details
- `images` (Array of Strings): High-resolution luxury product photographs
- `sizes` (Array of Strings): `['XS', 'S', 'M', 'L', 'XL']`
- `colors` (Array of Objects): `[{ name: 'Royal Sapphire', hex: '#1E3A8A' }]`

---

### C. `customers` Collection
Stores registered patrons and guest order history.
- `id` (String): Customer identifier
- `name` (String)
- `email` (String)
- `phone` (String)
- `savedAddresses` (Array)
- `totalOrders` (Number)
- `totalSpent` (Number)

---

### D. `settings` Collection
Stores global storefront configuration.
- `storeName` (String): `SASA Official`
- `email` (String): Official order alerts recipient
- `phone` (String)
- `currencyCode` (String): `PKR`
- `defaultShippingFee` (Number)
- `freeShippingThreshold` (Number)

---

## 4. Step-by-Step: How to Get Your Free MongoDB Atlas Cluster

1. Sign up / log in at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a free **M0 Shared Cluster** (choose AWS or Google Cloud region closest to your audience, e.g. Mumbai or Bahrain).
3. Under **Security > Database Access**, click **Add New Database User**:
   - Authentication Method: **Password**
   - Username: e.g. `sasa_admin`
   - Password: Create a secure password (avoid special characters like `@` or `:` inside the password or URL-encode them).
   - Role: **Read and write to any database**.
4. Under **Security > Network Access**, click **Add IP Address**:
   - Click **Allow Access from Anywhere (`0.0.0.0/0`)** so your Node.js application can connect securely.
5. Under **Deployment > Database**, click **Connect > Drivers (Node.js)**:
   - Copy the connection string:
     `mongodb+srv://sasa_admin:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`
   - Replace `<password>` with your database user password.
   - Insert `/sasaofficial` before the `?` query parameters:
     `mongodb+srv://sasa_admin:YourPass123@cluster0.xxxxx.mongodb.net/sasaofficial?retryWrites=true&w=majority`
6. Paste into your `.env` file or test it directly in **Admin Panel > Store Settings > MongoDB Atlas Cloud Database**.

---

## 5. Troubleshooting & Solutions: Immutable `_id` Error Resolution

### Why "Performing an update on the path '_id' would modify the immutable field '_id'" Occurs:
In MongoDB, the `_id` field is the permanent immutable primary key of a document. When performing an `updateOne(filter, { $set: updatePayload }, { upsert: true })` operation, if `updatePayload` contains `_id` (even with the exact same value), MongoDB throws this error to protect document identity.

### How SASA Official Handles This:
1. **Recursive Payload Sanitization (`cleanMongoPayload`)**:
   - The backend server (`server.js`) recursively sanitizes all `$set` payloads for `products`, `orders`, `banners`, and `settings`, stripping any `_id` property before sending the update to MongoDB Atlas.
   - Products and orders are matched by their unique business identifier (`id`), allowing MongoDB to update document contents while preserving the existing database `_id` intact.
2. **Client-Side Defense (`stripMongoId`)**:
   - The client application (`AppContext.tsx`) also strips `_id` when hydrating state from `/api/products` and `/api/orders`, ensuring clean payloads are submitted on subsequent updates.

