
// ObjectFinder - Admin Login

const adminLoginForm = document.getElementById("adminLoginForm");

if (adminLoginForm) {
    adminLoginForm.addEventListener("submit", function(event) {

        event.preventDefault();

        const adminName = document.getElementById("adminName").value.trim();
        const adminEmail = document.getElementById("adminEmail").value.trim();
        const adminCode = document.getElementById("adminCode").value.trim();

        const message = document.getElementById("message");

        if (!adminName || !adminEmail || !adminCode) {
            message.textContent = "Please fill in all fields.";
            return;
        }

        message.style.color = "#fbbf24";
        message.textContent =
            "Login form is ready. Admin server verification will be connected later.";
    });
}
