const msRestAzure = require('ms-rest-azure');
const NetworkManagementClient = require('azure-arm-network');

let clientId = process.env['CLIENT_ID']; // service principal
let domain = process.env['DOMAIN']; // tenant id
let secret = process.env['APPLICATION_SECRET']; // service principal secret
let subscriptionId = process.env['APPSETTING_SUBSCRIPTION_ID']; // azure subscription id
let resourceGroup = process.env['APPSETTING_RESOURCEGROUP_NAME']; // name of resource group the gateway connection is  in
let connectionName = process.env['VPNCONNECTION_NAME']; // name of VPN connection
let msiendpoint = process.env["MSI_ENDPOINT"];
let environmentName = process.env["ARMENVIRONMENT"];

function getAzureCredentials(context) {
  if (msiendpoint) {
    context.log("Acquiring MSI credentials.");
    return msRestAzure.loginWithAppServiceMSI();
  } else {
    context.log("Acquiring credentials from SPN.");
    return msRestAzure.loginWithServicePrincipalSecret(clientId, secret, domain);
  }
}

module.exports = function (context, myTimer) {
  getAzureCredentials(
    context, clientId, secret, domain,
    (err, credentials) => {
      if (err) throw err
    }
  ).then(credentials => {
    context.log("Credentials acquired... continue.");
    if (environmentName.includes("prod")) {
      const client = new NetworkManagementClient(credentials, subscriptionId);
      return client.virtualNetworkGatewayConnections.get(resourceGroup, connectionName);
    } else {
      context.log("We're not in prod. Exit...");
      context.done();
    }
  })
    .then(vpnconnection => {
      context.log('VPN Connection status for RG ' + resourceGroup + ' and connection ' + connectionName + ':');
      context.log(vpnconnection.connectionStatus);
      if (vpnconnection.connectionStatus != "Connected") {
      var message = {
        content: [{
          type: 'text/plain',
          value: "The Azure VPN connection status has changed to " + vpnconnection.connectionStatus
        }]
      };
      context.done(null, message);
    } else {
      context.done();
    }
    });
};