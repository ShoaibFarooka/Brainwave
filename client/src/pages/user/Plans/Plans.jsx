import React, { useEffect, useState } from "react";
import { getPlans } from "../../../apicalls/plans";
import "./Plans.css";
import ConfirmModal from "./Components/ConfirmModal";
import WaitingModal from "./Components/WaitingModal";

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


    const handlePaymentStart = () => {
        setWaitingModalOpen(true);
    };

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
                        Rs. {plan.discuntedPrice.toLocaleString()}
                    </p>
                    <span className="plan-discount-tag">
                        {plan.discuntPercentage}% OFF
                    </span>
                    <p className="plan-renewal-info">
                        For {plan?.features[0]}
                    </p>
                    <button className="plan-button" 
                    // onClick={() => setModalOpen(true)}
                    onClick={handlePaymentStart}
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
