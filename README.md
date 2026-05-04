# 🍽️ Food Mood Finder

## Overview
Food Mood Finder helps users discover nearby restaurants based on their **mood, budget, distance, and preferences**.

---

## How It Works

1. User selects mood, budget, distance, and preferences  
2. App fetches data from Google Places API  
3. Restaurants are ranked using mood + distance + budget  
4. Results are displayed with explanations and links  

---

## Tech Stack

**Frontend**
- React (Vite)
- CSS

**Backend**
- Node.js
- Express

**APIs**
- Google Places API
- OpenStreetMap
- Yelp API

---

## Project Structure

```
food-mood-finder/
├── client/
├── server/
├── .env
```

---

## Setup Instructions

### 1. Clone the repo
```
git clone https://github.com/your-username/food-mood-finder.git
cd food-mood-finder
```

### 2. Install dependencies

**Frontend**
```
cd client
npm install
```

**Backend**
```
cd ../server
npm install
```

### 3. Add environment variables

Create a `.env` file in the root directory:

```
GOOGLE_PLACES_API_KEY=your_api_key_here
YELP_API_KEY=your_api_key_here
```

### 4. Run the app

**Backend**
```
cd server
npm run dev
```

**Frontend**
```
cd client
npm run dev
```

---

## Limitations

- Uses Google `priceLevel` (not exact prices)
- Dietary filters are not strictly enforced
- Some API data may be incomplete

---

## Future Improvements

- Natural language input (NLP)
- Smarter recommendation system
- Better dietary filtering
- Improved UI/UX

---

## Authors
- Vaishnavi Panchal, Alisha Pol
