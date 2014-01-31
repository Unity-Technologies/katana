define(['jquery', 'project/realtimePages', 'helpers'], function ($, realtimePages, helpers) {
         "use strict";
    var rtBuildDetail;
    
    rtBuildDetail = {
        init: function () {
        	// Creating a new websocket
	                
	        // Global websocketvariabel        
	        window.sock = null;

	        var wsuri;

	        var realTimeServer =  $('body').attr('data-realTimeServer');
	         
         	wsuri = realTimeServer;

         	console.log($('body').attr('data-realTimeServer'));

	         if ("WebSocket" in window) {
	         	sock = new WebSocket(wsuri);
	         } else if ("MozWebSocket" in window) {
	         	sock = new MozWebSocket(wsuri);
	         } else {
	             log("Browser does not support WebSocket!");
	             window.location = "http://autobahn.ws/unsupportedbrowser";
	         }

	         // if the socket connection is success
	         if (sock) {
	             sock.onopen = function() {
		             // get the json url to parse
		             console.log(helpers.getJsonUrl())
		             broadcast(helpers.getJsonUrl());
	         	    log("Connected to " + wsuri);
	             }

	             // when the connection closes
	             sock.onclose = function(e) {
	                 log("Connection closed (wasClean = " + e.wasClean + ", code = " + e.code + ", reason = '" + e.reason + "')");
	                 sock = null;
	                 console.log('closed')
	             }

	             // when the client recieves a message
	             sock.onmessage = function(e) {
	         		log(e.data);
	             }
	         }
	        
	        // send a message to the server
	         function broadcast(msg) {
	             if (sock) {
	             	sock.send(msg);
	            	 //log("Sent: " + msg);
	             }		         
	         };	        

	        // send messages from the server to be parsed
	        var stepList = $('#stepList > li');
	        function log(m) {								
				realtimePages.buildDetail(m, stepList);
	        };
        }
    }
    return rtBuildDetail;
});