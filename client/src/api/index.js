import axios from 'axios';

const API = axios.create({ baseURL: 'https://govtlinks.onrender.com/api' });

export default API;

export const fetchItems = () => API.get('/items');
export const syncData = () => API.get('/sync');
