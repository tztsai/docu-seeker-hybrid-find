# Krishnamurti Wisdom Search Engine

A MongoDB-powered search application for exploring the profound teachings of philosopher Jiddu Krishnamurti through a comprehensive database of transcribed talks, writings, and dialogues spanning over 60 years.

## Features

- **MongoDB Atlas Search Integration**: Utilizes MongoDB's hybrid search for powerful search capabilities
- **Score-Based Highlighting**: Emphasizes the most relevant passages with opacity-based highlighting
- **Persistent Database Connection**: Automatically connects using environment variables
- **Philosophical Theme**: UI designed to reflect the contemplative nature of Krishnamurti's teachings
- **Category Filtering**: Filter teachings by categories like talks, dialogues, and writings
- **Responsive Design**: Works on desktop and mobile devices

## Technology Stack

- **Frontend**: React + TypeScript with shadcn/ui components
- **Backend**: Express.js server with MongoDB Node.js driver
- **Database**: MongoDB Atlas with Atlas Search
- **Styling**: Tailwind CSS
- **Deployment**: Docker support, environment configuration

## Deployment Instructions for Vercel

### Prerequisites

- Node.js 18+ and Python 3.8+
- MongoDB Atlas account with a database containing Krishnamurti's teachings
- A Vercel account

### Deploying to Vercel

1. **Fork or clone this repository**

2. **Set up environment variables in Vercel**

   In the Vercel dashboard for your project, navigate to Settings > Environment Variables and add:

   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority
   MONGODB_DB_NAME=krishnamurti
   MONGODB_COLLECTION=teachings
   ```

3. **Deploy to Vercel**

   Connect your repository to Vercel and deploy. The `vercel.json` file in this repo already contains the necessary configuration for both the frontend and the Python API.

4. **Set up MongoDB Atlas Search index**

   Ensure your MongoDB Atlas cluster has a search index named "jk" on your collection with the following configuration:

   ```json
   {
     "mappings": {
       "dynamic": true,
       "fields": {
         "content": {
           "type": "string"
         },
         "title": {
           "type": "string"
         },
         "tags": {
           "type": "string"
         }
       }
     }
   }
   ```

## Getting Started with Local Development

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
