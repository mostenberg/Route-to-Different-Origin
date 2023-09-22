//This code is used to test the algorithms outside of edgeworkers.
//You can run code in this file locally (in VS Code) and debug before running as an EdgeWorker
//It spoofs the logger function. And allows you to manually define a 'request' with host and path
//To test the code:
//    Download the code locally and open in your IDE (I use Visual Studio Code)
//    Modify the request object to simulate a request coming in.
//    Run the

const logger = {
  log: function (arg1) {
    console.log(arg1);
  },
};

//sample request value for testing. Adjust input to test different
request = {
  host: "www.mikes-notes-uat2.com",
  path: "/folder1/testpage3.html",
  setVariable: function (varName, varVal) {
    console.log(`Variable ${varName} set to ${varVal}\n`);
  },
};

//This is overriding the EW function to be used for local testing.
logger.log(
  `Request.host is ${request.host}\n request.path is ${request.path}\n`
);

//Actual Edgeworker code follows:

//This lists what the default originFlag and alternate origin flag is for each hostname
//For each hostname, list the default origin flag first, and the alternate origin 2nd
const host_to_origins_map = {
  "www.mikes-notes.com": ["mikesnotes", "mikesnotesspa"],
  "www.mikes-notes-uat1dd.com": ["uat1", "uat1spa"],
  "www.mikes-notes-uat2.com": ["uat2", "uat2spa"],
  "www.mikes-notes-prod1.com": ["prod1", "prod1spa"],
  "www.mikes-notes-prod2.com": ["prod2", "prod2spa"],
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

function pathIncludesAnyPattern(path, patternList) {
  for (x = 0; x < patternList.length; x++) {
    if (path.includes(patternList[x])) {
      logger.log(`Matched: ${path} in ${patternList[x]} \n`);
      return true; //Return true if it'sa match.
    }
  }
}

try {
  //use hostname map to determine what the flag for the default origin is
  const defaultOrigin = host_to_origins_map[request.host]
    ? host_to_origins_map[request.host][0]
    : undefined;

  //Exit if we don't have a defined origin to route to:
  if (defaultOrigin) {
    request.setVariable("PMUSER_ORIGIN_ID", defaultOrigin);
    logger.log(`Default origin set to ${defaultOrigin}\n`);
  } else {
    logger.log(
      `Exiting because hostname ${request.host} does not have  a defined origin mapping`
    );
    return 0;
  }

  //Then get the alternate origin to use in case the path matches:
  const alternateOrigin = host_to_origins_map[request.host]
    ? host_to_origins_map[request.host][1]
    : undefined;
  logger.log("Tentative origin set to : " + alternateOrigin);

  // First check if the request path is in the exclusing list If so, end:
  if (pathIncludesAnyPattern(request.path, pathExcludePatterns)) {
    logger.log(
      `Exiting because this path ${request.path} is in the exclude list\n.`
    );
    return 0;
  }

  //check path to determine if this path should go to alternate origin
  //by either a direct path match, or including one of the patterns.
  if (paths.includes(request.path)) {
    logger.log(
      `Path of this request, ${request.path} was in the list of paths.`
    ); //Debug logging
    request.setVariable("PMUSER_ORIGIN_ID", alternateOrigin);
    logger.log("completed onClientRequest with no errors");
  } else if (pathIncludesAnyPattern(request.path, pathPatterns)) {
    logger.log("Path of this request was in the list of patterns."); //Debug logging
    request.setVariable("PMUSER_ORIGIN_ID", alternateOrigin);
  } else {
    logger.log(
      `NO ACTION TAKEN since path ${request.path} didn't match path or patterns list.\n`
    );
  }
} catch (error) {
  logger.log(`Error: ${error.toString()}`);
}
