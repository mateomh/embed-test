const testinData = {
  // inData.SVCMCA_ANI = '5551234',
  // inData.SVCMCA_CONTACT_ID = '1234567890',
  // inData.SVCMCA_CONTACT_ID = '100000025811998',
  // SVCMCA_CONTACT_ID: '300000004992660', // Fabian Prueba
  // BAC_CONTACT_CIFBCO: '42829685801', // Fabian Prueba
  // BAC_CANTACT_CIFCOM: '428296858', // Fabian Prueba
  // SVCMCA_CONTACT_ID: '300000009591426', // Ileana Alfaro
  // BAC_CONTACT_CIFBCO: 'ALFAILEAO000', // Ileana Alfaro
  // BAC_CANTACT_CIFCOM: 'ALFAILEAO000', // Ileana Alfaro
  // SVCMCA_BYPASS_IDENTIFY_CONTACT = true,
  // SVCMCA_CONTACT_ID: '',
  // BAC_CONTACT_CIFBCO: '123456789',
  SVCMCA_CONTACT_NUMBER: '',
  BAC_CONTACT_CIFBCO: '',
  BAC_CANTACT_CIFCOM: '',
  // SVCMCA_LEAD_ID: '300000023043998',
  SVCMCA_LEAD_ID: '300000023954315',
  // SVCMCA_LEAD_NUMBER: '',
  SVCMCA_LEAD_NAME: 'LEAD CREADO DESDE ASPECT',
  BAC_LEAD_CHANNEL: "BAC_CONTACT_CENTER",
  BAC_LEAD_SOURCE: "SALIENTE",
  BAC_LEAD_DESCRIPTION: "Descripción de la Oferta del Lead desde Aspect"
};

const newEventId = 'aspect-bac';

const channel = 'CHAT';
const channelType = 'ORA_SVC_CHAT';
const classification = 'ORA_SERVICE';

const getConfig = () => {
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
  // const type2 ='FA_TOKEN';
  // svcMca.tlb.api.getConfiguration(type2, (response) => {
  //   console.log('Token Config', response);

  //   if (response.result == 'success') 
  //   {			  
  //     console.log('getConfiguration is success. Response is: ', response);
  //   } 
  //   else 
  //   {
  //     alert('Could not getConfiguration. finished with error: ' + response.error);
  //   }
  // });
  console.log('WAIT FOR CONFIG RESPONSE');
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

const registerListeners = () => {
  // const channel = 'PHONE';
  // const channelType = 'ORA_SVC_PHONE';
  const channel = 'CHAT';
  const channelType = 'ORA_SVC_CHAT';
  
  const classification = 'ORA_SERVICE';
  // ON DATA UPDATED
  svcMca.tlb.api.onDataUpdated(channel,classification, (resp) => {
    console.log('THIS IS THE DATA UPDATED CALLBACK', resp);
    alert ('Wrapup Info \n', JSON.stringify(resp, null, 2));
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

const setReady = () => {
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

const initialConfig = () => {
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
      getConfig();
      registerListeners();
      setReady();
  })
  node.addEventListener('error', function(evt) { 
      console.log('##DLS: Error loading ORACLE API JS from URL: '+node.src);
  }, false);
  currentNode.appendChild(node);
};

initialConfig();

