import helmet from "helmet";

 const helmetConfig = helmet({
    frameguard: {
        action: 'deny',  // Prevent embedding the app in an iframe
    },

    xssFilter: true, // Enable XSS filtering
    hidePoweredBy: true, 
    permittedCrossDomainPolicies: { permittedPolicies: 'none'},// Prevents Flash, Acrobat, or other plugins from accessing your backend
    referrerPolicy: { policy: 'no-referrer-when-downgrade' },
    
    
    
    // contentSecurityPolicy: {
    //   directives: {
    //     defaultSrc: ["'self'"],
    //     scriptSrc: ["'self'"], 
    //     styleSrc: ["'self'"],
    //     imgSrc: ["'self'"],
    //     connectSrc: ["'self'"],
    //     fontSrc: ["'self'"],
    //     objectSrc: ["'none'"],
    //     mediaSrc: ["'self'"],
    //     frameSrc: ["'none'"],
    //   }
    // },
    // hsts: {
    //   maxAge: 31536000,          // 1 year
    //   includeSubDomains: true,   // apply to subdomains
    //   preload: true              // request to be in browser preload list
    // }
})

export default helmetConfig;







// hsts :


// Absolutely — here's a real-world example that shows exactly how HSTS works in practice, and why it's important.

// 🏢 Scenario: Your Website
// You own a site:

// arduino
// Copy
// Edit
// https://mysecurestore.com
// You have HSTS configured like this:

// js
// Copy
// Edit
// hsts: {
//   maxAge: 31536000,          // 1 year
//   includeSubDomains: true,   // apply to subdomains
//   preload: true              // request to be in browser preload list
// }
// 🌐 User Visits Your Site (First Time)
// The user types in:

// arduino
// Copy
// Edit
// http://mysecurestore.com
// (maybe they typed just mysecurestore.com and the browser tried HTTP first)

// Your server redirects them to:

// arduino
// Copy
// Edit
// https://mysecurestore.com
// The server includes this response header:

// lua
// Copy
// Edit
// Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
// The browser remembers this rule:

// For the next 1 year, always use HTTPS when visiting mysecurestore.com or any of its subdomains.

// 🔁 On Next Visit
// If the user tries:

// arduino
// Copy
// Edit
// http://mysecurestore.com
// ✅ The browser automatically upgrades it to:

// arduino
// Copy
// Edit
// https://mysecurestore.com
// No insecure HTTP request is made at all.

// 💥 Without HSTS
// If HSTS were not enabled:

// A hacker on a public Wi-Fi (e.g., coffee shop) could intercept the initial HTTP request and perform a man-in-the-middle attack.

// The user may be tricked into thinking they're securely using your site, when in fact they're seeing a fake page.

// 💪 With HSTS Preload
// If your site is on the HSTS preload list:

// Even before the first visit, browsers never use http://mysecurestore.com.

// The browser already knows: "Only use HTTPS."

// 🧠 Summary

// With HSTS	Without HSTS
// Browser forces HTTPS	      May try HTTP first
// Protects against downgrade attacks        	Vulnerable on first visit
// Secure for subdomains     	Subdomains might be unprotected
// Preload makes it even       stricter	Needs one visit before HTTPS enforced
