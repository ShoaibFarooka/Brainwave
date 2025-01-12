import usersSlice from "./usersSlice";
import { configureStore } from "@reduxjs/toolkit";
import loaderSlice from "./loaderSlice";
import paymentsSlice from "./paymentSlice";

const store = configureStore({
  reducer: {
    users: usersSlice,
    loader: loaderSlice,
    payments: paymentsSlice,
  },
});

export default store;
