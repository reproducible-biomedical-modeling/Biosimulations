# CRBM-Viz
[![Tests](https://github.com/reproducible-biomedical-modeling/CRBM-Viz/workflows/Build,%20Lint,%20Test/badge.svg)](https://github.com/reproducible-biomedical-modeling/CRBM-Viz/actions)
[![Docker](https://github.com/reproducible-biomedical-modeling/CRBM-Viz/workflows/Docker%20Image%20CI/badge.svg)](https://github.com/reproducible-biomedical-modeling/CRBM-Viz/actions)
[![Documentation](https://github.com/reproducible-biomedical-modeling/CRBM-Viz/workflows/Documentation/badge.svg)](https://github.com/reproducible-biomedical-modeling/CRBM-Viz/actions)
[![Deploy](https://github.com/reproducible-biomedical-modeling/CRBM-Viz/workflows/Publish%20Docker/badge.svg)](https://github.com/reproducible-biomedical-modeling/CRBM-Viz/actions)
## Current Build

https://crbm-viz.herokuapp.com/

## Documentation

https://reproducible-biomedical-modeling.github.io/CRBM-Viz/

## Deploying

The current build is automatically deployed to heroku at above link. To deploy a new version into production:

1. Ensure that all tests have passed

2. Visit the test deployment at the above link and visually ensure that the site is functional.

3. Create a release in github and give approriate version.
   This will update the latest build image on dockerhub
