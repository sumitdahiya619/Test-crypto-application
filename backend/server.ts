import express from 'express';
import { MongoClient, Collection } from 'mongodb';
import cors from 'cors';
import { fetchStockPrice } from './utils/fetchStockPrice';

const app = express();
app.use(cors());
app.use(express.json);

const PORT = 3000
const MONGO_URI = 'mongodb://localhost:27017/stock-prices';

let client : MongoClient;
let stockPriceCollection: Collection;

const connectToDatabase = async () => {
    client = new MongoClient(MONGO_URI);
    await client.connect();
    stockPriceCollection = client.db().collection('stock-prices');
    console.log('MongoDB connected');
  };

// const stocks = ['GOOG', 'BTC', 'AAPL', 'ETH', 'TSLA'];
const stocks = ['bitcoin'];

const pollData = async () => {
    for(const stock of stocks) {
        try {
            const priceData = await fetchStockPrice(stock);
            await stockPriceCollection.insertOne({ stock, price: priceData.price, timestamp: priceData.timestamp });
        } catch (error) {
            console.log(`Failed to fetch or store data for ${stock}: `, error);
        }
    }
}

setInterval(pollData, 20000);

app.get('/api/stocks/:symbol', async (req, res) => {
    const { symbol } = req.params;
    try {
        const data = await stockPriceCollection.find({ stock: symbol })
            .sort({ timeStamp: -1 })
            .limit(20)
            .toArray();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch data' });
    }
})

app.listen(PORT, () => {
    connectToDatabase()
        .then(() => {
            console.log(`Server is running on port: ${PORT}`);
        })
        .catch((error) => {
            console.error('Failed to connect to the database: ', error);
        })
    console.log(`Server is running on Port: ${PORT}`);
});