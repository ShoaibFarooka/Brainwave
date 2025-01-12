import React, { useEffect, useState } from "react";
import { getPlans } from "../../../apicalls/plans";
import "./Plans.css";
import ConfirmModal from "./Components/ConfirmModal";
import WaitingModal from "./Components/WaitingModal";
import { addPayment, checkPaymentStatus } from "../../../apicalls/payment";
import { useDispatch, useSelector } from "react-redux";
import { getUserInfo } from "../../../apicalls/users";
import { SetSubscriptionData } from "../../../redux/paymentSlice";

const Plans = () => {
    const { user } = useSelector((state) => state.users);
    const [plans, setPlans] = useState([]);
    const [isModalOpen, setModalOpen] = useState(false);
    const [isWaitingModalOpen, setWaitingModalOpen] = useState(false);
    const { subscriptionData } = useSelector((state) => state.subscription);
    const dispatch = useDispatch()

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
                user: userdata.data,
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


    useEffect(() => {
        if (user?.paymentRequired === true && subscriptionData?.paymentStatus === "pending") {
            setWaitingModalOpen(true);
            // dispatch(SetSubscriptionData({ paymentStatus: "refetch" }))
        }
    }, [user, subscriptionData]);


    console.log(subscriptionData, "subscriptionData")

    return (
        <div>
            {!user?.paymentRequired ? <div class="no-plan-required">
  <div class="no-plan-content">
    <h2>No Plan Required</h2>
    <p>You don't need to buy any plan to access the system. Enjoy all the features with no additional cost!</p>
  </div>
</div> : subscriptionData?.paymentStatus !== "paid" ? <div className="plans-container">
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
            </div> :
                <div className="subscription-details">
                    <h1 className="plan-title">{subscriptionData.plan.title}</h1>

                    <svg
                        width="64px"
                        height="64px"
                        viewBox="-3.2 -3.2 38.40 38.40"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="#10B981"
                        stroke="#253864"
                        transform="matrix(1, 0, 0, 1, 0, 0)"
                    >
                        <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                        <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round" stroke="#CCCCCC" strokeWidth="0.064"></g>
                        <g id="SVGRepo_iconCarrier">
                            <path
                                d="m16 0c8.836556 0 16 7.163444 16 16s-7.163444 16-16 16-16-7.163444-16-16 7.163444-16 16-16zm5.7279221 11-7.0710679 7.0710678-4.2426406-4.2426407-1.4142136 1.4142136 5.6568542 5.6568542 8.4852814-8.4852813z"
                                fill="#202327"
                                fillRule="evenodd"
                            ></path>
                        </g>
                    </svg>

                    <p className="plan-description">{subscriptionData?.plan?.subscriptionData}</p>
                    <p className="plan-dates">Start Date: {subscriptionData.startDate}</p>
                    <p className="plan-dates">End Date: {subscriptionData.endDate}</p>
                </div>

            }

            <WaitingModal
                isOpen={isWaitingModalOpen}
                onClose={() => setWaitingModalOpen(false)}
                timeoutDuration={300} // Timer duration in seconds
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
