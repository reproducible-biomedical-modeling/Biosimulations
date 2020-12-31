import { registerAs } from '@nestjs/config';
import { urls, appName, urlMap } from '@biosimulations/config/common';
export default registerAs('urls', () => {
    const config: urlMap = {
        dispatchApi: process.env.DISPATCH_URL || urls.dispatchApi,
        simulatorsApi: process.env.SIMULATORS_API_URL || urls.simulatorsApi,
        ontologyApi: process.env.ONTOLOGY_API_URL || urls.simulatorsApi,
        // TODO update these 
        platformApi: urls.simulatorsApi,
        accountApi: urls.simulatorsApi,
        platform: urls.simulatorsApi,
        account: urls.simulatorsApi,
        dispatch: urls.simulatorsApi,
        simulators: urls.simulatorsApi


    };

    return config;
});