
let productsCache = null;

async function getProducts() {

    if (productsCache) {
        return productsCache;
    }

    try {
        const response = await fetch("products.json");

        if (!response.ok) {
            throw new Error("Products file not found");
        }

        productsCache = await response.json();

        return productsCache;

    } catch (error) {
        console.error("Products error:", error);
        return [];
    }
}

function getCart() {

    try {
        return JSON.parse(localStorage.getItem("cart")) || [];

    } catch (error) {
        console.error("Cart data error:", error);
        return [];
    }
}


function saveCart(cart) {

    localStorage.setItem("cart", JSON.stringify(cart));
}
function Open_Categ_list() {

    const categoryList = document.querySelector(".category_nav_list");

    if (categoryList) {
        categoryList.classList.toggle("active");
    }
}


function open_Menu() {
    const navLinks = document.querySelector(".nav_links");
    if (navLinks) {
        navLinks.classList.toggle("active");
    }
}


function open_close_cart() {
    const cart = document.querySelector(".cart");
    if (cart) {
        cart.classList.toggle("active");
    }
}

function addToCart(product) {
    if (!product) {
        console.error("Product not found!");
        return;
    }

    const cart = getCart();

    const existingProduct = cart.find(
        item => String(item.id) === String(product.id)
    );

    if (existingProduct) {

        existingProduct.quantity =
            (Number(existingProduct.quantity) || 1) + 1;

    } else {

        cart.push({
            ...product,
            quantity: 1
        });
    }

    saveCart(cart);
    updateCart();
}



function updateButtonsState() {
    const cart = getCart();
    const buttons = document.querySelectorAll(".btn_add_cart");
    buttons.forEach(button => {
        const productId = button.dataset.id;
        const isInCart = cart.some(
            item => String(item.id) === String(productId)
        );

        if (isInCart) {

            button.classList.add("active");

            button.innerHTML = `
                <i class="fa-solid fa-cart-shopping"></i>
                Item in cart
            `;

        } else {

            button.classList.remove("active");

            button.innerHTML = `
                <i class="fa-solid fa-cart-shopping"></i>
                Add to cart
            `;
        }

    });
}


function updateCart() {
    const cartItemsContainer = document.getElementById("cart_items");
    if (!cartItemsContainer) {
        updateButtonsState();
        return;
    }

    const cart = getCart();

    let totalPrice = 0;
    let totalCount = 0;

    cartItemsContainer.innerHTML = "";

    cart.forEach((item, index) => {

        const quantity = Math.max(1, Number(item.quantity) || 1);
        const price = Number(item.price) || 0;

        const totalPriceItem = price * quantity;

        totalPrice += totalPriceItem;
        totalCount += quantity;

        cartItemsContainer.innerHTML += `
            <div class="item_cart">

                <img src="${item.img}" alt="${item.name || "Product"}">

                <div class="content">

                    <h4>${item.name || "Product"}</h4>

                    <p class="price_cart">
                        $${totalPriceItem.toFixed(2)}
                    </p>

                    <div class="quantity_control">

                        <button
                            type="button"
                            class="decrease_quantity"
                            data-index="${index}">
                            -
                        </button>

                        <span class="quantity">
                            ${quantity}
                        </span>

                        <button
                            type="button"
                            class="Increase_quantity"
                            data-index="${index}">
                            +
                        </button>

                    </div>

                </div>

                <button
                    type="button"
                    class="delete_item"
                    data-index="${index}"
                    aria-label="Remove product">

                    <i class="fa-solid fa-trash-can"></i>

                </button>

            </div>
        `;

    });

    const priceCartTotal = document.querySelector(".price_cart_toral");
    if (priceCartTotal) {
        priceCartTotal.textContent = `$ ${totalPrice.toFixed(2)}`;
    }

    const countItemCart = document.querySelector(".Count_item_cart");
    if (countItemCart) {
        countItemCart.textContent = totalCount;
    }

    const countItemHeader = document.querySelector(".count_item_header");
    if (countItemHeader) {
        countItemHeader.textContent = totalCount;
    }


    updateButtonsState();
}

function increaseQuantity(index) {

    const cart = getCart();

    if (!cart[index]) {
        return;
    }

    cart[index].quantity =
        (Number(cart[index].quantity) || 1) + 1;

    saveCart(cart);

    updateCart();
}

function decreaseQuantity(index) {

    const cart = getCart();

    if (!cart[index]) {
        return;
    }

    const quantity = Number(cart[index].quantity) || 1;

    if (quantity > 1) {

        cart[index].quantity = quantity - 1;

    } else {

        cart.splice(index, 1);
    }

    saveCart(cart);

    updateCart();
}

function removeFromCart(index) {

    const cart = getCart();

    if (!cart[index]) {
        return;
    }

    cart.splice(index, 1);

    saveCart(cart);

    updateCart();
}

document.addEventListener("click", async function (event) {

    const target = event.target;

    if (!(target instanceof Element)) {
        return;
    }
    const addButton = target.closest(".btn_add_cart");

    if (addButton) {

        const productId = addButton.dataset.id;

        const products = await getProducts();

        const selectedProduct = products.find(
            product => String(product.id) === String(productId)
        );

        if (selectedProduct) {

            addToCart(selectedProduct);

        } else {

            console.error("Product not found:", productId);
        }

        return;
    }

    const increaseButton = target.closest(".Increase_quantity");

    if (increaseButton) {

        const index = Number(increaseButton.dataset.index);

        increaseQuantity(index);

        return;
    }
    const decreaseButton = target.closest(".decrease_quantity");

    if (decreaseButton) {

        const index = Number(decreaseButton.dataset.index);

        decreaseQuantity(index);

        return;
    }
    const deleteButton = target.closest(".delete_item");

    if (deleteButton) {

        const index = Number(deleteButton.dataset.index);

        removeFromCart(index);

        return;
    }

});

document.addEventListener("DOMContentLoaded", function () {

    const searchForm = document.querySelector(".search_box");

    const searchInput = document.querySelector("#search");


    if (searchForm && searchInput) {

        searchForm.addEventListener("submit", async function (event) {

            event.preventDefault();

            const searchValue = searchInput.value.trim().toLowerCase();

            if (!searchValue) {
                return;
            }

            const products = await getProducts();

            const foundProduct = products.find(product => {

                const productName = String(product.name || "").toLowerCase();

                return productName.includes(searchValue);
            });


            if (!foundProduct) {

                alert("Product not found!");

                return;
            }
            const productButton = document.querySelector(
                `.btn_add_cart[data-id="${CSS.escape(String(foundProduct.id))}"]`
            );

            const productCard = productButton
                ? productButton.closest(".product")
                : null;


            if (productCard) {

                productCard.scrollIntoView({
                    behavior: "smooth",
                    block: "center"
                });

                productCard.style.outline = "3px solid #4de615";
                productCard.style.outlineOffset = "5px";

                setTimeout(() => {

                    productCard.style.outline = "";
                    productCard.style.outlineOffset = "";

                }, 3000);

            } else {

                alert(
                    "Product found, but it is not displayed in the current page."
                );
            }

        });

    }


    updateCart();

});
