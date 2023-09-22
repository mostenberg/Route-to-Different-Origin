/*
(c) Copyright 2020 Akamai Technologies, Inc. Licensed under Apache 2 license.
Version: 0.22
Purpose:  For each domain, you can specify a default and alternate origin.
Then you can define which origin you would like to use based on the path or pattern.
Also has a rule to allow you to exclude routing to alternate because 
at some point you'll route all traffic to the new origin, and just use a pattern to decide stuff that's not routed.
*/

// Import logging module
import { logger } from "log";
import {
  host_to_origins_map,
  paths,
  pathPatterns,
  pathExcludePatterns,
} from "data.js";

export function onClientRequest(request) {
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
}
