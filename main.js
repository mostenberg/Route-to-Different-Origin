/*
(c) Copyright 2020 Akamai Technologies, Inc. Licensed under Apache 2 license.
Version: 0.22
Purpose:  Routes to different origin if path of incoming request is in list of paths 
*/

// Import logging module
import { logger } from "log";
import { paths } from "paths_list.js";

export function onClientRequest(request) {
  try {
    if (paths.includes(request.path)) {
      logger.log("Path of this request was in the list of paths."); //Debug logging
      request.setVariable("PMUSER_ORIGIN_ID", "origin2");
      logger.log("completed onClientRequest with no errors");
    }
  } catch (error) {
    logger.log(`Error: ${error.toString()}`);
  }
}
