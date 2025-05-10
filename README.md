# MongoDB Search Application

A production-ready web application for searching documents using MongoDB Atlas Search capabilities. This application demonstrates how to implement hybrid search combining keyword-based and semantic search techniques.

![MongoDB Search](https://mongodb-devrel-media.s3.amazonaws.com/social/mongodb-search-banner.png)

## Features

- **Powerful Search**: Utilize MongoDB's hybrid search capabilities combining traditional text search with vector-based semantic search
- **Real-time Results**: Get immediate search results with query highlighting
- **Category Filtering**: Filter search results by document categories
- **Document Details**: View complete document information with rich formatting
- **Responsive Design**: Works on desktop and mobile devices
- **Production Ready**: Includes server-side rendering, error handling, and deployment configurations

## Technology Stack

- **Frontend**: React + TypeScript with shadcn/ui components
- **Backend**: Express.js server with MongoDB Node.js driver
- **Database**: MongoDB Atlas with Atlas Search
- **Styling**: Tailwind CSS
- **Deployment**: Docker support, environment configuration

## Getting Started

### Prerequisites

- Node.js 18+ or Docker
- MongoDB Atlas account (free tier or above)

### Quick Start

1. Clone the repository:

```sh
git clone https://github.com/yourusername/mongodb-search.git
cd mongodb-search
```

2. Install dependencies:

```sh
npm install
```

3. Set up environment variables:

```sh
cp .env.example .env
```

Edit the `.env` file with your MongoDB Atlas connection string and other settings.

4. Run the development server:

```sh
npm run dev:full
```

5. Open [http://localhost:5173](http://localhost:5173) in your browser

### MongoDB Atlas Setup

1. Create a MongoDB Atlas account and cluster
2. Set up Atlas Search for your collection (see `DEPLOYMENT.md` for detailed instructions)
3. Create a database user and note the connection string

## Deployment

See `DEPLOYMENT.md` for detailed deployment instructions, including:

- Local deployment
- Docker deployment
- Cloud hosting options (Heroku, Vercel, etc.)

## Documentation

- [MongoDB Atlas Search Documentation](https://www.mongodb.com/docs/atlas/atlas-search/)
- [Vector Search Tutorial](https://www.mongodb.com/docs/atlas/atlas-vector-search/)

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/9e170e3f-4f1f-452b-98fb-75386ffdee4f) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
