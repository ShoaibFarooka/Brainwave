const { default: axiosInstance } = require(".");

export const addPayment = async (payload) => {
  try {
    const response = await axiosInstance.post("/api/payment", payload);
    return response.data;
  } catch (error) {
    return error.response.data;
  }
};


export const checkPaymentStatus = async ({userId}) => {
  try {
    const response = await axiosInstance.get(`/api/payment/check-payment-status/`+userId,);
    return response.data;
  } catch (error) {
    return error.response.data;
  }
};