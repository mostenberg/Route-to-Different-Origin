# Overview

EdgeWorker Code to identify if a specific request should go the the 'default' or 'alternate' origin for that hostname.
This is done by providing a list of paths and patterns which should use the 'alternate' origin.
You can also provide a list of patterns for items which should never use the 'alternate' origin.

## Contents

1. main.js : The EdgeWorker Code which can be run on Akamai platform.
2. bundle.json : Edgeworker JSON object containing version number and description
3. data.js : Includes lists of hostnames, tagnames, paths and patterns to be routed to alternate origin.

## Purpose

This EdgeWorker allows you to specify if a default or alternate origin should be used for each request coming to an edge server.

- Based on the hostname of the incomng requst, you can idenfity a 'default' origin and an 'alternate' origin.
- If the incoming request path matches any 'paths' then use the alternate origin.
- If the incoming request path includes any of the strings in 'pathPatterns' then you should use the alternate origin
- If the incoming requst path matches any of the strings in 'pathExcludePatterns' then use the 'default' origin (overriding the above two items)

## Logic Overivew

This edgeworker works with an Akamai configuration. The Akamai configuration should be setup such that:

- A user property called 'PMUSER_ORIGIN_ID' must be setup. This will indicate which origin will be used.
- A series of origins must be setup, such that each origin is only for a particular value of if 'PMUSER_ORIGIN_ID'

- The file data.js contains a three different objects:.
  - host_to_origin_map: Contains a list of hostnames and the default origin tag and alternate origin tag. (tag is just a user-friedly identifier for the origin, such as 'uat1-spa' or 'prod-non-spa')
  - paths : A list of paths which should use the alternate origin
  - pathPatterns : A list of patterns which will invoke the alternate origin if they are with the request path
  - pathExcludePatters : A list of patterns which will never be routed to alternate origin (overrides first 2 settings)
- The file main.js contains the main code logic:
  - When a request comes to an edge server, this EdgeWorker will check the hostname to determine the appropriate default origin for the request.
  - It will then check to see if the path of the request is in the pathExcludePatters list. If so, the default is used.
  - If path is not in excludes list, check if path is in list for alternates. If so, use alternate origin for this hostname
  - If path includes any strings in the 'pathPatterns' list, then use the alternate origin.

## Setup and Usage

### EdgeWorker Setup

- Create a new EdgeWorker on the Akamai platform using the main.js and bundle.json and data.js provided.
- In the file 'data.js' modify the following objects :
  - host_to_origins_map: Put the name of all your hostnames, followed by a friendly name for the default origin and the alternate origin (example: www.mikes-notes.com,["non-spa-prod","spa-prod"])
  - paths : Modify to list all of the paths whcih should use the alternate origin.
  - pathPatterns : Modify to list all patterns which should use the alternate origin. If the pattern is included anywhere in the request, it will be a 'match'. (e.g. '/p/')
  - pathExcludePatterns : Modify to list all patterns which should _NOT_ go to the alternate origin. This overrides the above two options, and allows you to toggle over to a mode where you push everything to alternate _except_ these ones.
  - Save and deploy your EdgeWorker ![Figure1](/images/addEdgeWorkerAndModifyData.jpg)

### Akamai Property Setup

1. In your Akamai configuration, add a user variable called PMUSER_ORIGIN_ID ![Figure2](/images/CreatePMUSER_ORIGIN_ID.jpg)
2. In your Akamai configuration, create a rule to run the EdgeWorker behavior and specify the EdgeWorker you created above.

- In your Akamai configuration, create a series of origins. Each origin should have a rule such that the origin is only used if 'PMUSER_ORIGIN_ID' equals a certain value. Use a 'friendly name' for the origin as the value. For example, 'prod-spa' or 'prod-non-spa' or 'dev-spa'. ![Figure3](/images/SetupPropertyWithOriginRules.jpg)
