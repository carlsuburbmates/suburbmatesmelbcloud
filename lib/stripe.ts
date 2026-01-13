import 'server-only';
import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is missing. Please set it in your .env file.');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2023-10-16', // Hardcoded to match verified version or latest safe default.
    appInfo: {
        name: 'SuburbMates',
        url: 'https://suburbmates.com.au',
    },
});
