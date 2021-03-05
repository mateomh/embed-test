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

const clickConfig = () => {
  console.log('Click config');
  console.log(svcMca.tlb.api);
  console.log(svcMca.tlb.api.getConfiguration);
  console.log('After');
  const scripts = document.getElementsByTagName('script');
  console.log(scripts[3]);
  // svcMca.tlb.api.getConfiguration('ALL', function (response) {
  //   console.log(response);
  //   if (response.result == 'success') {
  //     alert('Success! Configuration is: ' + response.configuration);
  //   } else {
  //     alert('Operation finished with error: ' + response.error);
  //   }
  // });
  // svcMca.tlb.api.disableFeature('OUTBOUND_CALL', function (response) {
  //   console.log(response);
  //   if (response.result == 'success') {
  //     alert('Success! Feature disabled!');
  //   } else {
  //     alert('Operation finished with error: ' + response.error);
  //   }
  // });
  // svcMca.tlb.api.readyForOperation();
  // svcMca.tlb.api.getConfiguration(ALL, null);
  console.log('New config');
  alert('from the iframe15');
  const callback = () => {console.log('hola')};
  const type ='ALL'
  console.log(window.globalThis);
  svcMca.tlb.api.getConfiguration(type, callback);
  fetch('https://pokeapi.co/api/v2/pokemon/').then(res => console.log(res));
  // resp = svcMca.tlb.api.getConfiguration(function (configType, response) {
  //   console.log(configType);

  //   if (configType.result == 'success') 
  //   {			  
  //     console.log('getConfiguration is success. Response is: ' + JSON.stringify(configType));
  //     svcMca.tlb.api.readyForOperation(true, function (response) {
  //       if (response.result == 'success') 
  //       {
  //         console.log('readyForOperation Success!');
  //         document.getElementById("readySpan").textContent="Ready";
  //       }
  //       else 
  //       {
  //         document.getElementById("readySpan").textContent="Error";
  //       }
  //     });	
  //     var inData = {};
  //     inData.SVCMCA_ANI = '+14377716417';
  //     inData.SVCMCA_CONTACT_ID = '1234567890';
  //     svcMca.tlb.api.newCommEvent('PHONE', 'ORA_SERVICE', '12345-1234-67890', inData, null, function (response) {
  //       if (response.result == 'success') {
  //         console.log('Customer: '+response.outData.SVCMCA_CONTACT_NAME +' ('+response.outData.SVCMCA_CONTACT_ID +')');
  //         console.log('Account: '+response.outData.SVCMCA_ORG_NAME +' ('+response.outData.SVCMCA_ORG_ID +')');					  
  //       } else {
  //         alert('Operation finished with error: ' + response.error);
  //       }
  //     },'ORA_SVC_PHONE');
  //   } 
  //   else 
  //   {
  //     alert('Could not getConfiguration. finished with error: ' + configType.error);
  //   }
  // });
  // console.log(resp);
  console.log('End config');
};

const clickConfigDocument = () => {
  console.log('Official documentation actions');
}
