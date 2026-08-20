function toggleMenu() {
    let subMenu = document.getElementById("sub-menu");
    if (subMenu) {
        subMenu.classList.toggle("open-menu");
    }
}

document.getElementById("panel")?.addEventListener("click", toggleMenu);

function sendAlert(event) {
    // Stops the link from firing right away
    event.preventDefault(); 

    const userConfirmed = confirm("Are you sure you want to delete this article? It cannot be undone");

    if (userConfirmed) {
        // event.currentTarget gives us the element that was clicked  
        window.location.href = event.currentTarget.getAttribute('href');
        console.log(event.currentTarget);
        console.log(event.currentTarget.getAttribute('href'));
    }
}

document.querySelectorAll('.btn-delete').forEach(button => {
    button.addEventListener('click', sendAlert);
});