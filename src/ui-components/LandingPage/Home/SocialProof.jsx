import React from "react";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/autoplay";
import logo1 from "../../../assets/img/slider/h2.png";
import logo2 from "../../../assets/img/slider/h3.png";
import logo3 from "../../../assets/img/slider/h4.png";
import logo4 from "../../../assets/img/slider/hubspot.jpg";
import logo5 from "../../../assets/img/slider/incubix.webp";
import logo6 from "../../../assets/img/slider/jsb.png";
import logo7 from "../../../assets/img/slider/madscience-earth.png";
import logo8 from "../../../assets/img/slider/download-removebg-preview.png";
import logo9 from "../../../assets/img/slider/download1.png";

const logos = [
  { src: logo1, alt: "Logo 1" },
  { src: logo2, alt: "Logo 2" },
  { src: logo3, alt: "Logo 3" },
  { src: logo4, alt: "Hubspot" },
  { src: logo5, alt: "Incubix" },
  { src: logo6, alt: "JSB" },
  { src: logo7, alt: "Madscience Earth" },
  { src: logo8, alt: "Logo 8" },
  { src: logo9, alt: "logo 9" },
];

const SocialProof = () => {
  return (
    <div className="py-12 bg-white">
      <div className="container mx-auto px-6 text-center">
        <p className="text-center font-semibold text-brand-green mb-2">
          TRUSTED LEADING BRANDS{" "}
        </p>
        <h2 className="text-3xl md:text-4xl font-extrabold text-center mb-16">
          You're In Good Company
        </h2>
        <Swiper
          modules={[Autoplay]}
          spaceBetween={60}
          slidesPerView={"auto"}
          loop={true}
          autoplay={{
            delay: 0,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
          }}
          speed={5000}
          className="logo-swiper"
        >
          {logos.map((logo, index) => (
            <SwiperSlide key={index} className="!w-auto">
              <img
                src={logo.src}
                alt={logo.alt}
                className="h-12 w-auto object-contain hover:opacity-60 hover:filter grayscale transition-all duration-300 opacity-100 filter-none"
              />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
};

export default SocialProof;
