# ProyenMovies 

ProyenMovies is a premium cinematic streaming platform built with modern web technologies. This application allows users to discover trending movies, explore new releases, subscribe to premium plans, and stream top-tier entertainment effortlessly.

##  Tech Stack

*   **Frontend Framework**: [Next.js 14 (App Router)](https://nextjs.org/)
*   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
*   **Icons**: [Lucide React](https://lucide.dev/)
*   **Payment Gateway**: [Stripe](https://stripe.com/)
*   **Database/Backend API**: Custom Express API with MySQL (`localhost:5000/api`)

##  Features

*   **Cinematic UI/UX**: Dark mode aesthetic with premium styling and responsive design.
*   **Browse & Discovery**: Easily search, filter, and discover movies and TV shows.
*   **Personalization**: Watchlists and AI-driven personalized movie recommendations (via backend API).
*   **Stripe Integration**: Secure checkout sessions and webhook handling for premium subscriptions.
*   **Admin Dashboard**: Manage media, track user statistics, and upload new content.

##  Getting Started

### Prerequisites

*   Node.js (v18 or higher)
*   npm or yarn
*   Stripe Account (for payments)
*   The paired Express/MySQL backend running on `http://localhost:5000`

### Installation

1.  **Clone the repository** (if applicable) or navigate to the project directory:
    ```bash
    cd d:\Media_site
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Environment Variables**:
    Create a `.env.local` file in the root directory and add the following keys:
    ```env
    NEXT_PUBLIC_SITE_URL=http://localhost:3000
    NEXT_PUBLIC_API_URL=http://localhost:5000/api
    STRIPE_SECRET_KEY=your_stripe_secret_key
    STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
    ```

4.  **Run the development server**:
    ```bash
    npm run dev
    ```

5.  Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

##  Project Structure

*   `app/`: Next.js App Router pages and layouts.
    *   `(public)/`: Routes accessible by public users (e.g., `/browse`, `/movie/[id]`, `/payment`).
    *   `admin/`: Protected admin dashboard routes.
    *   `api/`: Internal Next.js API routes (e.g., Stripe webhooks).
*   `components/`: Reusable React components (Navbar, Hero, MovieGrid, etc.).
*   `lib/`: Utility functions and database/API hooks (`database.ts`, `api.ts`).
*   `type/`: TypeScript interfaces and type definitions.

##  Contributing

When contributing to this project, please ensure all new routes use the `app/` directory and components respect the dark-theme aesthetic defined in `globals.css`. Ensure no legacy mock audio/song data is committed to the codebase.
