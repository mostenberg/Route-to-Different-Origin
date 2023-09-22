//This lists what the default originFlag and alternate origin flag is for each hostname
//For each hostname, list the default origin flag first, and the alternate origin 2nd
const host_to_origins_map = {
  "www.mikes-notes.com": ["non-spa-prod", "spa-prod"],
  "www.mikes-notes-uat.com": ["non-spa-uat", "spa-uat"],
  "www.mikes-notes-uat2.com": ["non-spa-uat2", "spa-uat2"],
  "www.mikes-notes-prod1.com": ["non-spa-prod1", "spa-prod1"],
  "www.mikes-notes-prod2.com": ["non-spa-prod2", "spa-prod2"],
};

//These are the list of explicit paths.
//If the incoming request patch matches directly, the alternate origin will be used
const paths = [
  "/folder1/testpage3.html",
  "/folder1/testpage4.html",
  "/folder1/testpage5.html",
  "/folder1/testpage6.html",
];

//This is the list of patterns. If the  incoming request path includes any of these patterns
//the alternate origin will be used
const pathPatterns = ["/p/", "/c/", "/j/"];

//This is the list of 'excludes'.
//Any incoming path which includes these patterns will *NOT* get routed to the altername origin
//This overrides both the 'paths' and pathPatterns'. Basically any match here does not go to alternate origin.
const pathExcludePatterns = ["/x/", "/y/", "/z/"];

export { host_to_origins_map, paths, pathPatterns, pathExcludePatterns };
