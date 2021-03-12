const clickButton = () => {
  console.log('click');
  window.dynamicLoadCompleted = false;
  window.staticLoadCompleted = false;
  console.log("##DLS: Running DynamicLoadScript to load the Oracle API JS...");
  function getParameterByName(name) {
      var match = RegExp('[?&]' + name + '=([^&]*)').exec(window.location.search);
      return match && decodeURIComponent(match[1].replace(/\+/g, ' '));
  }
  var oraApiPath = '';
  var oraOrigin = getParameterByName('oraParentFrame');
  var oraApiSource = getParameterByName('oraApiSource');
  // var oraApiPath = '';
  // var oraOrigin = 'https://ccur-dev1.oraclecloud.com:443';
  // var oraApiSource = '/service/js/mcaInteractionV1.js.';
  console.log('##DLS: PageParameters - oraParentFrame: '+oraOrigin+' oraApiSource: '+oraApiSource);
  try {                 
      if (oraApiSource && oraApiSource.startsWith("http")) {
          oraApiPath = oraApiSource; //handle case where apiSource is loaded from external CDN
      } else {
          oraApiPath = oraOrigin+oraApiSource;
      }
      console.log('##DLS: Oracle API JS URL: '+oraApiPath);     
  } catch (e) {
      console.log('##DLS: Error '+e);
      console.error(e);
  }
  var currentNode = document.getElementById('dynamicLoadScript');
  var node = document.createElement('script');
  node.type = 'text/javascript';
  node.async = true;
  node.src = oraApiPath;
  node.addEventListener('load', function(evt) { 
      window.dynamicLoadCompleted = true;
      console.log('##DLS: Successfully loaded Oracle API JS');
      console.log(svcMca.tlb.api);
      // TODO INSERT ANY INIT PROCESSING HERE}, false);
  })
  node.addEventListener('error', function(evt) { 
      console.log('##DLS: Error loading ORACLE API JS from URL: '+node.src);
  }, false);
  // currentNode.innerHTML = '';
  currentNode.appendChild(node);
  // currentNode.parentNode.insertBefore(node, currentNode.nextSibling);
  // console.log('loaded');
  // currentNode.parentNode.insertBefore(node, currentNode.nextSibling);
};

// const clickConfig = () => {
//   console.log('Click config');
//   console.log(svcMca.tlb.api);
//   console.log(svcMca.tlb.api.getConfiguration);
//   console.log('After');
//   const scripts = document.getElementsByTagName('script');
//   console.log(scripts[3]);
//   // svcMca.tlb.api.getConfiguration('ALL', function (response) {
//   //   console.log(response);
//   //   if (response.result == 'success') {
//   //     alert('Success! Configuration is: ' + response.configuration);
//   //   } else {
//   //     alert('Operation finished with error: ' + response.error);
//   //   }
//   // });
//   // svcMca.tlb.api.disableFeature('OUTBOUND_CALL', function (response) {
//   //   console.log(response);
//   //   if (response.result == 'success') {
//   //     alert('Success! Feature disabled!');
//   //   } else {
//   //     alert('Operation finished with error: ' + response.error);
//   //   }
//   // });
//   // svcMca.tlb.api.readyForOperation();
//   // svcMca.tlb.api.getConfiguration(ALL, null);
//   console.log('New config');
//   const type ='ALL'
//   // svcMca.tlb.api.getConfiguration(type, callback);
//   svcMca.tlb.api.getConfiguration(type, (configType, response) => {
//     console.log('Config Type', configType);

//     if (configType.result == 'success') 
//     {			  
//       console.log('getConfiguration is success. Response is: ', response);
//       svcMca.tlb.api.disableFeature('OUTBOUND_CALL', function (response) {
//           console.log(response);
//           if (response.result == 'success') {
//             alert('Success! Feature disabled!');
//           } else {
//             alert('Operation finished with error: ' + response.error);
//           }
//         });
//       svcMca.tlb.api.readyForOperation(true, function (response) {
//         if (response.result == 'success') 
//         {
//           console.log('readyForOperation Success!');
//           // document.getElementById("readySpan").innerText="Ready";
//         }
//         else 
//         {
//           console.log('No Operation. ERROR!!!!!');
//           // document.getElementById("readySpan").innerText="Error";
//         }
//       });	
//       var inData = {};
//       inData.SVCMCA_ANI = '5551234';
//       inData.SVCMCA_CONTACT_ID = '1234567890';
//       svcMca.tlb.api.newCommEvent('PHONE', 'ORA_SERVICE', '12345-1234-67890', inData, null, function (response) {
//         if (response.result == 'success') {
//           console.log('Customer: '+response.outData.SVCMCA_CONTACT_NAME +' ('+response.outData.SVCMCA_CONTACT_ID +')');
//           console.log('Account: '+response.outData.SVCMCA_ORG_NAME +' ('+response.outData.SVCMCA_ORG_ID +')');					  
//         } else {
//           alert('Operation finished with error: ' + response.error);
//         }
//       },'ORA_SVC_PHONE');
//     } 
//     else 
//     {
//       alert('Could not getConfiguration. finished with error: ' + configType.error);
//     }
//   });
//   console.log('End config');
// };

