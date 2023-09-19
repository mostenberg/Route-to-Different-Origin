# Overview

EdgeWorker Code to Select a different origin if the URL is in list of URLs

## Contents

1. main.js : The EdgeWorker Code which can be run on Akamai platform.
2. bundle.json : Edgeworker JSON object containing version number and description
3. paths_list.js : The list of paths which should go to the alternate origin

## Purpose

This code allows you to route specific paths defined in paths_list.js to an alternate origin by setting a variable called PMUSER_ORIGIN_ID which will invoke the 2nd origin.

## Logic Overivew

- The file paths_list.js contains a list of paths which should be routed to the alternate origin.
- The file main.js identifies the hostname of the alternate origin in the variable 'origin2'
- The file main.js checks to see if the current path is in the list of paths which should be routed to the alternate origin. If it's in the list of paths, the route command will set the new origin. The path and query string from the original request will automatically be applied to the new origin. If you want to provide a _different_ path or query string, you can set route.path="new path" or route.query="new_query_string". More details available here: https://techdocs.akamai.com/edgeworkers/docs/request-object#route

## Setup and Usage

### EdgeWorker Setup

- Create a new EdgeWorker on the Akamai platform using the main.js and bundle.json provided.
- In the file 'path_list.js' , modify the array to have the names of the paths which you would like to route to the alternate origin.

### Akamai Property Setup

- In your Akamai configuration, add a user variable called PMUSER_ORIGIN_ID . When this variable is set to a value of 'origin2' , we will use the 2nd origin. ![Figure 2](/images/CreateVariablePMUSER_ORIGIN_ID.jpg)
- In your Akamai configuration, create a rule for your EdgeWorker. Set the rule so that the EdgeWorker will not execute on the types of requests that would not go to origin2 (e.g. probably only execute where file extension is html, empty etc). Add the EdgeWorker behavior and select the EdgeWorker that you created in previous steps [Figure 3](/images/EWConditionalRule.jpg)
- In your Akamai configuration, create a rule which will use a second origin if the PMUSER_ORIGIN_ID variable has value 'origin2' [Figure 4](/images/Pick2ndOriginWhenFlagIsSet.jpg)
