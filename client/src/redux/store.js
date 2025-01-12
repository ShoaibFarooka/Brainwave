import usersSlice from "./usersSlice";
import { configureStore } from "@reduxjs/toolkit";
import loaderSlice from "./loaderSlice";
import subscriptionDataSlice from "./paymentSlice";

const store = configureStore({
  reducer: {
    users: usersSlice,
    loader: loaderSlice,
    subscription: subscriptionDataSlice,
  },
});

export default store;
