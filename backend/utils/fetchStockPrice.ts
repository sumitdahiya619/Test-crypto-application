import axios from "axios";

export const fetchStockPrice = async (symbol: string) => {
    const apiKey = 'CG-8LdJwbToLj63tLQndgry8LZx';
    const url = `https://api.coingecko.com/api/v3/simple/price?x_cg_demo_api_key=${apiKey}&ids=${symbol}&vs_currencies=usd`;
    const response = await axios.get(url);
    const price = response.data[symbol].usd;
    const timestamp = new Date();
    return { price, timestamp };
};