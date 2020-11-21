import { Injectable } from '@nestjs/common';
import { 
  edamInfo,
  kisaoInfo,
  sboInfo,
  sioInfo,
  spdxInfo,
  sboTerms,
  kisaoTerms,
  edamTerms,
  sioTerms,
  spdxTerms,
 } from '@biosimulations/ontology/sources';
import { 
  Ontologies,
  OntologyInfo,
  IOntologyTerm,
} from '@biosimulations/datamodel/common';

@Injectable()
export class OntologiesService {
  getInfo(ontologyId: Ontologies): OntologyInfo | null {
    switch (ontologyId) {
      case Ontologies.EDAM: return edamInfo;
      case Ontologies.KISAO: return kisaoInfo;
      case Ontologies.SBO: return sboInfo;
      case Ontologies.SIO: return sioInfo;
      case Ontologies.SPDX: return spdxInfo;
    }
    return null;
  }

  static _getTerms(ontologyId: Ontologies): { [id: string]: IOntologyTerm } | null {
    switch (ontologyId) {
      case Ontologies.EDAM: return edamTerms;
      case Ontologies.KISAO: return kisaoTerms;
      case Ontologies.SBO: return sboTerms;
      case Ontologies.SIO: return sioTerms;
      case Ontologies.SPDX: return spdxTerms;
    }
    return null;
  }

  getTerms(ontologyId: Ontologies): IOntologyTerm[] | null {
    const termsObj = OntologiesService._getTerms(ontologyId);
    if (termsObj == null) {
      return null;
    }

    const terms: IOntologyTerm[] = [];
    for (const term in termsObj) {
      terms.push(termsObj[term]);
    }
    return terms;
  }

  getTerm(ontologyId: Ontologies, termId: string): IOntologyTerm | null {
    const termsObj = OntologiesService._getTerms(ontologyId);
    if (termsObj == null) {
      return null;
    }

    return termsObj[termId] || null;
  }

  static isTermId(ontologyId: Ontologies, termId: string): boolean {
    const termsObj = OntologiesService._getTerms(ontologyId);
    if (termsObj == null) {
      return false;
    } else {
      return !!termsObj[termId];
    }
  }
}
