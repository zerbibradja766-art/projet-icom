
document.addEventListener("DOMContentLoaded", async function () {

    let cart = [];

    try {
        cart = JSON.parse(localStorage.getItem("cart")) || [];

        if (!Array.isArray(cart)) {
            cart = [];
        }

    } catch (error) {
        console.error("Cart data error:", error);
        cart = [];
    }
    const swiper_items_sale = document.getElementById("swiper_items_sale");
    const swiper_elctronics = document.getElementById("swiper_elctronics");
    const swiper_appliances = document.getElementById("swiper_appliances");
    const swiper_mobiles = document.getElementById("swiper_mobiles");
    function createProductCard(product) {

        const isInCart = cart.some(
            cartItem => String(cartItem.id) === String(product.id)
        );

        const price = Number(product.price) || 0;
        const oldPriceValue = Number(product.old_price) || 0;

        const hasOldPrice = oldPriceValue > price && price > 0;

        const percent_disc = hasOldPrice
            ? Math.floor(
                ((oldPriceValue - price) / oldPriceValue) * 100
            )
            : 0;

        const saleBadge = hasOldPrice
            ? `<span class="sale_present">%${percent_disc}</span>`
            : "";

        const oldPrice = hasOldPrice
            ? `<p class="old_price">$${oldPriceValue}</p>`
            : "";

        return `
            <div class="swiper-slide product">

                ${saleBadge}

                <div class="img_product">
                    <a href="#">
                        <img
                            src="${product.img || ""}"
                            alt="${product.name || "Product"}"
                            loading="lazy"
                        >
                    </a>
                </div>

                <div class="stars">
                    <i class="fa-solid fa-star"></i>
                    <i class="fa-solid fa-star"></i>
                    <i class="fa-solid fa-star"></i>
                    <i class="fa-solid fa-star"></i>
                    <i class="fa-solid fa-star"></i>
                </div>

                <p class="name_product">
                    <a href="#">${product.name || "Unnamed product"}</a>
                </p>

                <div class="price">
                    <p>
                        <span>$${price}</span>
                    </p>

                    ${oldPrice}
                </div>

                <div class="icons">

                    <span
                        class="btn_add_cart ${isInCart ? "active" : ""}"
                        data-id="${product.id}"
                    >
                        <i class="fa-solid fa-cart-shopping"></i>
                        ${isInCart ? "Item in cart" : "Add to cart"}
                    </span>

                    <span class="icon_product">
                        <i class="fa-regular fa-heart"></i>
                    </span>

                </div>

            </div>
        `;
    }

    try {

        const response = await fetch("products.json");

        if (!response.ok) {
            throw new Error("Could not load products.json");
        }

        const data = await response.json();

        if (!Array.isArray(data)) {
            throw new Error("Products data must be an array.");
        }
        if (swiper_items_sale) swiper_items_sale.innerHTML = "";
        if (swiper_elctronics) swiper_elctronics.innerHTML = "";
        if (swiper_appliances) swiper_appliances.innerHTML = "";
        if (swiper_mobiles) swiper_mobiles.innerHTML = "";
        data.forEach(product => {

            const category = String(
                product.category || product.catetory || ""
            ).toLowerCase().trim();
            if (
                Number(product.old_price) > Number(product.price) &&
                swiper_items_sale
            ) {
                swiper_items_sale.insertAdjacentHTML(
                    "beforeend",
                    createProductCard(product)
                );
            }
            if (
                category === "accessories" &&
                swiper_elctronics
            ) {
                swiper_elctronics.insertAdjacentHTML(
                    "beforeend",
                    createProductCard(product)
                );
            }
            if (
                category === "sports" &&
                swiper_appliances
            ) {
                swiper_appliances.insertAdjacentHTML(
                    "beforeend",
                    createProductCard(product)
                );
            }
            if (
                (category === "equipement" ||
                 category === "equipment") &&
                swiper_mobiles
            ) {
                swiper_mobiles.insertAdjacentHTML(
                    "beforeend",
                    createProductCard(product)
                );
            }

        });

        if (typeof window.initProductSwipers === "function") {
            window.initProductSwipers();
        } else {

            console.error("initProductSwipers function not found!");

        }


        console.log("Products loaded successfully!");
        console.log("Total products:", data.length);


    } catch (error) {

        console.error("Products loading error:", error);

    }

});
