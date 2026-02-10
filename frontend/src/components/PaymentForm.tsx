
import { useState, useEffect } from 'react';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useCart } from '@/lib/cart';

interface PaymentFormProps {
    onSuccess: () => void;
    shippingAddress: any;
    userInfo: any;
}

export const PaymentForm = ({ onSuccess, shippingAddress, userInfo }: PaymentFormProps) => {
    const stripe = useStripe();
    const elements = useElements();
    const { clearCart, items } = useCart();

    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        if (!stripe || !elements) {
            // Stripe.js has not yet loaded.
            return;
        }

        setIsProcessing(true);

        const { error, paymentIntent } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                return_url: `${window.location.origin}/checkout`, // Or a dedicated success page
            },
            redirect: 'if_required', // Avoid redirect if not necessary (e.g., for card payments)
        });

        if (error) {
            setErrorMessage(error.message || 'An unexpected error occurred.');
            setIsProcessing(false);
        } else if (paymentIntent && paymentIntent.status === 'succeeded') {
            // Payment successful!
            // Here you would typically call your backend API to finalize the order record
            // But we will handle the order creation logic here or in the parent component

            try {
                await createOrder(paymentIntent);
                onSuccess();
            } catch (err: any) {
                setErrorMessage(err.message || 'Payment succeeded but order creation failed.');
            }

            setIsProcessing(false);
        } else {
            // Other statuses (should be handled by returns_url if redirect happened)
            setIsProcessing(false);
        }
    };


    // Helper to calculate weight in KG (same as other files)
    const getWeightInKg = (weight: string): number => {
        const w = weight.toLowerCase();
        if (w.includes('kg')) {
            return parseFloat(w.replace('kg', ''));
        } else if (w.includes('g')) {
            return parseFloat(w.replace('g', '')) / 1000;
        }
        return 0.2; // Default fallback 200g
    };

    const calculateDeliveryFee = (cartItems: any[]) => {
        let totalWeight = 0;
        for (const item of cartItems) {
            if (item.product && item.product.weight) {
                totalWeight += getWeightInKg(item.product.weight) * item.quantity;
            } else {
                totalWeight += 0.2 * item.quantity;
            }
        }

        if (totalWeight <= 1) {
            return 350;
        } else {
            const extraWeight = Math.ceil(totalWeight - 1);
            return 350 + (extraWeight * 80);
        }
    };

    const createOrder = async (paymentIntent: any) => {
        // Create the final order in the database
        const token = localStorage.getItem('userInfo')
            ? JSON.parse(localStorage.getItem('userInfo')!).token
            : null;

        // Map items to match backend Schema requirements
        const formattedItems = items.map(item => ({
            product: item.product.id,
            name: item.product.name,
            imageUrl: item.product.image,
            price: item.product.price,
            qty: item.quantity
        }));

        const itemsPrice = items.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
        const shippingPrice = calculateDeliveryFee(items);
        const totalPrice = itemsPrice + shippingPrice;

        const orderData = {
            orderItems: formattedItems,
            shippingAddress: shippingAddress,
            paymentMethod: 'Stripe',
            itemsPrice: itemsPrice,
            taxPrice: 0,
            shippingPrice: shippingPrice,
            totalPrice: totalPrice,
        };

        // 1. Create Order
        const response = await fetch('http://localhost:5000/api/orders', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(orderData),
        });

        if (!response.ok) {
            throw new Error('Failed to create order');
        }

        const createdOrder = await response.json();

        // 2. Mark as Paid
        const paymentResult = {
            id: paymentIntent.id,
            status: paymentIntent.status,
            update_time: String(paymentIntent.created),
            email_address: userInfo.email,
            payer: { email_address: userInfo.email } // match controller expectation
        };

        const payResponse = await fetch(`http://localhost:5000/api/orders/${createdOrder._id}/pay`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(paymentResult),
        });

        if (!payResponse.ok) {
            console.error('Failed to mark order as paid');
            // We don't throw here to avoid blocking the success screen, but log it
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <PaymentElement />

            {errorMessage && (
                <div className="text-red-500 text-sm mt-2">{errorMessage}</div>
            )}

            <div className="flex gap-4 mt-6">
                <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => window.location.reload()} // Or handle back appropriately
                    disabled={isProcessing}
                >
                    Back
                </Button>
                <Button
                    disabled={!stripe || isProcessing}
                    className="flex-1"
                    type="submit"
                >
                    {isProcessing ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Processing...
                        </>
                    ) : (
                        "Pay Now"
                    )}
                </Button>
            </div>
        </form>
    );
};
