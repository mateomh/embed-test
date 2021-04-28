const clickNewCommEventEC = () => {
  var inData = {};
  getBCOandCOM();
  // svcMca.tlb.api.newCommEvent('CO-BROWSE', 'ORA_SERVICE', '123456789000', testinData, null, function (response) {
  svcMca.tlb.api.newCommEvent('CHAT', 'ORA_SERVICE', '123456789000', testinData, null, function (response) {
    if (response.result == 'success') {
      console.log('COMM RESPONSE: ',response);
      console.log('Customer: '+response.outData.SVCMCA_CONTACT_NAME +' ('+response.outData.SVCMCA_CONTACT_ID +')');
      console.log('Account: '+response.outData.SVCMCA_ORG_NAME +' ('+response.outData.SVCMCA_ORG_ID +')');					  
    } else {
      alert('Operation finished with error: ' + response.error);
    }
  },'');
  console.log('WAIT FOR NEW COMM EVENT RESPONSE');
};

const clickNewStartCommEventEC = () => {
  var inData = {};
  getBCOandCOM();

  // svcMca.tlb.api.startCommEvent('CO-BROWSE', 'ORA_SERVICE', '123456789000', testinData, null, function (response) {
  svcMca.tlb.api.startCommEvent('CHAT', 'ORA_SERVICE', '123456789000', testinData, null, function (response) {
    if (response.result == 'success') {
      console.log('COMM RESPONSE: ',response);
      console.log('Customer: '+response.outData.SVCMCA_CONTACT_NAME +' ('+response.outData.SVCMCA_CONTACT_ID +')');
      console.log('Account: '+response.outData.SVCMCA_ORG_NAME +' ('+response.outData.SVCMCA_ORG_ID +')');					  
    } else {
      alert('Operation finished with error: ' + response.error);
    }
  },'');
  console.log('WAIT FOR START COMM WINDOW POPUP');
};

const clickNewEndCommEventEC = () => {
  var inData = {};
	getBCOandCOM();  
  // svcMca.tlb.api.closeCommEvent('CO-BROWSE', 'ORA_SERVICE', '123456789000', testinData, 'WRAPUP', function (response) {
  svcMca.tlb.api.closeCommEvent('CHAT', 'ORA_SERVICE', '123456789000', testinData, 'WRAPUP', function (response) {
    if (response.result == 'success') {
      console.log('COMM END RESPONSE: ',response);
      //alert('Success! Call ended.');
    } else {
      console.log('COMM END RESPONSE Operation finished with error: ',response.error);
      //alert('Operation finished with error: ' + response.error);
    }
  },'');
  console.log('WAIT FOR END COMM WINDOW POPUP');
  // svcMca.tlb.api.onDataUpdated('CHAT','ORA_SERVICE', (resp) => {
  //   console.log('THIS IS THE DATA UPDATED CALLBACK', resp);
  // }, 'ORA_SVC_COBROWSE');
};

const clickCheckUser = () => {
  getBCOandCOM();

  svcMca.tlb.api.getCustomerData(channel, classification, newEventId, intestData, null, (response) => {
    if (response.result == 'success') {
      console.log("Response from Customer data", response);
      console.log('Customer: '+response.outData.SVCMCA_CONTACT_NAME +' ('+response.outData.SVCMCA_CONTACT_ID +')');
      console.log('Account:'+response.outData.SVCMCA_ORG_NAME+'('+response.outData.SVCMCA_ORG_ID+')');
      alert('Success! Results available in log.');
    } else {
      alert('Operation finished with error: ' + response.error);
    }
  },channelType);
};

const getBCOandCOM = () => {
  // const bco = document.getElementById('BCO').value;
  // testinData.BAC_CANTACT_CIFCOM = com;
  // console.log("BCO: ", bco);
  // const com = document.getElementById('COM').value;
  // testinData.BAC_CONTACT_CIFBCO = bco;
  // console.log("COM: ", com);
  const cn = document.getElementById('CONT_NUM').value;
  testinData.SVCMCA_CONTACT_NUMBER = cn;
  console.log("CONTACT NUMBER: ", cn);
};