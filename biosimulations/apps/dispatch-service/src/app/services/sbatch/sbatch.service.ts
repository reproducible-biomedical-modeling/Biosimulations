import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SbatchService {
  public constructor(private configService: ConfigService) {}

  public generateSbatch(
    tempSimDir: string,
    simulator: string,
    omexName: string,
    apiDomain: string,
    simId: string,
  ): string {
    const homeDir = this.configService.get('hpc.homeDir');
    if (apiDomain.startsWith('http://localhost')) {
      apiDomain = 'https://run.api.biosimulations.dev/';
    }
    const template = `#!/bin/bash    
#SBATCH --job-name=${simId}_Biosimulations
#SBATCH --time=20:00
#SBATCH --output=${tempSimDir}/out/job.output
#SBATCH --error=${tempSimDir}/out/job.output
#SBATCH --chdir=${tempSimDir}
#SBATCH --ntasks=1
#SBATCH --partition=crbm
#SBATCH --qos=general\n

export MODULEPATH=/isg/shared/modulefiles:/tgcapps/modulefiles
source /usr/share/Modules/init/bash
module load singularity/3.7.1
export PATH=$PATH:/usr/sbin/
export XDG_RUNTIME_DIR=${homeDir}/singularity/XDG/
export SINGULARITY_CACHEDIR=${homeDir}/singularity/cache/
export SINGULARITY_LOCALCACHEDIR=${homeDir}/singularity/localCache/
export SINGULARITY_TMPDIR=${homeDir}/singularity/tmp/
export SINGULARITY_PULLFOLDER=${homeDir}/singularity/images/
wget ${apiDomain}run/${simId}/download -O '${tempSimDir}/in/${omexName}' 1>'${tempSimDir}/out/job.output' 2>&1
singularity run -B ${tempSimDir}/in:/root/in -B ${tempSimDir}/out:/root/out ${simulator} -i '/root/in/${omexName}' -o '/root/out'`;
    return template;
  }

  public generateImageUpdateSbatch(url: string, force: string): string {
    const homeDir = this.configService.get('hpc.homeDir');
    const image = url.split('docker://ghcr.io/biosimulators/')[1];
    const template = `#!/bin/bash    

#SBATCH --job-name=${image}-Build
#SBATCH --time=30:00
#SBATCH --chdir=${homeDir}/singularity/images/
#SBATCH --partition=crbm
#SBATCH --qos=general
#SBATCH --ntasks=1
#SBATCH --output=${homeDir}/singularity/images/${image}.output
#SBATCH --cpus-per-task=4


export MODULEPATH=/isg/shared/modulefiles:/tgcapps/modulefiles
source /usr/share/Modules/init/bash
export PATH=$PATH:/usr/sbin/
module load singularity/3.7.1
export XDG_RUNTIME_DIR=${homeDir}/singularity/XDG/
export SINGULARITY_CACHEDIR=${homeDir}/singularity/cache/
export SINGULARITY_LOCALCACHEDIR=${homeDir}/singularity/localCache/
export SINGULARITY_TMPDIR=${homeDir}/singularity/tmp/
export SINGULARITY_PULLFOLDER=${homeDir}/singularity/images/
echo "Building On:"
hostname
echo "Using Singularity"
singularity --version
singularity -v pull ${force} ${url}`;
    return template;
  }
}
