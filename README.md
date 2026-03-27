# ProyenMovies 

ProyenMovies is a state-of-the-art cinematic streaming platform engineered for high-performance content delivery. By leveraging a hybrid architecture of edge-caching and cloud-native storage, it ensures sub-second response times and infinite scalability for the modern Kenyan market.

##  High-Performance Tech Stack

*   **Frontend**: [Next.js 14 (App Router)](https://nextjs.org/) — Utilizing React Server Components for minimal client-side JS overhead.
*   **API Layer**: Node.js Express — A robust, stateless backend managing high-concurrency requests.
*   **Database**: MySQL — Relational data integrity for user subscriptions and media metadata.
*   **Caching**: [Redis Cloud](https://redislabs.com/) — Distributed in-memory data store for global API acceleration.
*   **Media Storage**: [Cloudinary CDN](https://cloudinary.com/) — AI-optimized media delivery and asset management.
*   **Payments**: [Stripe](https://stripe.com/) — Secure, localized Kenyan (KES) payment processing.

---

##  Technical Architecture

### 1. Redis Caching Strategy (Edge Acceleration)
To reduce database latency by up to 90%, ProyenMovies implements a sophisticated Redis caching layer:
- **Query Caching**: Public routes like `/api/media` and `/api/media/:id` are cached at the edge.
- **Sliding TTL**: Cached items have a **1-hour Time-to-Live (TTL)**. High-traffic content stays "hot" in the cache, while stale data is automatically purged.
- **Cache Invalidation (Write-Through)**: Whenever an admin creates, updates, or deletes a movie, the system triggers `clearMediaCache()`. This ensures absolute data consistency by purging the `media:*` keys immediately across the cluster.
- **Verification**: Developers can monitor cache health via the `source` header in JSON responses (`database` for first hit, `cache` for subsequent hits).

  <img width="1366" height="768" alt="image" src="https://github.com/user-attachments/assets/62d0c18d-913a-48a0-a7bc-cd25114509e3" />


### 2. Cloudinary CDN Integration (Media Hosting)
We have moved away from local disk storage to a professional Cloud-Native approach:
- **Infinite Scalability**: Media assets (Thumbnails, Trailers, Full Movies) are streamed directly to Cloudinary, bypassing server-side bottlenecks.
- **Global Delivery**: Assets are served through Cloudinary's multi-CDN network, reducing buffering for users regardless of their geographical location.
- **Secure URLs**: All media is delivered over secure HTTPS (`secure_url`), with support for private transformations and restricted access tokens.
- **Storage Workflow**: The backend generates a temporary local stream before performing an asynchronous upload to the `proyenmovies` Cloudinary folder, ensuring that the primary database only stores production-ready CDN URLs.

### 3. API Architecture & Versioning
ProyenMovies follows a RESTful API pattern designed for future growth:
- **Current Version (v1)**: The core API resides at `/api/`.
- **Versioning Policy**: To support breaking changes in the future, the system is architected to support `/api/v1/` prefixing in the routing layer. 
- **Stateless Auth**: Uses JWT (JSON Web Tokens) for secure communication between Next.js and the Express backend.
- **CORS Protection**: Access is restricted via a whitelist system, ensuring only authorized frontend domains can interact with the media core.

---

##  Subscription Tiers (KES)

Optimized for the Kenyan market with competitive pricing and localized feature sets.

| Plan | Price | Access | Technical Features |
| :--- | :--- | :--- | :--- |
| **Proyen Weekly** | KES 199 | 1 Screen | 720p HD, Mobile + Web |
| **Proyen Monthly** | KES 649 | 2 Screens | 1080p Full HD, Offline Downloads |
| **Proyen Family** | KES 1,099 | 4 Screens | 4K Ultra HD, Priority Support |

---

##  Developer Setup & Installation

### Environment Configuration
The system requires dual-environment setup for full functionality.

**Backend (.env)**
```env
PORT=5000
DB_HOST=localhost
REDIS_URL=redis://your_provider_url
CLOUDINARY_URL=cloudinary://your_api_credentials
JWT_SECRET=your_secret_key
```

**Frontend (.env.local)**
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
STRIPE_SECRET_KEY=your_stripe_key
```

### Quick Start
```bash
# 1. Install & Setup Database
npm install
cd backend && npm run setup

# 2. Start Development Environment
npm run dev:backend  # Starts API on Port 5000
npm run dev          # Starts Next.js on Port 3000
```

---

##  Verification & Maintenance
- **Build Integrity**: Run `next build` to verify Page Router and App Router compatibility.
- **Performance Monitoring**: Check terminal logs for `Successfully connected to Redis Cloud! 🚀` on startup.
- **Admin**: New uploads should be verified in the Cloudinary Media Library.

##  Contributing
Developers must ensure that all new media-related controllers include the `redis.keys('media:*')` purge logic to avoid serving stale data to users through the cache layer.
