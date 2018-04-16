import { Observable } from 'rxjs/Rx';
import { Web3Service } from 'services/web3.service';

export function initializeContract(web3Service: Web3Service, contractClass: any, config: any) {
  return Observable.from(web3Service.getPrimaryAccount())

    .mergeMap((account: string) => {
      let gas = config.gas,
          defaults: any = {
            from: account
          };
    
      if (gas) {
        defaults.gas = gas;
      }
    
      contractClass.setProvider(web3Service.web3.currentProvider);
      contractClass.defaults(defaults);

      return Observable.of(contractClass);
    });
}