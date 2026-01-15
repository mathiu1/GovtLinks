import axios from 'axios';

const API = axios.create({
    baseURL: 'https://govtlinks.onrender.com/api',
    withCredentials: true
});

// Interceptor to handle 401/403 (Invalid Token) -> Auto Logout
API.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
            // Check if we are not already on login/register pages to avoid loops
            if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
                // Clear local storage markers
                localStorage.removeItem('token'); // or whatever marker used client side
                // dispatch logout event or force reload
                window.location.href = '/login?expired=true';
            }
        }
        return Promise.reject(error);
    }
);

export default API;

// Cache for storing pre-fetched detail items
const itemCache = new Map();

export const fetchItems = () => API.get('/items');

export const fetchItemById = async (id) => {
    if (itemCache.has(id)) {
        return Promise.resolve({ data: itemCache.get(id) });
    }
    const response = await API.get(`/items/${id}`);
    itemCache.set(id, response.data);
    return response;
};

export const prefetchItem = async (id) => {
    if (!itemCache.has(id)) {
        try {
            const response = await API.get(`/items/${id}`);
            itemCache.set(id, response.data);
        } catch (err) {
            console.warn("Prefetch failed", err);
        }
    }
};

export const syncData = () => API.get('/sync');
