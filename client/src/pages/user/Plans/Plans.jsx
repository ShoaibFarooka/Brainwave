import React, { useEffect, useState } from "react";
import { getPlans } from "../../../apicalls/plans";
import "./Plans.css";
import ConfirmModal from "./Components/ConfirmModal";
import WaitingModal from "./Components/WaitingModal";
import { addPayment, checkPaymentStatus } from "../../../apicalls/payment";
import { useSelector } from "react-redux";
import { getUserInfo } from "../../../apicalls/users";

const Plans = () => {
    const [plans, setPlans] = useState([]);
    const [isModalOpen, setModalOpen] = useState(false);
    const [isWaitingModalOpen, setWaitingModalOpen] = useState(false);


    useEffect(() => {
        const fetchPlans = async () => {
            try {
                const response = await getPlans();
                setPlans(response);
            } catch (error) {
                console.error("Error fetching plans:", error);
            }
        };

        fetchPlans();
    }, []);

    const transactionDetails = {
        amount: "-1.23000000",
        currency: "TSTRAT",
        duration: "text",
    };


    const handlePaymentStart = async (plan) => {

        try {
            const userdata = await getUserInfo();

            const transactionDetails = {
                user: userdata.data, // Use user details
                plan
            };

            const response = await addPayment(transactionDetails);

            localStorage.setItem("order_id", response.order_id);

        } catch (error) {
            console.error("Error processing payment:", error);
        } finally {
            setWaitingModalOpen(true);
        }
    };

    const waitingForPayment = async () => {
        try {
            const orderId = localStorage.getItem("order_id");

            if (!orderId) {
                throw new Error("Order ID not found in local storage.");
            }

            console.log(orderId)

            const payload = {
                orderId: orderId
            }

            const data = await checkPaymentStatus(payload);

            console.log("Payment Status:", data);

        } catch (error) {
            console.log("Error checking payment status:", error);
        }
    };

    // useEffect(() => {
    //     waitingForPayment()
    // }, [])


    return (
        <div className="plans-container">
            {plans.map((plan) => (
                <div
                    key={plan._id}
                    className={`plan-card ${plan.title === "Standard Membership" ? "basic" : ""}`}
                >
                    {plan.title === "Standard Membership" && (
                        <div className="most-popular-label">MOST POPULAR</div>
                    )}

                    <h2 className="plan-title">{plan.title}</h2>
                    <p className="plan-actual-price">
                        Rs. {plan.actualPrice.toLocaleString()}
                    </p>
                    <p className="plan-discounted-price">
                        Rs. {plan.discountedPrice.toLocaleString()}
                    </p>
                    <span className="plan-discount-tag">
                        {plan.discountPercentage}% OFF
                    </span>
                    <p className="plan-renewal-info">
                        For {plan?.features[0]}
                    </p>
                    <button className="plan-button"
                        // onClick={() => setModalOpen(true)}
                        onClick={() => handlePaymentStart(plan)}
                    >Choose Plan</button>
                    <ul className="plan-features">
                        {plan.features.map((feature, index) => (
                            <li key={index} className="plan-feature">
                                <span className="plan-feature-icon">✔</span>
                                {feature}
                            </li>
                        ))}
                    </ul>
                </div>
            ))}

            <WaitingModal
                isOpen={isWaitingModalOpen}
                onClose={() => setWaitingModalOpen(false)}
                timeoutDuration={30} // Timer duration in seconds
            />

            <ConfirmModal
                isOpen={isModalOpen}
                onClose={() => setModalOpen(false)}
                transaction={transactionDetails}
            />
        </div>
    );
};

export default Plans;