const clickConfig = () => {
  const type ='ALL';
  svcMca.tlb.api.getConfiguration(type, (response) => {
    console.log('Config Type', response);

    if (response.result == 'success') 
    {			  
      console.log('getConfiguration is success. Response is: ', response);
    } 
    else 
    {
      alert('Could not getConfiguration. finished with error: ' + response.error);
    }
  });
  console.log('WAIT FOR CONFIG RESPONSE');
};

const clickFeature = () => {
  svcMca.tlb.api.disableFeature('CONFERENCE_CALL', function (response) {
    console.log(response);
    if (response.result == 'success') {
      console.log('Success! Feature disabled!');
    } else {
      console.log('Operation finished with error: ' + response.error);
    }
  });
  console.log('WAIT FOR DISABLE FEATURE RESPONSE');
};

const interactionCommandExecutor = (command) => {
  switch(command.command) {
    case "accept":
      alert("Received accept command");
      break;
    case "reject":
      alert("Received reject command");
      break;
    case "setActive":
      alert("Received setActive command");
      break;
  }
  command.result = 'success';
  command.sendResponse(command); 
}

const agentCommandExecutor = (command) => {
  var cmd = command.command;
  switch(cmd) {
     case "getCurrentAgentState":
        command.outData = {
           'channel':command.channel,
           'channelType':command.channelType,
           'isAvailable':true,
           'isLoggedIn':true,
           'state':"AVAILABLE",
           'stateDisplayString':"Available",
           'reason':null,
           'reasonDisplayString':null};
        break;
     case "getActiveEngagements":
        command.outData = {'activeCount':1,'engagements' : [ {eventId:"1234"} ] };
        break;
     case "makeAvailable":
        alert("makeAvailable command invoked");
        break;
     case "makeUnavailable":
        alert("makeUnavailable command invoked");
  }
  command.result = 'success';
  command.sendResponse(command);
}

const clickListeners = () => {
  const channel = 'PHONE';
  const classification = 'ORA_SERVICE';
  const channelType = 'ORA_SVC_PHONE';
  // ON DATA UPDATED
  svcMca.tlb.api.onDataUpdated(channel,classification, (resp) => {
    console.log('THIS IS THE DATA UPDATED CALLBACK', resp);
  }, channelType);
  // ON OUTGOING EVENT
  svcMca.tlb.api.onOutgoingEvent(channel,classification, (resp) => {
    console.log('THIS IS THE OUTGOING EVENT CALLBACK', resp);
  }, channelType);
  // ON TOOLBAR MESSAGE
  svcMca.tlb.api.onToolbarMessage((resp) => {
    console.log('THIS IS THE TOOLBAR MESSAGE', resp);
  });
  // ON TOOLBAR INTERACTION COMMAND
  svcMca.tlb.api.onToolbarInteractionCommand(interactionCommandExecutor);
  // ON TOOLBAR AGENT COMMAND
  svcMca.tlb.api.onToolbarAgentCommand(channel, channelType, agentCommandExecutor);
  console.log('WAIT FOR LISTENERS REGISTRATION RESPONSE');
};

const clickReady = () => {
  svcMca.tlb.api.readyForOperation(true, function (response) {
    if (response.result == 'success') 
    {
      console.log('readyForOperation Success!');
      // document.getElementById("readySpan").innerText="Ready";
    }
    else 
    {
      console.log('No Operation. ERROR!!!!!');
      // document.getElementById("readySpan").innerText="Error";
    }
  });
  console.log('WAIT FOR READY RESPONSE');
};

const clickComm = () => {
  var inData = {};
  inData.SVCMCA_ANI = '5551234';
  inData.SVCMCA_CONTACT_ID = '1234567890';
  const oldId = '12345-1234-67890'
  const newId = 'aspect-bac'
  svcMca.tlb.api.newCommEvent('PHONE', 'ORA_SERVICE', newId, inData, null, function (response) {
    if (response.result == 'success') {
      console.log('COMM RESPONSE: ',response);
      console.log('Customer: '+response.outData.SVCMCA_CONTACT_NAME +' ('+response.outData.SVCMCA_CONTACT_ID +')');
      console.log('Account: '+response.outData.SVCMCA_ORG_NAME +' ('+response.outData.SVCMCA_ORG_ID +')');					  
    } else {
      alert('Operation finished with error: ' + response.error);
    }
  },'ORA_SVC_PHONE');
  console.log('WAIT FOR NEW COMM EVENT RESPONSE');
};

const clickStartComm = () => {
  var inData = {};
  inData.SVCMCA_ANI = '5551234';
  inData.SVCMCA_CONTACT_ID = '1234567890';
  const oldId = '12345-1234-67890'
  const newId = 'aspect-bac'
  svcMca.tlb.api.startCommEvent('PHONE', 'ORA_SERVICE', newId, inData, null, function (response) {
    if (response.result == 'success') {
      console.log('COMM RESPONSE: ',response);
      console.log('Customer: '+response.outData.SVCMCA_CONTACT_NAME +' ('+response.outData.SVCMCA_CONTACT_ID +')');
      console.log('Account: '+response.outData.SVCMCA_ORG_NAME +' ('+response.outData.SVCMCA_ORG_ID +')');					  
    } else {
      alert('Operation finished with error: ' + response.error);
    }
  },'ORA_SVC_PHONE');
  console.log('WAIT FOR START COMM WINDOW POPUP');
};

const clickConfigDocument = () => {
  console.log('Official documentation actions');
}
