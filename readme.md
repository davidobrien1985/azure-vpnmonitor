# Azure VPN Connection Monitor

This Azure Function monitors the status of an Azure Site to Site VPN connection.
The Function has been developed in NodeJS.

## Deployment

Check the [Azure Functions CLI documentation](https://docs.microsoft.com/en-us/azure/azure-functions/functions-run-local) to read about how to deploy this Function from your IDE or command line.

## Configuration

The `monitor` Function is triggered every `1 Minute` (see ./monitor/function.json) and has an output binding of type [Sendgrid](https://docs.microsoft.com/en-us/azure/azure-functions/functions-bindings-sendgrid).
The same json file configures the Sendgrid binding, with a `to`, a `from` and the Sendgrid API key which needs to be an Azure APP Setting called `MySendGridKey`.
The Function supports the use of a Service Principal, but also a [Managed Identity](https://docs.microsoft.com/en-us/azure/app-service/overview-managed-identity?context=azure/active-directory/managed-identities-azure-resources/context/msi-context).
The following Azure App Settings also need to be present in order for the Function to successfully work:

* `APPSETTING_RESOURCEGROUP_NAME`
  * name of resource group the gateway connection is in
* `VPNCONNECTION_NAME`
  * name of VPN connection
* `ARMENVIRONMENT`
  * set this to `prod` if you want the Function to actually do something. This setting assumes that the Function is deployed into multiple staged environments, but only actually has a VPN to monitor in prod. You might need to change that for your environment.
