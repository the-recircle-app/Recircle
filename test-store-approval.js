// Using native fetch (ES modules)
async function testStoreApprovalEndpoint() {
  try {
    // Test both local and deployed endpoints
    const localUrl = 'http://localhost:5000/api/store-approved';
    const deployedUrl = 'https://web-3-explorer-reign360.replit.app/api/store-approved';
    
    const payload = {
      user_wallet: "0x7dE3085b3190B3a787822Ee16F23be010f5F8686",
      store_name: "Test Store via Script",
      status: "approved"
    };
    
    // Test deployed endpoint
    console.log('\n--- TESTING DEPLOYED ENDPOINT ---');
    console.log(`Testing store approval endpoint at: ${deployedUrl}`);
    console.log(`Payload: ${JSON.stringify(payload, null, 2)}`);
    
    try {
      const deployedResponse = await fetch(deployedUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      
      const deployedStatus = deployedResponse.status;
      const deployedData = await deployedResponse.text();
      
      console.log(`Status code: ${deployedStatus}`);
      console.log(`Response body: ${deployedData}`);
      
      if (deployedResponse.ok) {
        try {
          const jsonData = JSON.parse(deployedData);
          console.log('Parsed JSON response:', jsonData);
        } catch (e) {
          console.log('Response was not valid JSON');
        }
      }
    } catch (error) {
      console.error(`Error testing deployed endpoint: ${error.message}`);
    }
    
    // Test local endpoint 
    console.log('\n--- TESTING LOCAL ENDPOINT ---');
    console.log(`Testing store approval endpoint at: ${localUrl}`);
    
    try {
      const localResponse = await fetch(localUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      
      const localStatus = localResponse.status;
      const localData = await localResponse.text();
      
      console.log(`Status code: ${localStatus}`);
      console.log(`Response body: ${localData}`);
      
      if (localResponse.ok) {
        try {
          const jsonData = JSON.parse(localData);
          console.log('Parsed JSON response:', jsonData);
        } catch (e) {
          console.log('Response was not valid JSON');
        }
      }
    } catch (error) {
      console.error(`Error testing local endpoint: ${error.message}`);
    }
  } catch (error) {
    console.error('Error testing endpoints:', error);
  }
}

testStoreApprovalEndpoint();