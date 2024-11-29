
export function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
}

export function setCookie(name, value, options = {}) {
    let cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(value)};`;

    // Set expiration if provided
    if (options.expires) {
        let expires;
        if (typeof options.expires === 'number') {
            // Set expiry date in days
            expires = new Date();
            expires.setTime(expires.getTime() + options.expires * 24 * 60 * 60 * 1000);
        } else if (options.expires instanceof Date) {
            // Set specific expiry date
            expires = options.expires;
        }
        cookieString += `expires=${expires.toUTCString()};`;
    }

    // Set path if provided, defaulting to the root path
    cookieString += `path=${options.path || '/'};`;

    // Set the secure flag if needed
    if (options.secure) {
        cookieString += 'secure;';
    }

    // Set the SameSite attribute if provided, defaulting to 'Lax'
    if (options.sameSite) {
        cookieString += `SameSite=${options.sameSite};`;
    } else {
        cookieString += 'SameSite=Lax;';
    }

    // Set the cookie
    document.cookie = cookieString;
}
