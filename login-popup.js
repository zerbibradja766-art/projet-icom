
document.addEventListener("DOMContentLoaded", function () {

    const openBtn = document.getElementById("openLogin");
    const closeBtn = document.getElementById("closeLogin");
    const popup = document.getElementById("loginPopup");
    const loginForm = document.getElementById("radjaLoginForm");
    const forgotLink = document.getElementById("radjaForgot");

    console.log("RADJA LOGIN JS LOADED");
    if (!openBtn || !closeBtn || !popup) {

        console.error("Login elements not found!", {
            openBtn,
            closeBtn,
            popup
        });

        return;
    }
    openBtn.addEventListener("click", function () {

        if (!popup.open) {
            popup.showModal();
        }

    });
    closeBtn.addEventListener("click", function () {

        if (popup.open) {
            popup.close();
        }

    });
    popup.addEventListener("click", function (event) {
        const rect = popup.getBoundingClientRect();
        const clickedInside =
            event.clientX >= rect.left &&
            event.clientX <= rect.right &&
            event.clientY >= rect.top &&
            event.clientY <= rect.bottom;

        if (!clickedInside) {
            popup.close();
        }

    });
    if (loginForm) {
        loginForm.addEventListener("submit", function (event) {

            event.preventDefault();

            const emailInput = document.getElementById("radjaEmail");
            const passwordInput = document.getElementById("radjaPassword");

            if (!emailInput || !passwordInput) {
                console.error("Email or password input not found!");
                return;
            }
            const email = emailInput.value.trim();
            const password = passwordInput.value;

            if (!email || !password) {
                alert("Please fill in all fields.");
                return;
            }
            alert("Login interface is working!");

        });

    }
    if (forgotLink) {
        forgotLink.addEventListener("click", function (event) {
            event.preventDefault();
            alert("Please contact support to reset your password.");

        });

    }

});
