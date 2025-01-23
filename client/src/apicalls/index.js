import axios from 'axios';

const axiosInstance = axios.create({
    // baseURL: 'https://backend-r0tz.onrender.com' ,
    baseURL: 'https://xsj9qxvz-5000.inc1.devtunnels.ms/' ,
    headers: {
        Authorization : `Bearer ${localStorage.getItem('token')}`
    }
});

export default axiosInstance;