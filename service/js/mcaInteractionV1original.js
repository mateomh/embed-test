
(function(global) {

  function mcaToolbar() {
    var version = "1.3.0";
    var toolbarInteractionCmd = function(eventId,command,slot,commandId,channel,inData,sendResponse){
      //PROTOTYPE Object passed to onToolbarInteractionCommand executor function
      var commands = {
          ACCEPT : "accept",
          REJECT : "reject",
          SET_ACTIVE : "setActive",
          DISCONNECT : "disconnect",
          CUSTOM : "custom",
          NOTIFICATION_TIMER_EXP: "NOTIFICATION_TIMER_EXP"
      };
      this.eventId = eventId;
      this.command = command;
      this.slot = slot;
      this.commandId = commandId;
      this.channel = channel;
      this.inData = inData;
      this.sendResponse = sendResponse;   //callback function to return results to MCA
      this.result = "needsSetByToolbar";
      this.resultDisplayString  = null;
      this.outData = {};
    };
    var toolbarAgentCmd = function(eventId,command,channel,channelType,inData,sendResponse){
      //PROTOTYPE Object passed to onToolbarAgentCommand executor function
      var commands = {
          GET_CURRENT_STATE : "getCurrentAgentState",
          GET_ACTIVE_ENGAGEMENTS: "getActiveEngagements",
          MAKE_AVAILABLE : "makeAvailable",
          MAKE_UNAVAILABLE : "makeUnavailable",
          CUSTOM : "custom"
      };
      this.eventId = eventId;
      this.command = command;
      this.channel = channel;
      this.channelType = channelType;
      this.inData = inData;
      this.sendResponse = sendResponse; //callback function to return results to MCA
      this.result = "needsSetByToolbar";
      this.resultDisplayString  = null;
      this.outData = {};
    };
    var core = (function () {
      var callbackRegistry = [];
      var eventStartRegistry = [];
      var longtermCallbackRegistry = [];
      var frameOrigin = null;
      var toolbarName = null;
      var eventNameForMessage = "mcaMessageEvent";
      var debugMode = false;

      var methods = {
        DISABLE_FEATURE : "disableFeature",
        SET_TOOLBAR_DIMENSIONS : "setToolbarDimensions",
        GET_DISPLAY_STATE : "getDisplayState",
        GET_CONFIGURATION : "getConfiguration",
        READY_FOR_OPERATION: "readyForOperation",
        NEW_COMM_EVENT: "newCommEvent",
        GET_CUSTOMER_DATA : "getCustomerData",
        START_COMM_EVENT : "startCommEvent",
        INVOKE_SCREEN_POP : "invokeScreenPop",
        CLOSE_COMM_EVENT : "closeCommEvent",
        TRANSFER_COMM_EVENT : "transferCommEvent",
        CONFERENCE_COMM_EVENT : "conferenceCommEvent",
        SET_COMM_EVENT_TRANSCRIPT : "setCommEventTranscript",
        UPGRADE_COMM_EVENT: "upgradeCommEvent",
        DOWNGRADE_COMM_EVENT: "downgradeCommEvent",
        ON_OUTGOING_EVENT : "onOutgoingEvent",
        OUTBOUND_COMM_ERROR: "outboundCommError",
        ON_DATA_UPDATED : "onDataUpdated",
        SEND_OUTGOING_EVENT : "sendOutgoingEvent",
        SEND_CUSTOMER_DATA_UPD : "sendDataUpdated",
        OPEN_FLOATING_TOOLBAR : "openFloatingToolbar", 
        IS_FLOATING_TOOLBAR_OPEN: "isFloatingToolbarOpen",
        CLOSE_FLOATING_TOOLBAR: "closeFloatingToolbar",
        OPEN_COMPANION_PANEL : "openCompanionPanel", 
        IS_COMPANION_PANEL_OPEN: "isCompanionPanelOpen",
        CLOSE_COMPANION_PANEL: "closeCompanionPanel",
        POST_TOOLBAR_MESSAGE : "postToolbarMessage",
        ON_TOOLBAR_MESSAGE : "onToolbarMessage",
        INTERACTION_COMMAND_RESPONSE: "tbInteractionCommandResponse", //Internal
        AGENT_COMMAND_RESPONSE: "tbAgentCommandResponse", //Internal
        AGENT_STATE_EVENT : "agentStateEvent",
        ON_TOOLBAR_INTERACTION_COMMAND : "onToolbarInteractionCommand",
        ON_TOOLBAR_AGENT_COMMAND : "onToolbarAgentCommand",
        FOCUS_COMM_EVENT : "focusCommEvent"
      };

      function initFrameAuth() {
        var searchString = window.location.search;
        if (typeof searchString !== 'string' || searchString.length === 0) {
          throw new Error("API not correctly delpoyed - missing init attributes!");
        }
        if (searchString.charAt(0) === '?') {
          searchString = searchString.slice(1);
          if (searchString.length === 0) {
            throw new Error("API not correctly delpoyed - missing init attributes!");
          }
        }
        var searchParams = searchString.split('&');
        for (var i = 0;i < searchParams.length;i++) {
          var pair = searchParams[i].split('=');
          if (pair[0] && pair[1] && pair[0] === 'oraParentFrame') {
            frameOrigin = decodeURIComponent(pair[1]).toLowerCase();
          }
          if (pair[0] && pair[1] && pair[0] === 'oraTbName') {
            toolbarName = decodeURIComponent(pair[1]).toLowerCase();
          }
        }
      };

      /**
       * Local implementation of a generator for UUID v4 as per RFC4122.
       * @returns {String} a locally generated UUID
       */
      function localUuidV4() {
        var bth = [];
        for (var ii = 0;ii < 256;ii++) {
          bth[ii] = (ii + 0x100).toString(16).substr(1);
        }

        var uuidBytes = new Array(16);
        for (var i = 0, r;i < 16;i++) {
          if ((i & 0x03) === 0) {
            r = Math.random() * 0x100000000;
          }
          uuidBytes[i] = r >>> ((i & 0x03) << 3) & 0xff;
        }
        uuidBytes[6] = (uuidBytes[6] & 0x0f) | 0x40;
        uuidBytes[8] = (uuidBytes[8] & 0x3f) | 0x80;

        var j = 0;
        return bth[uuidBytes[j++]] + bth[uuidBytes[j++]] + bth[uuidBytes[j++]] + bth[uuidBytes[j++]] + '-' + bth[uuidBytes[j++]] + bth[uuidBytes[j++]] + '-' + bth[uuidBytes[j++]] + bth[uuidBytes[j++]] + '-' + bth[uuidBytes[j++]] + bth[uuidBytes[j++]] + '-' + bth[uuidBytes[j++]] + bth[uuidBytes[j++]] + bth[uuidBytes[j++]] + bth[uuidBytes[j++]] + bth[uuidBytes[j++]] + bth[uuidBytes[j++]];
      };

      function sendMessage(jsonData) {
        if (frameOrigin) {
          window.parent.postMessage(JSON.stringify(jsonData), frameOrigin);
          if (debugMode) {
            console.log("### Toolbar "+toolbarName+" - sending Message: "+JSON.stringify(jsonData));
          }
        }
      }

      function receiveMessage(event) {
        if (debugMode) {
            console.log("### Toolbar "+toolbarName+" - receiveMessage: "+event.data);
        }
        // check for origin - we don't accept other messages except from FA  
        if (!frameOrigin || event.origin !== frameOrigin) {
          return;
        }
        if (event.data == '_adfShowBody') {
            return;
        }
        var jsonData = JSON.parse(event.data);
        if (typeof document.createEvent === "function") {
          var newEvent = document.createEvent("CustomEvent");
          newEvent.initCustomEvent(eventNameForMessage, true, true, jsonData);
          if (typeof document.dispatchEvent === "function") {
            document.dispatchEvent(newEvent);
          }
          else if (typeof document.fireEvent !== "undefined") {
            document.fireEvent(eventNameForMessage, newEvent);
          }
          else {
            throw new Error("The document doesn't support dispatchEvent");
          }
        }
        else {
          throw new Error("Browser doesn't support triggering events");
        }
      }

      function messageCallback(event) {
        var passData = event.detail;
        if (debugMode) {
            console.log("### Toolbar "+toolbarName+" - messageCallback for method: "+passData.method);
        }
        if (passData.method === methods.ON_TOOLBAR_MESSAGE) {
          var callbackOTM = longtermCallbackRegistry[methods.ON_TOOLBAR_MESSAGE];
          if (callbackOTM) {
            callbackOTM(passData);
          }
        }
        else if (passData.method === methods.ON_OUTGOING_EVENT) {
          var selectorOE = methods.ON_OUTGOING_EVENT + passData.channel;
          var callbackOE = longtermCallbackRegistry[selectorOE];
          if (callbackOE) {
            callbackOE(passData);
          }
        }
        else if (passData.method === methods.ON_DATA_UPDATED) {
          var selectorDU = methods.ON_DATA_UPDATED + passData.channel;
          var callbackDU = longtermCallbackRegistry[selectorDU];
          if (callbackDU) {
            callbackDU(passData);
          }
        } 
        else if (passData.method === methods.ON_TOOLBAR_INTERACTION_COMMAND) {
          var callbackICmd = longtermCallbackRegistry[methods.ON_TOOLBAR_INTERACTION_COMMAND];
          if (callbackICmd) {
              var iCmd = getInteractionCommand(passData);
              callbackICmd(iCmd);
          } 
        }
        else if (passData.method === methods.ON_TOOLBAR_AGENT_COMMAND) {
          var selectorACmd = methods.ON_TOOLBAR_AGENT_COMMAND + passData.channel;
          var callbackACmd = longtermCallbackRegistry[selectorACmd];
          if (callbackACmd) {
              var aCmd = getAgentCommand(passData);
              callbackACmd(aCmd);
          }
        }
        else {
          if (passData.method === methods.GET_CONFIGURATION) {
              debugMode = false;
              // if (passData.configuration.debugMode) {
              //     if (passData.configuration.debugMode === 'true') {
              //         debugMode = true;
              //     }
              // }
          }
          var callback = callbackRegistry[passData.uuid];
          if (callback) {
            callback(passData);
            if (passData.method !== methods.START_COMM_EVENT) {
              delete callbackRegistry[passData.uuid];
            }
          }
        }
      }

      function createParentMessageListener() {
        if (frameOrigin) {
          if (typeof window.addEventListener === "function") {
            window.addEventListener("message", receiveMessage, false);
          }
          else if (typeof window.attachEvent !== "undefined") {
            window.attachEvent("onmessage", receiveMessage);
          }
          else {
            throw new Error("Browser doesn't support addEventListener or attachEvent");
          }
        }
        else {
          throw new Error("API not correctly delpoyed!");
        }
      }

      function createCallbackHandler() {
        if (typeof window.addEventListener === "function") {
          window.addEventListener(eventNameForMessage, messageCallback, false);
        }
        else if (typeof window.attachEvent !== "undefined") {
          window.attachEvent(eventNameForMessage, messageCallback);
        }
        else {
          throw new Error("Browser doesn't support addEventListener or attachEvent");
        }
      }
      function interactionCommandResponse(command) {
          command.method = methods.INTERACTION_COMMAND_RESPONSE;
          command.toolbarName = toolbarName;
          sendMessage(command);
      }
      function agentCommandResponse(command) {
          command.method = methods.AGENT_COMMAND_RESPONSE;
          command.toolbarName = toolbarName;
          sendMessage(command);
      }
      function getInteractionCommand(data) {
          var eventId = data.eventId;
          var command = data.command;
          var commandId = data.commandId;
          var channel = data.channel;
          var inData = {}; 
          if (typeof data.params === 'object') {
              inData = data.params;
          } else if (typeof data.inData === 'object') {
              inData = data.inData;
          }
          var slot = data.slot;
          return new toolbarInteractionCmd(eventId,command,slot,commandId,channel,inData,interactionCommandResponse);
      }
      function getAgentCommand(data) {
          var eventId = data.eventId;
          var command = data.command;
          var inData = {}; 
          if (typeof data.params === 'object') {
              inData = data.params;
          } else if (typeof data.inData === 'object') {
              inData = data.inData;
          }
          var channel = data.channel;
          var channelType = data.channelType;
          return new toolbarAgentCmd(eventId,command,channel,channelType,inData,agentCommandResponse);
      }

      return {
        setup : function () {
          initFrameAuth();
          createParentMessageListener();
          createCallbackHandler();
        },
        validateExecutor : function(method,executor) {
          if (typeof executor !== 'function')  {
              console.log("ERROR: Invalid arg for the method: "+method+ " executor must be a function");
              throw new Error("ERROR: Invalid arg for the method: "+method+ " executor must be a function"); 
          }
        },
        /**
         *  Process API call from toolbar and
         *  @param objectData - data coming from toolbar through api.
         *  @param callback - function to be called when server ends processing.
         *  @return {undefined}
         */
        processCall : function (objectData, callback) {
          if (objectData.hasOwnProperty("toolbarName")) {
            console.log("ERROR: cannot call core.processCall with an object having toolbarName property - this is reserved for internal use");
            throw new Error("ERROR: cannot call core.processCall with an object having toolbarName property - this is reserved for internal use");
          }
          objectData.toolbarName = toolbarName;
          if (objectData.hasOwnProperty("uuid")) {
            console.log("ERROR: cannot call core.processCall with an object having uuid property - this is reserved for internal use");
            throw new Error("ERROR: cannot call core.processCall with an object having uuid property - this is reserved for internal use");
          }
          objectData.uuid = localUuidV4();
          if (objectData.method === methods.ON_TOOLBAR_MESSAGE) {
            longtermCallbackRegistry[methods.ON_TOOLBAR_MESSAGE] = callback;
          } 
          else if (objectData.method === methods.ON_OUTGOING_EVENT) {
            longtermCallbackRegistry[methods.ON_OUTGOING_EVENT + objectData.data.channel] = callback;
          }
          else if (objectData.method === methods.ON_DATA_UPDATED) {
            longtermCallbackRegistry[methods.ON_DATA_UPDATED + objectData.data.channel] = callback;
          }
          else if (objectData.method === methods.ON_TOOLBAR_INTERACTION_COMMAND) {
            longtermCallbackRegistry[methods.ON_TOOLBAR_INTERACTION_COMMAND] = callback;
          }
          else if (objectData.method === methods.ON_TOOLBAR_AGENT_COMMAND) {
            longtermCallbackRegistry[methods.ON_TOOLBAR_AGENT_COMMAND + objectData.data.channel] = callback;
          }
          else {
            callbackRegistry[objectData.uuid] = callback;
            if (objectData.method === methods.START_COMM_EVENT) {
              eventStartRegistry[objectData.data.eventId] = objectData.uuid;
            }
            if (objectData.method === methods.CLOSE_COMM_EVENT) {
              var startEventUuid = eventStartRegistry[objectData.data.eventId];
              delete callbackRegistry[startEventUuid];
              delete eventStartRegistry[startEventUuid];
            }
          }
          if (objectData.data.channel === 'PHONE' && ! objectData.data.channelType) {
            objectData.data.channelType = 'ORA_SVC_PHONE';
          } else if (objectData.data.channel === 'CHAT' && ! objectData.data.channelType) {
            objectData.data.channelType = 'ORA_SVC_CHAT';
          }
          sendMessage(objectData);
        },
        apiMethod :  {
          DISABLE_FEATURE : methods.DISABLE_FEATURE, 
          SET_TOOLBAR_DIMENSIONS : methods.SET_TOOLBAR_DIMENSIONS,
          GET_DISPLAY_STATE : methods.GET_DISPLAY_STATE,
          GET_CONFIGURATION : methods.GET_CONFIGURATION,
          READY_FOR_OPERATION : methods.READY_FOR_OPERATION,
          NEW_COMM_EVENT : methods.NEW_COMM_EVENT,
          GET_CUSTOMER_DATA : methods.GET_CUSTOMER_DATA,
          START_COMM_EVENT : methods.START_COMM_EVENT, 
          INVOKE_SCREEN_POP : methods.INVOKE_SCREEN_POP, 
          CLOSE_COMM_EVENT : methods.CLOSE_COMM_EVENT, 
          TRANSFER_COMM_EVENT : methods.TRANSFER_COMM_EVENT,
          CONFERENCE_COMM_EVENT : methods.CONFERENCE_COMM_EVENT,
          SET_COMM_EVENT_TRANSCRIPT : methods.SET_COMM_EVENT_TRANSCRIPT,
          UPGRADE_COMM_EVENT : methods.UPGRADE_COMM_EVENT,
          DOWNGRADE_COMM_EVENT : methods.DOWNGRADE_COMM_EVENT,
          ON_OUTGOING_EVENT : methods.ON_OUTGOING_EVENT,
          OUTBOUND_COMM_ERROR : methods.OUTBOUND_COMM_ERROR,
          ON_DATA_UPDATED : methods.ON_DATA_UPDATED,
          OPEN_FLOATING_TOOLBAR : methods.OPEN_FLOATING_TOOLBAR,
          IS_FLOATING_TOOLBAR_OPEN: methods.IS_FLOATING_TOOLBAR_OPEN,
          CLOSE_FLOATING_TOOLBAR: methods.CLOSE_FLOATING_TOOLBAR,
          OPEN_COMPANION_PANEL : methods.OPEN_COMPANION_PANEL,
          IS_COMPANION_PANEL_OPEN: methods.IS_COMPANION_PANEL_OPEN,
          CLOSE_COMPANION_PANEL: methods.CLOSE_COMPANION_PANEL,
          POST_TOOLBAR_MESSAGE : methods.POST_TOOLBAR_MESSAGE,
          ON_TOOLBAR_MESSAGE : methods.ON_TOOLBAR_MESSAGE,
          AGENT_STATE_EVENT : methods.AGENT_STATE_EVENT,
          ON_TOOLBAR_INTERACTION_COMMAND : methods.ON_TOOLBAR_INTERACTION_COMMAND,
          ON_TOOLBAR_AGENT_COMMAND : methods.ON_TOOLBAR_AGENT_COMMAND,
          FOCUS_COMM_EVENT : methods.FOCUS_COMM_EVENT
        }      
      };
    })();

    return {      
      initialize : function () {
        core.setup();
      },
      interactionCommandPrototype : toolbarInteractionCmd,
      agentCommandPrototype : toolbarAgentCmd,
      api :  {
        disableFeature : function (features, callback) {
          core.processCall( {
            method : core.apiMethod.DISABLE_FEATURE, version : version, data :  {
              features : features
            }
          },
          callback);
        },
        setToolbarDimensions : function (barType, height, width, callback) {
          core.processCall( {
            method : core.apiMethod.SET_TOOLBAR_DIMENSIONS, version : version, data :  {
              barType: barType, height : height, width: width
            }
          },
          callback);
        },
        getDisplayState : function (barType, callback) {
          core.processCall( {
            method : core.apiMethod.GET_DISPLAY_STATE, version : version, data :  {
              barType: barType
            }
          },
          callback);
        },
        getConfiguration : function (configType, callback) {
          if (typeof callback === 'undefined') {
              callback = configType;
              configType = null;
          }
          core.processCall( {
            method : core.apiMethod.GET_CONFIGURATION, version : version, data :  {
                configType: configType
            }
          },
          callback);
        },
        readyForOperation : function (readiness, callback) {
          core.processCall( {
            method : core.apiMethod.READY_FOR_OPERATION, version: version, data : {
              readiness : readiness
            }
          },
          callback);
        },
        newCommEvent : function (channel, appClassification, eventId, inData, lookupObject, callback, channelType) {
          if ((typeof callback === 'undefined') && (typeof channelType === 'undefined')) {
              callback = lookupObject;
              lookupObject = null;
          }

          if (typeof channelType === 'undefined') {
              channelType = "ORA_SVC_PHONE";
          }

          if (inData && typeof inData === 'object') {
              inData.mcaOrigEventSource = 'toolbar';
          }
          core.processCall( {
            method : core.apiMethod.NEW_COMM_EVENT, version : version, data : {
              channel : channel, appClassification : appClassification, eventId: eventId, inData : inData, lookupObject: lookupObject, channelType : channelType
            }
          },
          callback);
        },
        startCommEvent : function (channel, appClassification, eventId, inData, callback, channelType) {
          core.processCall( {
            method : core.apiMethod.START_COMM_EVENT, version : version, data :  {
              channel : channel, appClassification : appClassification, eventId : eventId, inData : inData, channelType : channelType
            }
          },
          callback);
        },
        getCustomerData : function (channel, appClassification, eventId, inData, lookupObject, callback, channelType) {
          if (typeof callback === 'undefined') {
              callback = lookupObject;
              lookupObject = null;
          }
          core.processCall( {
            method : core.apiMethod.GET_CUSTOMER_DATA, version : version, data :  {
              channel : channel, appClassification : appClassification, eventId : eventId, inData : inData, lookupObject: lookupObject, channelType : channelType
            }
          },
          callback);
        },
        invokeScreenPop : function (channel, appClassification, eventId, pageCode, pageData, callback, channelType) {
          core.processCall( {
            method : core.apiMethod.INVOKE_SCREEN_POP, version : version, data :  {
              channel : channel, appClassification : appClassification, eventId : eventId, pageCode: pageCode, inData : pageData, channelType : channelType
            }
          },
          callback);
        },
        closeCommEvent : function (channel, appClassification, eventId, inData, reason, callback, channelType) {
          core.processCall( {
            method : core.apiMethod.CLOSE_COMM_EVENT, version : version, data :  {
              channel : channel, appClassification : appClassification, eventId : eventId, inData : inData, reason : reason, channelType : channelType
            }
          },
          callback);
        },
        transferCommEvent : function (channel, appClassification, eventId, inData, callback, channelType) {
          core.processCall( {
            method : core.apiMethod.TRANSFER_COMM_EVENT, version : version, data :  {
              channel : channel, appClassification : appClassification, eventId : eventId, inData : inData, channelType : channelType
            }
          },
          callback);
        },
        conferenceCommEvent : function (channel, appClassification, eventId, inData, callback, channelType) {
          core.processCall( {
            method : core.apiMethod.CONFERENCE_COMM_EVENT, version : version, data :  {
              channel : channel, appClassification : appClassification, eventId : eventId, inData : inData, channelType : channelType
            }
          },
          callback);
        },
        setCommEventTranscript : function (channel, appClassification, eventId, inData, callback, channelType) {
          core.processCall( {
            method : core.apiMethod.SET_COMM_EVENT_TRANSCRIPT, version : version, data :  {
              channel : channel, appClassification : appClassification, eventId : eventId, inData : inData, channelType : channelType
            }
          },
          callback);
        },
        upgradeCommEvent : function (channel, eventId, channelType, upgradeChannel, upgradeChannelType, upgradeEventId, inData, callback ) {
          core.processCall( {
            method : core.apiMethod.UPGRADE_COMM_EVENT, version : version, data :  {
              channel : channel, channelType : channelType, upgradeChannel : upgradeChannel, upgradeChannelType : upgradeChannelType, upgradeEventId : upgradeEventId, eventId : eventId, inData : inData
            }
          },
          callback);
        },
        downgradeCommEvent : function (channel, eventId, channelType, downgradeChannel, downgradeChannelType, downgradeEventId, inData, callback ) {
          core.processCall( {
            method : core.apiMethod.DOWNGRADE_COMM_EVENT, version : version, data :  {
              channel : channel, eventId : eventId, channelType : channelType, downgradeChannel : downgradeChannel, downgradeChannelType : downgradeChannelType, downgradeEventId : downgradeEventId, inData : inData
            }
          },
          callback);
        },
        onOutgoingEvent : function (channel, appClassification, callback, channelType) {
          core.processCall( {
            method : core.apiMethod.ON_OUTGOING_EVENT, version : version, data :  {
              channel : channel, appClassification : appClassification, channelType : channelType
            }
          },
          callback);
        },
//          onOutgoingEvent : function (channel, appClassification, callback) {
//            core.processCall( {
//              method : core.apiMethod.ON_OUTGOING_EVENT, version : version, data :  {
//                channel : channel, appClassification : appClassification
//              }
//            },
//            callback);
//          },
        outboundCommError: function (channel, commUuid, errorCode, errorMsg, callback, channelType) {
          core.processCall( {
            method : core.apiMethod.OUTBOUND_COMM_ERROR, version : version, data :  {
              channel : channel, commUuid : commUuid, errorCode : errorCode, errorMsg : errorMsg, channelType : channelType
            }
          },
          callback);
        },
        onDataUpdated : function (channel, appClassification, callback, channelType) {
          core.processCall( {
            method : core.apiMethod.ON_DATA_UPDATED, version : version, data :  {
              channel : channel, appClassification : appClassification, channelType : channelType
            }
          },
          callback);
        },
        openFloatingToolbar : function (barType, url, height, width, inData, callback) {
          core.processCall( {
            method : core.apiMethod.OPEN_FLOATING_TOOLBAR, version : version, data : {
              barType: barType, url: url, height: height, width: width, inData : inData
            }
          },
          callback);
        },
        isFloatingToolbarOpen : function (barType, callback) {
          core.processCall( {
            method : core.apiMethod.IS_FLOATING_TOOLBAR_OPEN, version : version, data : {
              barType: barType
            }
          },
          callback);          
        },
        closeFloatingToolbar : function (barType, callback) {
          core.processCall( {
            method : core.apiMethod.CLOSE_FLOATING_TOOLBAR, version : version, data : {
              barType: barType
            }
          },
          callback);          
        },
        openCompanionPanel : function (panelType, url, title, inData, callback) {
          core.processCall( {
            method : core.apiMethod.OPEN_COMPANION_PANEL, version : version, data : {
              panelType: panelType, url: url, title: title, inData : inData
            }
          },
          callback);
        },
        isCompanionPanelOpen : function (panelType, callback) {
          core.processCall( {
            method : core.apiMethod.IS_COMPANION_PANEL_OPEN, version : version, data : {
              panelType: panelType
            }
          },
          callback);          
        },
        closeCompanionPanel : function (panelType, callback) {
          core.processCall( {
            method : core.apiMethod.CLOSE_COMPANION_PANEL, version : version, data : {
              panelType: panelType
            }
          },
          callback);          
        },
        postToolbarMessage : function (messagePayload, callback) {
          core.processCall( {
            method : core.apiMethod.POST_TOOLBAR_MESSAGE, version : version, data : {
                    messagePayload : messagePayload
            }
          },
          callback);          
        },
        onToolbarMessage : function (callback) {
          core.processCall( {
            method : core.apiMethod.ON_TOOLBAR_MESSAGE, version : version, data : {}
          },
          callback);          
        },
        agentStateEvent : function (channel, eventId, isAvailable, isLoggedIn, stateCd, stateDisplayString, reasonCd, reasonDisplayString, inData, callback, channelType) {
          core.processCall( {
            method : core.apiMethod.AGENT_STATE_EVENT, version : version, data :  {
              channel:channel, eventId:eventId, isAvailable:isAvailable, isLoggedIn:isLoggedIn, stateCd:stateCd, stateDisplayString:stateDisplayString, reasonCd:reasonCd, reasonDisplayString:reasonDisplayString, inData:inData, channelType:channelType
            }
          },
          callback);
        },
        onToolbarInteractionCommand : function (executor) {
          core.validateExecutor(core.apiMethod.ON_TOOLBAR_INTERACTION_COMMAND,executor);
          core.processCall( {
            method : core.apiMethod.ON_TOOLBAR_INTERACTION_COMMAND, version : version, data : {}
          },
          executor);   
        },
        onToolbarAgentCommand : function (channel, channelType, executor) {
          core.validateExecutor(core.apiMethod.ON_TOOLBAR_AGENT_COMMAND,executor);
          core.processCall( {
            method : core.apiMethod.ON_TOOLBAR_AGENT_COMMAND, version : version, data : {channel:channel,channelType:channelType}
          },
          executor);   
        },
        focusCommEvent : function (eventId, channel, channelType, inData, callback) {
          core.processCall( {
            method : core.apiMethod.FOCUS_COMM_EVENT, version : version, data :  {
              eventId:eventId, channel:channel, channelType:channelType, inData:inData
            }
          },
          callback);
        }
      }
    };
  }

  var mcaTlb = new mcaToolbar();
  mcaTlb.initialize();

  //exports to multiple environments
  if(typeof define === 'function' && define.amd){ //AMD
      define(function () { return mcaTlb; });
  } else if (typeof module !== 'undefined' && module.exports){ //node
      module.exports = mcaTlb;
  } else { //browser
      //use string because of Google closure compiler ADVANCED_MODE
      /*jslint sub:true */
      global['svcMca'] = {};
      global.svcMca['tlb'] = mcaTlb;
  }    
}(window));
