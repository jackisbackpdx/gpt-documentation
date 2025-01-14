/* eslint-disable no-unused-vars */
// main.js

// Example: Display a console message
console.log('main.js is loaded and ready.');
const sidebarLeft = document.getElementsByClassName('.sidebar');
const center = document.getElementsByClassName('.container');
const sidebarRight = document.getElementById('#sidebar-right');

sidebarLeft.style.height = center.style.height + 'px';
function toggleLeftSidebar() {
    document.getElementById('sidebar-left').classList.toggle('open');
}
  
function toggleRightSidebar() {
    document.getElementById('sidebar-right').classList.toggle('open');
}

function closeLeftSidebar() {
    document.getElementById('sidebar-left').classList.remove('open');
}
function closeRightSidebar() {
    document.getElementById('sidebar-right').classList.remove('open');
}
// Add any additional scripts or DOM manipulation here
