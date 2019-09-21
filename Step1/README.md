# First iteration setup

After cloning the repository, you can either 

## Run code locally

run `npm start` to run the code locally

## Deploy to the server

### One-time Azure setup

Setup description taken from https://docs.microsoft.com/en-us/azure/app-service/app-service-web-get-started-nodejs:

Create a resource group

``` powershell
az group create --name myResourceGroup --location "UK West"
```

Create Azure App Service plan

``` powershell
az appservice plan create --name myAppServicePlan --resource-group myResourceGroup --sku FREE
```

Create a web app

``` powershell
az webapp create --resource-group myResourceGroup --plan myAppServicePlan --name <app_name>
```

Set Node.js runtime

``` powershell
az webapp config appsettings set --resource-group myResourceGroup --name <app_name> --settings WEBSITE_NODE_DEFAULT_VERSION=10.14.1
```

### Application deployment

After one-time setup, you should be able to open http://<app_name>.azurewebsites.net

To deploy ZIP file with you code, open https://<app_name>.scm.azurewebsites.net/ZipDeployUI and upload code there