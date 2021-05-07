const urlProspects = 'https://ccur-dev1.fa.us6.oraclecloud.com/crmRestApi/resources/latest/contacts';
const urlLeads = 'https://ccur-dev1.fa.us6.oraclecloud.com/crmRestApi/resources/latest/leads/';

const userInfo = {
  "Type": "ZCA_PROSPECT",
  "Country": "CR",
  "FirstName": "Mateo",
  "MiddleName": "ctiName2 006",
  "LastName": "Mojica",
  "SecondLastName": "h",
  "PersonDEO_NumeroIdentificacion_c": "123456789",
  "PersonDEO_TipoIdentificacion360_c": "DNA",
  "PersonDEO_GeneroKYC_c": "MASCULINO",
  "PersonDEO_FechaNacimiento360_c": "20-01-2000",
  "PersonDEO_TelefonoFijoKYC_c": "12222222",
  "PersonDEO_TelefonoTrabajo_c": "22222222",
  "PersonDEO_Celular360_c": "32222222",
  "PersonDEO_CorreoElectronico_c": "COMprospect@prueba.com",
  "PersonDEO_CorreoBCO360_c": "BCOprospect@prueba.com",
  "PersonDEO_CorreoSEC360_c": "SECprospect@prueba.com"
};

const leadData = {
  "Name": "TOOLBAR LEAD",
  "StatusCode": "UNQUALIFIED",
  // "CanalLead_c": "BAC_CTI",
  // "Fuente_c": "Unified IP",
  "Description": "Prueba Creación Lead con TOOLBAR",
  "ContactPartyNumber": "CR-204576-ALFAILEAO000",
  "PrimaryInventoryItemNumber": "CR_TJC_V006",
  "Pais_c": "CR",
  "LeadFormularioWebCollection_c":
  [
      {
          "Origen_c": "UnifiedIP",
          "Nombre_c": "BENEFICIO",
          "Valor_c": "25 Porciento",
          "Descripcion_c": "taza minima",
          "Comentario_c": "sugerir al cliente"
      },
      {
          "Origen_c": "UnifiedIP",
          "Nombre_c": "PLAZO",
          "Valor_c": "12 meses",
          "Descripcion_c": "plazo para el cliente",
          "Comentario_c": "exclusivo con la oferta"
      }
  ]
}

const optionsProspects = {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Basic ZXNhbmFicmlhc2FsOkNyZWRvbWF0aWMxMw=='
  },
  body: JSON.stringify(userInfo)
};

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

  svcMca.tlb.api.getCustomerData(channel, classification, newEventId, testinData, null, async (response) => {
    if (response.result == 'success') {
      console.log("Response from Customer data", response);
      console.log('Customer: '+response.outData.SVCMCA_CONTACT_NAME +' ('+response.outData.SVCMCA_CONTACT_ID +')');
      console.log('Account:'+response.outData.SVCMCA_ORG_NAME+'('+response.outData.SVCMCA_ORG_ID+')');
      console.log('Success! Results available in log.');

      if (response.outData.BAC_CANTACT_CIFCOM === '' && response.outData.BAC_CONTACT_CIFBCO === '') {
        console.log('Call the create prospect service');

        const response = await fetch(urlProspects, optionsProspects);
        console.log('RESPONSE', response);
        const data = await response.json();
        console.log('Data', data);
        testinData.SVCMCA_CONTACT_NUMBER = data.PartyNumber;
        setBCOandCOM(data.PartyNumber);
        leadData.ContactPartyNumber = data.PartyNumber
        alert('New prospect created');
      } 

      leadData.ContactPartyNumber = testinData.SVCMCA_CONTACT_NUMBER
      console.log("LEADS", leadData);
      // console.log('TEST DATA', testinData);
    } else {
      alert('Operation finished with error: ' + response.error);
    }
  },channelType);
};

const clickLead = async () => {
  // getBCOandCOM();
  console.log('CREATING LEAD');

  const optionsLeads = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Basic ZXNhbmFicmlhc2FsOkNyZWRvbWF0aWMxMw=='
    },
    body: JSON.stringify(leadData)
  }

  const response = await fetch(urlLeads, optionsLeads);
  console.log('RESPONSE Leads', response);
  const data = await response.json();
  testinData.SVCMCA_LEAD_ID = data.LeadId;
  testinData.SVCMCA_LEAD_NUMBER = data.LeadNumber;
  console.log('Data Leads', data);
  alert('New lead created');
}

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

const setBCOandCOM = (value) => {
  const cn = document.getElementById('CONT_NUM');
  cn.value = value;
}