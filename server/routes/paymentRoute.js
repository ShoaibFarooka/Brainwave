const axios = require("axios");
const qs = require("qs"); // Import qs (for x-www-form-urlencoded)
const router = require("express").Router(); // Import express Router
const bodyParser = require("body-parser"); // Middleware for parsing request bodies
const Subscription = require("../models/subscriptionModel");

// Middleware to parse JSON body data
router.use(bodyParser.json());

const createSubscription = async (user, plan, response) => {
  const paymentDate = new Date();

  try {
    const SubscriptionData = {
      user: user._id,
      activePlan: plan._id,
      paymentStatus: "pending",
      status: "pending",
      paymentHistory: [
        {
          orderId: response.data.order_id,
          plan: plan._id,
          amount: plan.discountedPrice,
          paymentStatus: "pending",
          paymentDate: `${paymentDate.getFullYear()}-${String(
            paymentDate.getMonth() + 1
          ).padStart(2, "0")}-${String(paymentDate.getDate()).padStart(
            2,
            "0"
          )}`, // Set the current date
        },
      ],
    };

    if (response.data.status === "success") {
      const newSubscription = await Subscription.create(SubscriptionData);

      if (newSubscription) {
        return newSubscription; // Return the created subscription
      }
    } else {
      console.log("elc block");
      throw Error("Payment was not successful.");
    }
  } catch (error) {
    console.log(error, "wssss");
    throw error;
  }
};

// POST endpoint for initiating payment
router.post("/", async (req, res) => {
  const url = "https://api.zeno.africa"; // Zeno API base URL

  const { plan, user } = req.body;

  if (!plan || !user) {
    return res.status(400).send("Plan and user data are required.");
  }

  // Data to be sent to Zeno API
  const data = {
    buyer_name: user.name,
    buyer_phone: user.phoneNumber,
    buyer_email: user.email,
    amount: plan.discountedPrice, // Corrected the field spelling
    account_id: "zp89768", // Your Zeno account ID
    secret_key: "your_secret_key", // Replace with your actual secret key
    api_key: "your_api_key", // Replace with your actual API key
    webhook_url: "https://b600-39-52-46-126.ngrok-free.app/api/payment/webhook",
  };

  console.log(data, "data111");

  // const data = {
  //   buyer_name: "william",
  //   buyer_phone: "0689726060",
  //   buyer_email: "william@zeno.co.tz",
  //   amount: 500,
  //   account_id: "zp89768",
  //   secret_key: null, // Replace with your actual secret key
  //   api_key: null, // Replace with your actual API key
  //   webhook_url: "https://b600-39-52-46-126.ngrok-free.app/api/payment/webhook",
  // };

  // Convert data to x-www-form-urlencoded format
  const formattedData = qs.stringify(data);

  try {
    // Send POST request to the Zeno API
    const response = await axios.post(url, formattedData, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    console.log(response.data, "responseresponse");
    if (response.data.status === "success") {
      await createSubscription(user, plan, response);
    }

    res.status(200).send(response.data); // Send the response back to the client
  } catch (error) {
    console.log("Payment Error:", error);
    res
      .status(500)
      .send(error.response ? error.response.data : "Internal Server Error");
  }
});

router.get("/check-payment-status/:userId", async (req, res) => {
  const { userId } = req.params;  

  console.log(userId,"userdata")

  try {
    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    const subscription = await Subscription.findOne({ user: userId }).populate("activePlan");

    if (!subscription) {
      return res.status(404).json({ error: "Subscription not found" });
    }

    const lastPayment = subscription.paymentHistory.slice(-1)[0];

    if (!lastPayment) {
      return res.status(404).json({ error: "No payment history found" });
    }

    return res.status(200).json({
      paymentStatus: lastPayment.paymentStatus,
      paymentDate: lastPayment.paymentDate,
      amount: lastPayment.amount,
      plan: subscription.activePlan || "No active plan found", // Handle no active plan
    });
  } catch (error) {
    console.error("Error fetching payment status:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});


// Webhook handler for payment updates
router.post("/webhook", async (req, res) => {
  try {
    const paymentDate = new Date();

    const formattedDate = `${paymentDate.getFullYear()}-${String(
      paymentDate.getMonth() + 1
    ).padStart(2, "0")}-${String(paymentDate.getDate()).padStart(2, "0")}`; // Set the current date

    const data = JSON.parse(req.body.toString());

    console.log("Webhook Data Received: ", data);

    const { order_id, reference, status } = data;

    if (!order_id || !reference) {
      throw new Error("Invalid webhook payload");
    }

    const subscription = await Subscription.findOne({
      "paymentHistory.orderId": order_id,
    }).populate("paymentHistory.plan");

    if (!subscription) {
      throw new Error(`No subscription found with orderId: ${order_id}`);
    }

    const paymentHistoryIndex = subscription.paymentHistory.findIndex(
      (payment) => payment.orderId === order_id
    );

    if (paymentHistoryIndex === -1) {
      throw new Error(`Payment history not found for orderId: ${order_id}`);
    }

    subscription.paymentHistory[paymentHistoryIndex].referenceId = reference;
    subscription.paymentHistory[paymentHistoryIndex].paymentDate =
      formattedDate;

    if (status === "COMPLETED") {
      const endDate = paymentDate.setMonth(paymentDate.getMonth() +  subscription.paymentHistory[paymentHistoryIndex].plan.duration);
      const formattedEndDate = `${endDate.getFullYear()}-${String(
        endDate.getMonth() + 1
      ).padStart(2, "0")}-${String(endDate.getDate()).padStart(2, "0")}`;
      subscription.paymentHistory[paymentHistoryIndex].paymentStatus = "paid";
      subscription.paymentStatus = "paid";
      subscription.startDate = formattedDate;
      subscription.endDate = formattedEndDate;
      subscription.status = "active";
    } else if (status === "FAILED") {
      subscription.paymentHistory[paymentHistoryIndex].paymentStatus = "failed";
      subscription.paymentStatus = "failed";
      subscription.status = "pending";
    } else {
      subscription.paymentHistory[paymentHistoryIndex].paymentStatus =
        "pending";
      subscription.paymentStatus = "pending";
      subscription.status = "pending";
    }

    await subscription.save();

    console.log("Subscription updated successfully:", subscription);

    res.status(200).send("Webhook received successfully");
  } catch (error) {
    console.error("Webhook Error:", error.message);
    res.status(500).send("Webhook processing failed");
  }
});

module.exports = router;
