import React from 'react';
import AnimatedSection from '../Common/AnimatedSection';
import './Reviews.css';

const reviewsData = [
    { name: "Jihyeon Won", handle: "wonji", review: "Non-IT people can finally build this amazing landing page on their own (like me) 😍 Truly brilliant idea to save lots of time and money for busy solo entrepreneurs!", color: "bg-red-400" },
    { name: "Marie S.", handle: "mserro27", review: "What an amazing service! I just tried it and I love the output. It is a great tool for early stage ideas and brainstorming - LOVE THIS SO MUCH!", color: "bg-green-400" },
    { name: "Puli Paws", handle: "pulipaws", review: "The first impression was #WOW. It's a bit like a business card boosted with AI.", color: "bg-teal-400" },
    { name: "Sveta Bay", handle: "basv", review: "That's a game-changer for busy Founders! Makes it much easier to test the hypothesis and experiment with landing pages.", color: "bg-pink-400" },
    { name: "Vera Mur", handle: "vera_mur", review: "This is such a great tool for anyone who wants to create unique branding and a landing page with ease.", color: "bg-sky-400" },
    { name: "Azfar Ahmed", handle: "azfar_ahmed", review: "Awesome, really useful product for freelancers and digital marketers. Can quickly deliver some stunning landing pages for their clients in quick time.", color: "bg-yellow-400" },
    { name: "Crypto Boba", handle: "crypto_boba", review: "I used it for 3 months now, and it does bring the convenience of building a nice looking landing page easier. It operates faster than the conventional WordPress.", color: "bg-purple-400" },
    { name: "Karan Chadda", handle: "karan_chadda", review: "MakeLanding is a game-changer for landing page design. The ability to make beautiful landing pages in seconds with AI is truly remarkable", color: "bg-orange-400" },
    { name: "Nick Carter", handle: "masteroffailing", review: "Really cool and made some good stuff!", color: "bg-indigo-400" },
    { name: "Dan Mindru", handle: "dan_mindru", review: "This is absolutely incredible 🤯 The future is here.", color: "bg-gray-800" },
    { name: "Phil", handle: "PhilThe3rd", review: "This is sick, the examples are 10/10! I've seen many attempts at this but yours has the best color consistency and quality by far :)", color: "bg-blue-400" },
];

const ReviewCard = ({ name, handle, review, color }) => (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 flex flex-col w-full shrink-0">
        <p className="text-medium-text flex-grow">"{review}"</p>
        <div className="mt-6 flex items-center">
            <div className={`w-10 h-10 rounded-full ${color} flex items-center justify-center text-white font-bold mr-3 shrink-0`}>{name.charAt(0)}</div>
            <div>
                <p className="font-bold text-sm text-dark-text">{name}</p><p className="text-xs text-gray-500">@{handle}</p>
            </div>
        </div>
    </div>
);

const ReviewColumn = ({ reviews, animationStyle, className = '' }) => (
    <div className={`flex flex-col gap-6 ${className}`}>
        <div className="scroller-inner" style={animationStyle}>
            {reviews.map((review, index) => <ReviewCard key={`${review.handle}-${index}`} {...review} />)}
            {reviews.map((review, index) => <ReviewCard key={`${review.handle}-${index}-duplicate`} {...review} />)}
        </div>
    </div>
);

const Reviews = () => {
    const column1 = reviewsData.slice(0, 3);
    const column2 = reviewsData.slice(3, 6);
    const column3 = reviewsData.slice(6, 9);
    const column4 = [...reviewsData.slice(9, 12), reviewsData[0]];

    return (
        <AnimatedSection id="reviews" bg="bg-light-bg">
            <p className="text-center font-semibold text-brand-green mb-2">Reviews</p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-center mb-4">7909 landing pages already created!</h2>
            <p className="text-center text-lg text-medium-text mb-12 max-w-2xl mx-auto">You're in good company. Here's what our beautiful customers have to say about us.</p>
            
            <div className="relative max-w-7xl mx-auto h-[600px] overflow-hidden scroller-container">
                <div className="absolute inset-0 flex justify-center gap-6">
                    <ReviewColumn 
                        reviews={column1} 
                        animationStyle={{ animation: "scroll-up 40s linear infinite" }}
                        className="w-full sm:w-1/2 md:w-1/3 lg:w-1/4"
                    />
                     <ReviewColumn 
                        reviews={column2} 
                        animationStyle={{ animation: "scroll-down 45s linear infinite" }}
                        className="hidden sm:flex sm:w-1/2 md:w-1/3 lg:w-1/4"
                    />
                    <ReviewColumn 
                        reviews={column3} 
                        animationStyle={{ animation: "scroll-up 35s linear infinite" }}
                        className="hidden lg:flex lg:w-1/4"
                    />
                    <ReviewColumn 
                        reviews={column4} 
                        animationStyle={{ animation: "scroll-down 50s linear infinite" }}
                        className="hidden xl:flex xl:w-1/4"
                    />
                </div>
            </div>
        </AnimatedSection>
    );
};

export default Reviews;