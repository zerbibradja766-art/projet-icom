
console.log("MY UPDATED SWIPER.JS LOADED");



function initHeroSwiper() {

    const heroSlider = document.querySelector(".slide-swp");

    if (!heroSlider) {
        console.warn("Hero slider not found!");
        return;
    }

    if (heroSlider.swiper) {
        return;
    }

    const heroSlides = heroSlider.querySelectorAll(".swiper-slide");

    console.log("HERO SLIDER:", {
        slides: heroSlides.length,
        loop: false
    });

    new Swiper(heroSlider, {

        slidesPerView: 1,
        slidesPerGroup: 1,
        spaceBetween: 0,

        pagination: {
            el: heroSlider.querySelector(".swiper-pagination"),
            dynamicBullets: true,
            clickable: true
        },

        autoplay: heroSlides.length > 1 ? {
            delay: 2500,
            disableOnInteraction: false,
            pauseOnMouseEnter: true
        } : false,

        loop: false,

        observer: true,
        observeParents: true

    });

}

window.initProductSwipers = function () {

    if (typeof Swiper === "undefined") {
        console.error("Swiper library is not loaded!");
        return;
    }

    document.querySelectorAll(".slide_product").forEach(function (slider) {

        const slidesCount =
            slider.querySelectorAll(".swiper-slide").length;

        if (slidesCount === 0) {
            return;
        }

        if (slider.swiper) {
            return;
        }

        const parent = slider.parentElement;

        const nextButton = parent
            ? parent.querySelector(".swiper-button-next")
            : null;

        const prevButton = parent
            ? parent.querySelector(".swiper-button-prev")
            : null;

        console.log("PRODUCT SLIDER:", {
            element: slider.id || slider.className,
            slides: slidesCount,
            loop: false
        });

        new Swiper(slider, {

            slidesPerView: 2,
            slidesPerGroup: 1,
            spaceBetween: 10,

            speed: 600,

            autoplay: slidesCount > 1 ? {
                delay: 2500,
                disableOnInteraction: false,
                pauseOnMouseEnter: true
            } : false,

            navigation: {
                nextEl: nextButton,
                prevEl: prevButton
            },

            loop: false,

            watchOverflow: true,
            observer: true,
            observeParents: true,

            breakpoints: {

                0: {
                    slidesPerView: 2,
                    spaceBetween: 10
                },

                700: {
                    slidesPerView: 3,
                    spaceBetween: 15
                },

                1000: {
                    slidesPerView: 4,
                    spaceBetween: 20
                },

                1200: {
                    slidesPerView: 5,
                    spaceBetween: 20
                }

            }

        });

    });

};

document.addEventListener("DOMContentLoaded", function () {

    if (typeof Swiper === "undefined") {
        console.error("Swiper library is missing!");
        return;
    }

    initHeroSwiper();

    console.log("Hero Swiper initialized!");

});
