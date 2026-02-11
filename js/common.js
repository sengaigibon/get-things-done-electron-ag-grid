const pad = (part) => part.toString().padStart(2, '0');

/**
 * Format date to YYYY-MM-DD HH:MM:SS
 * @param {Date} date 
 */
function formatDateTime(date) {
    let datePart = date.getFullYear() + '-' + pad(date.getMonth() + 1) + '-' + pad(date.getDate());
    let timePart = pad(date.getHours()) + ':' + pad(date.getMinutes()) + ':' + pad(date.getSeconds());
    return datePart + ' ' + timePart;
}

/**
 * Format date to YYYY-MM-DD
 * @param {Date} date 
 */
function formatDate(date) {
    return date.getFullYear() + '-' + pad(date.getMonth() + 1) + '-' + pad(date.getDate());
}
